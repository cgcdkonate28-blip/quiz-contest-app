import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/admin-session";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const candidats = await prisma.user.findMany({
    select: {
      id: true,
      nom: true,
      prenom: true,
      username: true,
      email: true,
      tiktokHandle: true,
      createdAt: true,
    },
    orderBy: { username: "asc" },
  });

  return NextResponse.json({ candidats });
}

