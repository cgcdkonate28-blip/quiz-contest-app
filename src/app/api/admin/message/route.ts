import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/admin-session";

const schema = z.object({
  texte: z.string().min(1, "Le message ne peut pas être vide"),
});

export async function GET() {
  const message = await prisma.adminMessage.findFirst({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ message: message?.texte || null });
}

export async function POST(request: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const data = schema.parse(body);

    const message = await prisma.adminMessage.create({
      data: { texte: data.texte },
    });

    return NextResponse.json({ success: true, message: message.texte });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}

