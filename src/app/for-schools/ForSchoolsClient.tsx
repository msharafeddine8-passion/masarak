'use client';

import Link from 'next/link';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type Benefit = { emoji: string; tKey: TranslationKey; dKey: TranslationKey };

const BENEFITS: Benefit[] = [
  { emoji: '📊', tKey: 'fsc.b1.t', dKey: 'fsc.b1.d' },
  { emoji: '🎯', tKey: 'fsc.b2.t', dKey: 'fsc.b2.d' },
  { emoji: '🏆', tKey: 'fsc.b3.t', dKey: 'fsc.b3.d' },
  { emoji: '💼', tKey: 'fsc.b4.t', dKey: 'fsc.b4.d' },
  { emoji: '📚', tKey: 'fsc.b5.t', dKey: 'fsc.b5.d' },
  { emoji: '🤝', tKey: 'fsc.b6.t', dKey: 'fsc.b6.d' },
];

type Tier = { nameKey: TranslationKey; sizeKey: TranslationKey; popular: boolean };

const TIERS: Tier[] = [
  { nameKey: 'fsc.tier.small',  sizeKey: 'fsc.tier.small.size',  popular: false },
  { nameKey: 'fsc.tier.medium', sizeKey: 'fsc.tier.medium.size', popular: true  },
  { nameKey: 'fsc.tier.large',  sizeKey: 'fsc.tier.large.size',  popular: false },
];

export default function ForSchoolsClient() {
  const { t, dir } = useI18n();

  return (
    <main className="min-h-screen bg-bg py-12 px-4 relative overflow-hidden" dir={dir}>
      <div className={`absolute top-20 ${dir === 'rtl' ? '-right-32' : '-left-32'} w-96 h-96 bg-mint rounded-full blur-3xl opacity-30 pointer-events-none`} />
      <div className={`absolute top-1/3 ${dir === 'rtl' ? '-left-20' : '-right-20'} w-80 h-80 bg-info rounded-full blur-3xl opacity-15 pointer-events-none`} />

      <div className="relative container mx-auto max-w-5xl">
        <div className="bg-accent-light border border-accent/40 rounded-2xl p-4 mb-6 flex items-start gap-3 max-w-2xl mx-auto">
          <span className="text-3xl flex-shrink-0">🤝</span>
          <div>
            <strong className="text-accent-dark">{t('fsc.notice.title')}</strong>
            <p className="text-ink text-sm mt-1">{t('fsc.notice.body')}</p>
          </div>
        </div>

        <div className="text-center mb-12">
          <span className="badge-mint mb-4">{t('fsc.badge')}</span>
          <div className="text-7xl my-6 animate-bounce-soft">🏫</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
            {t('fsc.title')}
          </h1>
          <p className="text-xl text-ink-muted max-w-2xl mx-auto mb-6">
            {t('fsc.subtitle')}
          </p>
          <Link href="/contact?type=school-partnership" className="btn-primary text-lg px-8 py-4">
            {t('fsc.cta.contact')}
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-center mb-8">{t('fsc.benefits.title')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {BENEFITS.map(b => (
            <div key={b.tKey} className="bg-surface rounded-2xl border-2 border-line p-5">
              <div className="text-3xl mb-3">{b.emoji}</div>
              <h3 className="font-extrabold text-primary mb-2">{t(b.tKey)}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{t(b.dKey)}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-center mb-3">{t('fsc.tiers.title')}</h2>
        <p className="text-center text-ink-muted mb-8">{t('fsc.tiers.subtitle')}</p>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {TIERS.map(p => (
            <div key={p.nameKey} className={`bg-surface rounded-2xl border-2 p-6 ${p.popular ? "border-primary ring-4 ring-primary/10" : "border-line"}`}>
              {p.popular && (
                <div className="text-xs bg-primary text-white px-3 py-1 rounded-full inline-block mb-3 font-bold">{t('fsc.tier.popular')}</div>
              )}
              <h3 className="font-extrabold text-xl mb-1">{t(p.nameKey)}</h3>
              <p className="text-sm text-ink-subtle mb-4">{t(p.sizeKey)}</p>
              <div className="text-2xl font-extrabold text-primary mb-4">{t('fsc.tier.contact_us')}</div>
              <Link href="/contact?type=school-partnership" className={`block text-center py-2.5 rounded-xl font-bold ${p.popular ? "bg-primary text-white" : "border-2 border-primary text-primary"}`}>
                {t('fsc.tier.book')}
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold text-primary mb-3">{t('fsc.demo.title')}</h2>
          <p className="text-ink-muted mb-6">{t('fsc.demo.subtitle')}</p>
          <Link href="/contact?type=school-partnership" className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold">
            {t('fsc.demo.cta')}
          </Link>
        </div>
      </div>
    </main>
  );
}
