-- ============================================================
-- V2 Schema: XP, saved items, activity log, scholarship tracking
-- ============================================================

-- XP / Level + extra fields
ALTER TABLE student_profiles
  ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS level INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS streak_days INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_active DATE,
  ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS preferred_countries JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS preferred_careers JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS personality_type TEXT,
  ADD COLUMN IF NOT EXISTS strengths JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS weaknesses JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS career_dna_completed BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS dark_mode BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS language_pref TEXT DEFAULT 'ar';

-- Saved items: universities, majors, scholarships, internships
CREATE TABLE IF NOT EXISTS saved_items (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL CHECK (item_type IN ('university','school','vocational','major','scholarship','internship')),
  item_id TEXT NOT NULL,
  item_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, item_type, item_id)
);
CREATE INDEX IF NOT EXISTS idx_saved_user ON saved_items(user_id);
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_saved" ON saved_items;
CREATE POLICY "own_saved" ON saved_items FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Activity log
CREATE TABLE IF NOT EXISTS activity_log (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id TEXT,
  meta JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_activity_user_date ON activity_log(user_id, created_at DESC);
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_activity_read" ON activity_log;
CREATE POLICY "own_activity_read" ON activity_log FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "own_activity_insert" ON activity_log;
CREATE POLICY "own_activity_insert" ON activity_log FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Scholarship applications tracker
CREATE TABLE IF NOT EXISTS scholarship_applications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  scholarship_name TEXT NOT NULL,
  provider TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning','in_progress','submitted','accepted','rejected','expired')),
  deadline DATE,
  progress INTEGER DEFAULT 0,
  documents JSONB DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE scholarship_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_scholarships" ON scholarship_applications;
CREATE POLICY "own_scholarships" ON scholarship_applications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Internship applications tracker
CREATE TABLE IF NOT EXISTS internship_applications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  company TEXT NOT NULL,
  role TEXT,
  status TEXT DEFAULT 'planning' CHECK (status IN ('planning','applied','interview','offer','rejected')),
  applied_at DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE internship_applications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_internships" ON internship_applications;
CREATE POLICY "own_internships" ON internship_applications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Achievements / Badges
CREATE TABLE IF NOT EXISTS user_achievements (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_code TEXT NOT NULL,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, badge_code)
);
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "own_badges" ON user_achievements;
CREATE POLICY "own_badges" ON user_achievements FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'info',
  link TEXT,
  read_at TIMESTAMPTZ,
  scheduled_for TIMESTAMPTZ DEFAULT now(),
  target_audience TEXT DEFAULT 'all',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "read_own_or_broadcast" ON notifications;
CREATE POLICY "read_own_or_broadcast" ON notifications FOR SELECT
  USING (user_id = auth.uid() OR user_id IS NULL);
DROP POLICY IF EXISTS "admin_write_notif" ON notifications;
CREATE POLICY "admin_write_notif" ON notifications FOR ALL
  USING ((auth.jwt() ->> 'email') = 'msharafeddine8@gmail.com')
  WITH CHECK ((auth.jwt() ->> 'email') = 'msharafeddine8@gmail.com');
