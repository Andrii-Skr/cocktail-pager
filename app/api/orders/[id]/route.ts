// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  ctx: { params: { id: string } },
) {
  /* ① Читаем body (если нужен) */
  const body = (await req.json()) as {
    note?: string;
    status?: "NEW" | "IN_PROGRESS" | "DONE";
  };

  /* ② ОБЯЗАТЕЛЬНО awaiting params */
  const { id } = await ctx.params;          // ← ключевая строка
  // теперь id — строка из URL, можно преобразовать
  const numericId = Number(id);

  /* ③ Работаем с БД */
  const order = await prisma.order.update({
    where: { id: numericId },
    data: body,
  });

  return NextResponse.json(order);
}
