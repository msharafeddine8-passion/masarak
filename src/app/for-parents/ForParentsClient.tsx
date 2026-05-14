'use client';

import Link from 'next/link';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type Concern = { emoji: string; tKey: TranslationKey; dKey: TranslationKey; href: string };

const CONCERNS: Concern[] = [
  { emoji: '🎯',  tKey: 'fp.c1.t', dKey: 'fp.c1.d', href: '/career-dna' },
  { emoji: '💰',  tKey: 'fp.c2.t', dKey: 'fp.c2.d', href: '/tools/cost-calculator' },
  { emoji: '🏆',  tKey: 'fp.c3.t', dKey: 'fp.c3.d', href: '/scholarships' },
  { emoji: '🏛️', tKey: 'fp.c4.t', dKey: 'fp.c4.d', href: '/universities' },
  { emoji: '📚',  tKey: 'fp.c5.t', dKey: 'fp.c5.d', href: '/schools' },
  { emoji: '🔧',  tKey: 'fp.c6.t', dKey: 'fp.c6.d', href: '/vocational' },
];

export default function ForParentsClient() {
  const { t, dir } = useI18n();

  return (
    <main className="min-h-screen bg-bg py-12 px-4 relative overflow-hidden" dir={dir}>
      <div className={`absolute top-20 ${dir === 'rtl' ? '-right-32' : '-left-32'} w-96 h-96 bg-mint rounded-full blur-3xl opacity-30 pointer-events-none`} />
      <div className={`absolute top-1/3 ${dir === 'rtl' ? '-left-20' : '-right-20'} w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none`} />

      <div className="relative container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <span className="badge-accent mb-4">{t('fp.badge')}</span>
          <div className="text-7xl my-6 animate-bounce-soft">👨‍👩‍👧</div>
          <h1 className="h1 mb-4">
            {t('fp.title.1')}
            <br />
            <span className="text-gradient">{t('fp.title.2')}</span>
          </h1>
          <p className="lead max-w-2xl mx-auto">
            {t('fp.subtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/auth/register?role=parent" className="bg-primary text-white px-8 py-3 rounded-xl font-bold">
              {t('fp.cta.signup')}
            </Link>
            <Link href="/tools/cost-calculator" className="border-2 border-primary text-primary px-8 py-3 rounded-xl font-bold">
              {t('fp.cta.calc')}
            </Link>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-8">{t('fp.concerns.title')}</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {CONCERNS.map(c => (
            <Link key={c.href} href={c.href} className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all group">
              <div className="text-4xl mb-3">{c.emoji}</div>
              <h3 className="font-extrabold text-primary text-lg mb-2 group-hover:underline">{t(c.tKey)}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{t(c.dKey)}</p>
            </Link>
          ))}
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-3">{t('fp.tip.title')}</h2>
          <p className="text-amber-900 leading-relaxed">
            <strong>{t('fp.tip.body.1')}</strong> {t('fp.tip.body.2')} <em>{t('fp.tip.body.3')}</em>{t('fp.tip.body.4')}
          </p>
        </div>
      </div>
    </main>
  );
}
