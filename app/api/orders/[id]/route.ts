// app/api/orders/[id]/route.ts
import { Prisma } from "@prisma/client"
import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

type PatchBody = {
  note?: string | null
  status?: "NEW" | "IN_PROGRESS" | "DONE"
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  /* 1. достаём ID — нужно await! */
  const { id } = await params
  const numericId = Number(id)
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "id must be a number" }, { status: 400 })
  }

  /* 2. читаем и фильтруем body */
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 })
  }

  const data: PatchBody = {}
  if ("note" in body) {
    const note = (body as { note?: unknown }).note
    if (note !== null && typeof note !== "string") {
      return NextResponse.json(
        { error: "note must be a string" },
        { status: 400 }
      )
    }
    data.note = note ?? null
  }
  if ("status" in body) {
    const status = (body as { status?: unknown }).status
    if (status !== "NEW" && status !== "IN_PROGRESS" && status !== "DONE") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }
    data.status = status
  }
  if (!("note" in data) && !("status" in data)) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 })
  }

  try {
    /* 3. обновляем заказ */
    const order = await prisma.order.update({
      where: { id: numericId },
      data,
      include: { cocktail: true, user: true },
    })

    return NextResponse.json(order) // 200
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2025"
    ) {
      return NextResponse.json({ error: "order not found" }, { status: 404 })
    }
    console.error("PATCH /api/orders/[id] error:", err)
    return NextResponse.json(
      { error: "Не удалось обновить заказ" },
      { status: 500 }
    )
  }
}

/* Опционально: 405 для других методов */
export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 })
}
