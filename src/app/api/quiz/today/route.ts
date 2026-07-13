// GET /api/quiz/today
// Generates or returns today's personalized quiz for the logged-in user.
// Selection is delegated to the adaptive engine RPC `quiz_build_session()` which
// composes the daily pool from 6 weighted strata — SRS-due reviews, weak skills,
// Career-DNA / interest alignment, a growth-edge (one notch above current level),
// discovery, and fresh fill — with hard filters on language/grade/country and a
// graceful fallback so a student always gets a full session. (See
// DAILY_GROWTH_ARCHITECTURE.md, Phase 2.)

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const QUIZ_SIZE = 10;

type PoolRow = { question_id: number; stratum: string; ord: number };

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const today = new Date().toISOString().slice(0, 10);

  // 1) Idempotency: return existing session if already generated today
  const { data: existing } = await supabase
    .from('quiz_daily_sessions')
    .select('*')
    .eq('user_id', user.id)
    .eq('quiz_date', today)
    .maybeSingle();

  if (existing) {
    const { data: questions } = await supabase
      .from('quiz_questions')
      .select('id, subject, language, difficulty, stem, options, hints, skill_code, question_type, memory_show, memory_seconds')
      .in('id', existing.question_ids);
    const ordered = (existing.question_ids as number[])
      .map((id) => questions?.find((q) => q.id === id))
      .filter(Boolean);
    return NextResponse.json({ session: existing, questions: ordered });
  }

  // 2) Adaptive engine: build a personalized pool (runs as auth.uid() server-side).
  const { data: pool, error: poolErr } = await supabase
    .rpc('quiz_build_session', { p_size: QUIZ_SIZE });
  if (poolErr) {
    return NextResponse.json({ error: poolErr.message }, { status: 500 });
  }
  const rows = (pool ?? []) as PoolRow[];
  if (rows.length === 0) {
    return NextResponse.json({ error: 'no_questions_available' }, { status: 503 });
  }

  const orderedIds = rows.map((r) => r.question_id);
  const stratumById = new Map(rows.map((r) => [r.question_id, r.stratum]));

  // 3) Fetch the full question rows, preserving the engine's order + annotating why
  //    each question was chosen (the UI may surface "review" vs "new" vs "growth").
  const { data: questions } = await supabase
    .from('quiz_questions')
    .select('id, subject, language, difficulty, stem, options, hints, skill_code')
    .in('id', orderedIds);

  const ordered = orderedIds
    .map((id) => {
      const q = questions?.find((x) => x.id === id);
      return q ? { ...q, stratum: stratumById.get(id) ?? 'fresh' } : null;
    })
    .filter(Boolean);

  if (ordered.length === 0) {
    return NextResponse.json({ error: 'no_questions_available' }, { status: 503 });
  }

  // 4) Persist the daily session
  const { data: session, error: sessionErr } = await supabase
    .from('quiz_daily_sessions')
    .insert({
      user_id: user.id,
      quiz_date: today,
      question_ids: orderedIds,
      total: ordered.length,
    })
    .select()
    .single();

  if (sessionErr) {
    return NextResponse.json({ error: sessionErr.message }, { status: 500 });
  }

  // 5) Update times_shown counter (server-side, no race)
  await supabase.rpc('increment_question_shown', { qids: orderedIds });

  return NextResponse.json({ session, questions: ordered });
}
