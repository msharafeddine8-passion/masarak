-- ============================================================
-- Masarak Digital ID System — Phase A
-- Tables: student_cards + student_profile_sections
-- ============================================================
-- Run once in Supabase SQL Editor
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. Auto-generate Masarak ID (MSR-XXXXXX)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION generate_masarak_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  collision BOOLEAN := TRUE;
BEGIN
  WHILE collision LOOP
    new_id := 'MSR-' || LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    -- check uniqueness
    SELECT EXISTS (
      SELECT 1 FROM public.student_cards WHERE masarak_id = new_id
    ) INTO collision;
  END LOOP;
  RETURN new_id;
END;
$$;


-- ─────────────────────────────────────────────────────────────
-- 2. student_cards — card-specific data only
--    All other student data (avatar, country, dna) is
--    joined from student_profiles at render time.
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.student_cards (
  user_id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  masarak_id       TEXT UNIQUE NOT NULL DEFAULT generate_masarak_id(),
  display_name_ar  TEXT,
  display_name_en  TEXT,
  birth_year       INTEGER CHECK (birth_year > 1990 AND birth_year < 2025),
  study_level      TEXT CHECK (study_level IN ('secondary', 'university', 'graduate')),
  card_theme       TEXT NOT NULL DEFAULT 'classic' CHECK (card_theme IN ('classic', 'modern')),
  is_public        BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- auto-update updated_at
CREATE OR REPLACE FUNCTION touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at := NOW(); RETURN NEW; END;
$$;

DROP TRIGGER IF EXISTS student_cards_updated_at ON public.student_cards;
CREATE TRIGGER student_cards_updated_at
  BEFORE UPDATE ON public.student_cards
  FOR EACH ROW EXECUTE FUNCTION touch_updated_at();

-- RLS
ALTER TABLE public.student_cards ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cards — own read"   ON public.student_cards;
DROP POLICY IF EXISTS "cards — public read" ON public.student_cards;
DROP POLICY IF EXISTS "cards — own write"  ON public.student_cards;

-- Owner can read their own card (even if private)
CREATE POLICY "cards — own read"
  ON public.student_cards FOR SELECT
  USING (auth.uid() = user_id);

-- Anyone can read public cards (for /student/[masarak-id] page)
CREATE POLICY "cards — public read"
  ON public.student_cards FOR SELECT
  USING (is_public = TRUE);

-- Owner can insert/update/delete their card
CREATE POLICY "cards — own write"
  ON public.student_cards FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for public profile lookups
CREATE INDEX IF NOT EXISTS student_cards_masarak_id_idx
  ON public.student_cards (masarak_id);

CREATE INDEX IF NOT EXISTS student_cards_public_idx
  ON public.student_cards (masarak_id)
  WHERE is_public = TRUE;


-- ─────────────────────────────────────────────────────────────
-- 3. student_profile_sections — structured sections for PDF
--    (Phase B: PDF generation)
-- ─────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.student_profile_sections (
  id              BIGSERIAL PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_type    TEXT NOT NULL CHECK (
    section_type IN ('education', 'certificate', 'achievement', 'skill', 'language', 'volunteer')
  ),
  title           TEXT NOT NULL,
  subtitle        TEXT,
  date_from       DATE,
  date_to         DATE,
  description     TEXT,
  is_visible_pdf  BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.student_profile_sections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "sections — own read"  ON public.student_profile_sections;
DROP POLICY IF EXISTS "sections — own write" ON public.student_profile_sections;

CREATE POLICY "sections — own read"
  ON public.student_profile_sections FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "sections — own write"
  ON public.student_profile_sections FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Index for ordered fetch
CREATE INDEX IF NOT EXISTS sections_user_order_idx
  ON public.student_profile_sections (user_id, sort_order ASC);


-- ─────────────────────────────────────────────────────────────
-- 4. Auto-create a student_card row when a new user registers
--    (same pattern as ensure_student_profile trigger)
-- ─────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION ensure_student_card()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.student_cards (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS auto_create_student_card ON auth.users;
CREATE TRIGGER auto_create_student_card
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_student_card();


-- ─────────────────────────────────────────────────────────────
-- 5. Back-fill existing users (one-time, safe to re-run)
-- ─────────────────────────────────────────────────────────────

INSERT INTO public.student_cards (user_id)
SELECT id FROM auth.users
ON CONFLICT (user_id) DO NOTHING;


-- ✅ Done — student_cards + student_profile_sections ready
