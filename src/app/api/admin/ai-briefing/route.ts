// src/app/api/admin/ai-briefing/route.ts
// Server-side endpoint that generates the AI CEO daily briefing.
// Gated by ANTHROPIC_API_KEY env var + admin email check.

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { generateDailyBriefing, hasAi } from '@/lib/ai';
import { ADMIN_EMAIL } from '@/lib/permissions/capabilities';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey   = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  // Verify caller is admin via the JWT they send (Bearer or supabase cookie)
  const auth = req.headers.get('authorization') || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!bearer) return NextResponse.json({ ok: false, error: 'missing_token' }, { status: 401 });

  const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: `Bearer ${bearer}` } } });
  const { data: { user }, error: userErr } = await userClient.auth.getUser();
  if (userErr || !user) return NextResponse.json({ ok: false, error: 'not_signed_in' }, { status: 401 });
  if ((user.email || '').toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ ok: false, error: 'forbidden' }, { status: 403 });
  }

  if (!hasAi()) {
    return NextResponse.json({
      ok: false,
      error: 'ai_not_configured',
      hint: 'Set ANTHROPIC_API_KEY in Vercel env to activate.',
    }, { status: 503 });
  }

  // Use service role to read all stats (bypassing RLS).
  const admin = serviceKey
    ? createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })
    : userClient;

  // Gather yesterday's snapshot
  const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
  const monthAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();

  const snapshot = {
    yesterdayNewUsers: 0,
    yesterdayActiveUsers: 0,
    yesterdaySaves: 0,
    yesterdayDnaCompletions: 0,
    totalUsers: 0,
    pendingInvites: 0,
    staleUniversities: 0,
    staleSchools: 0,
    openTickets: 0,
  };

  try {
    const { data: kpi } = await admin.rpc('admin_kpi_overview');
    if (kpi) {
      snapshot.totalUsers = (kpi as { totalUsers?: number }).totalUsers || 0;
      snapshot.pendingInvites = (kpi as { pendingInvites?: number }).pendingInvites || 0;
      snapshot.openTickets = (kpi as { openTickets?: number }).openTickets || 0;
    }
    const { count: newUsersC } = await admin.from('analytics_events').select('id', { count: 'exact', head: true })
      .eq('event_name', 'register_complete').gte('created_at', dayAgo);
    snapshot.yesterdayNewUsers = newUsersC || 0;

    const { count: activeC } = await admin.from('analytics_events').select('id', { count: 'exact', head: true })
      .gte('created_at', dayAgo);
    snapshot.yesterdayActiveUsers = activeC || 0;

    const { count: savesC } = await admin.from('analytics_events').select('id', { count: 'exact', head: true })
      .eq('event_name', 'save_item').gte('created_at', dayAgo);
    snapshot.yesterdaySaves = savesC || 0;

    const { count: dnaC } = await admin.from('analytics_events').select('id', { count: 'exact', head: true })
      .eq('event_name', 'complete_dna').gte('created_at', dayAgo);
    snapshot.yesterdayDnaCompletions = dnaC || 0;

    const { count: staleU } = await admin.from('universities').select('id', { count: 'exact', head: true })
      .or(`last_verified_at.is.null,last_verified_at.lt.${monthAgo}`);
    snapshot.staleUniversities = staleU || 0;

    const { count: staleS } = await admin.from('schools').select('id', { count: 'exact', head: true });
    snapshot.staleSchools = staleS || 0;
  } catch (e) {
    console.warn('[ai-briefing] snapshot error', e);
  }

  const result = await generateDailyBriefing(snapshot);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
  }

  // Cache it
  const key = `daily_briefing_${new Date().toISOString().slice(0, 10)}`;
  try {
    await admin.from('ai_insights').upsert({
      insight_key: key,
      insight_type: 'daily_briefing',
      scope: 'global',
      title: 'البريفينج اليومي — ' + new Date().toLocaleDateString('ar'),
      body_md: result.text || '',
      data_payload: snapshot,
      model_used: result.model,
      tokens_in: result.tokensIn,
      tokens_out: result.tokensOut,
      cost_usd: result.costUsd,
      expires_at: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
    }, { onConflict: 'insight_key' });
  } catch (e) {
    console.warn('[ai-briefing] cache error', e);
  }

  return NextResponse.json({
    ok: true,
    body_md: result.text,
    snapshot,
    cost_usd: result.costUsd,
    cached_key: key,
  });
}
