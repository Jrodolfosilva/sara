import crypto from "crypto";

const key = Buffer.from(process.env.CPF_ENCRYPTION_KEY ?? "", "base64");

export function encrypt(text: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const ciphertext = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, ciphertext]).toString("base64");
}

export function decrypt(payload: string): string {
  const raw = Buffer.from(payload, "base64");
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const ciphertext = raw.subarray(28);
  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(ciphertext), decipher.final()]).toString("utf8");
}

// Determinístico — mesmo CPF sempre gera o mesmo hash, usado só p/ checar duplicidade.
// encrypt()/decrypt() usam IV aleatório e não servem pra isso.
export function hashCpf(cpf: string): string {
  return crypto.createHmac("sha256", key).update(cpf).digest("hex");
}
