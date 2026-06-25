'use client';

import { useState, useEffect } from 'react';
import { daysUntilDeadline, deadlineStatus } from '@/lib/deadline';
import { formatNumber } from '@/lib/numbers';

type Props = {
  deadline: string | null | undefined;
  locale?: 'ar' | 'en';
  className?: string;
};

/**
 * Sprint 3.3: honest urgency chip for scholarship deadlines.
 * - Calculates days remaining from the deadline string.
 * - Color codes: red (urgent ≤7 days), amber (≤30), gray (open), neutral (expired).
 * - Expired scholarships keep their card with "انتهت" label for SEO value
 *   (work order section 3.3: "expired scholarships labeled, not deleted").
 */
export default function DeadlineChip({ deadline, locale = 'ar', className = '' }: Props) {
  // Compute on the client to avoid SSR/CSR mismatch on the date.
  const [days, setDays] = useState<number | null>(null);
  const [status, setStatus] = useState<ReturnType<typeof deadlineStatus>>(null);

  useEffect(() => {
    setDays(daysUntilDeadline(deadline));
    setStatus(deadlineStatus(deadline));
  }, [deadline]);

  if (days === null || status === null) return null;

  if (status === 'expired') {
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-bg-soft text-ink-muted ${className}`}>
        ⏹ {locale === 'ar' ? 'انتهت المهلة' : 'Expired'}
      </span>
    );
  }

  const dayLabel = locale === 'ar' ? (days === 1 ? 'يوم' : 'يوم') : (days === 1 ? 'day' : 'days');
  const prefix = locale === 'ar' ? 'باقي' : '';
  const styles = status === 'urgent'
    ? 'bg-red-100 text-red-700'
    : status === 'soon'
    ? 'bg-amber-100 text-amber-700'
    : 'bg-emerald-50 text-emerald-700';

  const formatted = formatNumber(days, locale);

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${styles} ${className}`}>
      ⏳ {prefix} {formatted} {dayLabel}
    </span>
  );
}
