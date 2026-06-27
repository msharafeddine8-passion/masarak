-- The admin-management RPCs already guard internally with is_super_admin(), but the
-- anon role has no legitimate reason to reach them. Revoke anon EXECUTE (authenticated
-- is retained so the super admin's dashboard session can still call them).
revoke execute on function public.grant_admin_role(text, boolean) from anon;
revoke execute on function public.list_admins() from anon;
