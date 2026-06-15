-- ============================================================
-- Phase B — Public Profile Policies + PDF sections visibility
-- ============================================================
-- Run once in Supabase SQL Editor
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 1. Allow anonymous reads of student_profiles
--    when the student's card is public (is_public = TRUE)
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "profiles — public card read" ON public.student_profiles;

CREATE POLICY "profiles — public card read"
  ON public.student_profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_cards sc
      WHERE sc.user_id = student_profiles.user_id
        AND sc.is_public = TRUE
    )
  );


-- ─────────────────────────────────────────────────────────────
-- 2. Allow anonymous reads of student_profile_sections
--    when the student's card is public
-- ─────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "sections — public card read" ON public.student_profile_sections;

CREATE POLICY "sections — public card read"
  ON public.student_profile_sections FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.student_cards sc
      WHERE sc.user_id = student_profile_sections.user_id
        AND sc.is_public = TRUE
    )
  );


-- ─────────────────────────────────────────────────────────────
-- 3. RPC — get_public_student_profile(masarak_id TEXT)
--    Returns card + profile joined, for SSR public page.
--    SECURITY DEFINER so it bypasses RLS safely — only
--    returns data when is_public = TRUE.
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.get_public_student_profile(p_masarak_id TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
DECLARE
  v_card  public.student_cards%ROWTYPE;
  v_prof  public.student_profiles%ROWTYPE;
  v_secs  JSON;
BEGIN
  -- Fetch card (must be public)
  SELECT * INTO v_card
  FROM public.student_cards
  WHERE masarak_id = p_masarak_id
    AND is_public = TRUE
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  -- Fetch profile
  SELECT * INTO v_prof
  FROM public.student_profiles
  WHERE user_id = v_card.user_id
  LIMIT 1;

  -- Fetch visible sections
  SELECT json_agg(s ORDER BY s.sort_order ASC)
  INTO v_secs
  FROM public.student_profile_sections s
  WHERE s.user_id = v_card.user_id
    AND s.is_visible_pdf = TRUE;

  RETURN json_build_object(
    'card', row_to_json(v_card),
    'profile', row_to_json(v_prof),
    'sections', COALESCE(v_secs, '[]'::JSON)
  );
END;
$$;

-- Grant execute to anon and authenticated
GRANT EXECUTE ON FUNCTION public.get_public_student_profile(TEXT) TO anon, authenticated;


-- ✅ Done — public profile policies + RPC ready
