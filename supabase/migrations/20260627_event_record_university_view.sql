-- Event-driven (Step 4): a student viewing a university surfaces them in that
-- org's Leads pipeline as a top-of-funnel 'view' lead. Wired via the existing
-- emit('student.viewed_university') → fireListeners → record_university_view RPC.
-- Mirrors record_university_save but: low score (5), first-touch only, NEVER
-- downgrades a stronger lead (save/applied/…), and does NOT notify (views are
-- high-volume / low-signal — avoids notification spam).
create or replace function record_university_view(p_university_id bigint) returns jsonb
language plpgsql security definer set search_path to 'public','pg_catalog' as $$
declare v_student uuid := auth.uid(); v_org_id uuid;
begin
  if v_student is null then return jsonb_build_object('ok',false,'error','not_signed_in'); end if;
  select o.id into v_org_id from organizations o
   where o.org_type='university' and o.entity_id=p_university_id and o.is_active=true limit 1;
  if v_org_id is null then return jsonb_build_object('ok',true,'org',false); end if;
  insert into org_leads (org_id, student_id, source, score)
    values (v_org_id, v_student, 'view', 5)
    on conflict (org_id, student_id) do update set last_interaction_at = now();
  return jsonb_build_object('ok',true,'org',true);
end; $$;
