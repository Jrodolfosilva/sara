import { prisma } from "@/lib/prisma";
import { getStripe, ASSINATURA_PRECO_CENTAVOS, ASSINATURA_TRIAL_DIAS } from "@/lib/stripe";

export type TipoNegocio = "listing" | "professional";

type ItemAssinavel = {
  id: string;
  nome: string;
  ownerId: string;
  subscriptionStatus: string;
};

async function buscarItem(tipo: TipoNegocio, id: string): Promise<ItemAssinavel | null> {
  if (tipo === "listing") {
    return prisma.listing.findUnique({
      where: { id },
      select: { id: true, nome: true, ownerId: true, subscriptionStatus: true },
    });
  }
  return prisma.professional.findUnique({
    where: { id },
    select: { id: true, nome: true, ownerId: true, subscriptionStatus: true },
  });
}

export class AssinaturaError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

// Cria (ou reaproveita) o checkout de assinatura de um negócio específico.
// Usado tanto pelo dono (fluxo normal) quanto pelo admin (gerar link manualmente).
export async function criarCheckoutNegocio(params: {
  tipo: TipoNegocio;
  id: string;
  origin: string;
}) {
  const { tipo, id, origin } = params;

  const item = await buscarItem(tipo, id);
  if (!item) {
    throw new AssinaturaError("Negócio não encontrado", 404);
  }
  if (item.subscriptionStatus === "ACTIVE" || item.subscriptionStatus === "TRIALING") {
    throw new AssinaturaError("Este negócio já tem assinatura ativa", 400);
  }

  const owner = await prisma.user.findUnique({ where: { id: item.ownerId } });
  if (!owner) {
    throw new AssinaturaError("Dono do negócio não encontrado", 404);
  }

  const stripe = getStripe();

  let stripeCustomerId = owner.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: owner.email,
      name: owner.nome,
      metadata: { userId: owner.id },
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({
      where: { id: owner.id },
      data: { stripeCustomerId },
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [
      {
        price_data: {
          currency: "brl",
          unit_amount: ASSINATURA_PRECO_CENTAVOS,
          recurring: { interval: "month" },
          product_data: { name: `Busca Pebas — Assinatura: ${item.nome}` },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: ASSINATURA_TRIAL_DIAS,
      metadata: { tipo, itemId: item.id },
    },
    metadata: { tipo, itemId: item.id },
    success_url: `${origin}/assinatura?status=sucesso`,
    cancel_url: `${origin}/assinatura?status=cancelado`,
  });

  if (!checkoutSession.url) {
    throw new AssinaturaError("Não foi possível gerar o link de pagamento", 500);
  }

  return checkoutSession.url;
}
