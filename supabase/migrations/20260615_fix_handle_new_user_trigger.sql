-- ════════════════════════════════════════════════════════════════════════════
-- Fix handle_new_user() trigger — 15 June 2026
--
-- Problem: original function uses ON CONFLICT (id) DO NOTHING which only
-- protects the PRIMARY KEY. The user_profiles.email column has a UNIQUE
-- constraint; any duplicate email causes an unhandled exception that
-- propagates up and BLOCKS the auth.users INSERT entirely — user creation fails.
--
-- Fix:
--   1. Change ON CONFLICT (id) DO NOTHING → ON CONFLICT DO NOTHING
--      (protects ALL unique constraints — id AND email)
--   2. Add EXCEPTION WHEN OTHERS THEN RETURN NEW
--      (ensures trigger errors NEVER block auth user creation)
-- ════════════════════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, primary_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT DO NOTHING;  -- handles BOTH id (PK) and email (UNIQUE) conflicts
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Safety net: never let a trigger failure block auth user creation.
  -- Log the issue but let the auth insert succeed.
  RAISE WARNING 'handle_new_user: skipped profile insert for %, error: %', NEW.email, SQLERRM;
  RETURN NEW;
END;
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- Done. Run in Supabase SQL Editor.
-- ════════════════════════════════════════════════════════════════════════════
