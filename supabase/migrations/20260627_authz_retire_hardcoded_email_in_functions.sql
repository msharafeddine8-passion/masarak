-- S2 (functions): retire the hardcoded super-admin email from SECURITY DEFINER
-- function guards, routing them through is_super_admin()/is_admin() so they honour
-- the app_metadata authz model (the app_metadata.super_admin flag + co-admins) and
-- stop breaking if the owner email ever changes. is_super_admin() itself keeps the
-- email allowlist — it is the single source of truth. After this, the email literal
-- appears in exactly one function (is_super_admin) and zero RLS policies.

-- Role-column write guard (S1 defense): only the super admin may change role columns.
create or replace function public.guard_role_columns()
 returns trigger language plpgsql security definer
 set search_path to 'public', 'pg_catalog'
as $function$
begin
  if is_super_admin() then return new; end if;
  if tg_table_name = 'profiles' then
    new.role := old.role;
  elsif tg_table_name = 'user_profiles' then
    new.primary_role := old.primary_role;
    new.active_role := old.active_role;
  end if;
  return new;
end; $function$;

-- Legacy alias used by ~8 org RLS policies. Delegate to is_admin() so org management
-- (operational, not finance/PII) is available to super admin AND co-admins, matching
-- the sibling org policies (org_leads/org_invites/org_messages) already on is_admin().
create or replace function public.is_platform_admin()
 returns boolean language sql stable
 set search_path to 'public', 'pg_catalog'
as $function$
  select is_admin();
$function$;

-- Org verification approval: operational admin action → co-admins included.
create or replace function public.approve_org_verification(p_org_id uuid)
 returns jsonb language plpgsql security definer
 set search_path to 'public', 'pg_catalog'
as $function$
declare v_org_name text; v_member record;
begin
  if not is_admin() then return jsonb_build_object('ok', false, 'error', 'forbidden'); end if;
  select display_name into v_org_name from organizations where id = p_org_id;
  update organizations set verification_status = 'verified', is_verified = true, verified_at = now() where id = p_org_id;
  for v_member in select user_id from org_members where org_id = p_org_id loop
    begin
      insert into notifications (user_id, type, title, body, link_url, severity)
      values (v_member.user_id, 'org.verified', '🎉 تم توثيق ' || coalesce(v_org_name, 'مؤسستك') || '!',
              'مبروك! صارت مؤسستك موثّقة على مسارك. الشارة الزرقاء ✓ صارت تظهر على صفحتك العامة.', '/org/dashboard', 'success');
    exception when others then null; end;
  end loop;
  return jsonb_build_object('ok', true);
end; $function$;

-- Executive KPI overview includes revenue → super admin only.
create or replace function public.admin_kpi_overview()
 returns jsonb language plpgsql security definer
 set search_path to 'public', 'pg_catalog'
as $function$
declare
  v_total_users bigint := 0; v_active_30d bigint := 0; v_new_today bigint := 0;
  v_new_this_month bigint := 0; v_paid_active bigint := 0; v_lifetime bigint := 0;
  v_revenue_today numeric := 0; v_revenue_month numeric := 0; v_revenue_year numeric := 0;
  v_universities bigint := 0; v_schools bigint := 0; v_scholarships bigint := 0;
  v_majors bigint := 0; v_dna_results bigint := 0; v_saved_items bigint := 0;
  v_open_tickets bigint := 0; v_pending_invites bigint := 0;
begin
  if not is_super_admin() then
    return jsonb_build_object('error', 'forbidden');
  end if;
  select count(*) into v_total_users from auth.users;
  select count(*) into v_new_today from auth.users where created_at >= date_trunc('day', now());
  select count(*) into v_new_this_month from auth.users where created_at >= date_trunc('month', now());
  begin
    select count(distinct user_id) into v_active_30d from analytics_events where created_at >= now() - interval '30 days' and user_id is not null;
  exception when others then v_active_30d := 0; end;
  begin
    select count(*) into v_paid_active from subscriptions where status='active' and plan not in ('free');
    select count(*) into v_lifetime from subscriptions where status='active' and plan='lifetime';
    select coalesce(sum(amount_usd),0) into v_revenue_today from subscriptions where created_at >= date_trunc('day', now()) and status='active';
    select coalesce(sum(amount_usd),0) into v_revenue_month from subscriptions where created_at >= date_trunc('month', now()) and status='active';
    select coalesce(sum(amount_usd),0) into v_revenue_year from subscriptions where created_at >= date_trunc('year', now()) and status='active';
  exception when others then null; end;
  begin select count(*) into v_universities from universities; exception when others then null; end;
  begin select count(*) into v_schools from schools; exception when others then null; end;
  begin select count(*) into v_scholarships from scholarships; exception when others then null; end;
  begin select count(*) into v_majors from majors; exception when others then null; end;
  begin select count(*) into v_saved_items from saved_items; exception when others then null; end;
  begin select count(*) into v_dna_results from dna_results; exception when others then null; end;
  begin select count(*) into v_open_tickets from support_tickets where status in ('open','in_progress'); exception when others then null; end;
  begin select count(*) into v_pending_invites from org_invites where redeemed_at is null and expires_at > now(); exception when others then null; end;
  return jsonb_build_object(
    'totalUsers', v_total_users, 'newToday', v_new_today, 'newThisMonth', v_new_this_month,
    'active30d', v_active_30d, 'paidActive', v_paid_active, 'lifetime', v_lifetime,
    'revenueToday', v_revenue_today, 'revenueMonth', v_revenue_month, 'revenueYear', v_revenue_year,
    'universities', v_universities, 'schools', v_schools, 'scholarships', v_scholarships,
    'majors', v_majors, 'savedItems', v_saved_items, 'dnaResults', v_dna_results,
    'openTickets', v_open_tickets, 'pendingInvites', v_pending_invites, 'asOf', now()
  );
end; $function$;

-- 30-day user-growth series (executive tier) → super admin only.
create or replace function public.admin_user_growth_30d()
 returns table(day date, new_users bigint, total_users bigint)
 language plpgsql security definer
 set search_path to 'public', 'pg_catalog'
as $function$
begin
  if not is_super_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
  with dates as (
    select generate_series(date_trunc('day', now() - interval '29 days'), date_trunc('day', now()), '1 day')::date as d
  ),
  daily as (
    select date_trunc('day', created_at)::date as d, count(*) as n
    from auth.users where created_at >= now() - interval '30 days' group by 1
  )
  select dates.d as day, coalesce(daily.n, 0) as new_users,
         sum(coalesce(daily.n, 0)) over (order by dates.d)
           + (select count(*) from auth.users where created_at < now() - interval '30 days') as total_users
  from dates left join daily on daily.d = dates.d order by dates.d;
end; $function$;
