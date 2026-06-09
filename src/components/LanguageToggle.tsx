'use client';

import { useI18n } from '@/lib/i18n';

/**
 * Compact toggle that switches the site between Arabic (default) and English.
 * Shows the OTHER language as the label so the user knows what they're switching to.
 */
export default function LanguageToggle({ compact = false }: { compact?: boolean }) {
  const { locale, setLocale } = useI18n();
  const next = locale === 'ar' ? 'en' : 'ar';
  const label = next === 'en' ? 'EN' : 'ع';
  const aria  = next === 'en' ? 'Switch to English' : 'التبديل إلى العربية';

  return (
    <button
      type="button"
      onClick={() => setLocale(next)}
      aria-label={aria}
      title={aria}
      className={
        compact
          ? 'inline-flex items-center justify-center w-11 h-11 rounded-xl bg-mint-light text-primary text-xs font-extrabold hover:bg-mint transition-colors'
          : 'inline-flex items-center gap-1.5 px-3.5 py-2.5 min-h-[44px] rounded-xl bg-mint-light text-primary text-sm font-extrabold hover:bg-mint transition-colors'
      }
    >
      <span className="text-base leading-none">🌐</span>
      <span>{label}</span>
    </button>
  );
}
