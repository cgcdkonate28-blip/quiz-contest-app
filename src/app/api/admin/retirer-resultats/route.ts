import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/admin-session";

export async function POST() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const existing = await prisma.gameSettings.findFirst();

  if (existing) {
    await prisma.gameSettings.update({
      where: { id: existing.id },
      data: { resultatsPublies: false },
    });
  }

  return NextResponse.json({ success: true });
}

