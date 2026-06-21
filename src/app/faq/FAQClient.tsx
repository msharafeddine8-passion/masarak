'use client';

import Link from 'next/link';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type FAQ = { qKey: TranslationKey; aKey: TranslationKey };

const FAQS: FAQ[] = [
  { qKey: 'faq.q1',  aKey: 'faq.a1' },
  { qKey: 'faq.q2',  aKey: 'faq.a2' },
  { qKey: 'faq.q3',  aKey: 'faq.a3' },
  { qKey: 'faq.q4',  aKey: 'faq.a4' },
  { qKey: 'faq.q5',  aKey: 'faq.a5' },
  { qKey: 'faq.q6',  aKey: 'faq.a6' },
  { qKey: 'faq.q7',  aKey: 'faq.a7' },
  { qKey: 'faq.q8',  aKey: 'faq.a8' },
  { qKey: 'faq.q9',  aKey: 'faq.a9' },
  { qKey: 'faq.q10', aKey: 'faq.a10' },
];

export default function FAQClient() {
  const { t, dir } = useI18n();

  return (
    <main className="min-h-screen bg-bg-soft py-12 px-4" dir={dir}>
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm text-ink-subtle hover:text-primary mb-2 inline-block">
            {t('faq.back')}
          </Link>
          <h1 className="text-4xl font-extrabold text-primary">{t('faq.title')}</h1>
          <p className="text-ink-muted mt-3 text-lg">{t('faq.subtitle')}</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-surface rounded-2xl border-2 border-line hover:border-primary/40 transition-colors"
            >
              <summary className="cursor-pointer p-5 flex items-center justify-between font-bold text-lg list-none">
                <span>{t(faq.qKey)}</span>
                <span className="text-primary text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-5 pb-5 text-ink-muted leading-relaxed">{t(faq.aKey)}</div>
            </details>
          ))}
        </div>

        <div className="mt-10 bg-primary/5 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-extrabold text-primary mb-2">{t('faq.more.title')}</h2>
          <p className="text-ink-muted mb-4">{t('faq.more.subtitle')}</p>
          <Link
            href="/contact"
            className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold"
          >
            {t('faq.more.cta')}
          </Link>
        </div>
      </div>
    </main>
  );
}
