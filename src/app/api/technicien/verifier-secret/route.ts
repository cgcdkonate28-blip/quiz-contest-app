import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  secret: z.string().min(1),
});

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

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 400 }
    );
  }
}

