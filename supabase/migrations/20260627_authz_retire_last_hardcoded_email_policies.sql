-- Final S2 cleanup: the last 2 RLS policies still pinned to the hardcoded super
-- admin email. Retire the literal email in favour of the authz functions.
--   universities_global → is_admin()  (public content; co-admins may manage it)
--   team_members        → is_super_admin()  (internal staff list; super-admin only)
-- After this migration, zero RLS policies reference the hardcoded email; all admin
-- gating flows through is_super_admin() / is_admin() (see ADMIN_ARCHITECTURE_AUDIT.md).

alter policy uni_g_admin on public.universities_global
  using (is_admin())
  with check (is_admin());

alter policy team_members_admin_all on public.team_members
  using (is_super_admin())
  with check (is_super_admin());
