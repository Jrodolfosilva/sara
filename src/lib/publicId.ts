import { randomBytes } from "crypto";
import { Prisma } from "@prisma/client";

// Sem caracteres ambíguos (0/O, 1/I/L).
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function generatePublicId(prefix: "EMP" | "PRO") {
  const bytes = randomBytes(8);
  let code = "";
  for (let i = 0; i < bytes.length; i++) {
    code += ALPHABET[bytes[i] % ALPHABET.length];
  }
  return `${prefix}-${code}`;
}

/** Tenta criar com um código público novo a cada colisão de unicidade (P2002). */
export async function withUniquePublicId<T>(
  prefix: "EMP" | "PRO",
  create: (codigoPublico: string) => Promise<T>
): Promise<T> {
  for (let attempt = 1; attempt <= 5; attempt++) {
    try {
      return await create(generatePublicId(prefix));
    } catch (error) {
      const isUniqueViolation =
        error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
      if (!isUniqueViolation || attempt === 5) throw error;
    }
  }
  throw new Error("unreachable");
}
