-- ============================================================================
-- Daily Growth — Phase 2: adaptive selection engine.
-- quiz_build_session() composes a personalized daily pool from 6 weighted strata
-- (SRS-due, weak skills, Career-DNA/interest alignment, growth-edge, discovery,
-- fresh fill) with hard filters (language/grade/country) and graceful fallback
-- when a student's profile/DNA signals are missing. Secure: builds ONLY for
-- auth.uid(). Wired into GET /api/quiz/today. See DAILY_GROWTH_ARCHITECTURE.md.
-- ============================================================================

-- Career-DNA (RIASEC) -> learning-category weighting (dedicated, tunable table).
create table if not exists public.quiz_dna_categories (
  dna_type      text not null,   -- realistic|investigative|artistic|social|enterprising|conventional
  category_code text not null references public.quiz_categories(code) on delete cascade,
  weight        numeric not null default 1,
  primary key (dna_type, category_code)
);
alter table public.quiz_dna_categories enable row level security;
drop policy if exists quiz_dna_categories_read on public.quiz_dna_categories;
create policy quiz_dna_categories_read on public.quiz_dna_categories for select using (true);
drop policy if exists quiz_dna_categories_admin on public.quiz_dna_categories;
create policy quiz_dna_categories_admin on public.quiz_dna_categories for all
  using (is_admin()) with check (is_admin());

insert into public.quiz_dna_categories (dna_type, category_code) values
  ('investigative','math'),('investigative','physics'),('investigative','chemistry'),
  ('investigative','biology'),('investigative','science'),('investigative','computer_science'),
  ('investigative','ai'),('investigative','logic'),('investigative','critical_thinking'),
  ('artistic','arabic'),('artistic','english'),('artistic','philosophy'),
  ('artistic','media_literacy'),('artistic','public_speaking'),('artistic','communication_skills'),
  ('social','psychology'),('social','sociology'),('social','emotional_intelligence'),
  ('social','communication_skills'),('social','health'),('social','mental_wellbeing'),
  ('enterprising','economics'),('enterprising','entrepreneurship'),('enterprising','leadership'),
  ('enterprising','financial_literacy'),('enterprising','career_skills'),('enterprising','interview_skills'),
  ('conventional','financial_literacy'),('conventional','study_skills'),('conventional','time_management'),
  ('conventional','productivity'),('conventional','digital_skills'),('conventional','cv_building'),
  ('realistic','physics'),('realistic','chemistry'),('realistic','programming'),
  ('realistic','cybersecurity'),('realistic','environmental_awareness'),('realistic','health')
on conflict do nothing;

create or replace function public.quiz_build_session(p_size int default 10)
returns table(question_id bigint, stratum text, ord int)
language plpgsql security definer set search_path = public, pg_catalog as $$
#variable_conflict use_column
declare
  v_user      uuid := auth.uid();
  v_lang      text;
  v_grade     text;
  v_ptype     text;
  v_countries text[];
  v_interests text[];
begin
  if v_user is null then return; end if;

  select coalesce(language_pref,'ar'), grade_level, personality_type,
         coalesce((select array_agg(x) from jsonb_array_elements_text(preferred_countries) x), '{}'),
         coalesce(interests, '{}')
    into v_lang, v_grade, v_ptype, v_countries, v_interests
  from student_profiles where user_id = v_user;
  v_lang := coalesce(v_lang, 'ar');

  return query
  with
  recent as (
    select h.question_id from quiz_user_history h
    where h.user_id = v_user and h.answered_at > now() - interval '90 days'
  ),
  srs_due as (
    select distinct h.question_id from quiz_user_history h
    join quiz_questions q on q.id = h.question_id
    where h.user_id = v_user and h.next_review_at is not null
      and h.next_review_at <= now() and q.status='active'
  ),
  base as (
    select q.id, q.subject, q.difficulty, q.skill_code
    from quiz_questions q
    where q.status='active'
      and (q.language = v_lang or q.language is null)
      and (q.country is null or cardinality(v_countries)=0 or q.country = any(v_countries))
      and (q.grade_level is null or v_grade is null or q.grade_level = v_grade)
  ),
  weak as (
    select s.skill_code from quiz_user_skill s
    where s.user_id = v_user and s.mastery_score < 0.6
  ),
  dna_cats as (
    select c.category_code cat from quiz_dna_categories c
    where v_ptype is not null
      and (v_ptype ilike c.dna_type || '%' or upper(left(v_ptype,1))=upper(left(c.dna_type,1)))
  ),
  answered_subjects as (
    select distinct h.subject from quiz_user_history h where h.user_id = v_user
  ),
  avg_diff as (
    select coalesce(round(avg(s.current_difficulty)),3)::int d from quiz_user_skill s where s.user_id = v_user
  ),
  s_srs as (select sd.question_id, 'srs'::text strat, 1 prio from srs_due sd limit greatest(1,(p_size*0.3)::int)),
  s_weak as (
    select b.id qid, 'weak'::text, 2 from base b join weak w on w.skill_code=b.skill_code
    where b.id not in (select r.question_id from recent r)
    order by random() limit greatest(1,(p_size*0.3)::int)
  ),
  s_dna as (
    select b.id qid, 'dna'::text, 3 from base b
    where (b.subject in (select cat from dna_cats) or b.subject = any(v_interests))
      and b.id not in (select r.question_id from recent r)
    order by random() limit greatest(1,(p_size*0.2)::int)
  ),
  s_growth as (
    select b.id qid, 'growth'::text, 4 from base b cross join avg_diff
    where b.difficulty = avg_diff.d + 1
      and b.subject in (select subject from answered_subjects)
      and b.id not in (select r.question_id from recent r)
    order by random() limit greatest(1,(p_size*0.15)::int)
  ),
  s_disc as (
    select b.id qid, 'discovery'::text, 5 from base b
    where b.subject not in (select subject from answered_subjects)
      and b.id not in (select r.question_id from recent r)
    order by random() limit greatest(1,(p_size*0.05)::int)
  ),
  s_fill as (
    select b.id qid, 'fresh'::text, 6 from base b
    where b.id not in (select r.question_id from recent r)
    order by random() limit p_size
  ),
  s_relax as (
    select b.id qid, 'review'::text, 7 from base b
    left join lateral (
      select max(h.answered_at) la from quiz_user_history h
      where h.question_id=b.id and h.user_id=v_user
    ) x on true
    order by x.la asc nulls first, random() limit p_size
  ),
  unioned as (
    select * from s_srs union all select * from s_weak union all select * from s_dna
    union all select * from s_growth union all select * from s_disc
    union all select * from s_fill union all select * from s_relax
  ),
  dedup as (
    select u.question_id qid, u.strat, u.prio,
           row_number() over (partition by u.question_id order by u.prio) rn
    from unioned u
  )
  select d.qid, d.strat, (row_number() over (order by d.prio, random()))::int
  from dedup d where d.rn = 1
  order by d.prio, random()
  limit p_size;
end $$;

revoke execute on function public.quiz_build_session(int) from public;
grant execute on function public.quiz_build_session(int) to authenticated;
