-- Event-driven (Step 4): "parent linked student" now notifies the student.
-- Added inside the existing link_parent_by_code RPC (server-side, knows both the
-- parent (auth.uid()) and the student (v_student)). The notification is wrapped in
-- its own block so a notify failure can never block the actual linking.
create or replace function link_parent_by_code(p_code text) returns text
language plpgsql security definer set search_path to 'public','pg_catalog' as $function$
declare
  v_student uuid;
  v_name    text;
begin
  if p_code is null or length(trim(p_code)) < 4 then
    return 'BAD_CODE';
  end if;

  select user_id, full_name into v_student, v_name
  from student_profiles
  where upper(parent_link_code) = upper(trim(p_code));

  if v_student is null then return 'NOT_FOUND'; end if;
  if v_student = auth.uid() then return 'SELF'; end if;

  if exists (
    select 1 from parent_student_links
    where parent_user_id = auth.uid() and student_user_id = v_student
  ) then
    update parent_student_links
      set status = 'active', approved_at = now()
      where parent_user_id = auth.uid() and student_user_id = v_student;
  else
    insert into parent_student_links
      (parent_user_id, student_user_id, status, invited_at, approved_at)
    values (auth.uid(), v_student, 'active', now(), now());
  end if;

  -- notify the student (best-effort)
  begin
    insert into notifications (user_id, type, title, body, link_url, severity, created_by)
    values (v_student, 'parent.linked', 'وليّ أمر انضمّ لحسابك 👨‍👩‍👧',
            'تمّ ربط وليّ أمر بحسابك ليتابع تقدّمك. تقدر تدير الربط من إعدادات الخصوصية.',
            '/profile', 'info', auth.uid());
  exception when others then null;
  end;

  return 'OK:' || coalesce(v_name, 'الطالب');
end;
$function$;
