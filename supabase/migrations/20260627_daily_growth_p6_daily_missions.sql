-- Daily Growth — Phase 6: data-driven daily missions, computed from the learner's
-- REAL activity today (no hardcoded list, no extra tracking table — derived live).
-- Rendered on /quiz/today. The XP values are display targets; XP itself is still
-- awarded by /api/quiz/submit on the underlying actions.
create or replace function public.quiz_daily_missions()
returns jsonb
language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  v_user uuid := auth.uid();
  v_today date := current_date;
  v_answered int := 0;
  v_correct int := 0;
  v_session_done boolean := false;
  v_weak_practiced boolean := false;
begin
  if v_user is null then return '[]'::jsonb; end if;

  select count(*), count(*) filter (where was_correct)
    into v_answered, v_correct
  from quiz_user_history
  where user_id = v_user and answered_at::date = v_today;

  select coalesce(bool_or(completed_at is not null), false) into v_session_done
  from quiz_daily_sessions where user_id = v_user and quiz_date = v_today;

  select exists (
    select 1
    from quiz_user_history h
    join quiz_questions q on q.id = h.question_id
    join quiz_user_skill s on s.user_id = h.user_id and s.skill_code = q.skill_code
    where h.user_id = v_user and h.answered_at::date = v_today and s.mastery_score < 0.6
  ) into v_weak_practiced;

  return jsonb_build_array(
    jsonb_build_object('key','complete_session','icon','🎯','title','أكمل تحدّي اليوم',
      'target',1,'progress', case when v_session_done then 1 else 0 end,'done', v_session_done,'xp',25),
    jsonb_build_object('key','answer_10','icon','✍️','title','أجب على 10 أسئلة',
      'target',10,'progress', least(v_answered,10),'done', v_answered >= 10,'xp',15),
    jsonb_build_object('key','correct_5','icon','✅','title','حقّق 5 إجابات صحيحة',
      'target',5,'progress', least(v_correct,5),'done', v_correct >= 5,'xp',15),
    jsonb_build_object('key','practice_weak','icon','💪','title','تدرّب على نقطة ضعف',
      'target',1,'progress', case when v_weak_practiced then 1 else 0 end,'done', v_weak_practiced,'xp',20)
  );
end $$;

revoke execute on function public.quiz_daily_missions() from public;
grant execute on function public.quiz_daily_missions() to authenticated;
