import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET  /api/daily-challenge?userId=xxx   → today's question + user stats
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const today  = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // Pick today's challenge: deterministic by date seed
  const { data: challenges } = await supabase
    .from("challenges")
    .select("id, question, option_a, option_b, option_c, option_d, category, difficulty")
    .eq("active", true)
    .order("id");

  if (!challenges || challenges.length === 0)
    return NextResponse.json({ error: "No challenges found" }, { status: 404 });

  // Seed-based daily pick: day-of-year mod count
  const dayOfYear = Math.floor(
    (new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  const todayChallenge = challenges[dayOfYear % challenges.length];

  // Fetch user stats + whether they already answered today
  let userStats = null;
  let alreadyAnswered = null;
  let correctAnswer = null;
  let explanation = null;

  if (userId) {
    const { data: stats } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId)
      .single();
    userStats = stats;

    const { data: prev } = await supabase
      .from("user_challenges")
      .select("is_correct, xp_earned")
      .eq("user_id", userId)
      .eq("challenge_id", todayChallenge.id)
      .eq("answered_date", today)
      .maybeSingle();

    if (prev) {
      alreadyAnswered = prev;
      // If already answered, reveal the correct answer
      const { data: full } = await supabase
        .from("challenges")
        .select("correct, explanation")
        .eq("id", todayChallenge.id)
        .single();
      correctAnswer = full?.correct;
      explanation   = full?.explanation;
    }
  }

  return NextResponse.json({
    challenge: todayChallenge,
    today,
    userStats,
    alreadyAnswered,
    correctAnswer,
    explanation,
  });
}

// POST /api/daily-challenge  { userId, challengeId, answer }  → result + updated stats
export async function POST(req: NextRequest) {
  const { userId, challengeId, answer } = await req.json();
  const today = new Date().toISOString().slice(0, 10);

  if (!userId || !challengeId || !answer)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  // Check not already answered today
  const { data: existing } = await supabase
    .from("user_challenges")
    .select("id")
    .eq("user_id", userId)
    .eq("challenge_id", challengeId)
    .eq("answered_date", today)
    .maybeSingle();

  if (existing)
    return NextResponse.json({ error: "Already answered today" }, { status: 409 });

  // Get correct answer
  const { data: ch } = await supabase
    .from("challenges")
    .select("correct, explanation, difficulty")
    .eq("id", challengeId)
    .single();

  if (!ch) return NextResponse.json({ error: "Challenge not found" }, { status: 404 });

  const isCorrect = ch.correct === answer;
  const xpEarned  = isCorrect ? ch.difficulty * 10 : 2; // 10/20/30 XP for correct, 2 for trying

  // Record answer
  await supabase.from("user_challenges").insert({
    user_id:       userId,
    challenge_id:  challengeId,
    answered_date: today,
    is_correct:    isCorrect,
    xp_earned:     xpEarned,
  });

  // Update/upsert user_stats
  const { data: stats } = await supabase
    .from("user_stats")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  const streakContinued = stats?.last_challenge_date === yesterday;
  const newStreak = streakContinued ? (stats.current_streak || 0) + 1 : 1;
  const newXP     = (stats?.total_xp || 0) + xpEarned;
  const newLongest= Math.max(newStreak, stats?.longest_streak || 0);

  await supabase.from("user_stats").upsert({
    user_id:             userId,
    total_xp:            newXP,
    current_streak:      newStreak,
    longest_streak:      newLongest,
    last_challenge_date: today,
    updated_at:          new Date().toISOString(),
  }, { onConflict: "user_id" });

  return NextResponse.json({
    isCorrect,
    xpEarned,
    correctAnswer: ch.correct,
    explanation:   ch.explanation,
    newXP,
    newStreak,
  });
}
