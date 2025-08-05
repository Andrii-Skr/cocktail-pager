import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getIO } from "@/lib/socket";          // если вы эмитите событие

/* GET /api/orders  – список невыполненных заказов */
export async function GET() {
  const orders = await prisma.order.findMany({
    where: { status: { not: "DONE" } },       // либо уберите фильтр
    include: { cocktail: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(orders);
}

/* POST /api/orders { cocktailId } – создать заказ */
export async function POST(req: NextRequest) {
  const { cocktailId } = await req.json();
  const ua = req.headers.get("user-agent") ?? "unknown";

  const order = await prisma.order.create({
    data: { cocktailId, deviceId: ua },
    include: { cocktail: true },
  });

  // realtime
  getIO()?.emit("new-order", order);

  return NextResponse.json(order, { status: 201 });
}
