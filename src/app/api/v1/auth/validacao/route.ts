import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verificarTokenVerificacao } from "@/lib/emailVerification";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token ausente" }, { status: 400 });
  }

  const userId = verificarTokenVerificacao(token);
  if (!userId) {
    return NextResponse.json({ error: "Token inválido ou expirado" }, { status: 400 });
  }

  const { count } = await prisma.user.updateMany({
    where: { id: userId },
    data: { emailVerificado: true },
  });
  if (count === 0) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
