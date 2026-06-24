-- ════════════════════════════════════════════════════════════════════════════
-- Audit Fix #01 — Revive the university-save → org-lead → owner-notification chain
-- 24 June 2026
--
-- Root problem (audit C-1 / Root cause #1):
--   The client-side listener (src/lib/events/listeners.ts) read `universities.org_id`
--   — a column that DOES NOT EXIST (the real link is `organizations.entity_id`).
--   It also tried to read `org_members` from the browser, which RLS forbids to
--   students. Result: NO leads were ever created and orgs got NO "new lead"
--   notifications — the entire institution CRM funnel was dead.
--
-- This migration moves the whole side-effect SERVER-SIDE into one SECURITY DEFINER
-- RPC, which also fixes:
--   • H-2  — authz: a caller can only record a save for THEMSELVES (auth.uid()).
--   • H-13 — score double-count: +30 only on FIRST save; re-saves just touch
--            last_interaction_at (no inflation).
--   • H-12 — duplicate notifications: owners are notified only when the lead is
--            newly created (natural dedup on repeated save/unsave).
--   • H-8  — search_path is pinned (no mutable search_path).
--
-- Safe to apply: additive (creates one function). The accompanying code change in
-- listeners.ts calls this RPC instead of the broken column read.
-- Precondition verified before apply: org_leads has UNIQUE (org_id, student_id).
-- ════════════════════════════════════════════════════════════════════════════

create or replace function public.record_university_save(p_university_id bigint)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_student     uuid := auth.uid();
  v_org_id      uuid;
  v_org_name    text;
  v_lead_existed boolean;
  v_member      record;
begin
  -- Authz: only an authenticated user, recording their OWN save.
  if v_student is null then
    return jsonb_build_object('ok', false, 'error', 'not_signed_in');
  end if;

  -- Resolve the org via the REAL link (organizations.entity_id), not the
  -- non-existent universities.org_id.
  select o.id, o.display_name
    into v_org_id, v_org_name
  from organizations o
  where o.org_type = 'university'
    and o.entity_id = p_university_id
    and o.is_active = true
  limit 1;

  -- No claimed/active org for this university → nothing to do (not an error).
  if v_org_id is null then
    return jsonb_build_object('ok', true, 'org', false);
  end if;

  -- Idempotent lead: award the +30 only when the lead row is first created.
  select exists (
    select 1 from org_leads where org_id = v_org_id and student_id = v_student
  ) into v_lead_existed;

  insert into org_leads (org_id, student_id, source, score)
  values (v_org_id, v_student, 'save', 30)
  on conflict (org_id, student_id) do update
    set last_interaction_at = now();

  -- Notify org managers only on a NEW lead → no duplicate notifications on
  -- repeated save/unsave cycles.
  if not v_lead_existed then
    for v_member in
      select user_id from org_members
      where org_id = v_org_id and role in ('owner', 'admin', 'editor')
    loop
      insert into notifications
        (user_id, type, title, body, link_url, severity, entity_type, entity_id, created_by)
      values
        (v_member.user_id, 'org.new_lead',
         'طالب جديد مهتم بـ ' || coalesce(v_org_name, 'مؤسستك'),
         'حفظ صفحة مؤسستك طالب جديد. اطّلع على ملفه من قسم Leads.',
         '/org/dashboard?tab=leads', 'success', 'university', p_university_id::text, v_student);
    end loop;
  end if;

  return jsonb_build_object('ok', true, 'org', true, 'new_lead', not v_lead_existed);
end;
$$;

-- Only signed-in users may call it; never anon.
revoke all on function public.record_university_save(bigint) from public, anon;
grant execute on function public.record_university_save(bigint) to authenticated;
