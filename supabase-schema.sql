-- ========================================
-- MASARAK DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ========================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ────────────────────────────────
CREATE TABLE public.profiles (
  id            UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email         TEXT UNIQUE NOT NULL,
  full_name     TEXT,
  avatar_url    TEXT,
  role          TEXT DEFAULT 'student' CHECK (role IN ('student','parent','school_admin','university_admin','counselor','super_admin')),
  phone         TEXT,
  location      TEXT DEFAULT 'Lebanon',
  bio           TEXT,
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── STUDENT PROFILES ──────────────────────
CREATE TABLE public.student_profiles (
  id                  UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id             UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  school_name         TEXT,
  school_type         TEXT CHECK (school_type IN ('public','private','vocational','international')),
  grade_level         TEXT,
  gpa                 DECIMAL(4,2),
  graduation_year     INTEGER,
  university_name     TEXT,
  major               TEXT,
  university_year     INTEGER,
  preferred_majors    TEXT[],
  target_university   TEXT,
  languages           TEXT[],
  profile_completion  INTEGER DEFAULT 0,
  xp_points           INTEGER DEFAULT 0,
  streak_days         INTEGER DEFAULT 0,
  last_active         TIMESTAMPTZ DEFAULT NOW(),
  is_profile_public   BOOLEAN DEFAULT false,
  public_slug         TEXT UNIQUE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- ── PORTFOLIO ITEMS ───────────────────────
CREATE TABLE public.portfolio_items (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type         TEXT NOT NULL CHECK (type IN ('certificate','volunteer','training','internship','award','project','activity','other')),
  title        TEXT NOT NULL,
  organization TEXT,
  description  TEXT,
  start_date   DATE,
  end_date     DATE,
  is_current   BOOLEAN DEFAULT false,
  file_url     TEXT,
  link_url     TEXT,
  verified     BOOLEAN DEFAULT false,
  xp_earned    INTEGER DEFAULT 50,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── INSTITUTIONS ──────────────────────────
CREATE TABLE public.institutions (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name_ar      TEXT NOT NULL,
  name_en      TEXT,
  type         TEXT CHECK (type IN ('public_school','private_school','vocational','university','ngo')),
  location     TEXT,
  governorate  TEXT,
  website      TEXT,
  logo_url     TEXT,
  description  TEXT,
  phone        TEXT,
  email        TEXT,
  is_verified  BOOLEAN DEFAULT false,
  is_partner   BOOLEAN DEFAULT false,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── SCHOLARSHIPS ──────────────────────────
CREATE TABLE public.scholarships (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title             TEXT NOT NULL,
  provider          TEXT NOT NULL,
  type              TEXT CHECK (type IN ('full','partial','merit','need_based','sports','arts')),
  description       TEXT,
  amount            TEXT,
  currency          TEXT DEFAULT 'USD',
  deadline          DATE,
  eligibility       TEXT,
  required_gpa      DECIMAL(4,2),
  majors            TEXT[],
  countries         TEXT[],
  link_url          TEXT,
  is_active         BOOLEAN DEFAULT true,
  is_featured       BOOLEAN DEFAULT false,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── CAREER ASSESSMENTS ────────────────────
CREATE TABLE public.career_assessments (
  id              UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id         UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  riasec_scores   JSONB,
  top_types       TEXT[],
  recommended_majors TEXT[],
  recommended_careers TEXT[],
  taken_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ── GAMIFICATION ──────────────────────────
CREATE TABLE public.badges (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name         TEXT NOT NULL,
  name_ar      TEXT,
  description  TEXT,
  emoji        TEXT,
  xp_required  INTEGER DEFAULT 0,
  condition    TEXT,
  rarity       TEXT DEFAULT 'common' CHECK (rarity IN ('common','rare','epic','legendary'))
);

CREATE TABLE public.user_badges (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  badge_id   UUID REFERENCES public.badges(id),
  earned_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- ── ROW LEVEL SECURITY ────────────────────
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can manage own student profile" ON public.student_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own portfolio" ON public.portfolio_items FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own assessments" ON public.career_assessments FOR ALL USING (auth.uid() = user_id);

-- Public read for institutions and scholarships
CREATE POLICY "Anyone can read institutions" ON public.institutions FOR SELECT USING (true);
CREATE POLICY "Anyone can read scholarships" ON public.scholarships FOR SELECT USING (true);
CREATE POLICY "Anyone can read badges" ON public.badges FOR SELECT USING (true);

ALTER TABLE public.institutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scholarships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own badges" ON public.user_badges FOR ALL USING (auth.uid() = user_id);

-- ── AUTO-CREATE PROFILE ON SIGNUP ─────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── SAMPLE DATA ───────────────────────────
INSERT INTO public.badges (name, name_ar, description, emoji, xp_required, rarity) VALUES
  ('first_step',   'بداية الرحلة',   'أنشأت حسابك على مسارك',      '🌟', 0,   'common'),
  ('profile_50',   'نصف الطريق',     'أكملت 50% من ملفك الشخصي',   '🔥', 100, 'common'),
  ('profile_100',  'الملف الكامل',   'أكملت ملفك الشخصي 100%',     '🏆', 300, 'rare'),
  ('career_dna',   'أعرف نفسي',      'أكملت اختبار Career DNA',     '🎯', 150, 'rare'),
  ('first_cert',   'شهادة أولى',     'أضفت أول شهادة لملفك',       '📜', 50,  'common'),
  ('streak_7',     'أسبوع متواصل',   '7 أيام متتالية على المنصة',   '🔥', 200, 'rare'),
  ('scholarship',  'صياد المنح',     'قدّمت على منحة دراسية',       '💎', 400, 'epic');

SELECT 'Masarak database ready!' as status;
