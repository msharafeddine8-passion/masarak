-- ============================================================
-- توسيع جدول student_profiles بأعمدة جديدة
-- شغّل هذا SQL في Supabase SQL Editor مرة وحدة فقط
-- ============================================================

-- إضافة الأعمدة الجديدة (IF NOT EXISTS لو ضفتهن من قبل)
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS bio TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS country TEXT DEFAULT 'LB',
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS gender TEXT,

  -- بيانات الدراسة
  ADD COLUMN IF NOT EXISTS school_name TEXT,
  ADD COLUMN IF NOT EXISTS grade_level TEXT,
  ADD COLUMN IF NOT EXISTS graduation_year INTEGER,
  ADD COLUMN IF NOT EXISTS bac_section TEXT,
  ADD COLUMN IF NOT EXISTS bac_grade NUMERIC(5,2),

  -- العلامات والمعدلات (JSON: مادة → علامة)
  ADD COLUMN IF NOT EXISTS grades JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS overall_gpa NUMERIC(4,2),

  -- الإنجازات والتدريبات
  ADD COLUMN IF NOT EXISTS achievements JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS certificates JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS courses JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS internships JSONB DEFAULT '[]'::jsonb,

  -- التطوع
  ADD COLUMN IF NOT EXISTS volunteer_hours INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS volunteer_activities JSONB DEFAULT '[]'::jsonb,

  -- المهارات واللغات
  ADD COLUMN IF NOT EXISTS skills JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS languages JSONB DEFAULT '[]'::jsonb,

  -- الاهتمامات والأهداف
  ADD COLUMN IF NOT EXISTS interests JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS preferred_majors JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS preferred_universities JSONB DEFAULT '[]'::jsonb,

  -- روابط اجتماعية
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb,

  -- نسبة اكتمال الملف
  ADD COLUMN IF NOT EXISTS profile_completion INTEGER DEFAULT 0;


-- ============================================================
-- RLS Policies — تأكّد إنه كل مستخدم يقدر يقرأ ويعدّل صفّه فقط
-- (شغّلها فقط لو ما عندك policies من قبل)
-- ============================================================

-- فعّل RLS لو مش مفعّل
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;

-- احذف الـ policies القديمة (لو موجودة) وأعد إنشاءها
DROP POLICY IF EXISTS "users_read_own_profile" ON student_profiles;
DROP POLICY IF EXISTS "users_update_own_profile" ON student_profiles;
DROP POLICY IF EXISTS "users_insert_own_profile" ON student_profiles;

-- كل مستخدم يقرأ صفّه فقط
CREATE POLICY "users_read_own_profile"
  ON student_profiles FOR SELECT
  USING (auth.uid() = user_id);

-- كل مستخدم يعدّل صفّه فقط
CREATE POLICY "users_update_own_profile"
  ON student_profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- كل مستخدم يضيف صفّ خاص فيه فقط
CREATE POLICY "users_insert_own_profile"
  ON student_profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================================
-- Trigger ينشئ صف تلقائي لما المستخدم يسجّل
-- ============================================================

CREATE OR REPLACE FUNCTION ensure_student_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO student_profiles (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS auto_create_student_profile ON auth.users;
CREATE TRIGGER auto_create_student_profile
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION ensure_student_profile();


-- ============================================================
-- ✅ خلاص! دلوقت جدول student_profiles فيه كل الأعمدة الجديدة
-- ============================================================
