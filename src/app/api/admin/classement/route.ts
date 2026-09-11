import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/admin-session";

export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const attempts = await prisma.attempt.findMany({
    where: { status: "termine" },
    include: { user: { select: { username: true } } },
    orderBy: [{ scoreTotal: "desc" }, { tempsTotal: "asc" }],
  });

  const classement = attempts.map((a, index) => ({
    rang: index + 1,
    username: a.user.username,
    score: a.scoreTotal,
    temps: a.tempsTotal,
  }));

  const gameSettings = await prisma.gameSettings.findFirst();

  return NextResponse.json({
    classement,
    resultatsPublies: gameSettings?.resultatsPublies || false,
  });
}

