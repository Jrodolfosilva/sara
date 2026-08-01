import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { gerarTokenResetSenha } from "@/lib/passwordReset";
import { getClientIp, rateLimit, respostaLimitada } from "@/lib/rateLimit";

const schema = z.object({ email: z.string().email() });

export async function POST(request: NextRequest) {
  const limite = rateLimit(`esqueci-senha:${getClientIp(request)}`, 5, 60 * 60 * 1000);
  if (!limite.permitido) return respostaLimitada(limite.retryAfterSegundos);

  const body = await request.json();
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { email } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  // Sempre responde igual, exista ou não a conta — evita enumeração de e-mails.
  if (user?.senhaHash) {
    const token = gerarTokenResetSenha(user.id);
    const link = `${request.nextUrl.origin}/redefinir-senha?token=${token}`;
    sendEmail(
      user.email,
      "Redefinir senha — Busca Pebas",
      `<p>Olá, ${user.nome}!</p><p>Clique no link abaixo pra redefinir sua senha (válido por 1h):</p><p><a href="${link}">${link}</a></p><p>Se não foi você, ignore este e-mail.</p>`
    ).catch((error) => console.error("Falha ao enviar e-mail de reset de senha:", error));
  }

  return NextResponse.json({ ok: true });
}
