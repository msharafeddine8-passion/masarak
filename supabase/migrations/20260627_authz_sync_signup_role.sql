-- S1 hardening: close the privilege-escalation vector for NEW signups.
-- app_metadata is server-only (NOT user-writable); user_metadata IS user-writable.
-- On INSERT into auth.users, if app_metadata.role is unset, stamp it from a TRUSTED
-- decision that only ever yields a self-signup role (student/parent). A user who puts
-- role='admin'/'super_admin'/'org_owner' in user_metadata is forced to 'student'.
-- Privileged roles can only be granted server-side (grant_admin_role RPC / org flow).
create or replace function public.sync_signup_role()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_catalog'
as $function$
begin
  -- بس يعبّي إذا app_metadata.role فاضي، وبس يقبل أدوار التسجيل الذاتي (student/parent)
  if (NEW.raw_app_meta_data ->> 'role') is null then
    NEW.raw_app_meta_data := coalesce(NEW.raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('role',
           case when (NEW.raw_user_meta_data ->> 'role') = 'parent' then 'parent' else 'student' end);
  end if;
  return NEW;
end$function$;

drop trigger if exists trg_sync_signup_role on auth.users;
create trigger trg_sync_signup_role
  before insert on auth.users
  for each row execute function sync_signup_role();
