// app/api/cocktails/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/cocktails  — вернёт все напитки */
export async function GET() {
  const cocktails = await prisma.cocktail.findMany({
    orderBy: { id: "asc" },
  });
  return NextResponse.json(cocktails);
}

