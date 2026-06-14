-- ════════════════════════════════════════════════════════════════════════════
-- مسارك — Invite Self-Serve Migration
-- 14 June 2026
-- Goal: lets an invited organization owner sign up + claim their org
--       in a single flow on /org/redeem — without going through the public
--       /auth/register page (which is locked to students/parents).
-- ════════════════════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────────────────
-- 1. Public-readable invite lookup (token IS the secret)
-- Returns just enough to render the redeem page (email, role, org context).
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION lookup_org_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_invite org_invites;
BEGIN
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
  RETURN jsonb_build_object(
    'ok', true,
    'email', v_invite.email,
    'org_type', v_invite.org_type,
    'org_hint', v_invite.org_hint,
    'role', v_invite.role,
    'message', v_invite.message,
    'has_existing_org', v_invite.org_id IS NOT NULL
  );
END;
$$;

-- Anyone with the token can call this (token is unguessable, 24 bytes hex)
GRANT EXECUTE ON FUNCTION lookup_org_invite(text) TO anon, authenticated;

-- ───────────────────────────────────────────────────────────────────────────
-- 2. Upgrade redeem_org_invite to enforce email match
-- Prevents someone with a stolen token from claiming the org with a different
-- account. The user MUST be signed in with the email that received the invite.
-- ───────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION redeem_org_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_user_email text := auth.jwt() ->> 'email';
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
  -- NEW: enforce email match (security)
  IF lower(coalesce(v_user_email, '')) <> lower(v_invite.email) THEN
    RETURN jsonb_build_object(
      'ok', false,
      'error', 'email_mismatch',
      'expected', v_invite.email
    );
  END IF;

  -- Mark redeemed
  UPDATE org_invites
     SET redeemed_at = now(), redeemed_by = v_user_id
   WHERE id = v_invite.id;

  -- Link to existing org if invite targets one
  IF v_invite.org_id IS NOT NULL THEN
    INSERT INTO org_members (org_id, user_id, role)
    VALUES (v_invite.org_id, v_user_id, COALESCE(v_invite.role, 'owner'))
    ON CONFLICT (org_id, user_id) DO NOTHING;
  END IF;

  -- Tag the user so the rest of the app knows they're an org owner
  -- (student_profiles row may or may not exist for this user)
  BEGIN
    UPDATE student_profiles
       SET role = 'org_owner',
           updated_at = now()
     WHERE id = v_user_id;
  EXCEPTION WHEN OTHERS THEN NULL; END;

  RETURN jsonb_build_object(
    'ok', true,
    'org_id', v_invite.org_id,
    'role', v_invite.role,
    'org_type', v_invite.org_type,
    'org_hint', v_invite.org_hint
  );
END;
$$;

GRANT EXECUTE ON FUNCTION redeem_org_invite(text) TO authenticated;

-- ════════════════════════════════════════════════════════════════════════════
-- Done. Run this on Supabase SQL editor.
-- ════════════════════════════════════════════════════════════════════════════
