// GET /api/quiz/today
// Generates or returns today's personalized quiz for the logged-in user.

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const QUIZ_SIZE = 10;

// Subject → language enforcement
const SUBJECT_LANG: Record<string, 'en' | 'ar'> = {
  math: 'en', physics: 'en', chemistry: 'en', science: 'en', logic: 'en',
  arabic: 'ar', history: 'ar', civics: 'ar',
  general_culture: 'ar', life_skills: 'ar', religion: 'ar',
};

const DEFAULT_SUBJECTS = [
  'math', 'arabic', 'science', 'history', 'general_culture', 'logic', 'physics'
];

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
      .select('id, subject, language, difficulty, stem, options, hints, skill_code')
      .in('id', existing.question_ids);
    // Preserve original order
    const ordered = (existing.question_ids as number[])
      .map(id => questions?.find(q => q.id === id))
      .filter(Boolean);
    return NextResponse.json({
      session: existing,
      questions: ordered,
    });
  }

  // 2) Get user's question history (last 90 days) to exclude
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString();
  const { data: history } = await supabase
    .from('quiz_user_history')
    .select('question_id, answered_at')
    .eq('user_id', user.id)
    .gte('answered_at', ninetyDaysAgo);
  const seenIds = new Set((history ?? []).map(h => h.question_id));

  // 3) Get SRS-due reviews
  const { data: dueItems } = await supabase
    .from('quiz_user_history')
    .select('question_id, subject, next_review_at')
    .eq('user_id', user.id)
    .lte('next_review_at', new Date().toISOString())
    .order('next_review_at', { ascending: true })
    .limit(4);
  const srsIds = new Set((dueItems ?? []).map(d => d.question_id));

  // 4) Pool of fresh questions, balanced across subjects
  const targetPerSubject = Math.ceil(QUIZ_SIZE / DEFAULT_SUBJECTS.length);
  const selected: any[] = [];

  // First include up to 4 SRS reviews
  if (dueItems && dueItems.length) {
    const { data: srsQs } = await supabase
      .from('quiz_questions')
      .select('id, subject, language, difficulty, stem, options, hints, skill_code')
      .in('id', dueItems.map(d => d.question_id))
      .eq('status', 'active');
    selected.push(...(srsQs ?? []).slice(0, 4));
  }

  // Then pull fresh questions per subject
  for (const subject of DEFAULT_SUBJECTS) {
    if (selected.length >= QUIZ_SIZE) break;
    const need = Math.max(1, targetPerSubject - selected.filter(s => s.subject === subject).length);
    const { data: fresh } = await supabase
      .from('quiz_questions')
      .select('id, subject, language, difficulty, stem, options, hints, skill_code')
      .eq('subject', subject)
      .eq('status', 'active')
      .order('times_shown', { ascending: true })
      .limit(need * 5); // pull more to allow client-side filtering

    const candidates = (fresh ?? []).filter(q => !seenIds.has(q.id) && !selected.find(s => s.id === q.id));
    // Add randomness — shuffle and pick `need`
    const shuffled = candidates.sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, need));
  }

  // 5) Trim to QUIZ_SIZE and randomize order
  const final = selected.slice(0, QUIZ_SIZE).sort(() => Math.random() - 0.5);
  if (final.length === 0) {
    return NextResponse.json({ error: 'no_questions_available' }, { status: 503 });
  }

  // 6) Persist daily session
  const { data: session, error: sessionErr } = await supabase
    .from('quiz_daily_sessions')
    .insert({
      user_id: user.id,
      quiz_date: today,
      question_ids: final.map(q => q.id),
      total: final.length,
    })
    .select()
    .single();

  if (sessionErr) {
    return NextResponse.json({ error: sessionErr.message }, { status: 500 });
  }

  // 7) Update times_shown counter (server-side, no race)
  await supabase.rpc('increment_question_shown', { qids: final.map(q => q.id) });

  return NextResponse.json({ session, questions: final });
}
