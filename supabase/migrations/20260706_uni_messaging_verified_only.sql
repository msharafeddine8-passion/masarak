-- ============================================================================
-- University messaging: a VERIFIED university is messageable.
-- ----------------------------------------------------------------------------
-- Business model clarification from the owner: in Takaful's setup a university's
-- PREMIUM/subscription tier IS its verification — you mark a partner university
-- `verified` when it subscribes. The original RPCs required verified AND a
-- SEPARATE premium flag (is_featured / active subscription), which nobody sets,
-- so the "💬 Message" button never appeared even on verified partner unis.
--
-- Fix: gate university messaging on `verification_status='verified'` ONLY (drop
-- the is_premium_org requirement). Now verifying a university = students can
-- message it — one action does everything. Verification is admin-only, so this
-- stays a controlled gate. is_premium_org() is left in place (unused here) in
-- case a separate paid tier is introduced later.
-- Additive/idempotent (CREATE OR REPLACE). Reverting = restore the AND-premium check.
-- ============================================================================

-- Can the caller message this university? → verified university org.
CREATE OR REPLACE FUNCTION public.university_can_message(p_uni_id bigint)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.org_type='university'
      AND o.entity_id=p_uni_id
      AND o.verification_status='verified'
  );
$$;

-- Send a message to a verified university (lands in org_messages + notifies org admins).
CREATE OR REPLACE FUNCTION public.message_university(p_uni_id bigint, p_body text)
RETURNS bigint
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE
  me uuid := auth.uid();
  v_org public.organizations%ROWTYPE;
  mid bigint;
  my_name text;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF coalesce(btrim(p_body),'')='' THEN RAISE EXCEPTION 'empty message'; END IF;

  SELECT * INTO v_org FROM public.organizations
    WHERE org_type='university' AND entity_id=p_uni_id AND verification_status='verified'
    LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'university not available'; END IF;
  -- (removed: the is_premium_org guard — a VERIFIED university is messageable.)

  INSERT INTO public.org_messages (org_id, thread_key, sender_type, sender_id, recipient_id, body)
  VALUES (v_org.id, 'stu-'||me::text, 'student', me, NULL, btrim(p_body))
  RETURNING id INTO mid;

  -- notify the org's owners/admins
  SELECT coalesce(full_name,'طالب') INTO my_name FROM public.student_profiles WHERE user_id=me;
  INSERT INTO public.notifications (user_id, type, title, body, link, severity, channel)
  SELECT om.user_id, 'org_message',
         coalesce(my_name,'طالب') || ' راسل جامعتك',
         left(btrim(p_body),120), '/org/dashboard', 'info', 'in_app'
  FROM public.org_members om
  WHERE om.org_id=v_org.id AND om.role IN ('owner','admin');

  RETURN mid;
END; $$;

GRANT EXECUTE ON FUNCTION public.university_can_message(bigint)   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.message_university(bigint, text) TO authenticated;
