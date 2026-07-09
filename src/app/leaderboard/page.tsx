'use client';
// School leaderboard (growth strategy M1) — weekly XP ranking of schools, the
// school-pride loop: "your school is #3 in Lebanon this week". Data comes from
// the school_leaderboard() SECURITY DEFINER RPC (aggregated, no personal data).
// Degrades gracefully to a "coming soon" empty state until the RPC is applied.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';

type Row = { school: string; xp: number; students: number };

const MEDALS = ['🥇', '🥈', '🥉'];

export default function LeaderboardPage() {
  const { t, dir } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [mySchool, setMySchool] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data }, { data: { user } }] = await Promise.all([
        supabase.rpc('school_leaderboard', { p_days: 7, p_limit: 20 }),
        supabase.auth.getUser(),
      ]);
      if (!alive) return;
      setRows((Array.isArray(data) ? data : []) as Row[]);
      if (user) {
        const { data: sp } = await supabase.from('student_profiles')
          .select('school_name').eq('user_id', user.id).maybeSingle();
        if (alive) setMySchool((sp?.school_name || '').trim() || null);
      }
      setLoading(false);
    })().catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  const myRank = mySchool ? rows.findIndex(r => r.school.trim() === mySchool) : -1;
  const maxXp = rows.length > 0 ? Math.max(...rows.map(r => r.xp), 1) : 1;

  return (
    <main dir={dir} className="min-h-screen bg-bg pb-24">
      {/* Hero */}
      <section className="bg-gradient-hero text-white">
        <div className="max-w-3xl mx-auto px-4 py-10 text-center">
          <div className="text-6xl mb-3 animate-bounce-soft">🏫</div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{t('lb.title')}</h1>
          <p className="text-white/90">{t('lb.sub')}</p>
          {myRank >= 0 && mySchool && (
            <div className="inline-block mt-4 bg-surface/15 backdrop-blur rounded-2xl px-5 py-2.5 font-extrabold">
              {t('lb.myschool')}: {mySchool} — #{myRank + 1} 🎉
            </div>
          )}
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        <div className="bg-surface rounded-2xl border border-line shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
            <span className="font-extrabold text-primary text-sm">📅 {t('lb.week')}</span>
            <span className="text-[11px] text-ink-subtle">{t('lb.updated')}</span>
          </div>

          {loading ? (
            <div className="p-10 text-center text-ink-muted text-sm">…</div>
          ) : rows.length === 0 ? (
            <div className="p-10 text-center">
              <div className="text-5xl mb-3">🚀</div>
              <p className="font-extrabold text-ink mb-1">{t('lb.empty_t')}</p>
              <p className="text-sm text-ink-muted mb-5">{t('lb.empty_s')}</p>
              <Link href="/quiz/today" className="btn-primary px-6 py-2.5 rounded-xl inline-block">{t('lb.cta_quiz')}</Link>
            </div>
          ) : (
            <ol>
              {rows.map((r, i) => {
                const mine = mySchool && r.school.trim() === mySchool;
                return (
                  <li key={r.school}
                    className={`flex items-center gap-3 px-5 py-3.5 border-b border-border-2 last:border-0 ${mine ? 'bg-mint-pale/50' : i % 2 ? 'bg-bg-soft/40' : ''}`}>
                    <span className={`w-9 text-center font-extrabold ${i < 3 ? 'text-xl' : 'text-sm text-ink-subtle'}`}>
                      {i < 3 ? MEDALS[i] : `#${i + 1}`}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-extrabold text-ink text-sm truncate">
                        {r.school} {mine && <span className="text-[10px] bg-primary text-white font-bold px-2 py-0.5 rounded-full mr-1">{t('lb.you')}</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex-1 h-1.5 bg-bg-soft rounded-full overflow-hidden max-w-56">
                          <div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(4, Math.round((100 * r.xp) / maxXp))}%` }} />
                        </div>
                        <span className="text-[11px] text-ink-subtle whitespace-nowrap">{r.students} {t('lb.students')}</span>
                      </div>
                    </div>
                    <span className="font-extrabold text-primary text-sm whitespace-nowrap">⭐ {r.xp.toLocaleString('en')}</span>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="mt-4 bg-mint-pale border border-mint-light rounded-2xl p-4 text-center text-sm text-ink">
          💡 {t('lb.how')}
        </div>
      </div>
    </main>
  );
}
