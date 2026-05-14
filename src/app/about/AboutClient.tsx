'use client';

import Link from 'next/link';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type Value = { icon: string; tKey: TranslationKey; dKey: TranslationKey };

const VALUES: Value[] = [
  { icon: '💎', tKey: 'about.values.credibility.t', dKey: 'about.values.credibility.d' },
  { icon: '🎯', tKey: 'about.values.utility.t',     dKey: 'about.values.utility.d' },
  { icon: '⚖️', tKey: 'about.values.fairness.t',    dKey: 'about.values.fairness.d' },
  { icon: '🔒', tKey: 'about.values.privacy.t',     dKey: 'about.values.privacy.d' },
  { icon: '🧭', tKey: 'about.values.neutrality.t',  dKey: 'about.values.neutrality.d' },
  { icon: '🌱', tKey: 'about.values.growth.t',      dKey: 'about.values.growth.d' },
];

const OFFERS: TranslationKey[] = [
  'about.offer.1', 'about.offer.2', 'about.offer.3', 'about.offer.4',
  'about.offer.5', 'about.offer.6', 'about.offer.7', 'about.offer.8',
];

export default function AboutClient() {
  const { t, dir } = useI18n();

  return (
    <main className="min-h-screen bg-bg" dir={dir}>
      {/* Hero */}
      <section className="relative bg-gradient-hero text-white py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent rounded-full blur-3xl opacity-20" />
          <div className="absolute inset-0 bg-pattern-dots opacity-10" style={{ backgroundSize: '32px 32px' }} />
          <div className="absolute top-20 left-20 text-5xl animate-float opacity-40">🎓</div>
          <div className="absolute bottom-20 right-20 text-5xl animate-float opacity-40" style={{ animationDelay: '1s' }}>💚</div>
        </div>

        <div className="relative container mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/15 backdrop-blur rounded-full mb-6 text-sm font-semibold border border-white/20 animate-fade-up">
            {t('about.hero.badge')}
          </span>
          <div className="text-7xl mb-6 animate-bounce-soft drop-shadow-2xl">💡</div>
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 animate-fade-up" style={{ animationDelay: '0.1s' }}>
            {t('about.hero.title.1')} <span className="text-mint">{t('about.hero.title.2')}</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/95 leading-relaxed max-w-3xl mx-auto animate-fade-up" style={{ animationDelay: '0.2s' }}>
            {t('about.hero.subtitle')}
          </p>
        </div>
      </section>

      {/* Mission + Vision */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-2 gap-10 mb-16">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-[#1b3a6b]/10 rounded-xl flex items-center justify-center text-3xl mb-4">🎯</div>
              <h2 className="text-2xl font-bold mb-3 text-[#1b3a6b]">{t('about.mission.title')}</h2>
              <p className="text-slate-700 leading-relaxed">{t('about.mission.body')}</p>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <div className="w-14 h-14 bg-[#1b3a6b]/10 rounded-xl flex items-center justify-center text-3xl mb-4">🌟</div>
              <h2 className="text-2xl font-bold mb-3 text-[#1b3a6b]">{t('about.vision.title')}</h2>
              <p className="text-slate-700 leading-relaxed">{t('about.vision.body')}</p>
            </div>
          </div>

          {/* Values */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-10 text-[#1b3a6b]">{t('about.values.title')}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {VALUES.map(v => (
                <div key={v.tKey} className="bg-white p-6 rounded-xl border border-slate-100 hover:shadow-md transition">
                  <div className="text-4xl mb-3">{v.icon}</div>
                  <h3 className="font-bold text-lg mb-2 text-[#1b3a6b]">{t(v.tKey)}</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">{t(v.dKey)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* What we offer */}
          <div className="bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white p-10 rounded-2xl mb-16">
            <h2 className="text-3xl font-bold mb-6 text-center">{t('about.offer.title')}</h2>
            <div className="grid md:grid-cols-2 gap-4 text-base">
              {OFFERS.map(key => (
                <div key={key} className="flex items-start gap-2">
                  <span className="text-xl">✓</span>
                  <span>{t(key)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center bg-white p-10 rounded-2xl border-2 border-[#1b3a6b]/10">
            <h2 className="text-3xl font-bold mb-4 text-[#1b3a6b]">{t('about.cta.title')}</h2>
            <p className="text-slate-700 mb-6 max-w-2xl mx-auto leading-relaxed">
              {t('about.cta.subtitle')}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/auth/register"
                className="px-6 py-3 bg-[#1b3a6b] text-white rounded-lg font-semibold hover:bg-[#142d54] transition"
              >
                {t('about.cta.start')}
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-white text-[#1b3a6b] border-2 border-[#1b3a6b] rounded-lg font-semibold hover:bg-slate-50 transition"
              >
                {t('about.cta.contact')}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
