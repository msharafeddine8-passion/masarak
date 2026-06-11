-- ════════════════════════════════════════════════════════════════════════════
-- مسارك — Growth bundle migration
-- 11 June 2026
-- Adds: slugs (Sprint 2.2), testimonials (3.2), saved_items (4.1), dna_mappings (4.3)
-- Safe to run multiple times — uses IF NOT EXISTS / IF EXISTS guards.
-- ════════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────
-- Sprint 2.2 — Slug columns on entity tables (Latin short codes for URLs).
-- Adds a UNIQUE slug column to each entity table without breaking existing
-- numeric IDs. The Next.js router will accept either /universities/1 (legacy
-- 301 redirected) or /universities/aub (canonical).
-- ──────────────────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS universities    ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE IF EXISTS schools         ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE IF EXISTS scholarships    ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE IF EXISTS majors          ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE IF EXISTS internships     ADD COLUMN IF NOT EXISTS slug text UNIQUE;
ALTER TABLE IF EXISTS careers         ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Pre-seed slugs only for tables that have a `short` column (e.g. universities).
-- Schools don't have `short` in this schema, so we skip them — they can be
-- slugged manually from admin later.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'universities' AND column_name = 'short'
  ) THEN
    UPDATE universities SET slug = lower(short) WHERE slug IS NULL AND short IS NOT NULL;
  END IF;
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'schools' AND column_name = 'short'
  ) THEN
    UPDATE schools SET slug = lower(short) WHERE slug IS NULL AND short IS NOT NULL;
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────────────────
-- Sprint 3.2 — Testimonials table (real student quotes, ordered).
-- Founder uploads via admin dashboard; never seeded with fake data.
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS testimonials (
  id           bigserial PRIMARY KEY,
  name         text NOT NULL,
  image_url    text,                          -- avatar
  school_name  text,                          -- "Grand Lycée Franco-Libanais"
  university_name text,                       -- "AUB", "LAU"...
  body         text NOT NULL,                 -- the quote itself
  display_order int NOT NULL DEFAULT 0,
  is_published boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS testimonials_published_order_idx
  ON testimonials (is_published, display_order);

ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;

-- Public read for published rows only.
DROP POLICY IF EXISTS testimonials_public_read ON testimonials;
CREATE POLICY testimonials_public_read ON testimonials
  FOR SELECT USING (is_published = true);

-- Admin writes only.
DROP POLICY IF EXISTS testimonials_admin_write ON testimonials;
CREATE POLICY testimonials_admin_write ON testimonials
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com'
  ) WITH CHECK (
    auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com'
  );

-- ──────────────────────────────────────────────────────────────────────────
-- Sprint 4.1 — Saved items + compare (retention engine).
-- One row per (user, entity_type, entity_id). Used by "My list" + compare.
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_items (
  id            bigserial PRIMARY KEY,
  user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type   text NOT NULL CHECK (entity_type IN ('university','school','major','scholarship','career','internship','vocational')),
  entity_id     text NOT NULL,                -- stored as text so it works for numeric IDs and future slugs
  notes         text,                         -- optional user note
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS saved_items_user_idx ON saved_items (user_id, created_at DESC);

ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS saved_items_own_select ON saved_items;
CREATE POLICY saved_items_own_select ON saved_items
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS saved_items_own_insert ON saved_items;
CREATE POLICY saved_items_own_insert ON saved_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS saved_items_own_delete ON saved_items;
CREATE POLICY saved_items_own_delete ON saved_items
  FOR DELETE USING (auth.uid() = user_id);

-- ──────────────────────────────────────────────────────────────────────────
-- Sprint 4.3 — DNA → majors/universities mapping (closes the customization loop).
-- For each DNA primary type, list the recommended majors/universities/careers.
-- Used by /career-dna result page to show "your suggested rails".
-- ──────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS dna_mappings (
  id            bigserial PRIMARY KEY,
  dna_type      text NOT NULL,                -- 'I', 'A', 'S', 'C', 'E', 'R' (RIASEC) or our 6-category model
  target_type   text NOT NULL CHECK (target_type IN ('major','university','career','scholarship')),
  target_ref    text NOT NULL,                -- ID/slug of the target
  weight        smallint NOT NULL DEFAULT 1,  -- 1..5, higher = stronger fit
  rationale     text,                         -- human-readable explanation
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (dna_type, target_type, target_ref)
);

CREATE INDEX IF NOT EXISTS dna_mappings_lookup_idx ON dna_mappings (dna_type, target_type, weight DESC);

ALTER TABLE dna_mappings ENABLE ROW LEVEL SECURITY;

-- Public read so signed-out users can see the suggestions preview.
DROP POLICY IF EXISTS dna_mappings_public_read ON dna_mappings;
CREATE POLICY dna_mappings_public_read ON dna_mappings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS dna_mappings_admin_write ON dna_mappings;
CREATE POLICY dna_mappings_admin_write ON dna_mappings
  FOR ALL USING (
    auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com'
  ) WITH CHECK (
    auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com'
  );

-- ──────────────────────────────────────────────────────────────────────────
-- Section 0 — Multi-country `country_code` columns (sets up Saudi/Jordan expansion).
-- Added to ALL entity tables. Defaults to 'LB' so nothing breaks today.
-- ──────────────────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'LB';
ALTER TABLE IF EXISTS schools      ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'LB';
ALTER TABLE IF EXISTS scholarships ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'LB';
ALTER TABLE IF EXISTS majors       ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'LB';
ALTER TABLE IF EXISTS internships  ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'LB';
ALTER TABLE IF EXISTS careers      ADD COLUMN IF NOT EXISTS country_code text NOT NULL DEFAULT 'LB';

-- Scholarships: `country_scope` = array of eligible countries (work order Section 0).
ALTER TABLE IF EXISTS scholarships ADD COLUMN IF NOT EXISTS country_scope text[] NOT NULL DEFAULT ARRAY['LB'];

CREATE INDEX IF NOT EXISTS universities_country_idx ON universities (country_code);
CREATE INDEX IF NOT EXISTS schools_country_idx      ON schools      (country_code);
CREATE INDEX IF NOT EXISTS scholarships_country_idx ON scholarships (country_code);

-- ──────────────────────────────────────────────────────────────────────────
-- Done. After running, the app immediately:
--   • Saves work for save+compare (Sprint 4.1)
--   • Shows testimonials when you publish them (Sprint 3.2)
--   • Shows DNA rails when you seed mappings (Sprint 4.3)
--   • Is ready for slug URLs (Sprint 2.2)
--   • Is ready for Arabic-world multi-country expansion (Section 0)
-- ──────────────────────────────────────────────────────────────────────────
