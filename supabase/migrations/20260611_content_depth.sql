-- ════════════════════════════════════════════════════════════════════════════
-- مسارك — Content Depth Migration
-- 11 June 2026
-- Adds: deep columns + 6 new tables for university/major/career detail content,
-- glossary, student stories, and update audit log.
-- Safe to run multiple times (all ALTER/CREATE use IF NOT EXISTS).
-- Rollback included at the bottom (commented out).
-- ════════════════════════════════════════════════════════════════════════════

-- ──────────────────────────────────────────────────────────────────────────
-- 1. UNIVERSITIES — depth columns
-- ──────────────────────────────────────────────────────────────────────────
-- Fees
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS tuition_per_credit_usd      integer;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS tuition_per_year_usd        integer;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS tuition_per_year_lbp        bigint;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS registration_fee_usd        integer;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS other_fees_usd              integer;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS has_installment_plan        boolean DEFAULT false;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS installment_details         text;

-- Admission
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS acceptance_rate_percent     integer;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS min_gpa_required            decimal(3,2);
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS ielts_min                   decimal(3,1);
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS toefl_min                   integer;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS sat_min                     integer;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS accepts_conditional         boolean DEFAULT false;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS application_open_date       text;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS application_deadline_fall   text;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS application_deadline_spring text;

-- Campus
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS campus_city                 text;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS campus_area_sqm             integer;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS has_dorms                   boolean DEFAULT false;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS dorm_cost_per_year_usd      integer;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS has_cafeteria               boolean DEFAULT true;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS has_library_24h             boolean DEFAULT false;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS has_parking                 boolean DEFAULT false;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS transport_from_tripoli      text;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS transport_from_beirut       text;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS google_maps_url             text;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS geo_lat                     decimal(9,6);
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS geo_lng                     decimal(9,6);

-- Quality
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS graduation_rate_4yr_percent integer;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS employment_rate_6mo_percent integer;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS avg_salary_after_1yr_usd    integer;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS student_faculty_ratio       text;

-- Rich content
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS student_life_description    text;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS strengths                   text[];
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS ideal_student_profile       text;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS campus_vibe                 text;
ALTER TABLE IF EXISTS universities ADD COLUMN IF NOT EXISTS last_verified_at            timestamptz DEFAULT now();

-- ──────────────────────────────────────────────────────────────────────────
-- 2. MAJORS — depth columns
-- ──────────────────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS description_detailed       text;
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS duration_years             integer DEFAULT 4;
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS has_mandatory_internship   boolean DEFAULT false;
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS internship_duration_months integer;
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS has_coop                   boolean DEFAULT false;
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS language_of_instruction    text DEFAULT 'عربي/إنجليزي';
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS first_year_courses         text[];
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS admission_requirements     text;
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS career_paths               text[];
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS avg_salary_lebanon_usd     integer;
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS avg_salary_gulf_usd        integer;
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS demand_in_lebanon          text;
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS demand_in_gulf             text;
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS is_accredited_abroad       boolean DEFAULT false;
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS related_certifications     text[];
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS common_misconception       text;
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS ideal_student_traits       text;
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS worst_student_traits       text;
ALTER TABLE IF EXISTS majors ADD COLUMN IF NOT EXISTS last_verified_at           timestamptz DEFAULT now();

-- ──────────────────────────────────────────────────────────────────────────
-- 3. CAREERS — depth columns
-- ──────────────────────────────────────────────────────────────────────────
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS description_detailed       text;
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS a_day_in_life              text;
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS required_skills            text[];
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS soft_skills                text[];
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS salary_entry_lebanon_usd   integer;
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS salary_senior_lebanon_usd  integer;
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS salary_entry_gulf_usd      integer;
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS salary_senior_gulf_usd     integer;
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS salary_remote_usd          integer;
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS demand_5yr_outlook         text;
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS top_employers_lebanon      text[];
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS top_employers_gulf         text[];
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS related_majors             text[];
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS entry_certifications       text[];
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS work_life_balance          text;
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS remote_work_potential      text;
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS ai_impact                  text;
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS realistic_expectations     text;
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS last_verified_at           timestamptz DEFAULT now();
ALTER TABLE IF EXISTS careers ADD COLUMN IF NOT EXISTS slug                       text UNIQUE;

-- ──────────────────────────────────────────────────────────────────────────
-- 4. NEW TABLES
-- ──────────────────────────────────────────────────────────────────────────

-- University FAQs
CREATE TABLE IF NOT EXISTS university_faqs (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id integer NOT NULL,
  question      text NOT NULL,
  answer        text NOT NULL,
  category      text DEFAULT 'general',  -- general, admission, fees, campus, academic
  display_order integer DEFAULT 0,
  country_code  char(2) DEFAULT 'LB',
  created_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_uni_faqs_university ON university_faqs(university_id, display_order);

ALTER TABLE university_faqs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS uni_faqs_public_read ON university_faqs;
CREATE POLICY uni_faqs_public_read ON university_faqs FOR SELECT USING (true);
DROP POLICY IF EXISTS uni_faqs_admin_write ON university_faqs;
CREATE POLICY uni_faqs_admin_write ON university_faqs FOR ALL
  USING (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

-- University Testimonials (renamed to avoid collision with general testimonials)
CREATE TABLE IF NOT EXISTS university_testimonials (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id   integer NOT NULL,
  student_name    text NOT NULL,
  major           text NOT NULL,
  graduation_year integer,
  content         text NOT NULL,
  rating          smallint CHECK (rating BETWEEN 1 AND 5),
  pros            text,
  cons            text,
  is_verified     boolean DEFAULT false,
  display_order   integer DEFAULT 0,
  country_code    char(2) DEFAULT 'LB',
  created_at      timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_uni_test_university ON university_testimonials(university_id, display_order);

ALTER TABLE university_testimonials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS uni_test_public_read ON university_testimonials;
CREATE POLICY uni_test_public_read ON university_testimonials FOR SELECT USING (true);
DROP POLICY IF EXISTS uni_test_admin_write ON university_testimonials;
CREATE POLICY uni_test_admin_write ON university_testimonials FOR ALL
  USING (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

-- Major × University offerings (the actual program tuition + accreditation per uni)
CREATE TABLE IF NOT EXISTS major_university_offerings (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id          integer NOT NULL,
  major_id               integer NOT NULL,
  tuition_this_major_usd integer,
  accreditation          text,
  program_url            text,
  notes                  text,
  country_code           char(2) DEFAULT 'LB',
  created_at             timestamptz DEFAULT now(),
  UNIQUE(university_id, major_id)
);
CREATE INDEX IF NOT EXISTS idx_mu_offerings_uni   ON major_university_offerings(university_id);
CREATE INDEX IF NOT EXISTS idx_mu_offerings_major ON major_university_offerings(major_id);

ALTER TABLE major_university_offerings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS mu_offerings_public_read ON major_university_offerings;
CREATE POLICY mu_offerings_public_read ON major_university_offerings FOR SELECT USING (true);
DROP POLICY IF EXISTS mu_offerings_admin_write ON major_university_offerings;
CREATE POLICY mu_offerings_admin_write ON major_university_offerings FOR ALL
  USING (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

-- Glossary (university terminology dictionary)
CREATE TABLE IF NOT EXISTS glossary (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  term_en       text NOT NULL,
  term_ar       text NOT NULL,
  definition_ar text NOT NULL,
  example_ar    text,
  category      text DEFAULT 'general', -- academic, financial, admission, career, tools
  related_terms text[],
  display_order integer DEFAULT 0,
  country_code  char(2) DEFAULT 'LB',
  created_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_glossary_category ON glossary(category, display_order);
CREATE INDEX IF NOT EXISTS idx_glossary_term_en  ON glossary(lower(term_en));

ALTER TABLE glossary ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS glossary_public_read ON glossary;
CREATE POLICY glossary_public_read ON glossary FOR SELECT USING (true);
DROP POLICY IF EXISTS glossary_admin_write ON glossary;
CREATE POLICY glossary_admin_write ON glossary FOR ALL
  USING (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

-- Student Stories (day-in-life)
CREATE TABLE IF NOT EXISTS student_stories (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id   integer,
  major_id        integer,
  student_name    text NOT NULL,
  year_of_study   text NOT NULL,
  title           text NOT NULL,
  morning_routine text NOT NULL,
  academic_life   text NOT NULL,
  social_life     text NOT NULL,
  challenges      text NOT NULL,
  advice          text NOT NULL,
  pros            text[],
  cons            text[],
  thumbnail_emoji text DEFAULT '🎓',
  is_published    boolean DEFAULT false,
  country_code    char(2) DEFAULT 'LB',
  created_at      timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_stories_uni       ON student_stories(university_id, is_published);
CREATE INDEX IF NOT EXISTS idx_stories_published ON student_stories(is_published, created_at DESC);

ALTER TABLE student_stories ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS stories_public_read ON student_stories;
CREATE POLICY stories_public_read ON student_stories FOR SELECT USING (is_published = true);
DROP POLICY IF EXISTS stories_admin_write ON student_stories;
CREATE POLICY stories_admin_write ON student_stories FOR ALL
  USING (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

-- Data Update Log (audit who changed what)
CREATE TABLE IF NOT EXISTS data_update_log (
  id           bigserial PRIMARY KEY,
  table_name   text NOT NULL,
  row_id       text NOT NULL,
  changed_by   text NOT NULL,         -- email or 'system'
  change_note  text,                  -- "Updated AUB tuition for fall 2026"
  changed_at   timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_dul_table ON data_update_log(table_name, changed_at DESC);

ALTER TABLE data_update_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dul_admin_read ON data_update_log;
CREATE POLICY dul_admin_read ON data_update_log FOR SELECT
  USING (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');
DROP POLICY IF EXISTS dul_admin_write ON data_update_log;
CREATE POLICY dul_admin_write ON data_update_log FOR INSERT
  WITH CHECK (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

-- ════════════════════════════════════════════════════════════════════════════
-- Done. Next file: seed_content.sql with the actual data.
-- ROLLBACK (uncomment if needed):
--   DROP TABLE IF EXISTS data_update_log;
--   DROP TABLE IF EXISTS student_stories;
--   DROP TABLE IF EXISTS glossary;
--   DROP TABLE IF EXISTS major_university_offerings;
--   DROP TABLE IF EXISTS university_testimonials;
--   DROP TABLE IF EXISTS university_faqs;
--   (columns added with ALTER ADD can be DROP-ed individually if needed)
-- ════════════════════════════════════════════════════════════════════════════
