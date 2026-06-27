-- Correction for the two preceding revoke migrations: Postgres grants EXECUTE to the
-- PUBLIC pseudo-role by default, and has_function_privilege() resolves the privilege
-- through ANY path — so revoking only from anon/authenticated left EXECUTE intact via
-- PUBLIC. This migration revokes from PUBLIC (the real source), then re-grants to
-- authenticated for the admin-management RPCs that a signed-in super admin must call.
-- Trigger execution does NOT check the caller's EXECUTE privilege (the trigger runs as
-- the function owner), so revoking from PUBLIC does not affect the triggers firing.

-- Pure trigger functions: never called via API at all → revoke from PUBLIC entirely.
revoke execute on function public.ensure_student_card()      from public, anon, authenticated;
revoke execute on function public.org_affiliation_to_lead()  from public, anon, authenticated;
revoke execute on function public.sync_signup_role()         from public, anon, authenticated;
revoke execute on function public.touch_updated_at()         from public, anon, authenticated;

-- Admin-management RPCs: drop the blanket PUBLIC/anon grant, keep authenticated (the
-- super admin's session calls them; they self-guard with is_super_admin() internally).
revoke execute on function public.grant_admin_role(text, boolean) from public, anon;
revoke execute on function public.list_admins()                   from public, anon;
grant  execute on function public.grant_admin_role(text, boolean) to authenticated;
grant  execute on function public.list_admins()                   to authenticated;
