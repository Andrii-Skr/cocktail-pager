// app/api/orders/route.ts

import { Prisma } from "@prisma/client"
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getIO } from "@/lib/socket"

/* GET /api/orders – все, что не DONE, с пользователем */
export async function GET() {
  const orders = await prisma.order.findMany({
    where: { status: { not: "DONE" } },
    include: {
      cocktail: true,
      user: true, // чтобы на фронте был name
    },
    orderBy: { createdAt: "asc" },
  })
  return NextResponse.json(orders)
}

/* POST /api/orders { cocktailId, deviceId } */
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Некорректный JSON" }, { status: 400 })
  }

  const cocktailIdRaw = (body as { cocktailId?: unknown })?.cocktailId
  const deviceIdRaw = (body as { deviceId?: unknown })?.deviceId
  const cocktailId = Number(cocktailIdRaw)
  const deviceId = typeof deviceIdRaw === "string" ? deviceIdRaw.trim() : ""

  if (!Number.isFinite(cocktailId)) {
    return NextResponse.json(
      { error: "cocktailId обязателен и должен быть числом" },
      { status: 400 }
    )
  }

  if (!deviceId || deviceId.length > 128) {
    return NextResponse.json(
      { error: "deviceId обязателен и должен быть строкой" },
      { status: 400 }
    )
  }

  try {
    /* транзакция: ищем (или создаём) пользователя и пишем заказ */
    const order = await prisma.$transaction(async (tx) => {
      /* 1. пользователь */
      let user = await tx.users.findUnique({ where: { deviceId } })
      if (!user) {
        user = await tx.users.create({
          data: { deviceId, name: "Guest" },
        })
      }

      /* 2. заказ */
      return tx.order.create({
        data: {
          cocktailId,
          deviceId,
          userId: deviceId, // FK → Users.deviceId
        },
        include: { cocktail: true, user: true },
      })
    })

    /* 3. realtime push бармену */
    getIO()?.emit("new-order", order)

    return NextResponse.json(order, { status: 201 })
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2003"
    ) {
      return NextResponse.json({ error: "Коктейль не найден" }, { status: 400 })
    }
    console.error(e)
    return NextResponse.json(
      { error: "Не удалось создать заказ" },
      { status: 500 }
    )
  }
}
