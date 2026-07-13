'use client';
// "مستواك" — the student's level + progression, the visible face of the adaptive
// engine's leveling. Level tiers (مبتدئ → أسطورة) with an XP progress bar to the
// next level. Uses the same formula as the server (level = floor(√(xp/50)), so
// xp threshold for level L = L²·50). Self-contained; hardcoded Arabic to match
// the (Arabic-only) progress page it lives on.
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Gam = {
  level: number | null; xp_total: number | null; longest_streak: number | null;
  total_correct: number | null; total_quizzes: number | null;
};

const TIERS = [
  { min: 0,  name: 'مبتدئ',  emoji: '🌱', color: '#4B5563' },
  { min: 2,  name: 'متعلّم', emoji: '📗', color: '#2E9E8F' },
  { min: 4,  name: 'ماهر',   emoji: '⚡', color: '#2563EB' },
  { min: 7,  name: 'محترف',  emoji: '🎯', color: '#7C3AED' },
  { min: 10, name: 'خبير',   emoji: '🏆', color: '#B0741A' },
  { min: 15, name: 'أسطورة', emoji: '👑', color: '#C0397B' },
];
function tierFor(level: number) {
  let t = TIERS[0];
  for (const x of TIERS) if (level >= x.min) t = x;
  const next = TIERS.find((x) => x.min > level) ?? null;
  return { t, next };
}
const xpForLevel = (L: number) => L * L * 50;

export default function LevelHero() {
  const [g, setG] = useState<Gam | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !alive) return;
      const { data } = await supabase.from('quiz_gamification')
        .select('level, xp_total, longest_streak, total_correct, total_quizzes')
        .eq('user_id', user.id).maybeSingle();
      if (alive) setG((data as Gam) ?? { level: 0, xp_total: 0, longest_streak: 0, total_correct: 0, total_quizzes: 0 });
    })().catch(() => { /* best-effort */ });
    return () => { alive = false; };
  }, []);

  if (!g) return null;

  const level = g.level ?? 0;
  const xp = g.xp_total ?? 0;
  const { t: tier, next } = tierFor(level);
  const cur = xpForLevel(level);
  const nxt = xpForLevel(level + 1);
  const pct = Math.min(100, Math.max(0, Math.round(((xp - cur) / Math.max(1, nxt - cur)) * 100)));
  const toNext = Math.max(0, nxt - xp);

  return (
    <section className="rounded-2xl p-6 text-white shadow-sm" style={{ background: `linear-gradient(135deg, ${tier.color} 0%, #0A353B 100%)` }}>
      <div className="flex items-center gap-4">
        <div className="text-5xl leading-none">{tier.emoji}</div>
        <div className="flex-1 min-w-0">
          <div className="text-xs opacity-80">مستواك</div>
          <div className="text-2xl font-extrabold">{tier.name}</div>
          <div className="text-sm opacity-90">المستوى {level}</div>
        </div>
        <div className="text-left flex-shrink-0">
          <div className="text-2xl font-extrabold">{xp.toLocaleString('en')}</div>
          <div className="text-xs opacity-80">XP</div>
        </div>
      </div>

      {/* progress to next level */}
      <div className="mt-4">
        <div className="flex justify-between text-xs opacity-90 mb-1">
          <span>المستوى {level}</span>
          <span>{next ? `${toNext.toLocaleString('en')} XP للمستوى ${level + 1}` : 'أعلى مستوى! 👑'}</span>
        </div>
        <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* career stats */}
      <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4 text-sm opacity-95">
        <span>🎯 {(g.total_quizzes ?? 0).toLocaleString('en')} اختبار</span>
        <span>✅ {(g.total_correct ?? 0).toLocaleString('en')} إجابة صحيحة</span>
        <span>🔥 {(g.longest_streak ?? 0)} أطول سلسلة</span>
      </div>
    </section>
  );
}
