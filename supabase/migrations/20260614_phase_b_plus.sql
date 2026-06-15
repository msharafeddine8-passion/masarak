-- ════════════════════════════════════════════════════════════════════════════
-- مسارك — Phase B+ Migration
-- 14 June 2026
-- Adds:
--   1. organizations.verification_requested_at + verification_notes column
--   2. RPC request_org_verification — org owner calls; creates admin_notification
--   3. RPC approve_org_verification — admin only; marks verified + notifies org members
-- ════════════════════════════════════════════════════════════════════════════

ALTER TABLE IF EXISTS organizations
  ADD COLUMN IF NOT EXISTS verification_requested_at timestamptz;

ALTER TABLE IF EXISTS organizations
  ADD COLUMN IF NOT EXISTS verification_notes text;

-- Request verification — called by org owner from dashboard.
CREATE OR REPLACE FUNCTION request_org_verification(p_org_id uuid, p_notes text DEFAULT NULL)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_is_member boolean;
  v_org_name text;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_signed_in');
  END IF;
  SELECT EXISTS (
    SELECT 1 FROM org_members
    WHERE org_id = p_org_id AND user_id = v_user_id AND role IN ('owner','editor')
  ) INTO v_is_member;
  IF NOT v_is_member THEN
    RETURN jsonb_build_object('ok', false, 'error', 'not_org_member');
  END IF;

  SELECT name_ar INTO v_org_name FROM organizations WHERE id = p_org_id;

  UPDATE organizations
     SET verification_requested_at = now(),
         verification_notes        = COALESCE(p_notes, verification_notes)
   WHERE id = p_org_id
     AND COALESCE(verification_status, 'pending') NOT IN ('verified');

  -- Notify admins
  BEGIN
    INSERT INTO admin_notifications (severity, category, title, body, link_url, data_payload)
    VALUES ('info', 'risk',
            'طلب توثيق جديد: ' || COALESCE(v_org_name, p_org_id::text),
            COALESCE(p_notes, 'لا يوجد ملاحظات إضافية'),
            '/admin/dashboard?tab=universities',
            jsonb_build_object('org_id', p_org_id));
  EXCEPTION WHEN OTHERS THEN NULL; END;

  RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION request_org_verification(uuid, text) TO authenticated;

-- Approve verification — admin only.
CREATE OR REPLACE FUNCTION approve_org_verification(p_org_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_org_name text;
  v_member record;
BEGIN
  IF auth.jwt() ->> 'email' <> 'msharafeddine8@gmail.com' THEN
    RETURN jsonb_build_object('ok', false, 'error', 'forbidden');
  END IF;
  SELECT name_ar INTO v_org_name FROM organizations WHERE id = p_org_id;

  UPDATE organizations
     SET verification_status   = 'verified',
         is_verified           = true,
         verified_at           = now()
   WHERE id = p_org_id;

  FOR v_member IN
    SELECT user_id FROM org_members WHERE org_id = p_org_id
  LOOP
    BEGIN
      INSERT INTO notifications (user_id, type, title, body, link_url, severity)
      VALUES (
        v_member.user_id,
        'org.verified',
        '🎉 تم توثيق ' || COALESCE(v_org_name, 'مؤسستك') || '!',
        'مبروك! صارت مؤسستك موثّقة على مسارك. الشارة الزرقاء ✓ صارت تظهر على صفحتك العامة.',
        '/org/dashboard',
        'success'
      );
    EXCEPTION WHEN OTHERS THEN NULL; END;
  END LOOP;

  RETURN jsonb_build_object('ok', true);
END;
$$;
GRANT EXECUTE ON FUNCTION approve_org_verification(uuid) TO authenticated;
