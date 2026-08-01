import { NextRequest, NextResponse } from "next/server";
import { checkWhatsappExists } from "@/lib/evolution";
import { getClientIp, rateLimit, respostaLimitada } from "@/lib/rateLimit";

const numeroBrasilRegex = /^55\d{10,11}$/;

export async function POST(request: NextRequest) {
  const limite = rateLimit(`whatsapp-check:${getClientIp(request)}`, 20, 60 * 60 * 1000);
  if (!limite.permitido) return respostaLimitada(limite.retryAfterSegundos);

  const body = await request.json().catch(() => null);
  const numero = String(body?.whatsapp ?? "").replace(/\D/g, "");

  if (!numeroBrasilRegex.test(numero)) {
    return NextResponse.json({ error: "Número inválido" }, { status: 400 });
  }

  try {
    const exists = await checkWhatsappExists(numero);
    return NextResponse.json({ exists });
  } catch {
    return NextResponse.json({ error: "Não foi possível validar o número agora." }, { status: 502 });
  }
}
