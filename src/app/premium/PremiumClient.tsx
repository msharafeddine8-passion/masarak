'use client';

import Link from 'next/link';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type Feature = { emoji: string; tKey: TranslationKey; dKey: TranslationKey; color: string };

const PREMIUM_FEATURES: Feature[] = [
  { emoji: '🤖', tKey: 'prem.f1.t', dKey: 'prem.f1.d', color: 'from-violet to-primary' },
  { emoji: '📊', tKey: 'prem.f2.t', dKey: 'prem.f2.d', color: 'from-coral to-accent' },
  { emoji: '🎓', tKey: 'prem.f3.t', dKey: 'prem.f3.d', color: 'from-primary to-info' },
  { emoji: '📄', tKey: 'prem.f4.t', dKey: 'prem.f4.d', color: 'from-success to-mint' },
  { emoji: '🏆', tKey: 'prem.f5.t', dKey: 'prem.f5.d', color: 'from-warning to-accent' },
  { emoji: '🎯', tKey: 'prem.f6.t', dKey: 'prem.f6.d', color: 'from-mint to-primary-300' },
  { emoji: '📚', tKey: 'prem.f7.t', dKey: 'prem.f7.d', color: 'from-info to-primary-700' },
  { emoji: '💎', tKey: 'prem.f8.t', dKey: 'prem.f8.d', color: 'from-primary-700 to-primary-500' },
];

const FREE_FEATURES: TranslationKey[] = ['prem.free.f1', 'prem.free.f2', 'prem.free.f3', 'prem.free.f4'];
const PAID_FEATURES: TranslationKey[] = ['prem.paid.f1', 'prem.paid.f2', 'prem.paid.f3', 'prem.paid.f4', 'prem.paid.f5', 'prem.paid.f6'];

export default function PremiumClient() {
  const { t, dir } = useI18n();

  return (
    <main className="min-h-screen bg-bg overflow-x-hidden" dir={dir}>

      {/* HERO */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30" />
          <div className="absolute top-1/3 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-20" />
          <div className="absolute inset-0 bg-pattern-dots opacity-20" style={{ backgroundSize: '32px 32px' }} />
          <div className="absolute top-16 left-16 text-5xl animate-float opacity-40">💎</div>
          <div className="absolute bottom-24 right-20 text-4xl animate-float opacity-40" style={{ animationDelay: '1s' }}>✨</div>
        </div>

        <div className="relative container-page text-center">
          <span className="inline-flex items-center gap-2 bg-gradient-warm text-white px-4 py-1.5 rounded-full text-sm font-bold mb-6 shadow-floaty animate-fade-up">
            <span>{t('prem.badge')}</span>
          </span>
          <div className="text-8xl mb-6 animate-float drop-shadow-2xl">💎</div>
          <h1 className="h1 mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {t('prem.title.1')} <span className="text-gradient-warm">{t('prem.title.2')}</span>
            <br />
            <span className="text-gradient">{t('prem.title.3')}</span>
          </h1>
          <p className="lead max-w-2xl mx-auto mb-10 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {t('prem.subtitle.1')}
            <span className="text-primary font-bold"> {t('prem.subtitle.2')}</span>
            {t('prem.subtitle.3')}
          </p>

          <div className="inline-block bg-mint-light border border-mint rounded-2xl px-6 py-3 mb-8 shadow-soft animate-fade-up" style={{ animationDelay: '0.3s' }}>
            <strong className="text-primary-dark">{t('prem.launch.title')}</strong>
            <p className="text-xs text-ink mt-1">{t('prem.launch.note')}</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 animate-fade-up" style={{ animationDelay: '0.4s' }}>
            <Link href="/auth/register?role=student" className="btn-primary text-lg px-8 py-4">
              <span>{t('prem.cta.signup')}</span>
              <span className="text-xl">{dir === 'rtl' ? '←' : '→'}</span>
            </Link>
            <Link href="/contact" className="btn-outline text-lg px-8 py-4">
              {t('prem.cta.learn')}
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="section bg-surface relative">
        <div className="absolute top-10 right-0 w-72 h-72 bg-mint rounded-full blur-3xl opacity-15" />
        <div className="absolute bottom-10 left-0 w-72 h-72 bg-accent rounded-full blur-3xl opacity-10" />

        <div className="relative container-page">
          <div className="text-center mb-12">
            <span className="badge-accent mb-3">{t('prem.features.badge')}</span>
            <h2 className="h2 mb-3">{t('prem.features.title')}</h2>
            <p className="lead max-w-xl mx-auto">{t('prem.features.subtitle')}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger">
            {PREMIUM_FEATURES.map(f => (
              <div key={f.tKey} className="card group hover:shadow-floaty hover:-translate-y-1 transition-all">
                <div className={`icon-circle-lg bg-gradient-to-br ${f.color} text-white mb-3 group-hover:scale-110 group-hover:rotate-6 transition-transform`}>
                  <span className="text-3xl">{f.emoji}</span>
                </div>
                <h3 className="font-extrabold text-primary mb-1.5">{t(f.tKey)}</h3>
                <p className="text-sm text-ink-muted leading-relaxed">{t(f.dKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="section bg-bg-mint relative overflow-hidden">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-mint rounded-full blur-3xl opacity-30" />
        <div className="relative container-narrow">
          <div className="text-center mb-8">
            <span className="badge-mint mb-3">{t('prem.pricing.badge')}</span>
            <h2 className="h2 mb-3">{t('prem.pricing.title')}</h2>
            <p className="lead">{t('prem.pricing.subtitle')}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Free */}
            <div className="card relative">
              <h3 className="font-bold text-ink-muted mb-2">{t('prem.free.title')}</h3>
              <div className="text-3xl font-extrabold text-ink mb-1">{t('prem.free.price')}</div>
              <p className="text-sm text-ink-muted mb-4">{t('prem.free.period')}</p>
              <ul className="space-y-2 text-sm text-ink">
                {FREE_FEATURES.map(key => (
                  <li key={key} className="flex items-center gap-2"><span className="text-success">✓</span> {t(key)}</li>
                ))}
              </ul>
            </div>

            {/* Premium */}
            <div className="card border-2 border-accent relative bg-gradient-to-br from-accent-light/30 to-mint-pale">
              <span className={`absolute -top-3 ${dir === 'rtl' ? 'left-4' : 'right-4'} bg-gradient-warm text-white px-3 py-1 rounded-full text-[10px] font-extrabold shadow-floaty`}>{t('prem.paid.badge')}</span>
              <h3 className="font-bold text-accent-dark mb-2">{t('prem.paid.title')}</h3>
              <div className="text-3xl font-extrabold text-primary mb-1">{t('prem.paid.price')}</div>
              <p className="text-sm text-ink-muted mb-4">{t('prem.paid.period')}</p>
              <ul className="space-y-2 text-sm text-ink">
                {PAID_FEATURES.map(key => (
                  <li key={key} className="flex items-center gap-2"><span className="text-success">✓</span> {t(key)}</li>
                ))}
              </ul>
              <Link href="/auth/register?role=student" className="btn-primary w-full mt-4">
                {t('prem.paid.cta')}
              </Link>
              <p className="text-[10px] text-ink-subtle text-center mt-2">
                {t('prem.paid.note')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container-page">
          <div className="bg-gradient-hero text-white rounded-4xl p-10 md:p-14 text-center shadow-floaty relative overflow-hidden">
            <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-accent/30 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-mint/30 rounded-full blur-3xl" />

            <div className="relative">
              <div className="text-6xl mb-4 animate-bounce-soft">💎</div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-3">{t('prem.cta.title')}</h2>
              <p className="text-lg text-white/90 max-w-2xl mx-auto mb-6">
                {t('prem.cta.subtitle')}
              </p>
              <Link href="/auth/register?role=student" className="inline-flex items-center gap-2 bg-white text-primary font-extrabold px-8 py-4 rounded-2xl text-lg shadow-floaty hover:scale-105 transition-transform">
                <span>{t('prem.cta.button')}</span><span>{dir === 'rtl' ? '←' : '→'}</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
