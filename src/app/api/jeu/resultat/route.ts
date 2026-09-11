import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const gameSettings = await prisma.gameSettings.findFirst();

  if (!gameSettings || !gameSettings.resultatsPublies) {
    return NextResponse.json({ publies: false });
  }

  const attempts = await prisma.attempt.findMany({
    where: { status: "termine" },
    include: { user: { select: { username: true } } },
    orderBy: [{ scoreTotal: "desc" }, { tempsTotal: "asc" }],
  });

  const classementComplet = attempts.map((a, index) => ({
    rang: index + 1,
    username: a.user.username,
    score: a.scoreTotal,
  }));

  const top3 = classementComplet.slice(0, 3);

  const moi = classementComplet.find((c) => c.username === session.username);

  return NextResponse.json({
    publies: true,
    top3,
    monRang: moi ? moi.rang : null,
    monScore: moi ? moi.score : null,
    aJoue: !!moi,
  });
}

