import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import {
  createAdminSessionToken,
  ADMIN_SESSION_COOKIE_NAME,
} from "@/app/lib/admin-session";

const schema = z.object({
  nomOuPrenom: z.string().min(1, "Ce champ est requis"),
  adminKey: z.string().min(1, "La clé est requise"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = schema.parse(body);

    const admin = await prisma.admin.findFirst({
      where: {
        adminKey: data.adminKey.trim().toUpperCase(),
        OR: [
          { nom: { equals: data.nomOuPrenom.trim(), mode: "insensitive" } },
          {
            prenom: { equals: data.nomOuPrenom.trim(), mode: "insensitive" },
          },
        ],
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Identifiants incorrects" },
        { status: 401 }
      );
    }

    const token = await createAdminSessionToken({
      adminId: admin.id,
      nom: admin.nom,
      prenom: admin.prenom,
    });

    const response = NextResponse.json({ success: true });
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
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

