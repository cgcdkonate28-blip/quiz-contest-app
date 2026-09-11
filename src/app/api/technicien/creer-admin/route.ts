import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";

const schema = z.object({
  secret: z.string().min(1),
  nom: z.string().min(1, "Le nom est requis"),
  prenom: z.string().min(1, "Le prénom est requis"),
});

function generateAdminKey(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let key = "";
  for (let i = 0; i < 4; i++) {
    key += chars[Math.floor(Math.random() * chars.length)];
  }
  return key;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    if (data.secret !== process.env.TECHNICIAN_SECRET) {
      return NextResponse.json(
        { error: "Mot de passe secret incorrect" },
        { status: 401 }
      );
    }

    let adminKey = generateAdminKey();
    let existing = await prisma.admin.findUnique({ where: { adminKey } });
    while (existing) {
      adminKey = generateAdminKey();
      existing = await prisma.admin.findUnique({ where: { adminKey } });
    }

    const admin = await prisma.admin.create({
      data: {
        nom: data.nom,
        prenom: data.prenom,
        adminKey,
      },
    });

    return NextResponse.json({ success: true, adminKey: admin.adminKey });
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

