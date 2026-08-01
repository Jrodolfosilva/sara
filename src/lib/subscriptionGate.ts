import type { Prisma } from "@prisma/client";

const DIAS_CARENCIA = 40;

export function stripeConfigurado(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function limiteCarencia(): Date {
  return new Date(Date.now() - DIAS_CARENCIA * 24 * 60 * 60 * 1000);
}

// Filtro Prisma pra aplicar em `where.owner`: passa quem ainda está na carência
// de 40 dias OU já tem assinatura válida. Sem Stripe configurado, não filtra nada.
export function gateAssinaturaOwner(): Prisma.UserWhereInput | undefined {
  if (!stripeConfigurado()) return undefined;

  return {
    OR: [
      { criadoEm: { gt: limiteCarencia() } },
      { subscriptionStatus: { in: ["ACTIVE", "TRIALING"] } },
    ],
  };
}

// Mesma regra, mas pra checar um owner já carregado em memória (rotas de item único).
export function passaGateAssinatura(owner: { criadoEm: Date; subscriptionStatus: string }): boolean {
  if (!stripeConfigurado()) return true;
  if (owner.criadoEm > limiteCarencia()) return true;
  return owner.subscriptionStatus === "ACTIVE" || owner.subscriptionStatus === "TRIALING";
}
