import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/admin-session";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const attempt = await prisma.attempt.findUnique({
    where: { userId: id },
    include: {
      answerDetails: {
        include: { question: true },
      },
    },
  });

  if (!attempt) {
    return NextResponse.json({ hasAttempt: false });
  }

  const reponses = attempt.answerDetails
    .sort((a, b) => a.question.ordre - b.question.ordre)
    .map((ad) => ({
      question: ad.question.texte,
      reponseDonnee: ad.reponseDonnee,
      bonneReponse: ad.question.bonneReponse,
      pointsObtenus: ad.pointsObtenus,
    }));

  return NextResponse.json({
    hasAttempt: true,
    scoreTotal: attempt.scoreTotal,
    tempsTotal: attempt.tempsTotal,
    reponses,
  });
}

