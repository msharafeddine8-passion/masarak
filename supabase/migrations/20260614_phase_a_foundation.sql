-- ════════════════════════════════════════════════════════════════════════════
-- مسارك — Phase A: Foundation Migration (per ARCHITECTURE.md)
-- 14 June 2026
-- Builds:
--   1. user_profiles                    — canonical identity (one row per auth user)
--   2. notifications                    — in-app inbox
--   3. notification_preferences         — per-user channel prefs
--   4. notification_rules               — event → audience → template
--   5. org_leads                        — institution CRM pipeline
--   6. org_messages                     — direct messaging between org and student
--   7. event_listeners table            — auditable registry of what listens to what
--   8. Helper RPCs: notification counter, mark-read, etc.
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 1. user_profiles — the canonical identity table
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_profiles (
  id              uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text UNIQUE NOT NULL,
  full_name       text,
  avatar_url      text,
  phone           text,
  country_code    text DEFAULT 'LB',
  preferred_lang  text DEFAULT 'ar',
  timezone        text DEFAULT 'Asia/Beirut',
  primary_role    text NOT NULL DEFAULT 'student',   -- 'student' | 'parent' | 'org_owner' | 'sponsor' | 'super_admin'
  active_role     text,                              -- which role the user is currently in
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  last_seen_at    timestamptz,
  is_active       boolean DEFAULT true
);

CREATE INDEX IF NOT EXISTS idx_up_role  ON user_profiles (primary_role);
CREATE INDEX IF NOT EXISTS idx_up_email ON user_profiles (lower(email));

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS up_read_self ON user_profiles;
CREATE POLICY up_read_self ON user_profiles FOR SELECT
  USING (auth.uid() = id OR auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

DROP POLICY IF EXISTS up_write_self ON user_profiles;
CREATE POLICY up_write_self ON user_profiles FOR UPDATE
  USING (auth.uid() = id OR auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com')
  WITH CHECK (auth.uid() = id OR auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

DROP POLICY IF EXISTS up_insert_self ON user_profiles;
CREATE POLICY up_insert_self ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Backfill from existing auth.users (idempotent)
INSERT INTO user_profiles (id, email, full_name)
SELECT u.id, u.email,
       COALESCE(u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', NULL)
FROM auth.users u
ON CONFLICT (id) DO NOTHING;

-- Auto-create profile on new auth.users via trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO user_profiles (id, email, full_name, primary_role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ────────────────────────────────────────────────────────────────────────────
-- 2. notifications — user inbox
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id           bigserial PRIMARY KEY,
  user_id      uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type         text NOT NULL,                       -- 'scholarship.deadline_3d' | 'org.new_lead' | etc.
  title        text NOT NULL,
  body         text,
  link_url     text,
  entity_type  text,
  entity_id    text,
  channel      text NOT NULL DEFAULT 'in_app',      -- 'in_app' | 'email' | 'push' | 'sms' | 'whatsapp'
  severity     text NOT NULL DEFAULT 'info',        -- 'info' | 'success' | 'warn' | 'urgent'
  read_at      timestamptz,
  acted_at     timestamptz,
  metadata     jsonb DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notif_user_unread ON notifications (user_id, read_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notif_type        ON notifications (type, created_at DESC);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS notif_own_read ON notifications;
CREATE POLICY notif_own_read ON notifications FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

DROP POLICY IF EXISTS notif_own_update ON notifications;
CREATE POLICY notif_own_update ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- System can insert (server-side via service role or via SECURITY DEFINER RPCs)
DROP POLICY IF EXISTS notif_admin_insert ON notifications;
CREATE POLICY notif_admin_insert ON notifications FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com'
    OR auth.uid() IS NOT NULL  -- any authenticated user (for "you sent a message" type)
  );

-- ────────────────────────────────────────────────────────────────────────────
-- 3. notification_preferences
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  channels_by_type   jsonb DEFAULT '{}'::jsonb,         -- { "scholarship.deadline_3d": ["in_app","email"] }
  global_mute        boolean DEFAULT false,
  quiet_hours_start  time DEFAULT '22:00',
  quiet_hours_end    time DEFAULT '08:00',
  updated_at         timestamptz DEFAULT now()
);

ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS np_own ON notification_preferences;
CREATE POLICY np_own ON notification_preferences FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 4. notification_rules — automated dispatch rules
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notification_rules (
  id          bigserial PRIMARY KEY,
  trigger     text NOT NULL,             -- event name (e.g. 'student.saved_university') OR cron pattern
  audience    text NOT NULL,             -- 'self' | 'role:student' | 'saved:university:{id}' | 'parents_of:user:{id}'
  template    jsonb NOT NULL,            -- { "title": "...", "body_md": "..." }
  channels    text[] DEFAULT ARRAY['in_app'],
  is_active   boolean DEFAULT true,
  priority    integer DEFAULT 100,
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nr_trigger ON notification_rules (trigger, is_active);

ALTER TABLE notification_rules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS nr_admin_all ON notification_rules;
CREATE POLICY nr_admin_all ON notification_rules FOR ALL
  USING (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

DROP POLICY IF EXISTS nr_read_all ON notification_rules;
CREATE POLICY nr_read_all ON notification_rules FOR SELECT
  USING (is_active = true);

-- Seed a couple of default rules (idempotent)
INSERT INTO notification_rules (trigger, audience, template, channels, priority)
SELECT 'student.saved_university', 'org_owners_of:university:{entity_id}',
       jsonb_build_object('title', 'طالب جديد مهتم بمؤسستك',
                          'body_md', 'حفظ صفحتك طالب جديد. تابع لتعرف المزيد.'),
       ARRAY['in_app'], 50
WHERE NOT EXISTS (SELECT 1 FROM notification_rules WHERE trigger = 'student.saved_university');

INSERT INTO notification_rules (trigger, audience, template, channels, priority)
SELECT 'student.registered', 'self',
       jsonb_build_object('title', 'أهلاً وسهلاً بك على مسارك! 🎉',
                          'body_md', 'ابدأ رحلتك باختبار Career DNA لاكتشاف ميولك المهنية.'),
       ARRAY['in_app'], 100
WHERE NOT EXISTS (SELECT 1 FROM notification_rules WHERE trigger = 'student.registered');

-- ────────────────────────────────────────────────────────────────────────────
-- 5. org_leads — institution CRM
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS org_leads (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id                uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  student_id            uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source                text NOT NULL,        -- 'save' | 'event_register' | 'message' | 'cv_apply' | 'manual'
  status                text NOT NULL DEFAULT 'new',  -- 'new' | 'contacted' | 'engaged' | 'applied' | 'enrolled' | 'lost'
  score                 int DEFAULT 0,                -- 0-100
  first_interaction_at  timestamptz DEFAULT now(),
  last_interaction_at   timestamptz DEFAULT now(),
  assigned_to           text,                          -- email of org member handling
  notes                 text,
  metadata              jsonb DEFAULT '{}'::jsonb,
  UNIQUE (org_id, student_id)
);

CREATE INDEX IF NOT EXISTS idx_leads_org_status ON org_leads (org_id, status, score DESC);
CREATE INDEX IF NOT EXISTS idx_leads_student    ON org_leads (student_id);
CREATE INDEX IF NOT EXISTS idx_leads_recency    ON org_leads (org_id, last_interaction_at DESC);

ALTER TABLE org_leads ENABLE ROW LEVEL SECURITY;

-- Org members can see their org's leads
DROP POLICY IF EXISTS leads_org_read ON org_leads;
CREATE POLICY leads_org_read ON org_leads FOR SELECT
  USING (
    auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com'
    OR EXISTS (
      SELECT 1 FROM org_members
      WHERE org_members.org_id = org_leads.org_id
        AND org_members.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS leads_org_write ON org_leads;
CREATE POLICY leads_org_write ON org_leads FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM org_members WHERE org_id = org_leads.org_id AND user_id = auth.uid())
  );

-- Anyone authenticated can INSERT (triggered by events server-side)
DROP POLICY IF EXISTS leads_insert ON org_leads;
CREATE POLICY leads_insert ON org_leads FOR INSERT
  WITH CHECK (true);

-- ────────────────────────────────────────────────────────────────────────────
-- 6. org_messages — threaded messaging between org and student
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS org_messages (
  id            bigserial PRIMARY KEY,
  org_id        uuid NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  thread_key    text NOT NULL,             -- 'org:{org_id}:student:{student_id}'
  sender_type   text NOT NULL,             -- 'org' | 'student'
  sender_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recipient_id  uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body          text NOT NULL,
  read_at       timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_msg_thread ON org_messages (thread_key, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_msg_unread ON org_messages (recipient_id, read_at) WHERE read_at IS NULL;

ALTER TABLE org_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS msg_participants_read ON org_messages;
CREATE POLICY msg_participants_read ON org_messages FOR SELECT
  USING (
    auth.uid() = sender_id
    OR auth.uid() = recipient_id
    OR EXISTS (SELECT 1 FROM org_members WHERE org_id = org_messages.org_id AND user_id = auth.uid())
    OR auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com'
  );

DROP POLICY IF EXISTS msg_insert ON org_messages;
CREATE POLICY msg_insert ON org_messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id);

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Helper RPCs
-- ────────────────────────────────────────────────────────────────────────────

-- Count unread notifications for the current user
CREATE OR REPLACE FUNCTION my_unread_notifications_count()
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(COUNT(*), 0)::integer
  FROM notifications
  WHERE user_id = auth.uid() AND read_at IS NULL;
$$;
GRANT EXECUTE ON FUNCTION my_unread_notifications_count() TO authenticated;

-- Mark all current user's notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE n integer;
BEGIN
  UPDATE notifications SET read_at = now()
   WHERE user_id = auth.uid() AND read_at IS NULL;
  GET DIAGNOSTICS n = ROW_COUNT;
  RETURN n;
END;
$$;
GRANT EXECUTE ON FUNCTION mark_all_notifications_read() TO authenticated;

-- Upsert a lead with score increment (idempotent)
CREATE OR REPLACE FUNCTION upsert_org_lead(
  p_org_id uuid, p_student_id uuid, p_source text, p_score_delta int DEFAULT 0
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE v_id uuid;
BEGIN
  INSERT INTO org_leads (org_id, student_id, source, score)
  VALUES (p_org_id, p_student_id, p_source, GREATEST(p_score_delta, 0))
  ON CONFLICT (org_id, student_id) DO UPDATE
    SET score = LEAST(100, org_leads.score + p_score_delta),
        last_interaction_at = now(),
        source = COALESCE(org_leads.source, EXCLUDED.source)
  RETURNING id INTO v_id;
  RETURN v_id;
END;
$$;
GRANT EXECUTE ON FUNCTION upsert_org_lead(uuid, uuid, text, int) TO authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- Done. Run this on Supabase SQL editor.
-- ════════════════════════════════════════════════════════════════════════════
