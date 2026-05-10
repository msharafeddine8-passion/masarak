-- ============================================================
-- إنشاء جداول universities + schools + vocational_programs
-- شغّل هذا SQL في Supabase SQL Editor
-- ============================================================

-- ========== UNIVERSITIES ==========
CREATE TABLE IF NOT EXISTS universities (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  short TEXT,
  emoji TEXT,
  region TEXT,
  type TEXT,
  rank INTEGER,
  tuition_min INTEGER,
  tuition_max INTEGER,
  lang TEXT,
  url TEXT,
  majors JSONB DEFAULT '[]'::jsonb,
  scholarships BOOLEAN DEFAULT false,
  acceptance INTEGER,
  employ_rate INTEGER,
  description TEXT,
  founded INTEGER,
  students INTEGER,
  faculties INTEGER,
  campus TEXT,
  accred TEXT,
  color TEXT,
  paths JSONB DEFAULT '[]'::jsonb,
  photo TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========== SCHOOLS ==========
CREATE TABLE IF NOT EXISTS schools (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  area TEXT,
  type TEXT,
  curriculum JSONB DEFAULT '[]'::jsonb,
  lang TEXT,
  fees_min INTEGER DEFAULT 0,
  fees_max INTEGER DEFAULT 0,
  grades TEXT,
  founded INTEGER,
  students INTEGER,
  rating INTEGER DEFAULT 3,
  features JSONB DEFAULT '[]'::jsonb,
  description TEXT,
  phone TEXT,
  website TEXT,
  emoji TEXT,
  color TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========== VOCATIONAL PROGRAMS ==========
CREATE TABLE IF NOT EXISTS vocational_programs (
  id TEXT PRIMARY KEY,
  code TEXT,
  name TEXT NOT NULL,
  duration TEXT,
  level TEXT,
  sector TEXT,
  description TEXT,
  subjects JSONB DEFAULT '[]'::jsonb,
  salary_lb TEXT,
  salary_gulf TEXT,
  demand TEXT,
  uni_equiv TEXT,
  emoji TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ========== VOCATIONAL INSTITUTES ==========
CREATE TABLE IF NOT EXISTS vocational_institutes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  region TEXT,
  type TEXT,
  specialties JSONB DEFAULT '[]'::jsonb,
  website TEXT,
  emoji TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- RLS Policies — قراءة عامة، كتابة admin فقط
-- ============================================================

ALTER TABLE universities ENABLE ROW LEVEL SECURITY;
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocational_programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vocational_institutes ENABLE ROW LEVEL SECURITY;

-- قراءة عامة لكل الـ entities النشطة
DROP POLICY IF EXISTS "public_read_universities" ON universities;
CREATE POLICY "public_read_universities" ON universities FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "public_read_schools" ON schools;
CREATE POLICY "public_read_schools" ON schools FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "public_read_vocational" ON vocational_programs;
CREATE POLICY "public_read_vocational" ON vocational_programs FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "public_read_institutes" ON vocational_institutes;
CREATE POLICY "public_read_institutes" ON vocational_institutes FOR SELECT USING (is_active = true);

-- كتابة محصورة بالـ admin (إيميل msharafeddine8@gmail.com)
-- يستخدم auth.jwt() لقراءة الإيميل من JWT
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT (auth.jwt() ->> 'email') IN ('msharafeddine8@gmail.com');
$$ LANGUAGE sql STABLE;

DROP POLICY IF EXISTS "admin_write_universities" ON universities;
CREATE POLICY "admin_write_universities" ON universities FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_write_schools" ON schools;
CREATE POLICY "admin_write_schools" ON schools FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_write_vocational" ON vocational_programs;
CREATE POLICY "admin_write_vocational" ON vocational_programs FOR ALL USING (is_admin()) WITH CHECK (is_admin());

DROP POLICY IF EXISTS "admin_write_institutes" ON vocational_institutes;
CREATE POLICY "admin_write_institutes" ON vocational_institutes FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- ============================================================
-- ✅ خلصنا. الجداول جاهزة.
-- يمكنك الآن إضافة بيانات من /admin/dashboard
-- البيانات الموجودة في data.ts ستبقى تشتغل كـ fallback
-- ============================================================
