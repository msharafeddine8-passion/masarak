'use client';
// «يومي في مسارك» — the daily-habit block on the dashboard (growth strategy M1).
// Surfaces the already-built daily engine (quiz_gamification streaks/XP,
// quiz_daily_sessions, quiz_daily_missions) plus a deterministic "scholarship of
// the day" and the nearest scholarship deadline. Everything is best-effort: any
// piece that fails to load simply hides, never blocking the dashboard.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { effectiveStreak } from '@/lib/streak';
import { toast } from '@/lib/notify';
import { getPushStatus, enablePush, type PushStatus } from '@/lib/push';

type Mission = { key: string; icon: string; title: string; progress: number; target: number; xp: number; done: boolean };
type ScholOfDay = { id: number; name: string; org: string | null; amount: string | null; emoji: string | null };
type UrgentLite = { name: string; days: number } | null;

export default function DailyHero({ urgent }: { urgent: UrgentLite }) {
  const { t, dir } = useI18n();
  const [streak, setStreak] = useState<number | null>(null);
  const [xp, setXp] = useState(0);
  const [doneToday, setDoneToday] = useState<{ score: number; total: number; xp: number } | null>(null);
  const [mission, setMission] = useState<Mission | null>(null);
  const [schol, setSchol] = useState<ScholOfDay | null>(null);
  const [push, setPush] = useState<PushStatus>('unsupported');

  useEffect(() => { getPushStatus().then(setPush).catch(() => {}); }, []);

  async function onEnablePush() {
    const st = await enablePush();
    setPush(st);
    if (st === 'subscribed') toast(t('daily.push_ok'), 'ok');
    else if (st === 'denied') toast(t('daily.push_denied'), 'warn');
  }

  function challengeFriend() {
    if (!doneToday) return;
    const text = `${t('daily.challenge_msg1')} ${doneToday.score}/${doneToday.total} ${t('daily.challenge_msg2')}`;
    const url = `${window.location.origin}/quiz/today`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ text, url }).catch(() => { /* cancelled */ });
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`, '_blank', 'noopener');
    }
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !alive) return;
      const today = new Date().toISOString().slice(0, 10);

      const [{ data: g }, { data: s }, { data: m }, { data: sc }] = await Promise.all([
        supabase.from('quiz_gamification').select('streak_days, xp_total, last_quiz_date').eq('user_id', user.id).maybeSingle(),
        supabase.from('quiz_daily_sessions').select('completed_at, score, total, xp_earned')
          .eq('user_id', user.id).eq('quiz_date', today).maybeSingle(),
        supabase.rpc('quiz_daily_missions'),
        supabase.from('scholarships').select('id, name, org, amount, emoji').eq('active', true).order('id').limit(100),
      ]);
      if (!alive) return;

      setStreak(effectiveStreak(g?.streak_days, g?.last_quiz_date));
      setXp(g?.xp_total ?? 0);
      if (s?.completed_at) setDoneToday({ score: s.score, total: s.total, xp: s.xp_earned });
      const missions = (Array.isArray(m) ? m : []) as Mission[];
      setMission(missions.find(x => !x.done) ?? null);
      const pool = (sc || []) as ScholOfDay[];
      if (pool.length > 0) {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        setSchol(pool[dayOfYear % pool.length]);
      }
    })().catch(() => { /* best-effort: the block degrades gracefully */ });
    return () => { alive = false; };
  }, []);

  const flameActive = !!doneToday;

  return (
    <div dir={dir} className="bg-surface rounded-2xl border-2 border-primary/15 p-5 md:p-6 shadow-sm">
      {/* Header row: title + streak + XP */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <h2 className="font-extrabold text-primary text-lg flex-1 min-w-40">☀️ {t('daily.title')}</h2>
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full font-extrabold text-sm ${flameActive ? 'bg-orange-100 text-orange-600' : 'bg-bg-soft text-ink-muted'}`}
          title={flameActive ? t('daily.streak') : t('streak.keep')}>
          <span className={flameActive ? '' : 'grayscale opacity-70'}>🔥</span>
          {streak ?? '·'} {t('daily.days')}
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 font-extrabold text-sm">
          ⭐ {xp.toLocaleString('en')} XP
        </div>
        {push === 'default' && (
          <button type="button" onClick={onEnablePush}
            className="px-3 py-1.5 rounded-full bg-primary/10 text-primary font-extrabold text-sm hover:bg-primary/20 transition-colors">
            🔔 {t('daily.push_cta')}
          </button>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-3">
        {/* Daily quiz */}
        <div className={`rounded-xl p-4 border-2 ${doneToday ? 'bg-success-light/40 border-success/30' : 'bg-gradient-to-br from-mint-pale to-bg-mint border-primary/20'}`}>
          {doneToday ? (
            <>
              <div className="text-2xl mb-1">✅</div>
              <div className="font-extrabold text-ink text-sm">{t('daily.quiz_done')}</div>
              <div className="text-xs text-ink-muted mt-1">{doneToday.score}/{doneToday.total} · +{doneToday.xp} XP</div>
              <button type="button" onClick={challengeFriend}
                className="mt-2 inline-block bg-primary text-white font-bold text-xs px-3 py-1.5 rounded-lg hover:bg-primary/90">
                🥊 {t('daily.challenge')}
              </button>
              <div className="text-[11px] text-ink-subtle mt-2">{t('daily.quiz_done_sub')}</div>
            </>
          ) : (
            <>
              <div className="text-2xl mb-1">🎯</div>
              <div className="font-extrabold text-ink text-sm mb-2">{t('daily.quiz_cta')}</div>
              <Link href="/quiz/today" className="inline-block bg-primary text-white font-bold text-sm px-4 py-2 rounded-xl hover:bg-primary/90">
                {t('daily.quiz_btn')}
              </Link>
              <span className="text-[11px] text-amber-700 font-bold mr-2">+25 XP</span>
            </>
          )}
          {mission && (
            <div className="mt-3 pt-3 border-t border-line/60">
              <div className="flex items-center justify-between text-[11px] font-bold text-ink-muted mb-1">
                <span>{mission.icon} {t('daily.mission')}: {mission.title}</span>
                <span>{mission.progress}/{mission.target}</span>
              </div>
              <div className="h-1.5 bg-bg-soft rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, Math.round((100 * mission.progress) / Math.max(1, mission.target)))}%` }} />
              </div>
            </div>
          )}
        </div>

        {/* Scholarship of the day */}
        <div className="rounded-xl p-4 border-2 border-line bg-surface">
          <div className="text-[11px] font-extrabold text-primary mb-1.5">🏆 {t('daily.schol_day')}</div>
          {schol ? (
            <Link href="/scholarships" className="block group">
              <div className="font-extrabold text-ink text-sm group-hover:text-primary leading-snug">{schol.emoji || '🎓'} {schol.name}</div>
              <div className="text-xs text-ink-muted mt-1 truncate">{[schol.org, schol.amount].filter(Boolean).join(' · ')}</div>
              <span className="inline-block mt-2 text-xs font-bold text-primary group-hover:underline">{t('daily.schol_view')} ←</span>
            </Link>
          ) : (
            <div className="text-xs text-ink-subtle py-3">…</div>
          )}
        </div>

        {/* Nearest deadline + leaderboard */}
        <div className="rounded-xl p-4 border-2 border-line bg-surface flex flex-col">
          <div className="text-[11px] font-extrabold text-primary mb-1.5">⏳ {t('daily.nearest')}</div>
          {urgent ? (
            <Link href="/scholarships" className="block group flex-1">
              <div className="font-extrabold text-ink text-sm group-hover:text-primary leading-snug">{urgent.name}</div>
              <span className={`inline-block mt-1.5 text-xs font-extrabold px-2.5 py-1 rounded-full ${urgent.days <= 7 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700'}`}>
                {t('daily.days_left')} {urgent.days} {t('daily.days')}
              </span>
            </Link>
          ) : (
            <div className="text-xs text-ink-subtle flex-1">{t('daily.no_deadline')}</div>
          )}
          <Link href="/leaderboard" className="mt-3 pt-3 border-t border-line/60 text-xs font-extrabold text-primary hover:underline">
            🏫 {t('daily.lb_link')} ←
          </Link>
        </div>
      </div>
    </div>
  );
}
