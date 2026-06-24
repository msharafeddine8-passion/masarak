-- ════════════════════════════════════════════════════════════════════════════
-- Audit Fix #02 — Database security hardening (24 June 2026)
-- Closes Supabase advisor findings WITHOUT breaking public/anon features.
--   • H-8 — pin search_path on every function (advisor lint 0011)
--   • H-1 — admin_user_growth_30d() leaked platform metrics to ANY caller
--           (incl. anonymous): add an internal admin guard + revoke anon.
--   • H-2 — upsert_org_lead() was anon-executable: revoke anon (it is now
--           superseded by record_university_save in fix01).
--   • handle_new_user() is a trigger function and must not be an RPC: revoke.
--
-- NOTE (handled outside SQL):
--   • L-4 leaked-password protection → enable in Supabase Dashboard › Auth ›
--     Password security (HaveIBeenPwned). Not a migration.
--   • H-7 public-bucket listing (avatars/images) → tighten in fix04 after
--     confirming no feature calls storage .list() on those buckets.
-- ════════════════════════════════════════════════════════════════════════════

-- ── H-8: pin search_path on every function lacking it ───────────────────────
alter function public.admin_kpi_overview() set search_path = public, pg_catalog;
alter function public.approve_org_verification(p_org_id uuid) set search_path = public, pg_catalog;
alter function public.ensure_student_card() set search_path = public, pg_catalog;
alter function public.generate_masarak_id() set search_path = public, pg_catalog;
alter function public.get_public_student_profile(p_masarak_id text) set search_path = public, pg_catalog;
alter function public.handle_new_user() set search_path = public, pg_catalog;
alter function public.is_admin() set search_path = public, pg_catalog;
alter function public.is_org_admin(target_org uuid) set search_path = public, pg_catalog;
alter function public.is_org_manager(target_org uuid) set search_path = public, pg_catalog;
alter function public.is_platform_admin() set search_path = public, pg_catalog;
alter function public.link_parent_by_code(p_code text) set search_path = public, pg_catalog;
alter function public.lookup_org_invite(p_token text) set search_path = public, pg_catalog;
alter function public.mark_all_notifications_read() set search_path = public, pg_catalog;
alter function public.my_unread_notifications_count() set search_path = public, pg_catalog;
alter function public.redeem_org_invite(p_token text) set search_path = public, pg_catalog;
alter function public.request_org_verification(p_org_id uuid, p_notes text) set search_path = public, pg_catalog;
alter function public.touch_updated_at() set search_path = public, pg_catalog;
alter function public.upsert_org_lead(p_org_id uuid, p_student_id uuid, p_source text, p_score_delta integer) set search_path = public, pg_catalog;

-- ── H-1: guard admin_user_growth_30d (was readable by anon/any user) ────────
-- Rewritten in plpgsql to add the same admin check admin_kpi_overview uses.
-- Body is identical to the original query, just gated.
create or replace function public.admin_user_growth_30d()
returns table(day date, new_users bigint, total_users bigint)
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  if (auth.jwt() ->> 'email') <> 'msharafeddine8@gmail.com' then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return query
  with dates as (
    select generate_series(date_trunc('day', now() - interval '29 days'),
                           date_trunc('day', now()), '1 day')::date as d
  ),
  daily as (
    select date_trunc('day', created_at)::date as d, count(*) as n
    from auth.users
    where created_at >= now() - interval '30 days'
    group by 1
  )
  select dates.d as day,
         coalesce(daily.n, 0) as new_users,
         sum(coalesce(daily.n, 0)) over (order by dates.d)
           + (select count(*) from auth.users where created_at < now() - interval '30 days') as total_users
  from dates left join daily on daily.d = dates.d
  order by dates.d;
end;
$$;

-- ── Revoke anon/public EXECUTE on privileged functions ──────────────────────
revoke execute on function public.admin_kpi_overview()           from anon;
revoke execute on function public.admin_user_growth_30d()        from anon;
revoke execute on function public.upsert_org_lead(uuid, uuid, text, integer) from anon;
-- Trigger function — never meant to be an RPC:
revoke execute on function public.handle_new_user()              from anon, authenticated, public;
