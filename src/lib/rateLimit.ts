import { NextResponse } from "next/server";

type Balde = { count: number; resetEm: number };

// Em memória — funciona porque o app roda em container único (não serverless multi-instância).
const baldes = new Map<string, Balde>();

// Request comum (não NextRequest) pra funcionar também dentro do authorize() do NextAuth.
export function getClientIp(request: Request): string {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"
  );
}

// Janela fixa: `limite` requisições por `janelaMs` milissegundos, por chave.
export function rateLimit(
  chave: string,
  limite: number,
  janelaMs: number
): { permitido: boolean; retryAfterSegundos: number } {
  const agora = Date.now();
  const balde = baldes.get(chave);

  if (!balde || agora > balde.resetEm) {
    baldes.set(chave, { count: 1, resetEm: agora + janelaMs });
    return { permitido: true, retryAfterSegundos: 0 };
  }

  if (balde.count >= limite) {
    return { permitido: false, retryAfterSegundos: Math.ceil((balde.resetEm - agora) / 1000) };
  }

  balde.count++;
  return { permitido: true, retryAfterSegundos: 0 };
}

export function respostaLimitada(retryAfterSegundos: number) {
  return NextResponse.json(
    { error: "Muitas tentativas. Tente novamente em instantes." },
    { status: 429, headers: { "Retry-After": String(retryAfterSegundos) } }
  );
}

// Varredura simples pra não vazar memória com chaves velhas (chamada ocasional é suficiente).
setInterval(() => {
  const agora = Date.now();
  for (const [chave, balde] of baldes) {
    if (agora > balde.resetEm) baldes.delete(chave);
  }
}, 10 * 60 * 1000).unref();
