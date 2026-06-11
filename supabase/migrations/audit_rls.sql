-- ════════════════════════════════════════════════════════════════════════════
-- مسارك — RLS Audit (Sprint 5.1)
-- Run in Supabase SQL Editor. Output is the report — no changes made.
-- ════════════════════════════════════════════════════════════════════════════

-- 1) Tables that do NOT have RLS enabled (CRITICAL: anyone with anon key can read all rows)
SELECT
  '🔴 RLS DISABLED' AS severity,
  schemaname || '.' || tablename AS table_name,
  '  ← anon key can access this table'  AS warning
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = false
ORDER BY tablename;

-- 2) Tables WITH RLS but ZERO policies (CRITICAL: locked out for everyone including the owner)
SELECT
  '🔴 NO POLICIES' AS severity,
  schemaname || '.' || tablename AS table_name,
  '  ← RLS on but no policies = nothing readable' AS warning
FROM pg_tables t
WHERE schemaname = 'public'
  AND rowsecurity = true
  AND NOT EXISTS (
    SELECT 1 FROM pg_policies p
    WHERE p.schemaname = t.schemaname AND p.tablename = t.tablename
  )
ORDER BY tablename;

-- 3) Full policy inventory — review each one
SELECT
  '🟡 POLICY' AS type,
  schemaname || '.' || tablename AS table_name,
  policyname,
  cmd AS for_command,
  roles AS for_roles,
  qual AS using_expression,
  with_check AS check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 4) Permissions check — what can the `anon` role do on each table?
--    Anything beyond SELECT (or what your app actually needs) is suspicious.
SELECT
  '🔵 ANON GRANT' AS type,
  table_name,
  string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE grantee = 'anon'
  AND table_schema = 'public'
GROUP BY table_name
ORDER BY table_name;

-- ════════════════════════════════════════════════════════════════════════════
-- How to read the output:
--   🔴 = critical — fix before going to production
--   🟡 = review — make sure the USING / WITH CHECK expression matches intent
--   🔵 = info — what the anon (browser) role has access to
-- ════════════════════════════════════════════════════════════════════════════
