'use client';

import Link from 'next/link';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type Feat = { emoji: string; tKey: TranslationKey; dKey: TranslationKey; href: string; color: string };

const FEATURES: Feat[] = [
  { emoji: '🧬',  tKey: 'fs.feat.dna.t',          dKey: 'fs.feat.dna.d',          href: '/career-dna',             color: 'from-coral to-accent' },
  { emoji: '🎓',  tKey: 'fs.feat.majors.t',       dKey: 'fs.feat.majors.d',       href: '/majors',                 color: 'from-mint to-primary-300' },
  { emoji: '🏛️', tKey: 'fs.feat.unis.t',         dKey: 'fs.feat.unis.d',         href: '/universities',           color: 'from-primary-300 to-info' },
  { emoji: '🏆',  tKey: 'fs.feat.scholarships.t', dKey: 'fs.feat.scholarships.d', href: '/scholarships',           color: 'from-warning to-accent' },
  { emoji: '💼',  tKey: 'fs.feat.internships.t',  dKey: 'fs.feat.internships.d',  href: '/internships/hub',        color: 'from-success to-mint' },
  { emoji: '📋',  tKey: 'fs.feat.cv.t',           dKey: 'fs.feat.cv.d',           href: '/tools/cv-builder',       color: 'from-violet to-primary' },
  { emoji: '🤖',  tKey: 'fs.feat.advisor.t',      dKey: 'fs.feat.advisor.d',      href: '/tools/career-ai',        color: 'from-info to-primary' },
  { emoji: '🎤',  tKey: 'fs.feat.interview.t',    dKey: 'fs.feat.interview.d',    href: '/tools/interview-prep',   color: 'from-mint-light to-mint' },
];

export default function ForStudentsClient() {
  const { t, dir } = useI18n();

  return (
    <main className="bg-bg overflow-x-hidden" dir={dir}>

      {/* HERO */}
      <section className="relative pt-12 pb-20 md:pt-16 md:pb-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-40" />
          <div className="absolute top-1/3 -left-20 w-72 h-72 bg-accent rounded-full blur-3xl opacity-15" />
          <div className="absolute inset-0 bg-pattern-dots opacity-20" style={{ backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative container-page">
          <div className="grid lg:grid-cols-2 gap-10 items-center">

            <div className={`text-center ${dir === 'rtl' ? 'lg:text-right' : 'lg:text-left'} order-2 lg:order-1`}>
              <span className="inline-flex items-center gap-2 bg-mint-light text-primary-dark px-4 py-1.5 rounded-full text-sm font-bold mb-5 shadow-soft animate-fade-up">
                <span>{t('fs.hero.badge')}</span>
              </span>
              <h1 className="h1 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
                {t('fs.hero.title.1')}
                <br />
                <span className="text-gradient">{t('fs.hero.title.2')}</span>
              </h1>
              <p className={`lead max-w-xl mx-auto ${dir === 'rtl' ? 'lg:mx-0 lg:ml-auto' : 'lg:mx-0 lg:mr-auto'} mb-8 animate-fade-up`} style={{ animationDelay: '0.2s' }}>
                {t('fs.hero.subtitle.1')}
                <span className="text-primary font-bold"> {t('fs.hero.subtitle.2')} </span>
                {t('fs.hero.subtitle.3')}
              </p>
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <Link href="/auth/register?role=student" className="btn-primary text-lg px-8 py-4">
                  {t('fs.cta.start')}
                </Link>
                <Link href="/quiz/today" className="btn-mint text-lg px-8 py-4">
                  {t('fs.cta.quiz')}
                </Link>
              </div>
            </div>

            <div className="relative h-80 md:h-[450px] order-1 lg:order-2 animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-72 h-72 md:w-80 md:h-80 rounded-full bg-gradient-mint-deep opacity-90" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center text-[180px] md:text-[200px] animate-float drop-shadow-2xl">
                🎓
              </div>
              <div className="absolute top-4 right-4 bg-surface rounded-2xl shadow-floaty p-3 border border-border-soft animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-warm rounded-xl flex items-center justify-center text-xl">🏆</div>
                  <div>
                    <div className="text-xs text-ink-muted">{t('fs.float.level')}</div>
                    <div className="font-extrabold text-primary text-sm">L5 ✨</div>
                  </div>
                </div>
              </div>
              <div className="absolute top-1/3 left-2 bg-surface rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '0.7s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-fresh rounded-xl flex items-center justify-center text-xl">📚</div>
                  <div>
                    <div className="text-xs text-ink-muted">{t('fs.float.subject')}</div>
                    <div className="font-extrabold text-primary text-sm">{t('fs.float.subject.value')}</div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-8 bg-surface rounded-2xl shadow-floaty p-3 border border-border-soft animate-float" style={{ animationDelay: '1.2s' }}>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-cool rounded-xl flex items-center justify-center text-xl">🔥</div>
                  <div>
                    <div className="text-xs text-ink-muted">{t('fs.float.streak')}</div>
                    <div className="font-extrabold text-primary text-sm">{t('fs.float.streak.value')}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="section bg-surface relative overflow-hidden">
        <div className="absolute top-20 right-0 w-72 h-72 bg-mint rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-accent rounded-full blur-3xl opacity-10" />

        <div className="relative container-page">
          <div className="text-center mb-12">
            <span className="badge-accent mb-3">{t('fs.features.badge')}</span>
            <h2 className="h2 mb-3">{t('fs.features.title')}</h2>
            <p className="lead max-w-xl mx-auto">{t('fs.features.subtitle')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {FEATURES.map(f => (
              <Link key={f.href} href={f.href}
                className="group relative bg-surface rounded-3xl border border-border-soft p-5 hover:shadow-floaty hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${f.color} opacity-0 group-hover:opacity-10 transition-opacity -z-0`} />
                <div className="relative">
                  <div className={`icon-circle-lg bg-gradient-to-br ${f.color} text-white mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                    <span className="text-3xl">{f.emoji}</span>
                  </div>
                  <h3 className="font-extrabold text-primary mb-1.5 group-hover:underline">{t(f.tKey)}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed">{t(f.dKey)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HONEST STATE — منصة جديدة، رح نضيف قصص نجاح حقيقية ساعة الطلاب يخلصو سنتهن */}
      <section className="section bg-bg-mint relative overflow-hidden">
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30" />

        <div className="relative container-page">
          <div className="text-center max-w-2xl mx-auto">
            <div className="text-5xl mb-4">🌱</div>
            <h2 className="h2 mb-3">منصة جديدة — كن من أوائل الطلاب</h2>
            <p className="lead mb-6">
              مسارك انطلقت حديثاً. مش رح نخترع شهادات وهمية — بدل هيك، نحنا ملتزمين نضيف قصص نجاح حقيقية موثقة كل ما يستخدمو الطلاب المنصة.
            </p>
            <Link
              href="/auth/register?role=student"
              className="inline-flex items-center gap-2 bg-primary text-white font-bold px-6 py-3 rounded-2xl shadow-card hover:bg-primary-dark hover:-translate-y-0.5 transition-all"
            >
              ابدأ مجاناً اليوم ←
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section relative overflow-hidden">
        <div className="container-page">
          <div className="bg-gradient-hero text-white rounded-4xl p-10 md:p-16 text-center shadow-floaty relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-mint/30 rounded-full blur-3xl" />

            <div className="absolute top-8 right-1/4 text-3xl animate-float">📚</div>
            <div className="absolute bottom-12 left-1/4 text-3xl animate-float" style={{ animationDelay: '1s' }}>✨</div>

            <div className="relative">
              <div className="text-6xl mb-4 animate-bounce-soft">🚀</div>
              <h2 className="text-3xl md:text-5xl font-extrabold mb-3">{t('fs.cta.title')}</h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto mb-8">
                {t('fs.cta.subtitle')}
              </p>
              <Link href="/auth/register?role=student"
                className="inline-flex items-center gap-2 bg-surface text-primary font-extrabold px-8 py-4 rounded-2xl text-lg shadow-floaty hover:scale-105 transition-transform">
                {t('fs.cta.button')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
