import { formatNumber } from '@/lib/numbers';

type Props = {
  /** Date string or null. If null, falls back to a stable fallback for static data. */
  date?: string | null;
  locale?: 'ar' | 'en';
  className?: string;
};

/**
 * Sprint 2.6: visible "آخر تحديث" badge on entity detail pages.
 * Sourced from real DB `updated_at` when available; otherwise shows a stable
 * fallback so the page is honest about freshness instead of static text.
 */
export default function LastUpdated({ date, locale = 'ar', className = '' }: Props) {
  // Stable fallback: the year of last content audit. We do NOT use Date.now()
  // — that would change every render and lie about content freshness.
  const fallbackDate = new Date('2026-04-01T00:00:00Z');
  const d = date ? new Date(date) : fallbackDate;

  if (Number.isNaN(d.getTime())) return null;

  const formatter = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  let formatted = formatter.format(d);
  // Intl with ar-EG already uses Arabic Indic numerals. Just in case:
  if (locale === 'ar') formatted = formatNumber(formatted, 'ar');

  const label = locale === 'ar' ? 'آخر تحديث:' : 'Last updated:';

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-xs text-ink-muted bg-bg-mint/40 px-2.5 py-1 rounded-full ${className}`}
      title={d.toISOString()}
    >
      <span aria-hidden="true">🕓</span>
      <span className="font-semibold">{label}</span>
      <time dateTime={d.toISOString()}>{formatted}</time>
    </div>
  );
}
