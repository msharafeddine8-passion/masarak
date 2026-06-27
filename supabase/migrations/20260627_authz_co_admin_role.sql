-- Co-admin tier: a helper admin the super admin can add, with all access EXCEPT
-- finance (subscriptions/revenue/sponsors) + subscriber private data (students).
-- is_admin() = super_admin OR app_metadata.role='admin' (server-only, not user-writable).
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public, pg_catalog as $$
  select is_super_admin()
      or coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false);
$$;

-- Super-admin-only: grant/revoke the co-admin role on a user by email. Writes
-- app_metadata.role (server-only). The is_super_admin() guard means a co-admin
-- can NEVER promote themselves or anyone else.
create or replace function grant_admin_role(p_email text, p_grant boolean) returns jsonb
language plpgsql security definer set search_path = public, pg_catalog as $$
declare v_uid uuid;
begin
  if not is_super_admin() then return jsonb_build_object('ok',false,'error','forbidden'); end if;
  select id into v_uid from auth.users where lower(email)=lower(p_email) limit 1;
  if v_uid is null then return jsonb_build_object('ok',false,'error','user_not_found'); end if;
  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data,'{}'::jsonb)
         || jsonb_build_object('role', case when p_grant then 'admin' else 'student' end)
   where id = v_uid;
  return jsonb_build_object('ok',true,'granted',p_grant,'email',p_email);
end; $$;

-- Super-admin-only: list current admins (super + co-admins) for the management UI.
create or replace function list_admins() returns table(email text, role text)
language sql stable security definer set search_path = public, pg_catalog as $$
  select u.email::text,
         case when u.raw_app_meta_data->>'super_admin' = 'true' then 'super_admin'
              else coalesce(u.raw_app_meta_data->>'role','admin') end
  from auth.users u
  where is_super_admin()
    and (u.raw_app_meta_data->>'role' = 'admin' or u.raw_app_meta_data->>'super_admin' = 'true');
$$;

-- NOTE: app-layer hides finance/PII tabs from co-admins; full data enforcement
-- needs the RLS to tier non-sensitive admin policies onto is_admin() while keeping
-- finance + subscriber-PII tables on is_super_admin() (see ADMIN_ARCHITECTURE_AUDIT.md).
