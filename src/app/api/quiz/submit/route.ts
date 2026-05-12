// POST /api/quiz/submit
// Body: { sessionId, questionId, answerIndex, timeMs, usedHint }
// Server grades, updates SRS, awards XP, updates streak.

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

interface SubmitBody {
  sessionId: string;
  questionId: number;
  answerIndex: number;
  timeMs: number;
  usedHint?: boolean;
  isQuizComplete?: boolean;
}

// SM-2 algorithm
function computeSRS(prevInterval: number, prevEF: number, wasCorrect: boolean, quality: number) {
  let interval = prevInterval;
  let ef = prevEF;
  if (wasCorrect && quality >= 3) {
    if (interval === 1) interval = 1;
    else if (interval < 6) interval = 6;
    else interval = Math.round(interval * ef);
    ef = Math.max(1.3, ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
  } else {
    interval = 1;
    ef = Math.max(1.3, ef - 0.2);
  }
  return { interval, ef };
}

function deriveQuality(wasCorrect: boolean, usedHint: boolean, timeMs: number, expectedMs: number): number {
  if (!wasCorrect) return usedHint ? 1 : 0;
  if (usedHint) return 3;
  if (timeMs < expectedMs * 0.5) return 5;
  if (timeMs < expectedMs) return 4;
  return 3;
}

function computeXP(wasCorrect: boolean, usedHint: boolean, timeMs: number): number {
  if (!wasCorrect) return 0;
  let xp = 10;
  if (!usedHint) xp += 5;
  if (timeMs < 8000) xp += 5;
  return xp;
}

export async function POST(req: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json() as SubmitBody;

  // 1) Anti-cheat: server-side grading
  const { data: question } = await supabase
    .from('quiz_questions')
    .select('id, subject, correct_index, explanation, options, skill_code, difficulty')
    .eq('id', body.questionId)
    .single();

  if (!question) {
    return NextResponse.json({ error: 'question_not_found' }, { status: 404 });
  }

  // Bot detection: answer in <500ms gets 0 XP and is marked wrong for analytics
  if (body.timeMs < 500) {
    return NextResponse.json({ error: 'too_fast', wasCorrect: false }, { status: 200 });
  }

  const wasCorrect = body.answerIndex === question.correct_index;

  // 2) Verify the session belongs to this user and contains this question
  const { data: session } = await supabase
    .from('quiz_daily_sessions')
    .select('*')
    .eq('id', body.sessionId)
    .eq('user_id', user.id)
    .single();

  if (!session || !(session.question_ids as number[]).includes(body.questionId)) {
    return NextResponse.json({ error: 'invalid_session' }, { status: 400 });
  }

  // 3) Pull previous SRS state for this question (if any)
  const { data: prevHistory } = await supabase
    .from('quiz_user_history')
    .select('srs_interval_days, srs_ease_factor')
    .eq('user_id', user.id)
    .eq('question_id', body.questionId)
    .order('answered_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const prevInterval = prevHistory?.srs_interval_days ?? 1;
  const prevEF = prevHistory?.srs_ease_factor ?? 2.5;

  const expectedMs = 15000 + question.difficulty * 3000; // 15s baseline + 3s per difficulty point
  const quality = deriveQuality(wasCorrect, !!body.usedHint, body.timeMs, expectedMs);
  const srs = computeSRS(prevInterval, prevEF, wasCorrect, quality);
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + srs.interval);

  // 4) Insert history row
  await supabase.from('quiz_user_history').insert({
    user_id: user.id,
    question_id: body.questionId,
    subject: question.subject,
    was_correct: wasCorrect,
    time_taken_ms: body.timeMs,
    used_hint: body.usedHint ?? false,
    srs_interval_days: srs.interval,
    srs_ease_factor: srs.ef,
    next_review_at: nextReview.toISOString(),
  });

  // 5) Update per-skill mastery (EMA)
  if (question.skill_code) {
    const { data: skill } = await supabase
      .from('quiz_user_skill')
      .select('*')
      .eq('user_id', user.id)
      .eq('skill_code', question.skill_code)
      .maybeSingle();

    const newMastery = (skill ? skill.mastery_score * 0.7 : 0) + (wasCorrect ? 0.3 : 0);
    const newStreak = wasCorrect ? (skill?.correct_streak ?? 0) + 1 : 0;
    let newDifficulty = skill?.current_difficulty ?? 3;
    if (newStreak >= 3) newDifficulty = Math.min(10, newDifficulty + 1);
    if (!wasCorrect && (skill?.correct_streak ?? 0) === 0) newDifficulty = Math.max(1, newDifficulty - 1);

    await supabase.from('quiz_user_skill').upsert({
      user_id: user.id,
      skill_code: question.skill_code,
      subject: question.subject,
      mastery_score: newMastery,
      attempts: (skill?.attempts ?? 0) + 1,
      correct_streak: newStreak,
      current_difficulty: newDifficulty,
      last_seen_at: new Date().toISOString(),
    });
  }

  // 6) Award XP
  const xp = computeXP(wasCorrect, !!body.usedHint, body.timeMs);

  // 7) Update session score
  const newScore = (session.score ?? 0) + (wasCorrect ? 1 : 0);
  const sessionUpdate: any = { score: newScore };
  if (body.isQuizComplete) {
    sessionUpdate.completed_at = new Date().toISOString();
    sessionUpdate.xp_earned = (session.xp_earned ?? 0) + xp + 25; // +25 daily bonus
  } else {
    sessionUpdate.xp_earned = (session.xp_earned ?? 0) + xp;
  }
  await supabase.from('quiz_daily_sessions').update(sessionUpdate).eq('id', body.sessionId);

  // 8) Update gamification (XP + streak on quiz completion)
  let levelUp = false;
  let streakBonus = 0;
  if (body.isQuizComplete) {
    const { data: gam } = await supabase
      .from('quiz_gamification')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    const today = new Date().toISOString().slice(0, 10);
    const lastDate = gam?.last_quiz_date as string | null;
    let newStreak = 1;
    if (lastDate) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
      if (lastDate === yesterday) newStreak = (gam?.streak_days ?? 0) + 1;
      else if (lastDate === today) newStreak = gam?.streak_days ?? 1;
    }
    if (newStreak === 3 || newStreak === 7 || newStreak === 14 || newStreak === 30 || newStreak === 100) {
      streakBonus = newStreak * 5; // bonus XP at milestones
    }

    const prevXP = gam?.xp_total ?? 0;
    const newXP = prevXP + sessionUpdate.xp_earned + streakBonus;
    const prevLevel = gam?.level ?? 1;
    const newLevel = Math.max(1, Math.floor(Math.sqrt(newXP / 50)));
    levelUp = newLevel > prevLevel;

    await supabase.from('quiz_gamification').upsert({
      user_id: user.id,
      xp_total: newXP,
      level: newLevel,
      streak_days: newStreak,
      longest_streak: Math.max(gam?.longest_streak ?? 0, newStreak),
      last_quiz_date: today,
      total_quizzes: (gam?.total_quizzes ?? 0) + 1,
      total_correct: (gam?.total_correct ?? 0) + newScore,
      weekly_xp: (gam?.weekly_xp ?? 0) + sessionUpdate.xp_earned + streakBonus,
      updated_at: new Date().toISOString(),
    });
  }

  return NextResponse.json({
    wasCorrect,
    correctIndex: question.correct_index,
    explanation: question.explanation,
    xp,
    streakBonus,
    levelUp,
    srsInterval: srs.interval,
  });
}
