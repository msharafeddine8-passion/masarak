'use client';

import Link from 'next/link';
import { useI18n, type TranslationKey } from '@/lib/i18n';
import { SUPPORT_EMAIL, hasWhatsApp, whatsappLink, SUPPORT_WHATSAPP } from '@/lib/contact';

type Channel = { titleKey: TranslationKey; descKey: TranslationKey; emoji: string };

const CHANNELS: Channel[] = [
  { titleKey: 'contact.channel.general.t',  descKey: 'contact.channel.general.d',  emoji: '✉️' },
  { titleKey: 'contact.channel.partners.t', descKey: 'contact.channel.partners.d', emoji: '🤝' },
  { titleKey: 'contact.channel.support.t',  descKey: 'contact.channel.support.d',  emoji: '🛠️' },
  { titleKey: 'contact.channel.press.t',    descKey: 'contact.channel.press.d',    emoji: '📰' },
];

const HELP: TranslationKey[] = [
  'contact.help.1', 'contact.help.2', 'contact.help.3', 'contact.help.4', 'contact.help.5',
];

export default function ContactClient() {
  const { t, dir } = useI18n();

  return (
    <main className="min-h-screen bg-bg py-12 px-4 relative overflow-hidden" dir={dir}>
      <div className={`absolute top-20 ${dir === 'rtl' ? '-right-32' : '-left-32'} w-96 h-96 bg-mint rounded-full blur-3xl opacity-30 pointer-events-none`} />
      <div className={`absolute top-1/3 ${dir === 'rtl' ? '-left-20' : '-right-20'} w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none`} />

      <div className="relative container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm text-ink-muted hover:text-primary mb-2 inline-block">
            {t('contact.back')}
          </Link>
          <div className="text-7xl my-6 animate-bounce-soft">💬</div>
          <h1 className="h1 mb-3">{t('contact.title')}</h1>
          <p className="lead">
            {t('contact.subtitle')}
          </p>
        </div>

        {/* WhatsApp CTA — Jun-3 audit said the single-email/48hr channel was killing trust.
            Shown only if a real number is configured in lib/contact.ts (env-overridable). */}
        {hasWhatsApp() && (
          <a
            href={whatsappLink('مرحباً، عندي سؤال بخصوص مسارك:')}
            target="_blank" rel="noopener noreferrer"
            className="flex items-center justify-between gap-4 mb-6 bg-gradient-to-l from-[#25D366] to-[#128C7E] text-white rounded-2xl p-5 shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">💬</span>
              <div>
                <div className="font-extrabold text-lg">راسلنا على واتساب</div>
                <div className="text-sm text-white/90" dir="ltr">{SUPPORT_WHATSAPP}</div>
              </div>
            </div>
            <span className="text-2xl">←</span>
          </a>
        )}

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {CHANNELS.map(c => (
            <a
              key={c.titleKey}
              href={`mailto:${SUPPORT_EMAIL}`}
              className="group bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-[#1b3a6b] hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-3">{c.emoji}</div>
              <h3 className="font-extrabold text-[#1b3a6b] text-lg mb-1 group-hover:underline">
                {t(c.titleKey)}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{t(c.descKey)}</p>
              <div className="text-sm font-bold text-gray-800 break-all" dir="ltr">{SUPPORT_EMAIL}</div>
            </a>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-extrabold text-[#1b3a6b] mb-4">{t('contact.info.title')}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="font-bold w-32 text-gray-600">{t('contact.info.location')}</span>
              <span>{t('contact.info.location.value')}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold w-32 text-gray-600">{t('contact.info.email')}</span>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#1b3a6b] font-semibold hover:underline" dir="ltr">{SUPPORT_EMAIL}</a>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold w-32 text-gray-600">{t('contact.info.response')}</span>
              <span>{t('contact.info.response.value')}</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold w-32 text-gray-600">{t('contact.info.languages')}</span>
              <span>{t('contact.info.languages.value')}</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
          <div className="font-bold text-amber-900 mb-1">{t('contact.help.title')}</div>
          <ul className={`text-sm text-amber-900 space-y-1.5 list-disc ${dir === 'rtl' ? 'pr-5' : 'pl-5'} mt-2`}>
            {HELP.map(key => (
              <li key={key}>{t(key)}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
