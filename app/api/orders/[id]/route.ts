// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type PatchBody = {
  note?: string;
  status?: "NEW" | "IN_PROGRESS" | "DONE";
};

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  /* 1. достаём ID — нужно await! */
  const { id } = await params;
  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return NextResponse.json({ error: "id must be a number" }, { status: 400 });
  }

  /* 2. читаем и фильтруем body */
  const { note, status } = (await req.json()) as PatchBody;

  try {
    /* 3. обновляем заказ */
    const order = await prisma.order.update({
      where: { id: numericId },
      data : { note, status },
      include: { cocktail: true, user: true },
    });

    return NextResponse.json(order); // 200
  } catch {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }
}

/* Опционально: 405 для других методов */
export function GET() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
