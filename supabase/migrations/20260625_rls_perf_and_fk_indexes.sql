-- 2026-06-25 — Performance hardening
-- 1) Wrap bare auth.uid()/auth.jwt() in (SELECT ...) so they're evaluated once
--    per query instead of once per row. Applied to 107 policies in public schema.
-- 2) Add 3 missing FK indexes that were causing full scans on cascading deletes.
--
-- This is documentation only — these were applied directly to the remote DB via
-- the Supabase MCP `apply_migration` tool. Kept here for repo-level history.

-- ─── Part 1: RLS wrap (107 policies updated) ───────────────────────────────
-- Implemented as a DO block that iterates pg_policies, drops + recreates each
-- policy with auth.uid() / auth.jwt() wrapped in (SELECT ...).
-- Example transform:
--   BEFORE: (auth.uid() = user_id)
--   AFTER : ((SELECT auth.uid()) = user_id)
--
-- DO $$
-- DECLARE r RECORD; v_new_qual text; v_new_check text; v_create_sql text;
-- BEGIN
--   FOR r IN
--     SELECT schemaname, tablename, policyname, cmd, permissive,
--            array_to_string(roles, ', ') AS roles_csv, qual, with_check
--     FROM pg_policies
--     WHERE schemaname = 'public'
--       AND ((qual ~ 'auth\.(uid|jwt)\(\)' AND qual !~ 'SELECT\s+auth\.')
--         OR (with_check ~ 'auth\.(uid|jwt)\(\)' AND with_check !~ 'SELECT\s+auth\.'))
--   LOOP
--     v_new_qual := CASE WHEN r.qual IS NULL THEN NULL ELSE
--       regexp_replace(regexp_replace(r.qual, 'auth\.uid\(\)', '(SELECT auth.uid())', 'g'),
--                                            'auth\.jwt\(\)', '(SELECT auth.jwt())', 'g') END;
--     v_new_check := CASE WHEN r.with_check IS NULL THEN NULL ELSE
--       regexp_replace(regexp_replace(r.with_check, 'auth\.uid\(\)', '(SELECT auth.uid())', 'g'),
--                                                  'auth\.jwt\(\)', '(SELECT auth.jwt())', 'g') END;
--     EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
--     v_create_sql := format('CREATE POLICY %I ON %I.%I AS %s FOR %s TO %s',
--       r.policyname, r.schemaname, r.tablename, r.permissive, r.cmd, r.roles_csv);
--     IF v_new_qual  IS NOT NULL THEN v_create_sql := v_create_sql || ' USING ('      || v_new_qual  || ')'; END IF;
--     IF v_new_check IS NOT NULL THEN v_create_sql := v_create_sql || ' WITH CHECK (' || v_new_check || ')'; END IF;
--     EXECUTE v_create_sql;
--   END LOOP;
-- END $$;


-- ─── Part 2: Missing FK indexes (3) ────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_fields_of_study_parent_id
  ON public.fields_of_study(parent_id);

CREATE INDEX IF NOT EXISTS idx_scholarship_degree_levels_degree_code
  ON public.scholarship_degree_levels(degree_code);

CREATE INDEX IF NOT EXISTS idx_scholarship_host_countries_country_code
  ON public.scholarship_host_countries(country_code);
