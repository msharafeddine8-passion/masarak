/**
 * src/lib/profile-completion.ts
 * ─────────────────────────────
 * Single source of truth for profile completion %.
 * Used by /profile/page.tsx, /dashboard/page.tsx, and anywhere else
 * that needs to display or gate on profile completeness.
 *
 * 13 fields — same set across all surfaces.
 */

// Subset of student_profiles columns we need for the calculation
export type ProfileCompletionInput = Partial<{
  full_name: string | null;
  phone: string | null;
  city: string | null;
  bio: string | null;
  avatar_url: string | null;
  school_name: string | null;
  grade_level: string | null;
  bac_section: string | null;
  grades: unknown[];
  achievements: unknown[];
  certificates: unknown[];
  career_dna_completed: boolean | null;
  preferred_universities: unknown[];
}>;

/** Supabase select string — use this when fetching for completion only */
export const COMPLETION_SELECT =
  'full_name,phone,city,bio,avatar_url,school_name,grade_level,bac_section,grades,achievements,certificates,career_dna_completed,preferred_universities';

/**
 * Returns an integer 0–100 representing how complete the student profile is.
 * Each of the 13 fields contributes 1 point.
 */
export function computeProfileCompletion(profile: ProfileCompletionInput): number {
  const filled = [
    profile.full_name,
    profile.phone,
    profile.city,
    profile.bio,
    profile.avatar_url,
    profile.school_name,
    profile.grade_level,
    profile.bac_section,
    (profile.grades ?? []).length > 0,
    (profile.achievements ?? []).length > 0,
    (profile.certificates ?? []).length > 0,
    profile.career_dna_completed,
    (profile.preferred_universities ?? []).length > 0,
  ].filter(Boolean).length;

  return Math.round((filled / 13) * 100);
}
