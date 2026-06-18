-- Migration: add is_featured to organizations + subscriptions
-- Allows admins to flag orgs/sponsors as "featured" for prominent placement.

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false NOT NULL;

ALTER TABLE subscriptions
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false NOT NULL;

-- Index for fast "featured first" ordering
CREATE INDEX IF NOT EXISTS idx_organizations_featured ON organizations (is_featured DESC, verified_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscriptions_featured  ON subscriptions  (is_featured DESC, created_at DESC);
