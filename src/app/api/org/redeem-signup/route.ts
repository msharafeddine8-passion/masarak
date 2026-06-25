// src/app/api/org/redeem-signup/route.ts
// Server-side endpoint that creates an org owner account from a valid invite,
// SKIPPING email confirmation (the invite IS the email proof).
// Requires SUPABASE_SERVICE_ROLE_KEY in Vercel env.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { checkRateLimit, getClientId, rateLimitResponse } from '@/lib/ratelimit';
import type { NextRequest } from 'next/server';

export const runtime = 'nodejs';

type InviteLookup = {
  ok: boolean;
  error?: string;
  email?: string;
  org_type?: string;
  org_hint?: string;
  role?: string;
};

export async function POST(req: Request) {
  // Rate limit by client IP — auth-adjacent, anon abuse risk
  const rl = await checkRateLimit('auth', `ip:${getClientId(req as NextRequest)}`);
  if (!rl.success) return rateLimitResponse(rl);

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  if (!serviceKey) {
    return NextResponse.json({
      ok: false,
      error: 'service_role_not_configured',
      hint: 'Add SUPABASE_SERVICE_ROLE_KEY to Vercel env (from Supabase Dashboard → Settings → API → service_role).',
    }, { status: 503 });
  }

  let body: { token?: string; name?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'invalid_body' }, { status: 400 });
  }

  const { token, name, password } = body;
  if (!token || typeof token !== 'string') {
    return NextResponse.json({ ok: false, error: 'missing_token' }, { status: 400 });
  }
  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ ok: false, error: 'missing_name' }, { status: 400 });
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return NextResponse.json({ ok: false, error: 'password_too_short' }, { status: 400 });
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  // Step 1: validate the invite by token (server-side, safe)
  const anonClient = createClient(supabaseUrl, anonKey, { auth: { persistSession: false } });
  const { data: lookup, error: lookupErr } = await anonClient.rpc('lookup_org_invite', { p_token: token });
  if (lookupErr) {
    return NextResponse.json({ ok: false, error: 'lookup_failed', detail: lookupErr.message }, { status: 500 });
  }
  const inv = lookup as InviteLookup;
  if (!inv?.ok) {
    return NextResponse.json({ ok: false, error: inv?.error || 'invite_invalid' }, { status: 400 });
  }
  if (!inv.email) {
    return NextResponse.json({ ok: false, error: 'invite_no_email' }, { status: 400 });
  }

  // Step 2: create or handle existing user
  // List users to find if this email already exists (confirmed OR unconfirmed).
  // An unconfirmed user can be created by the client-side signUp() call before
  // reaching this route — we must handle that case instead of returning 409.
  const { data: existing } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
  const found = existing?.users?.find(
    u => (u.email || '').toLowerCase() === inv.email!.toLowerCase()
  );

  let userId: string;

  if (found) {
    if (found.email_confirmed_at) {
      // Confirmed user already exists → they should sign in with existing credentials
      return NextResponse.json({
        ok: false,
        error: 'user_exists',
        hint: 'Use the "I have an account" tab to sign in with your existing password.',
      }, { status: 409 });
    }

    // Unconfirmed user exists (was created by client-side signUp() just before this call).
    // Confirm their email and update metadata + password so they can sign in immediately.
    const { error: updateErr } = await admin.auth.admin.updateUserById(found.id, {
      email_confirm: true,
      password,
      user_metadata: {
        full_name: name.trim(),
        role: 'org_owner',
        org_type: inv.org_type,
        org_hint: inv.org_hint,
        invite_token: token,
      },
    });
    if (updateErr) {
      return NextResponse.json({
        ok: false,
        error: 'confirm_user_failed',
        detail: updateErr.message,
      }, { status: 500 });
    }
    userId = found.id;
  } else {
    // No user with this email — create fresh with email already confirmed.
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email: inv.email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: name.trim(),
        role: 'org_owner',
        org_type: inv.org_type,
        org_hint: inv.org_hint,
        invite_token: token,
      },
    });
    if (createErr || !created?.user) {
      return NextResponse.json({
        ok: false,
        error: 'create_user_failed',
        detail: createErr?.message || 'unknown',
      }, { status: 500 });
    }
    userId = created.user.id;
  }

  // Step 3: ensure user_profiles row exists with role='org_owner'
  // (The handle_new_user trigger may have already created it; upsert is idempotent.)
  try {
    await admin.from('user_profiles').upsert({
      id: userId,
      email: inv.email,
      full_name: name.trim(),
      primary_role: 'org_owner',
    }, { onConflict: 'id' });
  } catch (e) {
    console.warn('[redeem-signup] user_profiles upsert failed', e);
  }

  return NextResponse.json({
    ok: true,
    user_id: userId,
    email: inv.email,
  });
}
