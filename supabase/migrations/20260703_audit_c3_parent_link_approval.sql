-- ============================================================================
-- AUDIT C3 — Parent link now requires STUDENT APPROVAL (no silent auto-link).
-- ----------------------------------------------------------------------------
-- Before: link_parent_by_code() inserted the parent↔student row as status='active'
-- immediately, so anyone who knew/guessed a student's parent_link_code got instant
-- parent-level read access; the student was only NOTIFIED after the fact.
--
-- After: the row is created as status='pending'. The student approves or rejects
-- from the EXISTING /profile/parent-invites UI (approve → status='active').
-- The parent gains read access only once active — every parent page already gates
-- on status='active' (parent/student/[id] .eq('status','active'); parent/dashboard
-- filters status==='active'), so a pending link exposes nothing.
--
-- Return contract: 'BAD_CODE' | 'NOT_FOUND' | 'SELF' unchanged; a newly-created or
-- re-opened request returns 'PENDING:<name>'; an already-approved link returns
-- 'OK:<name>' (idempotent, keeps access). Callers handle both OK: and PENDING:.
--
-- ⚠️ NOT auto-applied — this rewrites a production auth RPC. Apply after review.
-- Additive/idempotent (CREATE OR REPLACE); revert = restore the prior body.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.link_parent_by_code(p_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $function$
declare
  v_student uuid;
  v_name    text;
  v_status  text;
  v_parent_name text;
begin
  if p_code is null or length(trim(p_code)) < 4 then
    return 'BAD_CODE';
  end if;

  select user_id, full_name into v_student, v_name
  from student_profiles
  where upper(parent_link_code) = upper(trim(p_code));

  if v_student is null then return 'NOT_FOUND'; end if;
  if v_student = auth.uid() then return 'SELF'; end if;

  select status into v_status
  from parent_student_links
  where parent_user_id = auth.uid() and student_user_id = v_student;

  -- Already approved by the student → keep access, nothing to do.
  if v_status = 'active' then
    return 'OK:' || coalesce(v_name, 'الطالب');
  end if;

  -- Create or re-open the link as PENDING — the student must approve it.
  if v_status is not null then
    update parent_student_links
      set status = 'pending', invited_at = now(), approved_at = null
      where parent_user_id = auth.uid() and student_user_id = v_student;
  else
    insert into parent_student_links
      (parent_user_id, student_user_id, status, invited_at, approved_at)
    values (auth.uid(), v_student, 'pending', now(), null);
  end if;

  -- Notify the student that a parent REQUESTS to follow (action needed).
  select coalesce(full_name, 'ولي أمر') into v_parent_name
  from public.profiles where id = auth.uid();
  begin
    insert into notifications (user_id, type, title, body, link, severity, channel)
    values (
      v_student,
      'parent.request',
      coalesce(v_parent_name, 'ولي أمر') || ' يطلب متابعة حسابك 👨‍👩‍👧',
      'راجع الطلب ووافق أو ارفض من صفحة ربط الأهل.',
      '/profile/parent-invites',
      'info',
      'in_app'
    );
  exception when others then null; -- notifications are best-effort
  end;

  return 'PENDING:' || coalesce(v_name, 'الطالب');
end;
$function$;

GRANT EXECUTE ON FUNCTION public.link_parent_by_code(text) TO authenticated;
