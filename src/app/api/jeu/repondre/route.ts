import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

const schema = z.object({
  questionId: z.string().min(1),
  reponse: z.enum(["A", "B", "C", "D"]).nullable(),
  tempsPris: z.number().int().min(0).max(120),
});

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);

    const gameSettings = await prisma.gameSettings.findFirst();
    const now = new Date();

    if (
      !gameSettings ||
      !gameSettings.dateHeureFin ||
      now > gameSettings.dateHeureFin
    ) {
      return NextResponse.json(
        { error: "La fenêtre de jeu est fermée" },
        { status: 403 }
      );
    }

    const attempt = await prisma.attempt.findUnique({
      where: { userId: session.userId },
    });

    if (!attempt || attempt.status === "termine") {
      return NextResponse.json(
        { error: "Aucune tentative en cours" },
        { status: 400 }
      );
    }

    const question = await prisma.question.findUnique({
      where: { id: data.questionId },
    });

    if (!question) {
      return NextResponse.json(
        { error: "Question introuvable" },
        { status: 404 }
      );
    }

    const answerDetail = await prisma.answerDetail.findFirst({
      where: { attemptId: attempt.id, questionId: question.id },
    });

    if (!answerDetail) {
      return NextResponse.json(
        { error: "Question non réservée" },
        { status: 400 }
      );
    }

    const correcte = data.reponse === question.bonneReponse;
    const pointsObtenus = correcte ? 10 : 0;

    await prisma.answerDetail.update({
      where: { id: answerDetail.id },
      data: {
        reponseDonnee: data.reponse,
        correcte,
        tempsPris: data.tempsPris,
        pointsObtenus,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    console.error(error);
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

