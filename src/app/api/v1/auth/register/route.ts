import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { gerarTokenVerificacao } from "@/lib/emailVerification";
import { getClientIp, rateLimit, respostaLimitada } from "@/lib/rateLimit";

const schema = z.object({
  nome: z.string().min(2),
  email: z.string().email(),
  senha: z.string().min(6),
});

export async function POST(request: NextRequest) {
  const limite = rateLimit(`register:${getClientIp(request)}`, 5, 60 * 60 * 1000);
  if (!limite.permitido) return respostaLimitada(limite.retryAfterSegundos);

  const body = await request.json();
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { nome, email, senha } = parsed.data;

  const existente = await prisma.user.findUnique({ where: { email } });
  if (existente) {
    return NextResponse.json({ error: "E-mail já cadastrado" }, { status: 409 });
  }

  const senhaHash = await bcrypt.hash(senha, 10);
  const user = await prisma.user.create({
    data: { nome, email, senhaHash },
    select: { id: true, nome: true, email: true, role: true },
  });

  const token = gerarTokenVerificacao(user.id);
  const link = `${request.nextUrl.origin}/validacao?token=${token}`;
  sendEmail(
    user.email,
    "Confirme seu e-mail — Busca Pebas",
    `<p>Olá, ${user.nome}!</p><p>Confirme seu e-mail clicando no link abaixo (válido por 24h):</p><p><a href="${link}">${link}</a></p>`
  ).catch((error) => console.error("Falha ao enviar e-mail de verificação:", error));

  return NextResponse.json(user, { status: 201 });
}
