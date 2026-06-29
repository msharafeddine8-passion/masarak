// Creates a Stripe Checkout Session for the signed-in user and returns its URL.
// Inert (503) until STRIPE_SECRET_KEY + the plan's STRIPE_PRICE_* are configured.
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getStripe, priceIdForPlan } from '@/lib/stripe';
import { SITE } from '@/lib/site-config';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const stripe = getStripe();
  if (!stripe) return NextResponse.json({ error: 'stripe_not_configured' }, { status: 503 });

  let body: { plan?: string } = {};
  try { body = await req.json(); } catch { /* ignore */ }
  const plan = body.plan || '';
  const price = priceIdForPlan(plan);
  if (!price) return NextResponse.json({ error: 'unknown_or_unpriced_plan' }, { status: 400 });

  // Require an authenticated user (so we can attribute the subscription).
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'not_authenticated' }, { status: 401 });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price, quantity: 1 }],
      client_reference_id: user.id,
      customer_email: user.email ?? undefined,
      metadata: { user_id: user.id, plan },
      success_url: `${SITE.url}/dashboard?checkout=success`,
      cancel_url: `${SITE.url}/pricing?checkout=cancelled`,
      allow_promotion_codes: true,
    });
    return NextResponse.json({ url: session.url });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'checkout_failed';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
