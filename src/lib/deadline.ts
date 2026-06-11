// Sprint 3.3: parse Arabic deadline strings and compute days remaining.
// Used by scholarship cards + homepage "closing soon" section.

const AR_MONTHS: Record<string, number> = {
  'يناير': 0,  'كانون الثاني': 0,
  'فبراير': 1, 'شباط': 1,
  'مارس': 2,   'آذار': 2,
  'أبريل': 3,  'نيسان': 3,
  'مايو': 4,   'أيار': 4,
  'يونيو': 5,  'حزيران': 5,
  'يوليو': 6,  'تموز': 6,
  'أغسطس': 7,  'آب': 7,
  'سبتمبر': 8, 'أيلول': 8,
  'أكتوبر': 9, 'تشرين الأول': 9,
  'نوفمبر': 10,'تشرين الثاني': 10,
  'ديسمبر': 11,'كانون الأول': 11,
};

const AR_INDIC_TO_WESTERN: Record<string, string> = {
  '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
  '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9',
};

function normalizeDigits(s: string): string {
  return s.replace(/[٠-٩]/g, d => AR_INDIC_TO_WESTERN[d] || d);
}

/**
 * Parse an Arabic deadline string like "31 مارس 2026" or "١ مايو ٢٠٢٦"
 * into a Date object. Returns null if unparseable.
 */
export function parseArabicDeadline(s: string | null | undefined): Date | null {
  if (!s) return null;
  const t = normalizeDigits(s).trim();
  // Try ISO first (if the DB has switched to dates).
  const iso = new Date(t);
  if (!Number.isNaN(iso.getTime()) && /\d{4}-\d{2}-\d{2}/.test(t)) return iso;

  // Match "31 مارس 2026" pattern (with possibly multi-word month names).
  const m = t.match(/^(\d{1,2})\s+(.+?)\s+(\d{4})$/);
  if (!m) return null;
  const day = Number(m[1]);
  const monthName = m[2].trim();
  const year = Number(m[3]);
  const month = AR_MONTHS[monthName];
  if (month === undefined) return null;
  const d = new Date(year, month, day);
  return Number.isNaN(d.getTime()) ? null : d;
}

export type DeadlineStatus = 'expired' | 'urgent' | 'soon' | 'open';

export function daysUntilDeadline(deadlineStr: string | null | undefined, now: Date = new Date()): number | null {
  const d = parseArabicDeadline(deadlineStr);
  if (!d) return null;
  const ms = d.getTime() - now.getTime();
  return Math.ceil(ms / (24 * 60 * 60 * 1000));
}

export function deadlineStatus(deadlineStr: string | null | undefined, now: Date = new Date()): DeadlineStatus | null {
  const days = daysUntilDeadline(deadlineStr, now);
  if (days === null) return null;
  if (days < 0) return 'expired';
  if (days <= 7) return 'urgent';
  if (days <= 30) return 'soon';
  return 'open';
}
