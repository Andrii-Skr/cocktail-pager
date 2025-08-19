import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma"

// id здесь — это Users.deviceId
export async function PATCH(req: NextRequest, context: any) {
  const { id } = context.params;

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }

  const nameRaw = body?.name;
  if (typeof nameRaw !== "string") {
    return NextResponse.json({ message: "Field 'name' must be a string" }, { status: 400 });
  }

  const name = nameRaw.trim();
  if (!name || name.length > 60) {
    return NextResponse.json({ message: "Invalid 'name' value" }, { status: 400 });
  }

  try {
    const user = await prisma.users.update({
      where: { deviceId: id },
      data: { name },
      select: { deviceId: true, name: true },
    });

    return NextResponse.json(user, { status: 200 });
  } catch (e: any) {
    // P2025 — не найдена запись
    if (e?.code === "P2025") {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }
    console.error("PATCH /api/users/[id] error:", e);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
