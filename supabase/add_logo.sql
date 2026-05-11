-- ============================================================
-- إضافة عمود logo_url للجامعات والمدارس
-- ============================================================

ALTER TABLE universities ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE schools ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE vocational_institutes ADD COLUMN IF NOT EXISTS logo_url TEXT;

-- ✅ خلصنا
