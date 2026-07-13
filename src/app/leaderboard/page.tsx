'use client';
// سباق المدارس — School League (the "wow" competitive layer over the daily quiz).
// A season-aware inter-school championship: this-week standings from
// school_league_standings() (Mon→now, with rank movement), a "my school" derby
// card that tells you exactly how many points to overtake the school above you,
// and a one-tap share. All data is aggregated (no personal data). Degrades
// gracefully to a "warming up" state until the RPC/data exist.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';

type Row = { rank: number; school: string; xp: number; students: number; prev_rank: number | null; rank_change: number | null };

const MEDALS = ['🥇', '🥈', '🥉'];

// ms until the next season reset (upcoming Monday 00:00 local — matches the
// SQL's date_trunc('week') Monday boundary).
function nextResetMs(): number {
  const now = new Date();
  let d = (1 - now.getDay() + 7) % 7; // days to next Monday
  if (d === 0) d = 7;                  // Monday itself → next Monday
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d, 0, 0, 0, 0);
  return target.getTime() - now.getTime();
}

function Move({ change }: { change: number | null }) {
  if (change == null) return <span className="text-[10px] font-bold text-amber-500" title="new">✦</span>;
  if (change > 0) return <span className="text-[10px] font-extrabold text-success">▲{change}</span>;
  if (change < 0) return <span className="text-[10px] font-extrabold text-red-500">▼{-change}</span>;
  return <span className="text-[10px] text-ink-subtle">–</span>;
}

export default function SchoolLeaguePage() {
  const { t, dir } = useI18n();
  const [rows, setRows] = useState<Row[]>([]);
  const [mySchool, setMySchool] = useState<string | null>(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      const [{ data }, { data: { user } }] = await Promise.all([
        supabase.rpc('school_league_standings', { p_limit: 30 }),
        supabase.auth.getUser(),
      ]);
      if (!alive) return;
      // Normalize: PostgREST can serialize bigint columns as strings.
      const norm = (Array.isArray(data) ? data : []).map((r: Record<string, unknown>) => ({
        rank: Number(r.rank),
        school: String(r.school ?? ''),
        xp: Number(r.xp) || 0,
        students: Number(r.students) || 0,
        prev_rank: r.prev_rank == null ? null : Number(r.prev_rank),
        rank_change: r.rank_change == null ? null : Number(r.rank_change),
      })) as Row[];
      setRows(norm);
      if (user) {
        setLoggedIn(true);
        const { data: sp } = await supabase.from('student_profiles')
          .select('school_name').eq('user_id', user.id).maybeSingle();
        if (alive) setMySchool((sp?.school_name || '').trim() || null);
      }
      setLoading(false);
    })().catch(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    function tick() {
      const ms = nextResetMs();
      const d = Math.floor(ms / 86400000);
      const h = Math.floor((ms % 86400000) / 3600000);
      const m = Math.floor((ms % 3600000) / 60000);
      setCountdown(d > 0 ? `${d}${t('league.d')} ${h}${t('league.h')}` : `${h}${t('league.h')} ${m}${t('league.m')}`);
    }
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, [t]);

  const myIdx = mySchool ? rows.findIndex(r => r.school.trim() === mySchool) : -1;
  const me = myIdx >= 0 ? rows[myIdx] : null;
  const rival = myIdx > 0 ? rows[myIdx - 1] : null;                                   // school directly above
  const chaser = myIdx >= 0 && myIdx < rows.length - 1 ? rows[myIdx + 1] : null;      // school directly below
  const maxXp = rows.length ? Math.max(...rows.map(r => r.xp), 1) : 1;

  function share() {
    if (!me) return;
    const txt = t('league.share_txt').replace('{school}', me.school).replace('{rank}', String(me.rank));
    const url = (typeof window !== 'undefined' ? window.location.origin : '') + '/leaderboard';
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ text: txt, url }).catch(() => { /* cancelled */ });
    } else if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${encodeURIComponent(txt + ' ' + url)}`, '_blank', 'noopener');
    }
  }

  return (
    <main dir={dir} className="min-h-screen bg-bg pb-24">
      {/* Season hero */}
      <section className="bg-gradient-hero text-white">
        <div className="max-w-3xl mx-auto px-4 py-9 text-center">
          <div className="text-6xl mb-2 animate-bounce-soft">🏆</div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{t('league.title')}</h1>
          <p className="text-white/90 mb-4">{t('league.sub')}</p>
          <div className="inline-flex items-center gap-2 bg-surface/15 backdrop-blur rounded-full px-4 py-2 text-sm font-extrabold">
            ⏳ {t('league.ends_in')} <span className="font-mono">{countdown || '…'}</span>
          </div>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 -mt-5 space-y-4">

        {/* My school card / derby — the screenshot-worthy centerpiece */}
        {!loading && (
          me ? (
            <div className="bg-gradient-to-br from-primary to-primary-dark text-white rounded-2xl p-5 shadow-lg">
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className="text-4xl font-black leading-none">#{me.rank}</div>
                  <div className="mt-1"><Move change={me.rank_change} /></div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-white/70 font-bold">{t('league.your_school')}</div>
                  <div className="font-extrabold text-lg truncate">{me.school}</div>
                  <div className="text-sm text-white/80">⭐ {me.xp.toLocaleString('en')} XP · {me.students} {t('lb.students')}</div>
                </div>
                <button onClick={share}
                  className="bg-white/20 hover:bg-white/30 transition-colors rounded-xl px-3 py-2 text-sm font-bold whitespace-nowrap">
                  📲 {t('league.share')}
                </button>
              </div>
              {/* Derby line */}
              <div className="mt-4 bg-black/15 rounded-xl px-4 py-3 text-sm font-bold">
                {me.rank > 1 && rival ? (
                  <>🔥 {t('league.chase').replace('{gap}', Math.max(0, rival.xp - me.xp).toLocaleString('en')).replace('{rival}', rival.school)}</>
                ) : me.rank === 1 ? (
                  <>👑 {t('league.leader')}{chaser ? ` — ${t('league.defend').replace('{gap}', Math.max(0, me.xp - chaser.xp).toLocaleString('en')).replace('{chaser}', chaser.school)}` : ''}</>
                ) : null}
              </div>
            </div>
          ) : loggedIn && mySchool ? (
            <div className="bg-surface rounded-2xl border border-line p-5 text-center">
              <div className="text-4xl mb-2">🎯</div>
              <p className="font-extrabold text-ink mb-1">{t('league.notranked_t').replace('{school}', mySchool)}</p>
              <p className="text-sm text-ink-muted mb-4">{t('league.notranked_s')}</p>
              <Link href="/quiz/today" className="btn-primary px-6 py-2.5 rounded-xl inline-block">{t('lb.cta_quiz')}</Link>
            </div>
          ) : loggedIn ? (
            <div className="bg-surface rounded-2xl border-2 border-primary/20 p-5 text-center">
              <div className="text-4xl mb-2">🏫</div>
              <p className="font-extrabold text-ink mb-1">{t('league.noschool_t')}</p>
              <p className="text-sm text-ink-muted mb-4">{t('league.noschool_s')}</p>
              <Link href="/profile/edit" className="btn-primary px-6 py-2.5 rounded-xl inline-block">{t('league.noschool_cta')}</Link>
            </div>
          ) : (
            <div className="bg-surface rounded-2xl border border-line p-5 text-center">
              <div className="text-4xl mb-2">🔑</div>
              <p className="font-extrabold text-ink mb-1">{t('league.guest_t')}</p>
              <Link href="/auth/login" className="btn-primary px-6 py-2.5 rounded-xl inline-block mt-2">{t('league.guest_cta')}</Link>
            </div>
          )
        )}

        {/* Standings */}
        <div className="bg-surface rounded-2xl border border-line shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-line">
            <span className="font-extrabold text-primary text-sm">📊 {t('league.standings')}</span>
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
                    className={`flex items-center gap-3 px-5 py-3.5 border-b border-border-2 last:border-0 ${mine ? 'bg-mint-pale/60' : i % 2 ? 'bg-bg-soft/40' : ''}`}>
                    <span className={`w-9 text-center font-extrabold ${r.rank <= 3 ? 'text-xl' : 'text-sm text-ink-subtle'}`}>
                      {r.rank <= 3 ? MEDALS[r.rank - 1] : `#${r.rank}`}
                    </span>
                    <div className="w-7 text-center"><Move change={r.rank_change} /></div>
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

        <div className="bg-mint-pale border border-mint-light rounded-2xl p-4 text-center text-sm text-ink">
          💡 {t('league.how')}
        </div>
      </div>
    </main>
  );
}
