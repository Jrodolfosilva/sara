import Stripe from "stripe";

let stripeClient: Stripe | undefined;

export function getStripe(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error("STRIPE_SECRET_KEY não configurada no .env");
    }
    stripeClient = new Stripe(secretKey);
  }
  return stripeClient;
}

export const ASSINATURA_PRECO_CENTAVOS = 4000;
export const ASSINATURA_TRIAL_DIAS = 30;
