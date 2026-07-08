-- ============================================================================
-- SECURITY FIX (P0) — Close anonymous PII exposure on student profiles
-- ----------------------------------------------------------------------------
-- Context
--   20260615_phase_b_public_profiles.sql added two blanket anon SELECT policies:
--     • "profiles — public card read"  ON public.student_profiles
--     • "sections — public card read"   ON public.student_profile_sections
--   keyed only on `student_cards.is_public = TRUE`.
--
--   These are over-broad and leak data:
--     1. student_profiles is exposed IN FULL to anon (all columns — email,
--        phone, date_of_birth, gpa, bac_grade) whenever the student's ID card
--        is public. The July-02 Phase-1 migration explicitly established the
--        opposite rule: "We DO NOT open student_profiles to public SELECT — it
--        holds PII. Public reads go through a SECURITY DEFINER RPC that returns
--        ONLY a curated, safe projection."
--     2. student_profile_sections is exposed IN FULL to anon, INCLUDING rows the
--        student marked is_visible_pdf = FALSE (hidden sections). The public RPC
--        deliberately filters those out; the direct anon policy does not.
--
-- Why dropping them is safe (verified against the codebase):
--   • Public ID-card page  /student/[masarakId]  → RPC get_public_student_profile
--   • Public academic page /u|/student profile    → RPC get_public_academic_profile
--     Both RPCs are SECURITY DEFINER, so they bypass RLS and DO NOT depend on
--     these policies. They already return only safe, is_public / is_visible_pdf
--     gated projections.
--   • Every authenticated read of these tables (dashboard, profile editor,
--     PDF generator, parent/counselor/org views) is matched by the pre-existing
--     owner/relationship policies ("profiles — own read", "sections — own read",
--     etc.), NOT by these anon policies.
--
-- Net effect: anonymous visitors can no longer SELECT raw PII rows directly;
-- the curated RPC path (the intended contract) is unchanged. Idempotent.
-- ============================================================================

-- Defensive: ensure RLS is on (no-op if already enabled).
ALTER TABLE public.student_profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profile_sections  ENABLE ROW LEVEL SECURITY;

-- 1) Remove the blanket anon read of full student_profiles rows.
DROP POLICY IF EXISTS "profiles — public card read" ON public.student_profiles;

-- 2) Remove the blanket anon read of student_profile_sections (which ignored
--    the is_visible_pdf gate and exposed hidden sections).
DROP POLICY IF EXISTS "sections — public card read" ON public.student_profile_sections;

-- ✅ Done — public reads now flow exclusively through the curated SECURITY
--    DEFINER RPCs; owner/relationship policies for authenticated users remain
--    intact. Verify with Supabase security advisors after applying.
