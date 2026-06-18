'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import { formatNumber } from '@/lib/numbers';
import { track } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';
import TestimonialsSection from '@/components/TestimonialsSection';

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

export default function Home() {
  const { t, dir, locale } = useI18n();

  // Dynamic stats from DB — fallback to static while loading
  const [counts, setCounts] = useState({ universities: 35, majors: 20, scholarships: 60 });
  useEffect(() => {
    Promise.all([
      supabase.from('universities').select('id', { count: 'exact', head: true }),
      supabase.from('majors').select('id', { count: 'exact', head: true }),
      supabase.from('scholarships').select('id', { count: 'exact', head: true }),
    ]).then(([u, m, s]) => {
      setCounts({
        universities: u.count ?? 35,
        majors:       m.count ?? 20,
        scholarships: s.count ?? 60,
      });
    });
  }, []);

  // Stats row data
  const STATS: { value: string; labelKey: TranslationKey; icon: string }[] = [
    { value: counts.universities + '+', labelKey: 'home.stat.universities', icon: '🏛️' },
    { value: counts.majors + '+',       labelKey: 'home.stat.majors',       icon: '📚' },
    { value: counts.scholarships + '+', labelKey: 'home.stat.scholarships', icon: '🎓' },
    { value: '60+',                     labelKey: 'home.stat.tools',        icon: '🛠️' },
  ];

  // How-it-works steps
  const STEPS: { n: string; emoji: string; tKey: TranslationKey; dKey: TranslationKey; color: string }[] = [
    { n: '1', emoji: '✍️', tKey: 'home.how.s1.t', dKey: 'home.how.s1.d', color: 'from-mint to-primary-300' },
    { n: '2', emoji: '🧬', tKey: 'home.how.s2.t', dKey: 'home.how.s2.d', color: 'from-coral to-accent' },
    { n: '3', emoji: '🚀', tKey: 'home.how.s3.t', dKey: 'home.how.s3.d', color: 'from-primary to-violet' },
  ];

  return (
    <main className="overflow-x-hidden bg-bg" dir={dir}>

      {/* ════ HERO ═════════════════════════════════════════════════════════════ */}
      <section className="relative pt-10 md:pt-16 pb-12 md:pb-24 overflow-hidden bg-gradient-to-b from-mint-pale via-bg to-bg">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-40" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-accent rounded-full blur-3xl opacity-15" />
          <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-primary-300 rounded-full blur-3xl opacity-20" />
          <div className="absolute inset-0 bg-pattern-dots opacity-30" style={{ backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative container-page">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-8 items-center">

            {/* TEXT */}
            <div className={`text-center ${dir === 'rtl' ? 'lg:text-right' : 'lg:text-left'} order-2 lg:order-1`}>
              <div className="inline-flex items-center gap-2 bg-mint-light text-primary-dark px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-fade-up shadow-soft">
                <span className="w-2 h-2 bg-success rounded-full animate-pulse" />
                <span>{t('home.hero.badge')}</span>
              </div>

              <h1 className="h1 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                {t('home.hero.title.1')}
                <br />
                <span className="text-gradient">{t('home.hero.title.2')}</span>
              </h1>

              <p className={`lead max-w-xl mx-auto ${dir === 'rtl' ? 'lg:mx-0 lg:ml-auto' : 'lg:mx-0 lg:mr-auto'} mb-8 animate-fade-up`} style={{ animationDelay: '0.2s' }}>
                {t('home.hero.subtitle.1')}
                <span className="text-primary font-bold"> {t('home.hero.subtitle.2')}</span>
                {t('home.hero.subtitle.3')}
              </p>

              <div className={`flex flex-wrap items-center justify-center ${dir === 'rtl' ? 'lg:justify-start' : 'lg:justify-start'} gap-3 mb-8 animate-fade-up`} style={{ animationDelay: '0.3s' }}>
                <Link href="/career-dna" onClick={() => track('cta_click', { id: 'hero_primary_dna', location: 'home_hero' })} className="btn-primary text-lg px-7 py-4">
                  <span>🧬</span>
                  <span>{t('home.cta.start_free')}</span>
                  <span className="text-xl">{dir === 'rtl' ? '←' : '→'}</span>
                </Link>
                <Link href="/universities" onClick={() => track('cta_click', { id: 'hero_secondary_unis', location: 'home_hero' })} className="btn-mint text-lg px-7 py-4">
                  <span>🏛️</span>
                  <span>{t('home.cta.try_dna')}</span>
                </Link>
              </div>

              <div className={`flex items-center justify-center ${dir === 'rtl' ? 'lg:justify-start' : 'lg:justify-start'} gap-4 text-sm text-ink-muted animate-fade-up`} style={{ animationDelay: '0.4s' }}>
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {['👨‍🎓','👩‍🎓','👨‍💼','👩‍🔬'].map((e, i) => (
                    <div key={i} className="w-9 h-9 rounded-full bg-gradient-mint flex items-center justify-center text-base border-2 border-white shadow-soft">
                      {e}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="font-bold text-ink">{t('home.hero.trust.title')}</div>
                  <div className="text-xs">{t('home.hero.trust.subtitle')}</div>
                </div>
              </div>
            </div>

            {/* VISUAL */}
            <div className="relative order-1 lg:order-2 h-[420px] md:h-[500px] lg:h-[560px] animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-80 h-80 md:w-96 md:h-96 rounded-full bg-gradient-mint-deep opacity-90" />
              </div>

              <div className="absolute inset-0 flex items-center justify-center text-[180px] md:text-[220px] animate-float drop-shadow-2xl">
                🎓
              </div>

              <div className="absolute top-2 md:top-4 right-2 md:right-6 bg-surface rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-warm rounded-xl flex items-center justify-center text-xl">🎯</div>
                  <div>
                    <div className="text-xs text-ink-muted">{t('home.float.quiz.label')}</div>
                    <div className="font-extrabold text-primary text-sm">{t('home.float.quiz.value')}</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/4 left-0 md:left-2 bg-surface rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-cool rounded-xl flex items-center justify-center text-xl">🏆</div>
                  <div>
                    <div className="text-xs text-ink-muted">{t('home.float.scholarship.label')}</div>
                    <div className="font-extrabold text-primary text-sm">{t('home.float.scholarship.value')}</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-12 right-4 md:right-8 bg-surface rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '1.5s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-fresh rounded-xl flex items-center justify-center text-xl">⭐</div>
                  <div>
                    <div className="text-xs text-ink-muted">{t('home.float.xp.label')}</div>
                    <div className="font-extrabold text-primary text-sm">{t('home.float.xp.value')}</div>
                  </div>
                </div>
              </div>

              <div className="absolute bottom-2 md:bottom-6 left-4 md:left-8 bg-surface rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-sunset rounded-xl flex items-center justify-center text-xl">🧬</div>
                  <div>
                    <div className="text-xs text-ink-muted">{t('home.float.dna.label')}</div>
                    <div className="font-extrabold text-primary text-sm">{t('home.float.dna.value')}</div>
                  </div>
                </div>
              </div>

              <div className="absolute top-1/2 -right-2 text-3xl md:text-4xl animate-bounce-soft" style={{ animationDelay: '0.3s' }}>📚</div>
              <div className="absolute top-10 left-1/4 text-2xl md:text-3xl animate-bounce-soft" style={{ animationDelay: '0.8s' }}>✨</div>
              <div className="absolute bottom-1/3 -left-2 text-3xl md:text-4xl animate-bounce-soft" style={{ animationDelay: '1.2s' }}>💡</div>
              <div className="absolute top-1/3 right-1/4 text-2xl animate-bounce-soft" style={{ animationDelay: '1.7s' }}>🚀</div>
            </div>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mt-10 md:mt-16 animate-fade-up stagger" style={{ animationDelay: '0.5s' }}>
            {STATS.map(s => (
              <div key={s.labelKey} className="card-glass text-center px-3 py-4 md:px-4 md:py-5 hover:scale-105 transition-transform">
                <div className="text-3xl mb-1">{s.icon}</div>
                <div className="text-2xl md:text-4xl font-extrabold text-primary leading-none">{formatNumber(s.value, locale)}</div>
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
                    <div>
                      <div className="font-extrabold text-primary">{t('home.dna.preview.title')}</div>
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
          <TestimonialsSection />
</main>
  );
}
