-- ════════════════════════════════════════════════════════════════════════════
-- مسارك — Org Invites Migration
-- 11 June 2026
-- Platform admin → invite somebody to claim/manage an organization.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS org_invites (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token        text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(24), 'hex'),
  email        text NOT NULL,
  org_id       uuid,                 -- nullable: invite to a brand-new claim
  org_type     text,
  org_hint     text,                 -- e.g. "AUB" — admin's note about which org
  role         text NOT NULL DEFAULT 'owner', -- owner / editor
  invited_by   uuid REFERENCES auth.users(id),
  message      text,                 -- optional message admin includes
  expires_at   timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  redeemed_at  timestamptz,
  redeemed_by  uuid REFERENCES auth.users(id),
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_org_invites_token ON org_invites (token);
CREATE INDEX IF NOT EXISTS idx_org_invites_email ON org_invites (lower(email));

ALTER TABLE org_invites ENABLE ROW LEVEL SECURITY;

-- Admin can manage invites.
DROP POLICY IF EXISTS oi_admin_all ON org_invites;
CREATE POLICY oi_admin_all ON org_invites FOR ALL
  USING (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com')
  WITH CHECK (auth.jwt() ->> 'email' = 'msharafeddine8@gmail.com');

-- The invitee can read their own pending invite by token (no auth needed for the read step).
-- We expose redemption through an RPC that does the validation.

-- Redeem RPC: invitee logs in, calls this with the token; on success, links them to the org.
CREATE OR REPLACE FUNCTION redeem_org_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_invite org_invites;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_signed_in');
  END IF;

  SELECT * INTO v_invite FROM org_invites WHERE token = p_token LIMIT 1;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_found');
  END IF;
  IF v_invite.redeemed_at IS NOT NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'already_redeemed');
  END IF;
  IF v_invite.expires_at < now() THEN
    RETURN jsonb_build_object('ok', false, 'error', 'expired');
  END IF;

  -- Mark as redeemed
  UPDATE org_invites
     SET redeemed_at = now(), redeemed_by = v_user_id
   WHERE id = v_invite.id;

  -- If invite targets an existing org, add the user as a member.
  IF v_invite.org_id IS NOT NULL THEN
    INSERT INTO org_members (org_id, user_id, role)
    VALUES (v_invite.org_id, v_user_id, COALESCE(v_invite.role, 'owner'))
    ON CONFLICT (org_id, user_id) DO NOTHING;
  END IF;

  RETURN jsonb_build_object(
    'ok', true,
    'org_id', v_invite.org_id,
    'role', v_invite.role
  );
END;
$$;

GRANT EXECUTE ON FUNCTION redeem_org_invite(text) TO authenticated;
