-- ============================================================
-- Fix: Widen birth_year constraint on student_cards
-- Old: birth_year > 1990 AND birth_year < 2025
-- New: birth_year >= 1965 AND birth_year <= 2013
--
-- Reason: 1990 and earlier years were being rejected, causing
-- save errors for graduates/counselors born before 1991.
-- ============================================================

DO $$
DECLARE
  con_name text;
BEGIN
  -- Find and drop the existing birth_year check constraint
  SELECT conname INTO con_name
  FROM pg_constraint
  WHERE conrelid = 'public.student_cards'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) LIKE '%birth_year%';

  IF con_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE public.student_cards DROP CONSTRAINT ' || quote_ident(con_name);
    RAISE NOTICE 'Dropped constraint: %', con_name;
  ELSE
    RAISE NOTICE 'No birth_year constraint found — skipping drop';
  END IF;
END;
$$;

-- Add new, wider constraint (nullable — no birth year = fine)
ALTER TABLE public.student_cards
  ADD CONSTRAINT student_cards_birth_year_check
    CHECK (birth_year IS NULL OR (birth_year >= 1965 AND birth_year <= 2013));

-- ✅ Done — birth_year now accepts 1965–2013
