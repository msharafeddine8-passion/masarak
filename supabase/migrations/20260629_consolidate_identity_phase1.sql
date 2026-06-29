-- ============================================================================
-- IDENTITY CONSOLIDATION — Phase 1: fix the drift engine + backfill
-- ----------------------------------------------------------------------------
-- Root cause found 2026-06-29: user_profiles (the canonical identity table)
-- stopped getting rows for new signups — 5 of 39 auth users had no user_profiles
-- row. handle_new_user inserts it but swallows errors (EXCEPTION WHEN OTHERS),
-- and user_profiles.email was NOT NULL, so any signup with no email at trigger
-- time silently produced NO identity row → the 3-table fragmentation.
--
-- This migration is SAFE: one constraint RELAXATION + one idempotent backfill.
-- Dry-run on production confirmed it inserts exactly the 5 missing rows, all with
-- valid email/full_name/primary_role, zero conflicts. Re-running is a no-op.
-- ============================================================================

-- 1. Don't let a missing email break identity creation ever again.
alter table public.user_profiles alter column email drop not null;

-- 2. Backfill a user_profiles row for every auth user that lacks one.
insert into public.user_profiles (id, email, full_name, primary_role)
select au.id,
       au.email,
       coalesce(p.full_name, au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name'),
       coalesce(au.raw_app_meta_data->>'role', p.role, 'student')
from auth.users au
left join public.profiles p on p.id = au.id
where not exists (select 1 from public.user_profiles u where u.id = au.id)
on conflict (id) do nothing;

-- After this, user_profiles is the complete canonical identity (all auth users).
-- Phase 2 (separate, code-side): repoint reads from `profiles` → `user_profiles`
-- and retire profiles once nothing reads it. Not done here to avoid coupling a
-- data migration with a code change.
