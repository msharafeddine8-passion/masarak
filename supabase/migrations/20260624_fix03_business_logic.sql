-- ════════════════════════════════════════════════════════════════════════════
-- Audit Fix #03 — Business-logic DB fixes (24 June 2026)
--   • H-11 — org verification RPCs queried organizations.name_ar (does NOT exist;
--            the column is display_name) → every call raised "column does not
--            exist", so the "request verification" button always failed and the
--            approve path errored. Fix: display_name. (Functions already had
--            search_path pinned by fix02.)
--   • H-4  — org_leads INSERT policy was WITH CHECK (true): any anon/user could
--            inject leads. Leads are created server-side by record_university_save
--            (SECURITY DEFINER, fix01) which bypasses RLS, so the client INSERT
--            can be restricted to org managers / platform admin.
-- ════════════════════════════════════════════════════════════════════════════

-- ── H-11: request_org_verification — display_name (was name_ar) ──────────────
create or replace function public.request_org_verification(p_org_id uuid, p_notes text default null)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare
  v_user_id uuid := auth.uid();
  v_is_member boolean;
  v_org_name text;
begin
  if v_user_id is null then return jsonb_build_object('ok', false, 'error', 'not_signed_in'); end if;
  select exists (
    select 1 from org_members where org_id = p_org_id and user_id = v_user_id and role in ('owner','editor')
  ) into v_is_member;
  if not v_is_member then return jsonb_build_object('ok', false, 'error', 'not_org_member'); end if;

  select display_name into v_org_name from organizations where id = p_org_id;
  update organizations
     set verification_requested_at = now(),
         verification_notes = coalesce(p_notes, verification_notes)
   where id = p_org_id and coalesce(verification_status, 'pending') not in ('verified');

  begin
    insert into admin_notifications (severity, category, title, body, link_url, data_payload)
    values ('info', 'risk', 'طلب توثيق جديد: ' || coalesce(v_org_name, p_org_id::text),
            coalesce(p_notes, 'لا يوجد ملاحظات إضافية'),
            '/admin/dashboard?tab=universities',
            jsonb_build_object('org_id', p_org_id));
  exception when others then null; end;

  return jsonb_build_object('ok', true);
end;
$$;

-- ── H-11: approve_org_verification — display_name (was name_ar) ──────────────
create or replace function public.approve_org_verification(p_org_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
declare v_org_name text; v_member record;
begin
  if auth.jwt() ->> 'email' <> 'msharafeddine8@gmail.com' then
    return jsonb_build_object('ok', false, 'error', 'forbidden');
  end if;
  select display_name into v_org_name from organizations where id = p_org_id;
  update organizations set verification_status = 'verified', is_verified = true, verified_at = now()
   where id = p_org_id;
  for v_member in select user_id from org_members where org_id = p_org_id loop
    begin
      insert into notifications (user_id, type, title, body, link_url, severity)
      values (v_member.user_id, 'org.verified',
              '🎉 تم توثيق ' || coalesce(v_org_name, 'مؤسستك') || '!',
              'مبروك! صارت مؤسستك موثّقة على مسارك. الشارة الزرقاء ✓ صارت تظهر على صفحتك العامة.',
              '/org/dashboard', 'success');
    exception when others then null; end;
  end loop;
  return jsonb_build_object('ok', true);
end;
$$;

-- ── H-4: restrict org_leads INSERT (was WITH CHECK (true)) ──────────────────
-- Legitimate leads are written by record_university_save (SECURITY DEFINER,
-- bypasses RLS). Direct client inserts are limited to the org's own managers.
drop policy if exists leads_insert on org_leads;
create policy leads_insert on org_leads for insert
  with check (is_org_manager(org_id) or is_platform_admin());
