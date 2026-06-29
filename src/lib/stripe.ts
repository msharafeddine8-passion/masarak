// Lazy Stripe server client + plan→price mapping.
// Everything is gated on env vars so the integration is completely INERT until
// the owner adds keys in Vercel — no key, no Stripe calls, no errors.
import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!_stripe) _stripe = new Stripe(key);
  return _stripe;
}

// Map internal plan codes → Stripe Price IDs (set these in Vercel env once the
// products/prices exist in the Stripe dashboard).
export function priceIdForPlan(plan: string): string | undefined {
  const map: Record<string, string | undefined> = {
    premium: process.env.STRIPE_PRICE_PREMIUM,
    uni_basic: process.env.STRIPE_PRICE_UNI_BASIC,
    uni_pro: process.env.STRIPE_PRICE_UNI_PRO,
    school_basic: process.env.STRIPE_PRICE_SCHOOL_BASIC,
    school_pro: process.env.STRIPE_PRICE_SCHOOL_PRO,
  };
  return map[plan];
}

export function planForPriceId(priceId: string | null | undefined): string | null {
  if (!priceId) return null;
  const entries: Array<[string, string | undefined]> = [
    ['premium', process.env.STRIPE_PRICE_PREMIUM],
    ['uni_basic', process.env.STRIPE_PRICE_UNI_BASIC],
    ['uni_pro', process.env.STRIPE_PRICE_UNI_PRO],
    ['school_basic', process.env.STRIPE_PRICE_SCHOOL_BASIC],
    ['school_pro', process.env.STRIPE_PRICE_SCHOOL_PRO],
  ];
  for (const [plan, id] of entries) if (id && id === priceId) return plan;
  return null;
}
