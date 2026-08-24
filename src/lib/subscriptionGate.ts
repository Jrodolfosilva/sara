const DIAS_CARENCIA = 40;

export function stripeConfigurado(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

function limiteCarencia(): Date {
  return new Date(Date.now() - DIAS_CARENCIA * 24 * 60 * 60 * 1000);
}

// Filtro pra aplicar direto no where de Listing/Professional: passa quem ainda
// está na carência de 40 dias OU já tem assinatura válida pra aquele negócio
// específico. Sem Stripe configurado, não filtra nada.
// Tipo estrutural (não usa Prisma.ListingWhereInput) de propósito: assim o mesmo
// filtro é aceito tanto em ListingWhereInput quanto ProfessionalWhereInput sem
// contaminar o `where` com os ~40 campos branded do Listing.
type GateFiltro = {
  OR: [{ criadoEm: { gt: Date } }, { subscriptionStatus: { in: ("ACTIVE" | "TRIALING")[] } }];
};

export function gateAssinaturaItem(): GateFiltro | undefined {
  if (!stripeConfigurado()) return undefined;

  return {
    OR: [
      { criadoEm: { gt: limiteCarencia() } },
      { subscriptionStatus: { in: ["ACTIVE", "TRIALING"] } },
    ],
  };
}

// Mesma regra, mas pra checar um negócio já carregado em memória (rotas de item único).
export function passaGateAssinatura(item: { criadoEm: Date; subscriptionStatus: string }): boolean {
  if (!stripeConfigurado()) return true;
  if (item.criadoEm > limiteCarencia()) return true;
  return item.subscriptionStatus === "ACTIVE" || item.subscriptionStatus === "TRIALING";
}

type ComCamposAssinatura = {
  stripeSubscriptionId?: unknown;
  subscriptionStatus?: unknown;
  trialEndsAt?: unknown;
  currentPeriodEnd?: unknown;
};

// Tira os campos de billing (Stripe) do objeto antes de mandar pra fora em
// resposta pública — evitar vazar status/ID de assinatura pra qualquer visitante.
export function semCamposAssinatura<T extends ComCamposAssinatura>(
  item: T
): Omit<T, "stripeSubscriptionId" | "subscriptionStatus" | "trialEndsAt" | "currentPeriodEnd"> {
  const { stripeSubscriptionId: _a, subscriptionStatus: _b, trialEndsAt: _c, currentPeriodEnd: _d, ...resto } = item;
  return resto;
}
