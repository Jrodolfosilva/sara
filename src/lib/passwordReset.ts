import crypto from "crypto";

const secret = process.env.AUTH_SECRET ?? "";
const VALIDADE_MS = 60 * 60 * 1000; // 1h — senha é sensível, prazo mais curto que verificação de email

function assinar(payload: string) {
  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}

export function gerarTokenResetSenha(userId: string): string {
  const expiraEm = Date.now() + VALIDADE_MS;
  const payload = `reset.${userId}.${expiraEm}`;
  const assinatura = assinar(payload);
  return `${Buffer.from(payload).toString("base64url")}.${assinatura}`;
}

export function verificarTokenResetSenha(token: string): string | null {
  const [payloadB64, assinatura] = token.split(".");
  if (!payloadB64 || !assinatura) return null;

  const payload = Buffer.from(payloadB64, "base64url").toString("utf8");
  const esperada = assinar(payload);

  const a = Buffer.from(assinatura);
  const b = Buffer.from(esperada);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  // Prefixo "reset" impede que um token de verificação de e-mail seja reaproveitado aqui.
  const [marcador, userId, expiraEmStr] = payload.split(".");
  if (marcador !== "reset") return null;

  const expiraEm = Number(expiraEmStr);
  if (!userId || !expiraEm || Date.now() > expiraEm) return null;

  return userId;
}
