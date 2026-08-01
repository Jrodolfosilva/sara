import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getStripe, ASSINATURA_PRECO_CENTAVOS, ASSINATURA_TRIAL_DIAS } from "@/lib/stripe";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: "Não encontrado" }, { status: 404 });
  }

  if (user.subscriptionStatus === "ACTIVE" || user.subscriptionStatus === "TRIALING") {
    return NextResponse.json({ error: "Já existe uma assinatura ativa" }, { status: 400 });
  }

  const stripe = getStripe();
  const origin = request.nextUrl.origin;

  let stripeCustomerId = user.stripeCustomerId;
  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.nome,
      metadata: { userId: user.id },
    });
    stripeCustomerId = customer.id;
    await prisma.user.update({
      where: { id: user.id },
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
          product_data: { name: "Busca Pebas — Assinatura mensal" },
        },
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: ASSINATURA_TRIAL_DIAS,
      metadata: { userId: user.id },
    },
    metadata: { userId: user.id },
    success_url: `${origin}/assinatura?status=sucesso`,
    cancel_url: `${origin}/assinatura?status=cancelado`,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
