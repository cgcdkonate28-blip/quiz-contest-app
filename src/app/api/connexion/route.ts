import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { verifyPassword } from "@/app/lib/auth-utils";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/app/lib/session";

const connexionSchema = z.object({
  uniqueCode: z.string().min(1, "L'identifiant est requis"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = connexionSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { uniqueCode: data.uniqueCode.trim().toUpperCase() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Identifiant ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    const valid = await verifyPassword(data.password, user.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Identifiant ou mot de passe incorrect" },
        { status: 401 }
      );
    }

    const token = await createSessionToken({
      userId: user.id,
      uniqueCode: user.uniqueCode,
      username: user.username,
    });

    const response = NextResponse.json({
      success: true,
      username: user.username,
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
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
