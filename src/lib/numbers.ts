/**
 * Convert a Western Arabic-numeral string ("35", "60+") to Arabic Indic numerals
 * ("٣٥", "٦٠+"). Used to keep numbers visually consistent across the Arabic UI.
 *
 * For the Arabic locale we use Arabic Indic to match the rest of the copy
 * (e.g. "٣٥ جامعة · ٦٠+ منحة"). English locale leaves numbers untouched.
 */
const AR_INDIC = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];

export function toArabicNumerals(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => AR_INDIC[Number(d)]);
}

export function formatNumber(value: string | number, locale: 'ar' | 'en'): string {
  return locale === 'ar' ? toArabicNumerals(value) : String(value);
}
