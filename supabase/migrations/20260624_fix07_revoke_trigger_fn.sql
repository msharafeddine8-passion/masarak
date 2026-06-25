-- ════════════════════════════════════════════════════════════════════════════
-- Audit Fix #07 — revoke EXECUTE on the role-guard trigger function — 24 June 2026
-- guard_role_columns() (added in fix05) is a TRIGGER function; it runs as the
-- table owner via the trigger and must not be callable as a public RPC. This
-- clears the advisor "anon/authenticated can execute SECURITY DEFINER function"
-- warning for it without affecting the trigger.
-- ════════════════════════════════════════════════════════════════════════════
revoke execute on function public.guard_role_columns() from public, anon, authenticated;
