-- ============================================================================
-- Quiz Engine v2 — a professional, section-balanced, grade-banded daily quiz.
-- ----------------------------------------------------------------------------
-- Upgrades quiz_build_session() from pure strata-sampling to a DOMAIN-BALANCED
-- selector so every daily set is varied — one question from each of the six
-- domains (academic / tech / thinking / career / guidance / wellbeing), which
-- GUARANTEES a brain/IQ/logic question every day (the 'thinking' domain) — while
-- keeping the adaptive learning science (SRS-due reviews, weak-skill targeting,
-- interest alignment, growth-edge difficulty). Difficulty is banded by the
-- student's mastery AND capped by grade (younger students never get
-- university-hard items). The pool never starves: recency is a soft score
-- penalty, not a hard filter, so a full session is always returned.
--
-- Also seeds six cognitive categories (memory / spatial / pattern / verbal /
-- numerical reasoning / attention) so brain-games are first-class in the
-- taxonomy. Content for them is seeded separately. Idempotent. NOT auto-applied.
-- ============================================================================

-- 1) Cognitive / brain-game categories (thinking domain) ---------------------
INSERT INTO public.quiz_categories (code, name_ar, name_en, domain, icon, sort_order, is_active) VALUES
  ('memory',              'الذاكرة',            'Memory',              'thinking', '🧠', 66, true),
  ('spatial_reasoning',   'التفكير المكاني',    'Spatial Reasoning',   'thinking', '🧊', 67, true),
  ('pattern_recognition', 'تمييز الأنماط',      'Pattern Recognition', 'thinking', '🔷', 68, true),
  ('verbal_reasoning',    'الاستدلال اللفظي',   'Verbal Reasoning',    'thinking', '🔤', 69, true),
  ('numerical_reasoning', 'الاستدلال العددي',   'Numerical Reasoning', 'thinking', '🔢', 76, true),
  ('attention_focus',     'التركيز والملاحظة',  'Attention & Focus',   'thinking', '👁️', 77, true)
ON CONFLICT (code) DO NOTHING;

-- 2) Engine v2 ---------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.quiz_build_session(p_size integer DEFAULT 10)
RETURNS TABLE(question_id bigint, stratum text, ord integer)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $function$
#variable_conflict use_column
declare
  v_user      uuid := auth.uid();
  v_lang      text;
  v_grade     text;
  v_ptype     text;
  v_countries text[];
  v_interests text[];
  v_mastery   int;
  v_ceiling   int;
begin
  if v_user is null then return; end if;

  select coalesce(language_pref,'ar'), grade_level, personality_type,
         coalesce((select array_agg(x) from jsonb_array_elements_text(preferred_countries) x), '{}'),
         coalesce(interests, '{}')
    into v_lang, v_grade, v_ptype, v_countries, v_interests
  from student_profiles where user_id = v_user;
  v_lang := coalesce(v_lang, 'ar');

  -- Ability band: mastery-driven (auto-progresses as the student improves),
  -- capped by grade so younger students never face university-hard items.
  select coalesce(round(avg(current_difficulty)), 3)::int into v_mastery
  from quiz_user_skill where user_id = v_user;
  v_mastery := coalesce(v_mastery, 3);
  v_ceiling := least(
    v_mastery + 1,
    case when v_grade ilike '%جامعي%' or v_grade ilike '%خريج%' then 8 else 5 end
  );
  v_ceiling := greatest(v_ceiling, 2);   -- never starve the pool

  return query
  with
  recent as (
    select h.question_id from quiz_user_history h
    where h.user_id = v_user and h.answered_at > now() - interval '60 days'
  ),
  srs_due as (
    select distinct h.question_id from quiz_user_history h
    join quiz_questions q on q.id = h.question_id
    where h.user_id = v_user and h.next_review_at is not null
      and h.next_review_at <= now() and q.status = 'active'
  ),
  weak as (
    select s.skill_code from quiz_user_skill s
    where s.user_id = v_user and s.mastery_score < 0.6 and s.skill_code is not null
  ),
  base as (
    select q.id, q.subject, q.difficulty, q.skill_code,
           coalesce(c.domain, 'academic') as dom
    from quiz_questions q
    left join quiz_categories c on c.code = q.subject
    where q.status = 'active'
      and (q.language = v_lang or q.language is null)
      and (q.country is null or cardinality(v_countries) = 0 or q.country = any(v_countries))
      and (q.grade_level is null or v_grade is null or q.grade_level = v_grade)
      and q.difficulty <= v_ceiling
  ),
  -- Pedagogical score per candidate (higher = more valuable to show today).
  scored as (
    select b.id, b.dom, b.difficulty,
      (case when b.id in (select question_id from srs_due) then 100 else 0 end)
      + (case when b.skill_code in (select skill_code from weak) then 40 else 0 end)
      + (case when b.subject = any(v_interests) then 15 else 0 end)
      + greatest(0, 10 - abs(b.difficulty - (v_mastery + 1)))   -- growth-edge preference
      + (case when b.id not in (select question_id from recent) then 20 else 0 end)
      + (random() * 5)::int                                     -- gentle shuffle
      as score
    from base b
  ),
  -- Variety guarantee: the single best-scoring question in EACH domain.
  per_domain as (
    select id, dom, score,
           row_number() over (partition by dom order by score desc) as rn
    from scored
  ),
  domain_core as (
    select id as qid, 'variety'::text as strat, score from per_domain where rn = 1
  ),
  -- Adaptive depth: best remaining questions overall.
  fill as (
    select s.id as qid, 'adaptive'::text as strat, s.score
    from scored s
    where s.id not in (select qid from domain_core)
    order by s.score desc
    limit p_size
  ),
  unioned as (
    select qid, strat, score from domain_core
    union all
    select qid, strat, score from fill
  ),
  dedup as (
    select qid, strat, score,
           row_number() over (partition by qid order by (strat = 'variety') desc, score desc) as rn
    from unioned
  ),
  final as (
    select qid, strat, score from dedup where rn = 1
    order by (strat = 'variety') desc, score desc
    limit p_size
  )
  select f.qid, f.strat,
         (row_number() over (order by (f.strat = 'variety') desc, f.score desc))::int
  from final f;
end $function$;

GRANT EXECUTE ON FUNCTION public.quiz_build_session(integer) TO authenticated;
