import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/admin-session";

const schema = z.object({
  debut: z.string().min(1, "La date de début est requise"),
  fin: z.string().min(1, "La date de fin est requise"),
});

export async function GET() {
  const gameSettings = await prisma.gameSettings.findFirst();
  return NextResponse.json({
    dateHeureDebut: gameSettings?.dateHeureDebut || null,
    dateHeureFin: gameSettings?.dateHeureFin || null,
  });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);

    const debut = new Date(data.debut);
    const fin = new Date(data.fin);
    const now = new Date();

    if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
      return NextResponse.json({ error: "Date invalide" }, { status: 400 });
    }

    if (debut.getTime() < now.getTime() - 60000) {
      return NextResponse.json(
        { error: "La date de début ne peut pas être dans le passé" },
        { status: 400 }
      );
    }

    if (fin.getTime() - debut.getTime() < 30 * 60 * 1000) {
      return NextResponse.json(
        { error: "La fin doit être au moins 30 minutes après le début" },
        { status: 400 }
      );
    }

    const existing = await prisma.gameSettings.findFirst();

    if (existing) {
      await prisma.gameSettings.update({
        where: { id: existing.id },
        data: { dateHeureDebut: debut, dateHeureFin: fin },
      });
    } else {
      await prisma.gameSettings.create({
        data: { dateHeureDebut: debut, dateHeureFin: fin },
      });
    }

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

