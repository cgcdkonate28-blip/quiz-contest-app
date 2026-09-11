import { NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getAdminSession } from "@/app/lib/admin-session";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;

  const attempt = await prisma.attempt.findUnique({
    where: { userId: id },
  });

  if (attempt) {
    await prisma.answerDetail.deleteMany({
      where: { attemptId: attempt.id },
    });
    await prisma.attempt.delete({ where: { id: attempt.id } });
  }

  return NextResponse.json({ success: true });
}

