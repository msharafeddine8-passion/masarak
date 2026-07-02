-- ============================================================================
-- SOCIAL SYSTEM · Message a University (PREMIUM universities only).
-- ----------------------------------------------------------------------------
-- Students can message a university, but ONLY if that university's org is
-- premium (admin-featured OR an active subscription). Messages land in the
-- existing org_messages inbox (org admins read them in /org/dashboard) and the
-- org's owners/admins get a notification. Reuses org_messages + subscriptions.
-- Additive only.  NOTE: organizations.id is a UUID; entity_id is the (bigint)
-- university id.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.is_premium_org(p_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizations o WHERE o.id=p_org_id AND (
      o.is_featured = true
      OR EXISTS (SELECT 1 FROM public.subscriptions s WHERE s.org_id=o.id
                  AND s.status IN ('active','trialing')
                  AND (s.current_period_end IS NULL OR s.current_period_end > now()))
    )
  );
$$;

-- Can the caller message this university? (verified university org that is premium)
CREATE OR REPLACE FUNCTION public.university_can_message(p_uni_id bigint)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.org_type='university' AND o.entity_id=p_uni_id AND o.verification_status='verified'
      AND public.is_premium_org(o.id)
  );
$$;

CREATE OR REPLACE FUNCTION public.message_university(p_uni_id bigint, p_body text)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog' AS $$
DECLARE me uuid := auth.uid(); v_org public.organizations%ROWTYPE; mid bigint; my_name text;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF coalesce(btrim(p_body),'')='' THEN RAISE EXCEPTION 'empty message'; END IF;
  SELECT * INTO v_org FROM public.organizations
    WHERE org_type='university' AND entity_id=p_uni_id AND verification_status='verified' LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'university not available'; END IF;
  IF NOT public.is_premium_org(v_org.id) THEN RAISE EXCEPTION 'not_premium'; END IF;

  INSERT INTO public.org_messages (org_id, thread_key, sender_type, sender_id, recipient_id, body)
  VALUES (v_org.id, 'stu-'||me::text, 'student', me, NULL, btrim(p_body)) RETURNING id INTO mid;

  -- notify the org's owners/admins
  SELECT coalesce(full_name,'طالب') INTO my_name FROM public.student_profiles WHERE user_id=me;
  INSERT INTO public.notifications (user_id, type, title, body, link, severity, channel)
  SELECT om.user_id, 'org_message', coalesce(my_name,'طالب') || ' راسل جامعتك', left(btrim(p_body),120), '/org/dashboard', 'info', 'in_app'
  FROM public.org_members om WHERE om.org_id=v_org.id AND om.role IN ('owner','admin');
  RETURN mid;
END; $$;

GRANT EXECUTE ON FUNCTION public.university_can_message(bigint)   TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.message_university(bigint, text) TO authenticated;
