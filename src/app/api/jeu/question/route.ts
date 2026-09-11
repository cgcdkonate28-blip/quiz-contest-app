import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getSession } from "@/app/lib/session";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const gameSettings = await prisma.gameSettings.findFirst();
  const now = new Date();

  if (
    !gameSettings ||
    !gameSettings.dateHeureDebut ||
    !gameSettings.dateHeureFin ||
    now < gameSettings.dateHeureDebut
  ) {
    return NextResponse.json({ ouvert: false });
  }

  if (now > gameSettings.dateHeureFin) {
    return NextResponse.json({ ouvert: false, ferme: true });
  }

  const totalQuestions = await prisma.question.count();

  let attempt = await prisma.attempt.findUnique({
    where: { userId: session.userId },
  });

  if (attempt && attempt.status === "termine") {
    return NextResponse.json({
      ouvert: true,
      termine: true,
      scoreTotal: attempt.scoreTotal,
    });
  }

  if (!attempt) {
    attempt = await prisma.attempt.create({
      data: { userId: session.userId, status: "en_cours" },
    });
  }

  const answeredCount = await prisma.answerDetail.count({
    where: { attemptId: attempt.id },
  });

  if (answeredCount >= totalQuestions) {
    const details = await prisma.answerDetail.findMany({
      where: { attemptId: attempt.id },
    });
    const scoreTotal = details.reduce((s, d) => s + d.pointsObtenus, 0);
    const tempsTotal = Math.floor(
      (Date.now() - attempt.startedAt.getTime()) / 1000
    );

    await prisma.attempt.update({
      where: { id: attempt.id },
      data: {
        status: "termine",
        submittedAt: new Date(),
        scoreTotal,
        tempsTotal,
      },
    });

    return NextResponse.json({ ouvert: true, termine: true, scoreTotal });
  }

  const question = await prisma.question.findFirst({
    where: { ordre: answeredCount + 1 },
  });

  if (!question) {
    return NextResponse.json({ ouvert: true, termine: true, scoreTotal: 0 });
  }

  await prisma.answerDetail.upsert({
    where: {
      attemptId_questionId: {
        attemptId: attempt.id,
        questionId: question.id,
      },
    },
    update: {},
    create: {
      attemptId: attempt.id,
      questionId: question.id,
      reponseDonnee: null,
      correcte: false,
      tempsPris: 0,
      pointsObtenus: 0,
      repondu: false,
    },
  });

  return NextResponse.json({
    ouvert: true,
    termine: false,
    numero: answeredCount + 1,
    total: totalQuestions,
    tempsImparti: question.tempsImparti,
    question: {
      id: question.id,
      texte: question.texte,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
    },
  });
}

