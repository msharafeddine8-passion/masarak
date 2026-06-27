-- P0 authz spine (increment 1, additive). Centralized super-admin check used to
-- replace the super-admin email hardcoded across ~48 RLS policies + app code.
-- Reads the request JWT only; writes nothing. app_metadata.super_admin is set
-- server-side (not user-writable); the legacy email stays as a fallback until the
-- per-user app_metadata backfill is run (separate, explicitly-authorized step).
create or replace function is_super_admin() returns boolean
language sql stable security definer set search_path = public, pg_catalog as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'super_admin')::boolean, false)
      or coalesce(lower(auth.jwt() ->> 'email') = 'msharafeddine8@gmail.com', false);
$$;

-- NOTE (not run here — requires explicit sign-off, touches auth.users identity):
-- the per-user backfill that actually moves authorization off user-writable
-- user_metadata onto server-only app_metadata:
--
--   update auth.users set raw_app_meta_data =
--       coalesce(raw_app_meta_data,'{}'::jsonb)
--       || jsonb_build_object('role', coalesce(raw_user_meta_data->>'role','student'))
--       || case when lower(email)='msharafeddine8@gmail.com'
--               then '{"super_admin": true}'::jsonb else '{}'::jsonb end;
