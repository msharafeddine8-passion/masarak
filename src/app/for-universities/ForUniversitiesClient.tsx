'use client';

import Link from 'next/link';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type Service = { emoji: string; tKey: TranslationKey; dKey: TranslationKey };

const SERVICES: Service[] = [
  { emoji: '🎯', tKey: 'fu.s1.t', dKey: 'fu.s1.d' },
  { emoji: '🌟', tKey: 'fu.s2.t', dKey: 'fu.s2.d' },
  { emoji: '📢', tKey: 'fu.s3.t', dKey: 'fu.s3.d' },
  { emoji: '📊', tKey: 'fu.s4.t', dKey: 'fu.s4.d' },
  { emoji: '🎓', tKey: 'fu.s5.t', dKey: 'fu.s5.d' },
  { emoji: '🌍', tKey: 'fu.s6.t', dKey: 'fu.s6.d' },
];

type Stat = { valueKey: TranslationKey; labelKey: TranslationKey };

const STATS: Stat[] = [
  { valueKey: 'fu.stat.active',       labelKey: 'fu.stat.active.label' },
  { valueKey: 'fu.stat.unis',         labelKey: 'fu.stat.unis.label' },
  { valueKey: 'fu.stat.scholarships', labelKey: 'fu.stat.scholarships.label' },
  { valueKey: 'fu.stat.paths',        labelKey: 'fu.stat.paths.label' },
];

export default function ForUniversitiesClient() {
  const { t, dir } = useI18n();

  return (
    <main className="min-h-screen bg-bg py-12 px-4 relative overflow-hidden" dir={dir}>
      <div className={`absolute top-20 ${dir === 'rtl' ? '-right-32' : '-left-32'} w-96 h-96 bg-mint rounded-full blur-3xl opacity-30 pointer-events-none`} />
      <div className={`absolute top-1/3 ${dir === 'rtl' ? '-left-20' : '-right-20'} w-80 h-80 bg-violet/40 rounded-full blur-3xl opacity-15 pointer-events-none`} />

      <div className="relative container mx-auto max-w-5xl">
        <div className="bg-accent-light border border-accent/40 rounded-2xl p-4 mb-6 flex items-start gap-3 max-w-2xl mx-auto">
          <span className="text-3xl flex-shrink-0">🤝</span>
          <div>
            <strong className="text-accent-dark">{t('fu.notice.title')}</strong>
            <p className="text-ink text-sm mt-1">{t('fu.notice.body')}</p>
          </div>
        </div>

        <div className="text-center mb-12">
          <span className="badge-primary mb-4">{t('fu.badge')}</span>
          <div className="text-7xl my-6 animate-bounce-soft">🏛️</div>
          <h1 className="h1 mb-4">
            {t('fu.title.1')}
            <br />
            <span className="text-gradient">{t('fu.title.2')}</span>
          </h1>
          <p className="lead max-w-3xl mx-auto mb-6">
            {t('fu.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/contact?type=university-partnership" className="btn-primary text-lg px-8 py-4">
              {t('fu.cta.contact')}
            </Link>
            <Link href="/universities" className="btn-outline text-lg px-8 py-4">
              {t('fu.cta.browse')}
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-12">
          {STATS.map(s => (
            <div key={s.valueKey} className="bg-surface rounded-2xl border-2 border-line p-5 text-center">
              <div className="text-4xl font-extrabold text-primary">{t(s.valueKey)}</div>
              <div className="text-sm text-ink-muted mt-1">{t(s.labelKey)}</div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-center mb-8">{t('fu.services.title')}</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {SERVICES.map(s => (
            <div key={s.tKey} className="bg-surface rounded-2xl border-2 border-line p-5">
              <div className="text-3xl mb-3">{s.emoji}</div>
              <h3 className="font-extrabold text-primary mb-2">{t(s.tKey)}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{t(s.dKey)}</p>
            </div>
          ))}
        </div>

        <div className="bg-surface rounded-2xl border-2 border-purple-200 p-8">
          <h2 className="text-2xl font-extrabold text-purple-900 mb-3">{t('fu.why.title')}</h2>
          <p className="text-ink-muted leading-relaxed mb-4">
            {t('fu.why.body.1')} <strong>{t('fu.why.body.2')}</strong>{t('fu.why.body.3')}
          </p>
          <Link href="/contact?type=university-partnership" className="inline-block bg-primary text-white px-6 py-2.5 rounded-xl font-bold">
            {t('fu.why.cta')}
          </Link>
        </div>
      </div>
    </main>
  );
}
