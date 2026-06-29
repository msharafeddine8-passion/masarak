-- Daily Growth — Phase 4: learner analytics for student + parent dashboards.
-- Returns overall accuracy/speed, per-category performance, strong/weak skills,
-- and a 30-day growth curve. Secure: a caller may view their OWN analytics, a
-- linked active parent may view their student's, and admins may view anyone's.
-- Consumed by the student dashboard and parent student-detail page (Phase 4 UI).
create or replace function public.quiz_user_analytics(p_student uuid default null)
returns jsonb
language plpgsql security definer set search_path = public, pg_catalog as $$
declare
  v_caller uuid := auth.uid();
  v_target uuid;
  v_result jsonb;
begin
  if v_caller is null then return jsonb_build_object('error','unauthenticated'); end if;
  v_target := coalesce(p_student, v_caller);

  if v_target <> v_caller then
    if not exists (
      select 1 from parent_student_links
      where parent_user_id = v_caller and student_user_id = v_target and status = 'active'
    ) and not is_admin() then
      return jsonb_build_object('error','forbidden');
    end if;
  end if;

  select jsonb_build_object(
    'overall', (
      select jsonb_build_object(
        'answered', count(*),
        'correct', count(*) filter (where was_correct),
        'accuracy', coalesce(round(100.0*count(*) filter (where was_correct)/nullif(count(*),0)), 0),
        'avg_time_ms', coalesce(round(avg(time_taken_ms)), 0)
      ) from quiz_user_history where user_id = v_target
    ),
    'by_category', (
      select coalesce(jsonb_agg(row order by (row->>'answered')::int desc), '[]'::jsonb) from (
        select jsonb_build_object(
          'category', h.subject,
          'name_ar', coalesce(c.name_ar, h.subject),
          'icon', c.icon,
          'answered', count(*),
          'accuracy', round(100.0*count(*) filter (where h.was_correct)/count(*))
        ) row
        from quiz_user_history h
        left join quiz_categories c on c.code = h.subject
        where h.user_id = v_target
        group by h.subject, c.name_ar, c.icon
      ) t
    ),
    'strong_skills', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('skill', skill_code, 'subject', subject,
                                  'mastery', round(mastery_score*100), 'attempts', attempts) x
        from quiz_user_skill where user_id = v_target and mastery_score >= 0.75 and attempts >= 2
        order by mastery_score desc limit 5
      ) s
    ),
    'weak_skills', (
      select coalesce(jsonb_agg(x), '[]'::jsonb) from (
        select jsonb_build_object('skill', skill_code, 'subject', subject,
                                  'mastery', round(mastery_score*100), 'attempts', attempts) x
        from quiz_user_skill where user_id = v_target and mastery_score < 0.6 and attempts >= 2
        order by mastery_score asc limit 5
      ) s
    ),
    'growth_30d', (
      select coalesce(jsonb_agg(jsonb_build_object('day', d, 'answered', n, 'accuracy', acc) order by d), '[]'::jsonb)
      from (
        select date_trunc('day', answered_at)::date d, count(*) n,
               round(100.0*count(*) filter (where was_correct)/count(*)) acc
        from quiz_user_history
        where user_id = v_target and answered_at > now() - interval '30 days'
        group by 1
      ) g
    ),
    'as_of', now()
  ) into v_result;

  return v_result;
end $$;

revoke execute on function public.quiz_user_analytics(uuid) from public;
grant execute on function public.quiz_user_analytics(uuid) to authenticated;
