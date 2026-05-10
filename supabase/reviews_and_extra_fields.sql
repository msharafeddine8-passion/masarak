-- ============================================================
-- جدول التقييمات + حقول إضافية للجامعات/المدارس/المهنيات
-- ============================================================

-- ========== STEP 1: حقول إضافية لكل entity ==========
ALTER TABLE universities
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS application_deadline TEXT,
  ADD COLUMN IF NOT EXISTS requirements TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS application_deadline TEXT,
  ADD COLUMN IF NOT EXISTS requirements TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE vocational_programs
  ADD COLUMN IF NOT EXISTS requirements TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE vocational_institutes
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

-- ========== STEP 2: جدول التقييمات ==========
CREATE TABLE IF NOT EXISTS entity_reviews (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('university', 'school', 'vocational', 'institute')),
  entity_id TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text TEXT NOT NULL,
  status_year TEXT,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_reviews_entity ON entity_reviews(entity_type, entity_id) WHERE is_visible = true;

-- ========== STEP 3: RLS for reviews ==========
ALTER TABLE entity_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_reviews" ON entity_reviews;
CREATE POLICY "public_read_reviews" ON entity_reviews FOR SELECT USING (is_visible = true);

DROP POLICY IF EXISTS "user_insert_own_review" ON entity_reviews;
CREATE POLICY "user_insert_own_review" ON entity_reviews FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_update_own_review" ON entity_reviews;
CREATE POLICY "user_update_own_review" ON entity_reviews FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "user_delete_own_review" ON entity_reviews;
CREATE POLICY "user_delete_own_review" ON entity_reviews FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- ✅ خلصنا
-- ============================================================
