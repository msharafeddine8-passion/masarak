// Social system · Phase 1 — public Academic Profile types & helpers.
// The shape here MUST mirror get_public_academic_profile() in
// supabase/migrations/20260702_social_phase1_profile.sql (safe projection only).

export type PublicProfile = {
  slug: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  country_code: string | null;
  grade_level: string | null;
  school_name: string | null;
  university_name: string | null;
  major: string | null;
  interests: string[] | null;
  skills: string[] | null;
  languages: string[] | null;
  personality_type: string | null;
  career_dna_completed: boolean;
  preferred_majors: string[] | null;
  preferred_universities: string[] | null;
  graduation_year: number | null;
  social_links: Record<string, string> | null;
  xp: number;
  level: number;
  streak_days: number;
  badges: string[];
  created_at: string;
};

// ISO 3166-1 alpha-2 → flag emoji (regional indicator symbols). No dependency.
export function flagEmoji(cc?: string | null): string {
  if (!cc || cc.length !== 2) return '🌍';
  const A = 0x1f1e6;
  const up = cc.toUpperCase();
  return String.fromCodePoint(A + (up.charCodeAt(0) - 65), A + (up.charCodeAt(1) - 65));
}

// Minimal badge catalogue (mirrors the codes used in profile AchievementsTab).
// Kept here so public profiles can render earned badges without importing a tab.
export const BADGE_LABELS: Record<string, { icon: string; ar: string }> = {
  first_login:      { icon: '👋', ar: 'أول دخول' },
  profile_50:       { icon: '📝', ar: 'نصف الملف' },
  profile_100:      { icon: '✅', ar: 'ملف مكتمل' },
  avatar_uploaded:  { icon: '🖼️', ar: 'صورة شخصية' },
  career_dna:       { icon: '🧬', ar: 'Career DNA' },
  first_save:       { icon: '🔖', ar: 'أول حفظ' },
  saved_5:          { icon: '📚', ar: 'جامِع الفرص' },
  first_review:     { icon: '⭐', ar: 'أول تقييم' },
  scholarship_apply:{ icon: '🏆', ar: 'تقدّم لمنحة' },
  streak_7:         { icon: '🔥', ar: 'أسبوع متواصل' },
  streak_30:        { icon: '⚡', ar: 'شهر متواصل' },
  level_5:          { icon: '🌟', ar: 'مستوى 5' },
};

export function badgeMeta(code: string): { icon: string; ar: string } {
  return BADGE_LABELS[code] ?? { icon: '🎖️', ar: code };
}
