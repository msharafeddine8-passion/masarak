-- ════════════════════════════════════════════════════════════════════════════
-- Audit Fix #04 — Close notification injection + move cross-user notifs server-side
-- 24 June 2026
--   • C-2 — notifications INSERT policy allowed ANY authenticated user to insert a
--           row for ANY user_id (incl. user_id = NULL, which read_own_or_broadcast
--           exposes to EVERYONE) → platform-wide phishing/spam. Tighten INSERT to
--           self-only; broadcasts (user_id NULL) remain creatable only by admin via
--           the admin_write_notif policy.
--   • Root #1 / H-12 — the only legitimate cross-user client insert was the DNA
--           "notify my parents" path in listeners.ts, which ALSO queried wrong
--           columns (parent_id/student_id — the table uses parent_user_id/
--           student_user_id) so it never worked. Move it into a SECURITY DEFINER
--           RPC with the correct columns + a 1-hour dedup (fixes duplicate
--           notifications on quiz retakes).
-- ════════════════════════════════════════════════════════════════════════════

-- ── DNA-completed side effect (self + approved parents), server-side + deduped ──
create or replace function public.record_dna_completed()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_student uuid := auth.uid();
  v_parent  record;
begin
  if v_student is null then
    return jsonb_build_object('ok', false, 'error', 'not_signed_in');
  end if;

  -- Self notification — skip if one was already sent in the last hour (dedup).
  if not exists (
    select 1 from notifications
    where user_id = v_student and type = 'student.dna_completed'
      and created_at > now() - interval '1 hour'
  ) then
    insert into notifications (user_id, type, title, body, link_url, severity)
    values (v_student, 'student.dna_completed',
            '🧬 رائع! خلّصت اختبار Career DNA',
            'اطّلع على نتيجتك وخصوصياتك المهنية + الاقتراحات المخصّصة لك.',
            '/career-dna/result', 'success');
  end if;

  -- Notify linked & approved parents (correct columns; dedup per parent).
  for v_parent in
    select parent_user_id from parent_student_links
    where student_user_id = v_student and approved_at is not null
  loop
    if not exists (
      select 1 from notifications
      where user_id = v_parent.parent_user_id and type = 'parent.student_milestone'
        and created_at > now() - interval '1 hour'
    ) then
      insert into notifications (user_id, type, title, body, link_url, severity)
      values (v_parent.parent_user_id, 'parent.student_milestone',
              '🎉 ابنك خلّص اختبار Career DNA',
              'افتح ملف ابنك لتشوف نتيجة الاختبار والاقتراحات.',
              '/parent', 'success');
    end if;
  end loop;

  return jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.record_dna_completed() from public, anon;
grant execute on function public.record_dna_completed() to authenticated;

-- ── C-2: restrict notifications INSERT to the row's own user ────────────────
-- (cross-user/broadcast notifications now come only from SECURITY DEFINER RPCs
--  — record_university_save, record_dna_completed, approve_org_verification — or
--  from admin via the existing admin_write_notif ALL policy.)
drop policy if exists notif_admin_insert on notifications;
create policy notif_insert_self on notifications for insert
  with check (auth.uid() = user_id);
