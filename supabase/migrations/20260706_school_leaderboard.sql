-- ============================================================================
-- School leaderboard (growth strategy M1) — weekly XP ranking of schools.
-- ----------------------------------------------------------------------------
-- Aggregates the last N days of daily-quiz XP (quiz_daily_sessions.xp_earned)
-- per student_profiles.school_name. SECURITY DEFINER because both tables are
-- self-only under RLS; the function returns ONLY aggregates (school name, total
-- XP, distinct student count) — no personal data leaves it.
-- Idempotent. NOT auto-applied — run in the SQL editor after review.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.school_leaderboard(p_days int DEFAULT 7, p_limit int DEFAULT 20)
RETURNS TABLE(school text, xp bigint, students bigint)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  SELECT
    btrim(sp.school_name)                AS school,
    COALESCE(SUM(s.xp_earned), 0)::bigint AS xp,
    COUNT(DISTINCT s.user_id)::bigint     AS students
  FROM public.quiz_daily_sessions s
  JOIN public.student_profiles sp ON sp.user_id = s.user_id
  WHERE s.quiz_date >= CURRENT_DATE - GREATEST(COALESCE(p_days, 7), 1)
    AND COALESCE(btrim(sp.school_name), '') <> ''
    AND s.completed_at IS NOT NULL
  GROUP BY btrim(sp.school_name)
  ORDER BY xp DESC, students DESC
  LIMIT LEAST(GREATEST(COALESCE(p_limit, 20), 1), 100);
$$;

GRANT EXECUTE ON FUNCTION public.school_leaderboard(int, int) TO anon, authenticated;
