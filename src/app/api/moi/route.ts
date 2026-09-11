import { NextResponse } from "next/server";
import { getSession } from "@/app/lib/session";

export async function GET() {
  const session = await getSession();
  return NextResponse.json({ loggedIn: !!session });
}

