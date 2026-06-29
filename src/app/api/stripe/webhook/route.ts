// Stripe webhook → keeps public.subscriptions in sync with Stripe.
// Inert until STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET + SUPABASE_SERVICE_ROLE_KEY
// are set. Verifies the signature, then writes via the service-role client.
import { NextResponse } from 'next/server';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type Stripe from 'stripe';
import { getStripe, planForPriceId } from '@/lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function admin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const db = admin();
  if (!stripe || !secret || !db) {
    return NextResponse.json({ error: 'stripe_webhook_not_configured' }, { status: 503 });
  }

  const sig = req.headers.get('stripe-signature');
  if (!sig) return NextResponse.json({ error: 'missing_signature' }, { status: 400 });

  let event: Stripe.Event;
  try {
    const raw = await req.text();
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'bad_signature';
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const s = event.data.object as Stripe.Checkout.Session;
        const subId = typeof s.subscription === 'string' ? s.subscription : s.subscription?.id;
        const userId = s.client_reference_id || s.metadata?.user_id || null;
        if (subId && userId) {
          const sub = await stripe.subscriptions.retrieve(subId);
          await upsertSubscription(db, sub, userId);
        }
        break;
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await upsertSubscription(db, sub, null);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'handler_failed';
    return NextResponse.json({ received: true, warning: msg }, { status: 200 });
  }

  return NextResponse.json({ received: true });
}

async function upsertSubscription(db: SupabaseClient, sub: Stripe.Subscription, userId: string | null) {
  const item = sub.items?.data?.[0];
  const price = item?.price;
  const plan = planForPriceId(price?.id) || 'premium';
  const amountUsd = price?.unit_amount != null ? price.unit_amount / 100 : null;
  // Newer Stripe API exposes the period end on the subscription item, not the root.
  const periodEnd = item?.current_period_end ?? null;
  const row = {
    plan,
    status: sub.status,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at: sub.cancel_at ? new Date(sub.cancel_at * 1000).toISOString() : null,
    amount_usd: amountUsd,
    currency: price?.currency ?? 'usd',
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : sub.customer?.id ?? null,
    stripe_subscription_id: sub.id,
    updated_at: new Date().toISOString(),
  };

  // No unique constraint on stripe_subscription_id is assumed: update-then-insert.
  const { data: existing } = await db
    .from('subscriptions')
    .select('id')
    .eq('stripe_subscription_id', sub.id)
    .maybeSingle();

  if (existing) {
    await db.from('subscriptions').update(row).eq('id', (existing as { id: number }).id);
  } else if (userId) {
    await db.from('subscriptions').insert({ ...row, user_id: userId, starts_at: new Date().toISOString() });
  }
}
