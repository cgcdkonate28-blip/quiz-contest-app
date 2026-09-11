import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { hashPassword, generateUniqueIdCandidate } from "@/app/lib/auth-utils";

const inscriptionSchema = z
  .object({
    nom: z.string().min(1, "Le nom est requis"),
    prenom: z.string().min(1, "Le prénom est requis"),
    username: z.string().min(3, "Le username doit faire au moins 3 caractères"),
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(4, "Le mot de passe doit faire au moins 4 caractères")
      .regex(/[A-Z]/, "Le mot de passe doit contenir au moins une majuscule")
      .regex(/[a-z]/, "Le mot de passe doit contenir au moins une minuscule")
      .regex(/[0-9]/, "Le mot de passe doit contenir au moins un chiffre"),
    confirmationPassword: z.string(),
    tiktokHandle: z
      .string()
      .regex(/^@/, "Le compte TikTok doit commencer par @")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmationPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmationPassword"],
  });

async function generateUniqueId(nom: string): Promise<string> {
  let id = generateUniqueIdCandidate(nom);
  let existing = await prisma.user.findUnique({ where: { uniqueCode: id } });

  while (existing) {
    id = generateUniqueIdCandidate(nom);
    existing = await prisma.user.findUnique({ where: { uniqueCode: id } });
  }

  return id;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = inscriptionSchema.parse(body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: data.email }, { username: data.username }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email ou ce username est déjà utilisé" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(data.password);
    const uniqueCode = await generateUniqueId(data.nom);

    const user = await prisma.user.create({
      data: {
        nom: data.nom,
        prenom: data.prenom,
        username: data.username,
        email: data.email,
        passwordHash,
        tiktokHandle: data.tiktokHandle || "",
        uniqueCode,
        emailVerified: true,
      },
    });

    return NextResponse.json({ success: true, uniqueCode: user.uniqueCode });
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
