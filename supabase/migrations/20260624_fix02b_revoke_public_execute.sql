-- ════════════════════════════════════════════════════════════════════════════
-- Audit Fix #02b — Properly revoke EXECUTE from PUBLIC (24 June 2026)
-- The per-`anon` REVOKE in fix02 was ineffective: Postgres grants EXECUTE on
-- functions to PUBLIC by default, so `anon` still inherited it. Revoke from
-- PUBLIC and re-grant only where a real caller needs it.
--   • H-1 — admin_kpi_overview / admin_user_growth_30d: admin dashboard calls
--           them while signed in (the internal email guard does the real check).
--           PUBLIC → revoked; authenticated → granted.
--   • H-2 — upsert_org_lead: superseded by record_university_save (fix01) and has
--           no internal guard. No client caller remains → revoke from everyone.
-- ════════════════════════════════════════════════════════════════════════════

revoke execute on function public.admin_kpi_overview() from public;
grant  execute on function public.admin_kpi_overview() to authenticated;

revoke execute on function public.admin_user_growth_30d() from public;
grant  execute on function public.admin_user_growth_30d() to authenticated;

revoke execute on function public.upsert_org_lead(uuid, uuid, text, integer) from public, anon, authenticated;
