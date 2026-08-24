import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

const statusMap: Record<Stripe.Subscription.Status, "TRIALING" | "ACTIVE" | "PAST_DUE" | "CANCELED" | "INCOMPLETE"> = {
  trialing: "TRIALING",
  active: "ACTIVE",
  past_due: "PAST_DUE",
  canceled: "CANCELED",
  incomplete: "INCOMPLETE",
  incomplete_expired: "CANCELED",
  unpaid: "PAST_DUE",
  paused: "CANCELED",
};

async function syncSubscription(subscription: Stripe.Subscription) {
  const tipo = subscription.metadata?.tipo;
  const itemId = subscription.metadata?.itemId;

  const periodEndItem = subscription.items.data[0]?.current_period_end;
  const data = {
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: statusMap[subscription.status] ?? "NONE",
    trialEndsAt: subscription.trial_end ? new Date(subscription.trial_end * 1000) : null,
    currentPeriodEnd: periodEndItem ? new Date(periodEndItem * 1000) : null,
  };

  if (tipo === "listing" && itemId) {
    await prisma.listing.updateMany({ where: { id: itemId }, data });
    return;
  }
  if (tipo === "professional" && itemId) {
    await prisma.professional.updateMany({ where: { id: itemId }, data });
    return;
  }

  // Fallback pra eventos sem metadata (ex: assinatura editada direto no Stripe):
  // acha o negócio pelo id da assinatura, em qualquer uma das duas tabelas.
  const listing = await prisma.listing.findUnique({ where: { stripeSubscriptionId: subscription.id } });
  if (listing) {
    await prisma.listing.update({ where: { id: listing.id }, data });
    return;
  }
  const professional = await prisma.professional.findUnique({ where: { stripeSubscriptionId: subscription.id } });
  if (professional) {
    await prisma.professional.update({ where: { id: professional.id }, data });
  }
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "Webhook não configurado" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Assinatura ausente" }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Assinatura inválida" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const checkoutSession = event.data.object as Stripe.Checkout.Session;
      if (checkoutSession.subscription) {
        const subscriptionId =
          typeof checkoutSession.subscription === "string"
            ? checkoutSession.subscription
            : checkoutSession.subscription.id;
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        await syncSubscription(subscription);
      }
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      await syncSubscription(event.data.object as Stripe.Subscription);
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
