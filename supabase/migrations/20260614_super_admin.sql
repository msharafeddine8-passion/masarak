-- ════════════════════════════════════════════════════════════════════════════
-- مسارك — Super Admin Dashboard Migration
-- 14 June 2026
-- Adds the data plane needed for the world-class Super Admin command center:
--   1. analytics_events   — universal event tracking (page views, clicks, conversions)
--   2. admin_actions      — audit log for every admin action
--   3. subscriptions      — billing/plan tracking (works without Stripe; ready for Stripe)
--   4. ai_insights        — cached AI CEO insights (avoid repeated LLM calls)
--   5. support_tickets    — customer support center
--   6. admin_notifications — admin-only notifications/alerts
-- All tables: idempotent, RLS-enabled, admin-only writes.
-- ════════════════════════════════════════════════════════════════════════════

-- ────────────────────────────────────────────────────────────────────────────
-- 1. analytics_events — universal event sink
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics_events (
  id           bigserial PRIMARY KEY,
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id   text,                                  -- anonymous-stable session id
  event_name   text NOT NULL,                         -- 'page_view', 'save_item', 'cta_click', 'signup_complete', etc.
  entity_type  text,                                  -- 'university','school','scholarship','major','career'
  entity_id    text,
  page_url     text,
  referrer     text,
  utm_source   text,
  utm_medium   text,
  utm_campaign text,
  country_code text,
  device       text,                                  -- 'mobile' | 'tablet' | 'desktop'
  properties   jsonb DEFAULT '{}'::jsonb,             -- flexible payload
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ae_created      ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_event        ON analytics_events (event_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_user         ON analytics_events (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_entity       ON analytics_events (entity_type, entity_id, created_at DESC);

ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Anyone can INSERT (so the public site can track), nobody can read directly except admin.
DROP POLICY IF EXISTS ae_insert_anyone ON analytics_events;
CREATE POLICY ae_insert_anyone ON analytics_events
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS ae_admin_read ON analytics_events;
CREATE POLICY ae_admin_read ON analytics_events
  FOR SELECT USING (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

-- ────────────────────────────────────────────────────────────────────────────
-- 2. admin_actions — audit log for everything admin does
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_actions (
  id           bigserial PRIMARY KEY,
  admin_email  text NOT NULL,
  action       text NOT NULL,    -- 'user_suspend', 'university_approve', 'subscription_grant', etc.
  target_type  text,             -- 'user','university','school','subscription','invite'
  target_id    text,
  reason       text,
  details      jsonb DEFAULT '{}'::jsonb,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_aa_admin_time ON admin_actions (admin_email, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_aa_target     ON admin_actions (target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_aa_action     ON admin_actions (action, created_at DESC);

ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS aa_admin_all ON admin_actions;
CREATE POLICY aa_admin_all ON admin_actions FOR ALL
  USING (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

-- ────────────────────────────────────────────────────────────────────────────
-- 3. subscriptions — works WITHOUT Stripe (admin can grant manually);
-- ready to connect to Stripe webhook when ready.
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS subscriptions (
  id              bigserial PRIMARY KEY,
  user_id         uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id          uuid,                              -- university/school/sponsor account
  plan            text NOT NULL,                     -- 'free','premium','lifetime','school_basic','school_pro','uni_basic','uni_pro','sponsor'
  status          text NOT NULL DEFAULT 'active',    -- 'active','past_due','canceled','trialing'
  starts_at       timestamptz NOT NULL DEFAULT now(),
  current_period_end timestamptz,
  cancel_at       timestamptz,
  amount_usd      numeric(10,2),                     -- billed amount
  currency        text DEFAULT 'USD',
  stripe_customer_id      text,                      -- nullable until Stripe connected
  stripe_subscription_id  text,
  granted_by      text,                              -- admin email if manually granted
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  CHECK ((user_id IS NOT NULL) OR (org_id IS NOT NULL))
);

CREATE INDEX IF NOT EXISTS idx_sub_user   ON subscriptions (user_id, status);
CREATE INDEX IF NOT EXISTS idx_sub_org    ON subscriptions (org_id, status);
CREATE INDEX IF NOT EXISTS idx_sub_status ON subscriptions (status, current_period_end);
CREATE INDEX IF NOT EXISTS idx_sub_stripe ON subscriptions (stripe_subscription_id);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS sub_own_read ON subscriptions;
CREATE POLICY sub_own_read ON subscriptions FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

DROP POLICY IF EXISTS sub_admin_write ON subscriptions;
CREATE POLICY sub_admin_write ON subscriptions FOR ALL
  USING (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

-- ────────────────────────────────────────────────────────────────────────────
-- 4. ai_insights — cached LLM outputs (don't pay for the same insight twice)
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS ai_insights (
  id           bigserial PRIMARY KEY,
  insight_key  text NOT NULL,             -- e.g. 'daily_briefing_2026-06-14', 'risk_universities_q2'
  insight_type text NOT NULL,             -- 'daily_briefing','risk_alert','opportunity','content_idea','trend'
  scope        text DEFAULT 'global',     -- 'global','university:<id>','school:<id>'
  title        text NOT NULL,
  body_md      text NOT NULL,             -- markdown body
  data_payload jsonb DEFAULT '{}'::jsonb, -- structured insights for charts
  model_used   text,                      -- 'claude-sonnet-4-6', 'rule-based', etc.
  tokens_in    integer,
  tokens_out   integer,
  cost_usd     numeric(8,4),
  generated_at timestamptz NOT NULL DEFAULT now(),
  expires_at   timestamptz,
  UNIQUE (insight_key)
);

CREATE INDEX IF NOT EXISTS idx_ai_type_time ON ai_insights (insight_type, generated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_scope     ON ai_insights (scope, generated_at DESC);

ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ai_admin_all ON ai_insights;
CREATE POLICY ai_admin_all ON ai_insights FOR ALL
  USING (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

-- ────────────────────────────────────────────────────────────────────────────
-- 5. support_tickets — customer support center
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS support_tickets (
  id           bigserial PRIMARY KEY,
  user_id      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email        text,
  name         text,
  subject      text NOT NULL,
  body         text NOT NULL,
  category     text DEFAULT 'general',     -- 'bug','feature','complaint','question','partnership'
  priority     text DEFAULT 'normal',      -- 'low','normal','high','urgent'
  status       text DEFAULT 'open',        -- 'open','in_progress','waiting','resolved','closed'
  assigned_to  text,                       -- admin email
  resolution   text,
  internal_notes text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  resolved_at  timestamptz,
  first_response_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_st_status     ON support_tickets (status, priority, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_st_user       ON support_tickets (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_st_assigned   ON support_tickets (assigned_to, status);

ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS st_insert_anyone ON support_tickets;
CREATE POLICY st_insert_anyone ON support_tickets FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS st_own_read ON support_tickets;
CREATE POLICY st_own_read ON support_tickets FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');
DROP POLICY IF EXISTS st_admin_write ON support_tickets;
CREATE POLICY st_admin_write ON support_tickets FOR UPDATE
  USING (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

-- ────────────────────────────────────────────────────────────────────────────
-- 6. admin_notifications — alerts the admin needs to see
-- ────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admin_notifications (
  id           bigserial PRIMARY KEY,
  severity     text NOT NULL DEFAULT 'info',  -- 'info','success','warn','danger'
  category     text NOT NULL,                  -- 'security','growth','revenue','risk','opportunity'
  title        text NOT NULL,
  body         text,
  link_url     text,
  data_payload jsonb DEFAULT '{}'::jsonb,
  read_at      timestamptz,
  acted_at     timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_an_unread ON admin_notifications (read_at, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_an_severity ON admin_notifications (severity, created_at DESC);

ALTER TABLE admin_notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS an_admin_all ON admin_notifications;
CREATE POLICY an_admin_all ON admin_notifications FOR ALL
  USING (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

-- ────────────────────────────────────────────────────────────────────────────
-- 7. Helper RPCs the admin dashboard will use repeatedly
-- ────────────────────────────────────────────────────────────────────────────

-- Returns the Executive Overview KPI snapshot in ONE call (faster than 11 queries).
CREATE OR REPLACE FUNCTION admin_kpi_overview()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_users        bigint := 0;
  v_active_30d         bigint := 0;
  v_new_today          bigint := 0;
  v_new_this_month     bigint := 0;
  v_paid_active        bigint := 0;
  v_lifetime           bigint := 0;
  v_revenue_today      numeric := 0;
  v_revenue_month      numeric := 0;
  v_revenue_year       numeric := 0;
  v_universities       bigint := 0;
  v_schools            bigint := 0;
  v_scholarships       bigint := 0;
  v_majors             bigint := 0;
  v_dna_results        bigint := 0;
  v_saved_items        bigint := 0;
  v_open_tickets       bigint := 0;
  v_pending_invites    bigint := 0;
BEGIN
  -- guard: only admin
  IF (auth.jwt() ->> 'email') <> 'msharafeddine8@gmail.com' THEN
    RETURN jsonb_build_object('error', 'forbidden');
  END IF;

  SELECT COUNT(*) INTO v_total_users    FROM auth.users;
  SELECT COUNT(*) INTO v_new_today      FROM auth.users WHERE created_at >= date_trunc('day', now());
  SELECT COUNT(*) INTO v_new_this_month FROM auth.users WHERE created_at >= date_trunc('month', now());

  BEGIN
    SELECT COUNT(DISTINCT user_id) INTO v_active_30d
    FROM analytics_events WHERE created_at >= now() - interval '30 days' AND user_id IS NOT NULL;
  EXCEPTION WHEN OTHERS THEN v_active_30d := 0; END;

  BEGIN
    SELECT COUNT(*) INTO v_paid_active FROM subscriptions
    WHERE status='active' AND plan NOT IN ('free');
    SELECT COUNT(*) INTO v_lifetime FROM subscriptions
    WHERE status='active' AND plan='lifetime';
    SELECT COALESCE(SUM(amount_usd),0) INTO v_revenue_today FROM subscriptions
    WHERE created_at >= date_trunc('day', now()) AND status='active';
    SELECT COALESCE(SUM(amount_usd),0) INTO v_revenue_month FROM subscriptions
    WHERE created_at >= date_trunc('month', now()) AND status='active';
    SELECT COALESCE(SUM(amount_usd),0) INTO v_revenue_year  FROM subscriptions
    WHERE created_at >= date_trunc('year', now()) AND status='active';
  EXCEPTION WHEN OTHERS THEN NULL; END;

  BEGIN SELECT COUNT(*) INTO v_universities FROM universities; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN SELECT COUNT(*) INTO v_schools FROM schools; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN SELECT COUNT(*) INTO v_scholarships FROM scholarships; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN SELECT COUNT(*) INTO v_majors FROM majors; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN SELECT COUNT(*) INTO v_saved_items FROM saved_items; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN SELECT COUNT(*) INTO v_dna_results FROM dna_results; EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN SELECT COUNT(*) INTO v_open_tickets FROM support_tickets WHERE status IN ('open','in_progress'); EXCEPTION WHEN OTHERS THEN NULL; END;
  BEGIN SELECT COUNT(*) INTO v_pending_invites FROM org_invites WHERE redeemed_at IS NULL AND expires_at > now(); EXCEPTION WHEN OTHERS THEN NULL; END;

  RETURN jsonb_build_object(
    'totalUsers',     v_total_users,
    'newToday',       v_new_today,
    'newThisMonth',   v_new_this_month,
    'active30d',      v_active_30d,
    'paidActive',     v_paid_active,
    'lifetime',       v_lifetime,
    'revenueToday',   v_revenue_today,
    'revenueMonth',   v_revenue_month,
    'revenueYear',    v_revenue_year,
    'universities',   v_universities,
    'schools',        v_schools,
    'scholarships',   v_scholarships,
    'majors',         v_majors,
    'savedItems',     v_saved_items,
    'dnaResults',     v_dna_results,
    'openTickets',    v_open_tickets,
    'pendingInvites', v_pending_invites,
    'asOf',           now()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION admin_kpi_overview() TO authenticated;

-- Daily user growth (last 30 days)
CREATE OR REPLACE FUNCTION admin_user_growth_30d()
RETURNS TABLE(day date, new_users bigint, total_users bigint)
LANGUAGE sql
SECURITY DEFINER
AS $$
  WITH dates AS (
    SELECT generate_series(date_trunc('day', now() - interval '29 days'), date_trunc('day', now()), '1 day')::date AS d
  ),
  daily AS (
    SELECT date_trunc('day', created_at)::date AS d, COUNT(*) AS n
    FROM auth.users
    WHERE created_at >= now() - interval '30 days'
    GROUP BY 1
  )
  SELECT dates.d AS day,
         COALESCE(daily.n, 0) AS new_users,
         SUM(COALESCE(daily.n, 0)) OVER (ORDER BY dates.d) +
           (SELECT COUNT(*) FROM auth.users WHERE created_at < now() - interval '30 days') AS total_users
  FROM dates LEFT JOIN daily ON daily.d = dates.d
  ORDER BY dates.d;
$$;

GRANT EXECUTE ON FUNCTION admin_user_growth_30d() TO authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- Done. Run this on Supabase SQL editor.
-- ════════════════════════════════════════════════════════════════════════════
