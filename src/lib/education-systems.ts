// Country-aware education systems — the core of making Masarak pan-Arab instead of
// Lebanon-only. Grade levels, secondary-school tracks, the grading scale, and the
// phone format all differ per country. Forms read from here keyed by country_code
// so a Saudi/Egyptian/Emirati student sees their own system, never Lebanese EB/BAC.

export type Option = { value: string; label: string };

export type EduSystem = {
  /** Secondary + post-secondary stages shown in the "grade level" dropdown. */
  gradeLevels: Option[];
  /** Secondary-school streams/tracks (the old Lebanese "bac_section"). */
  tracks: Option[];
  /** Max value of the national grading scale (LB=20, most Arab states=100). */
  gradeScaleMax: number;
  /** Human label for the scale, e.g. "من 20" / "من 100 (%)". */
  gradeScaleLabel: string;
  /** International dialing code, e.g. "+966". */
  dialCode: string;
  /** Example phone shown as input placeholder. */
  phoneExample: string;
};

// Shared tail appended to every country's school stages.
const POST_SECONDARY: Option[] = [
  { value: 'freshman', label: 'سنة تحضيريّة / Freshman' },
  { value: 'university', label: 'طالب جامعي' },
  { value: 'graduate', label: 'خرّيج' },
];

const INTL_TRACKS: Option[] = [
  { value: 'IB', label: 'بكالوريا دوليّة (IB)' },
  { value: 'SAT', label: 'أمريكي / SAT' },
];

export const EDUCATION_SYSTEMS: Record<string, EduSystem> = {
  LB: {
    gradeLevels: [
      { value: 'grade_10', label: 'الصف العاشر / EB1' },
      { value: 'grade_11', label: 'الصف الحادي عشر / EB2' },
      { value: 'grade_12', label: 'الصف الثاني عشر / EB3' },
      ...POST_SECONDARY,
    ],
    tracks: [
      { value: 'GS', label: 'علوم عامة (GS)' },
      { value: 'LS', label: 'علوم الحياة (LS)' },
      { value: 'SE', label: 'اجتماع واقتصاد (SE)' },
      { value: 'LH', label: 'آداب وإنسانيّات (LH)' },
      ...INTL_TRACKS,
    ],
    gradeScaleMax: 20, gradeScaleLabel: 'من 20', dialCode: '+961', phoneExample: '+961 70 000 000',
  },
  SA: {
    gradeLevels: [
      { value: 'grade_10', label: 'أول ثانوي' },
      { value: 'grade_11', label: 'ثاني ثانوي' },
      { value: 'grade_12', label: 'ثالث ثانوي' },
      ...POST_SECONDARY,
    ],
    tracks: [
      { value: 'science', label: 'القسم العلمي' },
      { value: 'admin', label: 'إداري / أدبي' },
      { value: 'quran', label: 'تحفيظ القرآن' },
      ...INTL_TRACKS,
    ],
    gradeScaleMax: 100, gradeScaleLabel: 'من 100 (%)', dialCode: '+966', phoneExample: '+966 5X XXX XXXX',
  },
  EG: {
    gradeLevels: [
      { value: 'grade_10', label: 'الأول الثانوي' },
      { value: 'grade_11', label: 'الثاني الثانوي' },
      { value: 'grade_12', label: 'الثالث الثانوي' },
      ...POST_SECONDARY,
    ],
    tracks: [
      { value: 'sci_science', label: 'علمي علوم' },
      { value: 'sci_math', label: 'علمي رياضة' },
      { value: 'literary', label: 'أدبي' },
      ...INTL_TRACKS,
    ],
    gradeScaleMax: 100, gradeScaleLabel: 'من 100 (%)', dialCode: '+20', phoneExample: '+20 10 0000 0000',
  },
  AE: {
    gradeLevels: [
      { value: 'grade_10', label: 'الصف العاشر' },
      { value: 'grade_11', label: 'الصف الحادي عشر' },
      { value: 'grade_12', label: 'الصف الثاني عشر' },
      ...POST_SECONDARY,
    ],
    tracks: [
      { value: 'advanced', label: 'المسار المتقدّم (Advanced)' },
      { value: 'general', label: 'المسار العام (General)' },
      { value: 'elite', label: 'النخبة (Elite)' },
      ...INTL_TRACKS,
    ],
    gradeScaleMax: 100, gradeScaleLabel: 'من 100 (%)', dialCode: '+971', phoneExample: '+971 5X XXX XXXX',
  },
  JO: {
    gradeLevels: [
      { value: 'grade_11', label: 'الأول الثانوي' },
      { value: 'grade_12', label: 'التوجيهي (الثاني الثانوي)' },
      ...POST_SECONDARY,
    ],
    tracks: [
      { value: 'science', label: 'علمي' },
      { value: 'literary', label: 'أدبي' },
      { value: 'it', label: 'معلوماتيّة' },
      ...INTL_TRACKS,
    ],
    gradeScaleMax: 100, gradeScaleLabel: 'من 100 (%)', dialCode: '+962', phoneExample: '+962 7 0000 0000',
  },
};

// Generic fallback for any other country (Kuwait, Qatar, Bahrain, Oman, ...).
export const DEFAULT_EDU: EduSystem = {
  gradeLevels: [
    { value: 'grade_10', label: 'الصف العاشر' },
    { value: 'grade_11', label: 'الصف الحادي عشر' },
    { value: 'grade_12', label: 'الصف الثاني عشر' },
    ...POST_SECONDARY,
  ],
  tracks: [
    { value: 'science', label: 'علمي' },
    { value: 'literary', label: 'أدبي' },
    ...INTL_TRACKS,
    { value: 'other', label: 'أخرى' },
  ],
  gradeScaleMax: 100, gradeScaleLabel: 'من 100 (%)', dialCode: '+', phoneExample: '+___ __ ___ ___',
};

export function eduFor(countryCode?: string | null): EduSystem {
  if (countryCode && EDUCATION_SYSTEMS[countryCode]) return EDUCATION_SYSTEMS[countryCode];
  return DEFAULT_EDU;
}
