'use client';
// بطاقة المستقبل — Future-You card (growth "wow" bet #2, the shareable half).
// A story-ready identity card built ENTIRELY from the student's OWN data (career
// path, streak, XP, school-league rank) — no peer input, no anonymity, zero
// safety surface. The share IS the distribution: every card is branded "via
// مسارك · [school]". The screenshot is the artifact teens post.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useStudentContext } from '@/context/StudentContext';
import { useI18n } from '@/lib/i18n';

function roleEmoji(path: string): string {
  const p = (path || '').toLowerCase();
  const map: [string, string][] = [
    ['طب', '🩺'], ['صحة', '🩺'], ['تمريض', '🩺'], ['صيدل', '💊'],
    ['هندس', '⚙️'], ['engineer', '⚙️'],
    ['أعمال', '💼'], ['إدارة', '💼'], ['business', '💼'], ['اقتصاد', '📈'], ['محاسب', '📊'], ['مال', '💰'],
    ['حقوق', '⚖️'], ['قانون', '⚖️'], ['law', '⚖️'],
    ['فن', '🎨'], ['تصميم', '🎨'], ['art', '🎨'], ['design', '🎨'],
    ['أحياء', '🧬'], ['كيمياء', '⚗️'], ['فيزياء', '🔭'], ['علوم', '🔬'], ['science', '🔬'],
    ['حاسوب', '💻'], ['برمج', '💻'], ['تكنولوج', '💻'], ['ذكاء', '🤖'], ['data', '📊'],
    ['تعليم', '📚'], ['تربية', '📚'], ['teach', '📚'],
    ['إعلام', '🎬'], ['صحاف', '📰'], ['media', '🎬'],
    ['عمارة', '🏛️'], ['architect', '🏛️'], ['سياس', '🏛️'],
    ['نفس', '🧠'], ['اجتماع', '🤝'], ['لغ', '🗣️'], ['رياض', '🔢'],
  ];
  for (const [k, e] of map) if (p.includes(k)) return e;
  return '🎓';
}

export default function FutureCardPage() {
  const { t, dir } = useI18n();
  const { profile, careerDNA } = useStudentContext();
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [rank, setRank] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { if (alive) { setLoggedIn(false); setReady(true); } return; }

      const { data: g } = await supabase.from('quiz_gamification')
        .select('streak_days, xp_total').eq('user_id', user.id).maybeSingle();
      if (!alive) return;
      setStreak(g?.streak_days ?? 0);
      setXp(g?.xp_total ?? 0);

      // School-league rank — fully optional (RPC may not exist yet on this env).
      try {
        const school = (profile?.school || '').trim();
        if (school) {
          const { data: standings } = await supabase.rpc('school_league_standings', { p_limit: 100 });
          if (Array.isArray(standings)) {
            const row = (standings as { school: string; rank: number }[]).find(r => String(r.school).trim() === school);
            if (row && alive) setRank(Number(row.rank));
          }
        }
      } catch { /* rank is a bonus */ }
      setReady(true);
    })().catch(() => { if (alive) setReady(true); });
    return () => { alive = false; };
  }, [profile?.school]);

  const name = (profile?.fullName || '').trim().split(' ')[0] || t('card.you');
  const path = careerDNA?.primaryPath || '';
  const emoji = roleEmoji(path);
  const school = (profile?.school || '').trim();

  function share() {
    const txt = path
      ? t('card.share_dna').replace('{name}', name).replace('{path}', path)
      : t('card.share_generic').replace('{name}', name);
    const url = (typeof window !== 'undefined' ? window.location.origin : '') + '/card';
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ text: txt, url }).catch(() => { /* cancelled */ });
    } else if (typeof window !== 'undefined') {
      window.open(`https://wa.me/?text=${encodeURIComponent(txt + ' ' + url)}`, '_blank', 'noopener');
    }
  }

  if (ready && !loggedIn) {
    return (
      <main dir={dir} className="min-h-screen bg-bg flex items-center justify-center px-4">
        <div className="max-w-sm w-full bg-surface rounded-3xl border border-line p-8 text-center">
          <div className="text-6xl mb-3">✨</div>
          <h1 className="text-xl font-extrabold text-primary mb-2">{t('card.guest_t')}</h1>
          <Link href="/auth/login" className="btn-primary px-6 py-2.5 rounded-xl inline-block mt-2">{t('card.guest_cta')}</Link>
        </div>
      </main>
    );
  }

  return (
    <main dir={dir} className="min-h-screen bg-bg py-8 px-4">
      <div className="max-w-sm mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-extrabold text-primary text-lg">✨ {t('card.title')}</h1>
          <Link href="/dashboard" className="text-sm text-ink-muted hover:text-primary">← {t('card.back')}</Link>
        </div>

        {/* The card (screenshot this) */}
        <div className="relative overflow-hidden rounded-3xl p-7 text-white shadow-2xl"
          style={{ background: 'linear-gradient(155deg,#0F4A52 0%,#0A353B 55%,#123f63 100%)', aspectRatio: '4 / 5' }}>
          <div className="absolute -top-16 -right-12 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(46,158,143,.5),transparent 70%)' }} />
          <div className="absolute -bottom-20 -left-10 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle,rgba(59,78,150,.45),transparent 70%)' }} />

          <div className="relative h-full flex flex-col">
            <div className="text-[11px] font-extrabold tracking-wide" style={{ color: '#9FD8CD' }}>🧬 {t('card.tag')}</div>

            <div className="mt-5">
              <div className="text-[13px]" style={{ color: '#BFE7DE' }}>{t('card.hi')}</div>
              <div className="text-3xl font-black">{name}</div>
            </div>

            <div className="mt-auto">
              {path ? (
                <>
                  <div className="text-[13px]" style={{ color: '#BFE7DE' }}>{t('card.ontrack')}</div>
                  <div className="text-2xl font-black leading-tight">{emoji} {path}</div>
                </>
              ) : (
                <>
                  <div className="text-lg font-extrabold">🧭 {t('card.discover')}</div>
                  <div className="text-[12px] mt-1" style={{ color: '#9FD8CD' }}>{t('card.discover_sub')}</div>
                </>
              )}

              {/* stats */}
              <div className="flex flex-wrap gap-2 mt-5">
                {streak > 0 && (
                  <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,.12)' }}>
                    <div className="text-[10px]" style={{ color: '#BFE7DE' }}>{t('card.streak')}</div>
                    <div className="font-extrabold">{streak} 🔥</div>
                  </div>
                )}
                <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,.12)' }}>
                  <div className="text-[10px]" style={{ color: '#BFE7DE' }}>XP</div>
                  <div className="font-extrabold">{xp.toLocaleString('en')} ⭐</div>
                </div>
                {rank != null && (
                  <div className="rounded-xl px-3 py-2" style={{ background: 'rgba(255,255,255,.12)' }}>
                    <div className="text-[10px]" style={{ color: '#BFE7DE' }}>{t('card.rank')}</div>
                    <div className="font-extrabold">#{rank} 🏆</div>
                  </div>
                )}
              </div>

              <div className="mt-5 text-[11px]" style={{ color: '#8FCabd' }}>
                via مسارك{school ? ` · ${school}` : ''}
              </div>
            </div>
          </div>
        </div>

        {/* actions (not part of the screenshot) */}
        <p className="text-center text-[12px] text-ink-muted mt-4">📸 {t('card.screenshot_hint')}</p>
        <button onClick={share} className="btn-primary w-full py-3 rounded-xl mt-2 font-bold">📲 {t('card.share')}</button>
        {!path && (
          <Link href="/career-dna" className="block text-center mt-3 text-sm font-bold text-primary hover:underline">
            {t('card.discover_cta')} ←
          </Link>
        )}
      </div>
    </main>
  );
}
