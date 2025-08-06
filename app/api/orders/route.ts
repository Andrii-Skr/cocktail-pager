// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIO } from "@/lib/socket";

/* GET /api/orders – все, что не DONE, с пользователем */
export async function GET() {
  const orders = await prisma.order.findMany({
    where: { status: { not: "DONE" } },
    include: {
      cocktail: true,
      user:     true,           // чтобы на фронте был name
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(orders);
}

/* POST /api/orders { cocktailId, deviceId } */
export async function POST(req: NextRequest) {
  const { cocktailId, deviceId } = (await req.json()) as {
    cocktailId: number;
    deviceId: string | null;
  };

  if (!cocktailId || !deviceId)
    return NextResponse.json(
      { error: "cocktailId и deviceId обязательны" },
      { status: 400 },
    );

  try {
    /* транзакция: ищем (или создаём) пользователя и пишем заказ */
    const order = await prisma.$transaction(async (tx) => {
      /* 1. пользователь */
      let user = await tx.users.findUnique({ where: { deviceId } });
      if (!user) {
        user = await tx.users.create({
          data: { deviceId, name: "Guest" },
        });
      }

      /* 2. заказ */
      return tx.order.create({
        data: {
          cocktailId,
          deviceId,
          userId: deviceId,          // FK → Users.deviceId
        },
        include: { cocktail: true, user: true },
      });
    });

    /* 3. realtime push бармену */
    getIO()?.emit("new-order", order);

    return NextResponse.json(order, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Не удалось создать заказ" },
      { status: 500 },
    );
  }
}
