-- ============================================================================
-- Fix: increment_question_shown() — the missing daily-quiz counter function.
-- ----------------------------------------------------------------------------
-- api/quiz/today/route.ts calls rpc('increment_question_shown', { qids }) after
-- building a session, to bump quiz_questions.times_shown. The function was never
-- created, so the call has always errored (silently — the route ignores the
-- result, so the quiz still works). Effect: times_shown stayed 0 for every
-- question, so the adaptive engine couldn't de-prioritise over-shown questions
-- → students see more repeats over time. This restores freshness tracking.
-- quiz_questions.id is bigint. Idempotent. NOT auto-applied.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.increment_question_shown(qids bigint[])
RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  UPDATE public.quiz_questions
  SET times_shown = COALESCE(times_shown, 0) + 1
  WHERE id = ANY(qids);
$$;

GRANT EXECUTE ON FUNCTION public.increment_question_shown(bigint[]) TO authenticated;
