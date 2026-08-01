import crypto from "crypto";

const secret = process.env.AUTH_SECRET ?? "";
const VALIDADE_MS = 24 * 60 * 60 * 1000;

function assinar(payload: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function gerarTokenVerificacao(userId: string): string {
  const expiraEm = Date.now() + VALIDADE_MS;
  const payload = `${userId}.${expiraEm}`;
  const assinatura = assinar(payload);
  return `${Buffer.from(payload).toString("base64url")}.${assinatura}`;
}

export function verificarTokenVerificacao(token: string): string | null {
  const [payloadB64, assinatura] = token.split(".");
  if (!payloadB64 || !assinatura) return null;

  const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  const esperada = assinar(payload);

  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  const [userId, expiraEmStr] = payload.split(".");
  const expiraEm = Number(expiraEmStr);
  if (!userId || !expiraEm || Date.now() > expiraEm) return null;

  return userId;
}
