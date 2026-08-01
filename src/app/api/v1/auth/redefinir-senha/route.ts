import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verificarTokenResetSenha } from "@/lib/passwordReset";

const schema = z.object({
  token: z.string().min(1),
  novaSenha: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { token, novaSenha } = parsed.data;
  const userId = verificarTokenResetSenha(token);
  if (!userId) {
    return NextResponse.json({ error: "Link inválido ou expirado" }, { status: 400 });
  }

  const senhaHash = await bcrypt.hash(novaSenha, 10);
  const { count } = await prisma.user.updateMany({
    where: { id: userId },
    data: { senhaHash },
  });
  if (count === 0) {
    return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
