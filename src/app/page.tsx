'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';

// ─── Static data, keyed by translation IDs ────────────────────────────────────
type Feature = { href: string; icon: string; tKey: TranslationKey; dKey: TranslationKey; color: string };

const FEATURES: Feature[] = [
  { href: '/universities',     icon: '🏛️', tKey: 'home.feat.universities.t', dKey: 'home.feat.universities.d', color: 'from-primary-100 to-mint-light' },
  { href: '/majors',           icon: '📚', tKey: 'home.feat.majors.t',       dKey: 'home.feat.majors.d',       color: 'from-accent-light to-coral/20' },
  { href: '/scholarships',     icon: '🎓', tKey: 'home.feat.scholarships.t', dKey: 'home.feat.scholarships.d', color: 'from-violet/30 to-primary-100' },
  { href: '/careers',          icon: '💼', tKey: 'home.feat.careers.t',      dKey: 'home.feat.careers.d',      color: 'from-info-light to-mint-light' },
  { href: '/schools',          icon: '🏫', tKey: 'home.feat.schools.t',      dKey: 'home.feat.schools.d',      color: 'from-success-light to-mint-light' },
  { href: '/vocational',       icon: '🛠️', tKey: 'home.feat.vocational.t',   dKey: 'home.feat.vocational.d',   color: 'from-warning-light to-accent-light' },
  { href: '/quiz/today',       icon: '🎯', tKey: 'home.feat.quiz.t',         dKey: 'home.feat.quiz.d',         color: 'from-primary-200 to-primary-100' },
  { href: '/career-dna',       icon: '🧬', tKey: 'home.feat.dna.t',          dKey: 'home.feat.dna.d',          color: 'from-coral/20 to-violet/20' },
  { href: '/tools/cv-builder', icon: '📄', tKey: 'home.feat.cv.t',           dKey: 'home.feat.cv.d',           color: 'from-mint-light to-primary-100' },
];

type Audience = { icon: string; tKey: TranslationKey; dKey: TranslationKey; href: string; badgeKey?: TranslationKey };

const AUDIENCES: Audience[] = [
  { icon: '🎓', tKey: 'home.audiences.students.t', dKey: 'home.audiences.students.d', href: '/for-students',     badgeKey: 'home.audiences.students.badge' },
  { icon: '👪', tKey: 'home.audiences.parents.t',  dKey: 'home.audiences.parents.d',  href: '/for-parents' },
  { icon: '🏫', tKey: 'home.audiences.schools.t',  dKey: 'home.audiences.schools.d',  href: '/for-schools' },
  { icon: '🏛️', tKey: 'home.audiences.unis.t',     dKey: 'home.audiences.unis.d',     href: '/for-universities', badgeKey: 'home.audiences.unis.badge' },
];

type WhyCard = { icon: string; tKey: TranslationKey; dKey: TranslationKey; gradient: string };

const WHY: WhyCard[] = [
  { icon: '✨', tKey: 'home.why.curated.t',   dKey: 'home.why.curated.d',   gradient: 'from-mint to-primary-300' },
  { icon: '🚀', tKey: 'home.why.tech.t',      dKey: 'home.why.tech.d',      gradient: 'from-accent to-coral' },
  { icon: '🤝', tKey: 'home.why.community.t', dKey: 'home.why.community.d', gradient: 'from-violet to-primary-400' },
  { icon: '🔒', tKey: 'home.why.privacy.t',   dKey: 'home.why.privacy.d',   gradient: 'from-info to-primary-500' },
  { icon: '🎯', tKey: 'home.why.practical.t', dKey: 'home.why.practical.d', gradient: 'from-success to-mint' },
  { icon: '💚', tKey: 'home.why.values.t',    dKey: 'home.why.values.d',    gradient: 'from-primary-700 to-primary-500' },
];

const PARTNERS = [
  { name: 'AUB', icon: '🏛️' },
  { name: 'LAU', icon: '🎓' },
  { name: 'USJ', icon: '⚜️' },
  { name: 'UL',  icon: '🏫' },
  { name: 'BAU', icon: '🕌' },
  { name: 'USEK',icon: '🎵' },
  { name: 'NDU', icon: '⛰️' },
  { name: 'UOB', icon: '🏔️' },
];

// Tiny count-up component — animates from 0 to the target on first paint.
function AnimatedNumber({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (target <= 0) { setValue(0); return; }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // ease-out-cubic — slows toward the end so the final number feels intentional
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return <>{value}</>;
}

export default function Home() {
  const { t, dir } = useI18n();

  // Live counts from Supabase — keep small truthful fallbacks so SSR/first paint never lies.
  const [counts, setCounts] = useState({ universities: 35, majors: 20, scholarships: 8, tools: 12 });
  const [streak, setStreak] = useState<{ days: number; today: boolean; lastDays: boolean[] } | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [u, s] = await Promise.all([
        supabase.from('universities').select('id', { count: 'exact', head: true }),
        supabase.from('scholarships').select('id', { count: 'exact', head: true }).eq('active', true),
      ]);
      if (!active) return;
      setCounts(c => ({
        ...c,
        universities: u.count ?? c.universities,
        scholarships: s.count ?? c.scholarships,
      }));
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      const sevenDaysAgo = new Date(today.getTime() - 6 * 86400000).toISOString().slice(0, 10);
      const [{ data: gam }, { data: sessions }] = await Promise.all([
        supabase.from('quiz_gamification').select('streak_days').eq('user_id', user.id).maybeSingle(),
        supabase.from('quiz_daily_sessions').select('quiz_date, completed_at')
          .eq('user_id', user.id)
          .gte('quiz_date', sevenDaysAgo)
          .order('quiz_date', { ascending: true }),
      ]);
      if (cancelled) return;
      const days = Number(gam?.streak_days || 0);
      type Sess = { quiz_date: string; completed_at: string | null };
      const list = (sessions || []) as Sess[];
      const completedToday = !!list.find(s => s.quiz_date === todayStr && s.completed_at);
      const lastDays: boolean[] = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today.getTime() - i * 86400000).toISOString().slice(0, 10);
        lastDays.push(!!list.find(s => s.quiz_date === d && s.completed_at));
      }
      setStreak({ days, today: completedToday, lastDays });
    })();
    return () => { cancelled = true; };
  }, []);

  // Stats row — sourced from live DB counts. No '+' inflation; show real numbers.
  const STATS: { value: string; labelKey: TranslationKey; icon: string }[] = [
    { value: String(counts.universities), labelKey: 'home.stat.universities', icon: '🏛️' },
    { value: String(counts.majors),       labelKey: 'home.stat.majors',       icon: '📚' },
    { value: String(counts.scholarships), labelKey: 'home.stat.scholarships', icon: '🎓' },
    { value: String(counts.tools),        labelKey: 'home.stat.tools',        icon: '🛠️' },
  ];

  // How-it-works steps
  const STEPS: { n: string; emoji: string; tKey: TranslationKey; dKey: TranslationKey; color: string }[] = [
    { n: '1', emoji: '✍️', tKey: 'home.how.s1.t', dKey: 'home.how.s1.d', color: 'from-mint to-primary-300' },
    { n: '2', emoji: '🧬', tKey: 'home.how.s2.t', dKey: 'home.how.s2.d', color: 'from-coral to-accent' },
    { n: '3', emoji: '🚀', tKey: 'home.how.s3.t', dKey: 'home.how.s3.d', color: 'from-primary to-violet' },
  ];

  return (
    <main className="overflow-x-hidden bg-bg" dir={dir}>

      {/* ════ HERO — Cinematic Redesign ═══════════════════════════════════════ */}
      <section className="mk-bg-deep relative overflow-hidden pt-10 md:pt-20 pb-14 md:pb-24 text-white">
        {/* Drifting glow blobs */}
        <div aria-hidden className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full mk-drift" style={{ background: 'radial-gradient(closest-side, rgba(151,222,208,0.35), transparent 70%)' }} />
          <div className="absolute top-1/2 -left-24 w-[320px] h-[320px] rounded-full mk-drift2" style={{ background: 'radial-gradient(closest-side, rgba(22,199,217,0.18), transparent 70%)' }} />
          <div className="absolute bottom-0 right-1/3 w-[280px] h-[280px] rounded-full opacity-40 mk-drift" style={{ background: 'radial-gradient(closest-side, rgba(151,222,208,0.18), transparent 70%)', animationDelay: '4s' }} />
        </div>

        <div className="relative container-page">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-16 items-center">

            {/* TEXT */}
            <div className={`text-center ${dir === 'rtl' ? 'lg:text-right' : 'lg:text-left'} order-2 lg:order-1`}>
              <div className="inline-flex items-center gap-2 bg-white/8 border border-white/15 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold mb-6 mk-rise">
                <span className="w-2 h-2 bg-[var(--mk-mint)] rounded-full mk-livedot" />
                <span className="text-white/90">{t('home.hero.badge')}</span>
              </div>

              <h1 className="text-4xl md:text-6xl font-extrabold mb-5 leading-[1.15] mk-rise" style={{ animationDelay: '0.08s', fontFamily: "'IBM Plex Sans Arabic', system-ui, sans-serif" }}>
                <span className="text-white">{t('home.hero.title.1')}</span>
                <br />
                <span style={{ color: 'var(--mk-mint)' }}>{t('home.hero.title.2')}</span>
              </h1>

              <p className={`text-base md:text-lg text-white/75 max-w-xl mx-auto ${dir === 'rtl' ? 'lg:mx-0 lg:ml-auto' : 'lg:mx-0 lg:mr-auto'} mb-8 mk-rise leading-relaxed`} style={{ animationDelay: '0.16s' }}>
                {t('home.hero.subtitle.1')} <span className="text-[var(--mk-mint)] font-bold">{t('home.hero.subtitle.2')}</span>{t('home.hero.subtitle.3')}
              </p>

              <div className={`flex flex-wrap items-center justify-center ${dir === 'rtl' ? 'lg:justify-start' : 'lg:justify-start'} gap-3 mb-8 mk-rise`} style={{ animationDelay: '0.24s' }}>
                <Link href="/auth/register" className="mk-press mk-cta-mint inline-flex items-center gap-2 px-7 py-3.5 text-base">
                  <span>{t('home.cta.start_free')}</span>
                  <span className="text-xl">{dir === 'rtl' ? '←' : '→'}</span>
                </Link>
                <Link href="/career-dna" className="mk-press inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-base font-bold border border-white/25 bg-white/5 backdrop-blur text-white hover:bg-white/10 transition-colors">
                  <span>{t('home.cta.try_dna')}</span>
                  <span>🧬</span>
                </Link>
              </div>

              <div className={`flex items-center justify-center ${dir === 'rtl' ? 'lg:justify-start' : 'lg:justify-start'} gap-3 text-sm text-white/65 mk-rise`} style={{ animationDelay: '0.32s' }}>
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {['👨‍🎓','👩‍🎓','👨‍💼','👩‍🔬'].map((e, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--mk-mint)] to-[var(--mk-cyan)] flex items-center justify-center text-base border-2 border-[var(--mk-deep-2)] shadow-lg">
                      {e}
                    </div>
                  ))}
                </div>
                <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                  <div className="font-bold text-white">{t('home.hero.trust.title')}</div>
                  <div className="text-xs text-white/55">{t('home.hero.trust.subtitle')}</div>
                </div>
              </div>
            </div>

            {/* VISUAL — central glow + floating chips (decorative, labeled as example) */}
            <div className="relative order-1 lg:order-2 h-[380px] md:h-[460px] mk-screen-in" style={{ animationDelay: '0.1s' }}>
              {/* Central radial halo */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-64 h-64 md:w-80 md:h-80 rounded-full opacity-90 mk-helix" style={{ background: 'radial-gradient(closest-side, rgba(151,222,208,0.55), rgba(22,199,217,0.15) 60%, transparent 80%)' }} />
              </div>
              {/* Floating 🧬 — symbol of Career DNA */}
              <div className="absolute inset-0 flex items-center justify-center text-[140px] md:text-[180px] mk-float drop-shadow-[0_10px_40px_rgba(151,222,208,0.45)]">
                🧬
              </div>

              {/* Floating chip: today's quiz example */}
              <div className="absolute top-2 md:top-6 right-2 md:right-6 mk-chip mk-float" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">🎯</div>
                  <div>
                    <div className="text-[10px] text-white/60 font-semibold">{t('home.float.quiz.label')}</div>
                    <div className="text-sm font-extrabold text-white">{t('home.float.quiz.value')}</div>
                  </div>
                </div>
              </div>

              {/* Floating chip: scholarship */}
              <div className="absolute top-1/4 left-0 md:left-2 mk-chip mk-float" style={{ animationDelay: '0.9s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">🏆</div>
                  <div>
                    <div className="text-[10px] text-white/60 font-semibold">{t('home.float.scholarship.label')}</div>
                    <div className="text-sm font-extrabold text-white">{t('home.float.scholarship.value')}</div>
                  </div>
                </div>
              </div>

              {/* Floating chip: XP */}
              <div className="absolute bottom-10 right-4 md:right-10 mk-chip mk-float" style={{ animationDelay: '1.4s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">⚡</div>
                  <div>
                    <div className="text-[10px] text-white/60 font-semibold">{t('home.float.xp.label')}</div>
                    <div className="text-sm font-extrabold text-white">{t('home.float.xp.value')}</div>
                  </div>
                </div>
              </div>

              {/* Floating chip: DNA example */}
              <div className="absolute bottom-2 md:bottom-6 left-4 md:left-8 mk-chip mk-float" style={{ animationDelay: '1.9s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-xl">🧬</div>
                  <div>
                    <div className="text-[10px] text-white/60 font-semibold">{t('home.float.dna.label')}</div>
                    <div className="text-sm font-extrabold text-white">{t('home.float.dna.value')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Streak Widget — only for signed-in students with at least some quiz activity */}
          {streak && (streak.days > 0 || streak.lastDays.some(Boolean)) && (
            <div className="mt-10 md:mt-12">
              <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 rounded-3xl p-5 md:p-6 text-white shadow-floaty relative overflow-hidden">
                <div className="absolute -top-6 -right-6 text-9xl opacity-10">🔥</div>
                <div className="flex items-center justify-between gap-4 relative">
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white/80 font-semibold mb-1">سلسلتك اليومية</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl md:text-5xl font-extrabold">{streak.days}</span>
                      <span className="text-base md:text-lg font-bold">{streak.days === 1 ? 'يوم' : 'أيام'} 🔥</span>
                    </div>
                    {!streak.today ? (
                      <p className="text-white/90 text-sm mt-1 font-semibold">⚠️ كمّل اختبار اليوم قبل ما تضيع سلسلتك</p>
                    ) : (
                      <p className="text-white/90 text-sm mt-1 font-semibold">✓ خلّصت اختبار اليوم — رجاع بكرا!</p>
                    )}
                  </div>
                  <Link href="/quiz/today"
                    className="bg-white text-orange-600 font-extrabold px-5 py-3 rounded-2xl whitespace-nowrap hover:scale-105 transition-transform shadow-lg text-sm md:text-base">
                    {streak.today ? 'مراجعة ←' : 'كمّل الآن ←'}
                  </Link>
                </div>
                <div className="flex items-center gap-1.5 mt-4 relative">
                  {streak.lastDays.map((done, i) => (
                    <div key={i} className={`flex-1 h-1.5 rounded-full ${done ? 'bg-white' : 'bg-white/25'}`} />
                  ))}
                  <span className="text-[10px] text-white/70 font-bold mr-1 whitespace-nowrap">آخر ٧ أيام</span>
                </div>
              </div>
            </div>
          )}

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-10 md:mt-16 animate-fade-up stagger" style={{ animationDelay: '0.5s' }}>
            {STATS.map(s => (
              <div key={s.labelKey} className="card-glass text-center px-4 py-5 hover:scale-105 transition-transform">
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-3xl md:text-4xl font-extrabold text-primary leading-none">
                  <AnimatedNumber target={Number(s.value) || 0} />
                </div>
                <div className="text-xs md:text-sm text-ink-muted mt-1 font-medium">{t(s.labelKey)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ PARTNER STRIP ═══════════════════════════════════════════════════ */}
      <section className="py-10 bg-surface border-y border-border-soft">
        <div className="container-page">
          <p className="text-center text-sm text-ink-muted mb-6 font-bold">
            {t('home.partners.heading')}
          </p>
          <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap">
            {PARTNERS.map(p => (
              <div key={p.name} className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-bg-soft hover:bg-mint-light transition-colors">
                <span className="text-2xl">{p.icon}</span>
                <span className="font-extrabold text-primary text-sm">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ FEATURES GRID ═══════════════════════════════════════════════════ */}
      <section className="section relative overflow-hidden">
        <div className="absolute top-20 right-0 w-72 h-72 bg-mint rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-accent rounded-full blur-3xl opacity-10" />

        <div className="relative container-page">
          <div className="text-center mb-12">
            <span className="badge-accent mb-3">{t('home.features.badge')}</span>
            <h2 className="h2 mb-3">{t('home.features.title')}</h2>
            <p className="lead max-w-xl mx-auto">{t('home.features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {FEATURES.map(f => (
              <Link
                key={f.href}
                href={f.href}
                className="group relative bg-surface rounded-3xl border border-border-soft p-6 hover:shadow-floaty hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-0`} />
                <div className="relative z-10">
                  <div className="icon-circle-lg bg-gradient-mint mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform">
                    <span className="text-3xl">{f.icon}</span>
                  </div>
                  <h3 className="h4 mb-1.5 group-hover:text-primary transition-colors">{t(f.tKey)}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{t(f.dKey)}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-bold text-primary opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0">
                    <span>{t('home.features.open')}</span><span>{dir === 'rtl' ? '←' : '→'}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════ HOW IT WORKS ════════════════════════════════════════════════════ */}
      <section className="section bg-bg-mint relative overflow-hidden">
        <div className="absolute top-0 left-0 w-72 h-72 bg-mint rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary-200 rounded-full blur-3xl opacity-20" />

        <div className="relative container-page">
          <div className="text-center mb-12">
            <span className="badge-mint mb-3">{t('home.how.badge')}</span>
            <h2 className="h2 mb-3">{t('home.how.title')}</h2>
            <p className="lead max-w-xl mx-auto">{t('home.how.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 stagger">
            {STEPS.map((step, i) => (
              <div key={step.n} className="relative">
                <div className={`absolute -top-4 ${dir === 'rtl' ? 'right-6' : 'left-6'} w-12 h-12 rounded-2xl bg-gradient-to-br ${step.color} text-white font-extrabold text-xl flex items-center justify-center shadow-floaty`}>
                  {step.n}
                </div>
                <div className="card text-center pt-8 hover:shadow-floaty hover:-translate-y-1 transition-all">
                  <div className="text-6xl mb-4">{step.emoji}</div>
                  <h3 className="h4 mb-2">{t(step.tKey)}</h3>
                  <p className="text-ink-muted leading-relaxed text-sm">{t(step.dKey)}</p>
                </div>
                {i < 2 && (
                  <div className={`hidden md:block absolute top-1/2 ${dir === 'rtl' ? '-left-3' : '-right-3'} text-3xl text-primary opacity-30`}>{dir === 'rtl' ? '←' : '→'}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ AUDIENCES ═══════════════════════════════════════════════════════ */}
      <section className="section bg-surface relative overflow-hidden">
        <div className="absolute top-10 -right-20 w-72 h-72 bg-accent rounded-full blur-3xl opacity-15" />

        <div className="relative container-page">
          <div className="text-center mb-12">
            <span className="badge-mint mb-3">{t('home.audiences.badge')}</span>
            <h2 className="h2 mb-3">{t('home.audiences.title')}</h2>
            <p className="lead max-w-xl mx-auto">{t('home.audiences.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {AUDIENCES.map(a => (
              <Link
                key={a.href}
                href={a.href}
                className="card-hoverable relative overflow-hidden group bg-surface"
              >
                {a.badgeKey && (
                  <span className={`absolute top-3 ${dir === 'rtl' ? 'left-3' : 'right-3'} badge-accent text-[10px]`}>{t(a.badgeKey)}</span>
                )}
                <div className="text-5xl mb-3 group-hover:animate-bounce-soft">{a.icon}</div>
                <h3 className="h4 mb-1.5 text-primary">{t(a.tKey)}</h3>
                <p className="text-sm text-ink-muted leading-relaxed mb-3">{t(a.dKey)}</p>
                <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
                  {t('home.audiences.cta')} <span className="group-hover:-translate-x-1 transition-transform">{dir === 'rtl' ? '←' : '→'}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ════ DNA SPOTLIGHT ═══════════════════════════════════════════════════ */}
      <section className="section bg-bg">
        <div className="container-page">
          <div className="bg-gradient-hero text-white rounded-4xl p-8 md:p-12 lg:p-16 shadow-floaty relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-accent/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-mint/30 rounded-full blur-3xl" />

            <div className="relative grid md:grid-cols-2 gap-8 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-4">
                  {t('home.dna.badge')}
                </span>
                <h2 className="text-3xl md:text-5xl font-extrabold mb-4 leading-tight">
                  {t('home.dna.title')}
                </h2>
                <p className="text-lg md:text-xl text-white/90 mb-6 leading-relaxed">
                  {t('home.dna.subtitle')}
                </p>
                <Link href="/career-dna" className="inline-flex items-center gap-2 bg-white text-primary font-extrabold px-6 py-3 rounded-2xl shadow-floaty hover:scale-105 transition-transform">
                  <span>{t('home.dna.cta')}</span><span>{dir === 'rtl' ? '←' : '→'}</span>
                </Link>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="text-[180px] md:text-[240px] animate-float drop-shadow-2xl">🧬</div>
                <div className={`absolute bottom-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} bg-white text-ink rounded-2xl p-4 shadow-floaty max-w-xs`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">👑</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-1.5">
                        <div className="font-extrabold text-primary">{t('home.dna.preview.title')}</div>
                        <span className="text-[9px] uppercase tracking-wider bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-extrabold">{dir === 'rtl' ? 'مثال' : 'EXAMPLE'}</span>
                      </div>
                      <div className="text-xs text-ink-muted">{t('home.dna.preview.match')}</div>
                    </div>
                  </div>
                  <div className="text-xs text-ink-muted">{t('home.dna.preview.paths_label')}</div>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="badge-mint !text-[10px] !px-2">{t('home.dna.preview.path1')}</span>
                    <span className="badge-mint !text-[10px] !px-2">{t('home.dna.preview.path2')}</span>
                    <span className="badge-mint !text-[10px] !px-2">{t('home.dna.preview.path3')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ WHY MASARAK ═════════════════════════════════════════════════════ */}
      <section className="section bg-surface">
        <div className="container-page">
          <div className="text-center mb-12">
            <span className="badge-primary mb-3">{t('home.why.badge')}</span>
            <h2 className="h2 mb-3">{t('home.why.title')}</h2>
            <p className="lead max-w-xl mx-auto">{t('home.why.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
            {WHY.map(w => (
              <div key={w.tKey} className="card group hover:shadow-floaty hover:-translate-y-1 transition-all">
                <div className={`icon-circle-lg bg-gradient-to-br ${w.gradient} text-white mb-4 group-hover:rotate-6 transition-transform`}>
                  <span>{w.icon}</span>
                </div>
                <h3 className="h4 mb-2">{t(w.tKey)}</h3>
                <p className="text-ink-muted leading-relaxed">{t(w.dKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════ TESTIMONIAL ═════════════════════════════════════════════════════ */}
      <section className="section bg-bg-mint relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-mint rounded-full blur-3xl opacity-30" />

        <div className="relative container-narrow">
          <div className="text-center mb-8">
            <span className="badge-mint mb-3">{t('home.testimonial.badge')}</span>
            <h2 className="h2 mb-3">{t('home.testimonial.title')}</h2>
          </div>

          <div className="bg-surface rounded-4xl p-8 md:p-12 shadow-floaty relative">
            <div className={`text-7xl text-primary/15 absolute top-4 ${dir === 'rtl' ? 'right-6' : 'left-6'} leading-none`}>&quot;</div>
            <p className="text-xl md:text-2xl font-bold text-ink leading-relaxed mb-6 relative">
              {t('home.testimonial.quote.1')}
              <br />
              <span className="text-gradient">{t('home.testimonial.quote.2')}</span>
            </p>
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-gradient-mint flex items-center justify-center text-2xl font-extrabold text-primary border-4 border-white shadow-soft">
                {t('home.testimonial.author').charAt(0)}
              </div>
              <div>
                <div className="font-bold text-ink text-lg">{t('home.testimonial.author')}</div>
                <div className="text-sm text-ink-muted">{t('home.testimonial.role')}</div>
              </div>
              <div className={`${dir === 'rtl' ? 'mr-auto' : 'ml-auto'} text-2xl`}>⭐⭐⭐⭐⭐</div>
            </div>
          </div>
        </div>
      </section>

      {/* ════ FINAL CTA ═══════════════════════════════════════════════════════ */}
      <section className="section relative overflow-hidden">
        <div className="container-page">
          <div className="relative bg-gradient-hero text-white rounded-4xl p-10 md:p-16 text-center shadow-floaty overflow-hidden">
            <div className="absolute inset-0 bg-pattern-dots opacity-20" style={{ backgroundSize: '20px 20px' }} />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-mint/30 rounded-full blur-3xl" />

            <div className="absolute top-8 right-1/4 text-3xl animate-float">🎓</div>
            <div className="absolute top-12 left-1/4 text-3xl animate-float" style={{ animationDelay: '1s' }}>✨</div>
            <div className="absolute bottom-12 right-1/3 text-3xl animate-float" style={{ animationDelay: '1.5s' }}>📚</div>
            <div className="absolute bottom-10 left-1/3 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>💡</div>

            <div className="relative">
              <div className="text-6xl mb-4 animate-bounce-soft">🚀</div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-4">{t('home.cta.title')}</h2>
              <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-8">
                {t('home.cta.subtitle')}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-2 bg-white text-primary font-extrabold px-8 py-4 rounded-2xl text-lg shadow-floaty hover:scale-105 transition-transform"
                >
                  <span>{t('home.cta.start_free')}</span><span>{dir === 'rtl' ? '←' : '→'}</span>
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center gap-2 border-2 border-white/40 text-white font-bold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-colors backdrop-blur"
                >
                  {t('home.cta.learn_more')}
                </Link>
              </div>
              <p className="text-sm text-white/70 mt-6">
                {t('home.cta.note')}
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
