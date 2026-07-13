-- ============================================================================
-- سباق المدارس — School League standings (the "wow" competitive layer).
-- ----------------------------------------------------------------------------
-- Upgrades the flat weekly leaderboard into a season-aware "league": scores are
-- aggregated over the CURRENT ISO week (Mon 00:00 → now, matching date_trunc
-- 'week'), and each school carries its rank CHANGE vs last week (↑/↓ drama).
-- The "derby" (your school vs the school directly above you) is derived on the
-- client from these ordered standings — no matchmaking table needed for v1.
--
-- SECURITY DEFINER (both source tables are self-only under RLS); returns ONLY
-- aggregates (school name, xp, distinct student count, ranks) — no personal data.
-- Idempotent. NOT auto-applied — run in the SQL editor after review.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.school_league_standings(p_limit int DEFAULT 30)
RETURNS TABLE(rank int, school text, xp bigint, students bigint, prev_rank int, rank_change int)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  WITH this_week AS (
    SELECT btrim(sp.school_name)          AS school,
           SUM(s.xp_earned)::bigint        AS xp,
           COUNT(DISTINCT s.user_id)::bigint AS students
    FROM public.quiz_daily_sessions s
    JOIN public.student_profiles sp ON sp.user_id = s.user_id
    WHERE s.completed_at IS NOT NULL
      AND s.quiz_date >= date_trunc('week', CURRENT_DATE)::date
      AND COALESCE(btrim(sp.school_name), '') <> ''
    GROUP BY btrim(sp.school_name)
  ),
  last_week AS (
    SELECT btrim(sp.school_name)   AS school,
           SUM(s.xp_earned)::bigint AS xp
    FROM public.quiz_daily_sessions s
    JOIN public.student_profiles sp ON sp.user_id = s.user_id
    WHERE s.completed_at IS NOT NULL
      AND s.quiz_date >= (date_trunc('week', CURRENT_DATE) - INTERVAL '7 days')::date
      AND s.quiz_date <  date_trunc('week', CURRENT_DATE)::date
      AND COALESCE(btrim(sp.school_name), '') <> ''
    GROUP BY btrim(sp.school_name)
  ),
  ranked_this AS (
    SELECT school, xp, students,
           RANK() OVER (ORDER BY xp DESC, students DESC)::int AS rank
    FROM this_week
  ),
  ranked_last AS (
    SELECT school, RANK() OVER (ORDER BY xp DESC)::int AS prev_rank
    FROM last_week
  )
  SELECT r.rank, r.school, r.xp, r.students, l.prev_rank,
         CASE WHEN l.prev_rank IS NULL THEN NULL ELSE l.prev_rank - r.rank END AS rank_change
  FROM ranked_this r
  LEFT JOIN ranked_last l ON l.school = r.school
  ORDER BY r.rank, r.school
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 30), 1), 100);
$$;

GRANT EXECUTE ON FUNCTION public.school_league_standings(int) TO anon, authenticated;

-- ----------------------------------------------------------------------------
-- CORNERSTONE FIX: nothing ever wrote student_profiles.school_name (the profile
-- editor only saved school to user_metadata), so the leaderboard/league were
-- structurally empty — 0 students had a school. set_my_school() upserts the
-- canonical field the league reads; the profile editor now calls it on save.
-- SECURITY DEFINER so it works whether or not the user already has a profile row
-- and regardless of student_profiles RLS write policies.
-- ----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_my_school(p_school text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid();
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  INSERT INTO public.student_profiles (user_id, school_name)
  VALUES (me, NULLIF(btrim(p_school), ''))
  ON CONFLICT (user_id) DO UPDATE SET school_name = EXCLUDED.school_name;
END; $$;

GRANT EXECUTE ON FUNCTION public.set_my_school(text) TO authenticated;

-- One-time backfill: the few users who already picked a school (stored only in
-- user_metadata) get it copied into student_profiles, without clobbering any
-- value already set there.
INSERT INTO public.student_profiles (user_id, school_name)
SELECT u.id, btrim(u.raw_user_meta_data->>'school')
FROM auth.users u
WHERE COALESCE(btrim(u.raw_user_meta_data->>'school'), '') <> ''
ON CONFLICT (user_id) DO UPDATE
  SET school_name = COALESCE(public.student_profiles.school_name, EXCLUDED.school_name);
