// Effective streak — the truthful, decaying day-streak.
// quiz_gamification.streak_days is only rewritten when the student next plays, so
// a broken streak stays frozen at its old value (e.g. still shows "5 🔥" days
// after they stopped). This computes the LIVE streak: it's only alive if the last
// quiz was today or yesterday; the moment a day is missed it decays to 0 — so
// missing days actually costs momentum, as it should. Pure + timezone-local.
export function effectiveStreak(
  streakDays: number | null | undefined,
  lastQuizDate: string | null | undefined,
): number {
  const s = streakDays ?? 0;
  if (s < 1 || !lastQuizDate) return 0;
  const now = new Date();
  const yest = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const y = `${yest.getFullYear()}-${String(yest.getMonth() + 1).padStart(2, '0')}-${String(yest.getDate()).padStart(2, '0')}`;
  // YYYY-MM-DD compares lexicographically; alive if last quiz was today or yesterday.
  return lastQuizDate >= y ? s : 0;
}
