import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";

const schema = z.object({
  uniqueCode: z.string().min(1),
  nom: z.string().min(1),
  prenom: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const user = await prisma.user.findFirst({
      where: {
        uniqueCode: data.uniqueCode.trim().toUpperCase(),
        nom: { equals: data.nom.trim(), mode: "insensitive" },
        prenom: { equals: data.prenom.trim(), mode: "insensitive" },
        username: { equals: data.username.trim(), mode: "insensitive" },
        email: { equals: data.email.trim(), mode: "insensitive" },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Aucun compte ne correspond à ces informations" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: user.id,
      prenom: user.prenom,
      nom: user.nom,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
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
