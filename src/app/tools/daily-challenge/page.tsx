// DEPRECATED (Daily Growth, Phase 5): this standalone page used a hardcoded 40-question
// set + localStorage streak — a parallel system to the real adaptive engine. It is
// superseded by /quiz/today (personalized selection via quiz_build_session) + /quiz/progress
// (learner analytics). Redirect so any old links/bookmarks land on the canonical experience.
// The legacy `challenges`/`user_challenges`/`user_stats` tables are left dormant (no data loss).
import { redirect } from 'next/navigation';

export default function DeprecatedDailyChallengeRedirect() {
  redirect('/quiz/today');
}
