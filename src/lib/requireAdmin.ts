import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { session: null, response: NextResponse.json({ error: "Acesso negado" }, { status: 403 }) };
  }
  return { session, response: null };
}
