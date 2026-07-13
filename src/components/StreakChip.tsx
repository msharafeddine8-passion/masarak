'use client';
// Header streak chip (growth strategy M1): the student's day-streak follows them
// on every page, linking to /quiz/today. Orange flame = today's quiz done (streak
// safe); gray flame = not yet (tap to protect it). Renders nothing when logged
// out or before the first streak day — zero clutter for visitors/new users.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { effectiveStreak } from '@/lib/streak';

export default function StreakChip() {
  const { t } = useI18n();
  const [streak, setStreak] = useState(0);
  const [doneToday, setDoneToday] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !alive) return;
      const today = new Date().toISOString().slice(0, 10);
      const [{ data: g }, { data: s }] = await Promise.all([
        supabase.from('quiz_gamification').select('streak_days, last_quiz_date').eq('user_id', user.id).maybeSingle(),
        supabase.from('quiz_daily_sessions').select('completed_at').eq('user_id', user.id).eq('quiz_date', today).maybeSingle(),
      ]);
      if (!alive) return;
      // Truthful streak: decays to 0 the moment a day is missed (not frozen).
      setStreak(effectiveStreak(g?.streak_days, g?.last_quiz_date));
      setDoneToday(!!s?.completed_at);
    })().catch(() => { /* best-effort */ });
    return () => { alive = false; };
  }, []);

  if (streak < 1) return null;

  return (
    <Link
      href="/quiz/today"
      title={doneToday ? t('streak.title') : t('streak.keep')}
      className={`hidden sm:inline-flex items-center gap-1 h-11 px-3 rounded-xl font-extrabold text-sm transition-colors ${
        doneToday ? 'bg-orange-100 text-orange-600 hover:bg-orange-200' : 'bg-bg-soft text-ink-muted hover:bg-mint-light'
      }`}
    >
      <span className={doneToday ? '' : 'grayscale opacity-70'} aria-hidden="true">🔥</span>
      {streak}
    </Link>
  );
}
