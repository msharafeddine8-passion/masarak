-- ============================================================================
-- SOCIAL SYSTEM · PHASE 7 — Notification Center (preferences + categories).
-- ----------------------------------------------------------------------------
-- The notification pipeline already exists (table + bell + /notifications, all
-- reconciled in Phase 2). This adds user PREFERENCES: social_notify() and the
-- university-follower trigger now respect per-category mutes + a global mute.
-- Additive only.
-- ============================================================================

-- type -> category (used for filtering + preference mutes)
CREATE OR REPLACE FUNCTION public.notif_category(p_type text)
RETURNS text LANGUAGE sql IMMUTABLE SET search_path TO 'public','pg_catalog' AS $$
  SELECT CASE
    WHEN p_type IN ('friend_request','friend_accept','message','comment','reply','like') THEN 'social'
    WHEN p_type IN ('uni_announcement','uni_event') THEN 'universities'
    WHEN p_type LIKE 'scholarship%' OR p_type LIKE 'student.scholarship%' OR p_type IN ('deadline','saved_update') THEN 'content'
    ELSE 'system' END;
$$;

-- may a notification of this type be delivered to this user? (default yes)
CREATE OR REPLACE FUNCTION public.notif_allowed(p_user uuid, p_type text)
RETURNS boolean LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog' AS $$
DECLARE np public.notification_preferences%ROWTYPE; cat text := public.notif_category(p_type);
BEGIN
  SELECT * INTO np FROM public.notification_preferences WHERE user_id=p_user;
  IF NOT FOUND THEN RETURN true; END IF;
  IF coalesce(np.global_mute,false) THEN RETURN false; END IF;
  RETURN coalesce((np.channels_by_type -> cat ->> 'in_app')::boolean, true);
END; $$;

-- social_notify now honours preferences (insert 0 rows when muted)
CREATE OR REPLACE FUNCTION public.social_notify(p_user uuid, p_type text, p_title text, p_body text, p_link text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public','pg_catalog' AS $$
  INSERT INTO public.notifications (user_id, type, title, body, link, severity, channel)
  SELECT p_user, p_type, p_title, p_body, p_link, 'info', 'in_app'
  WHERE public.notif_allowed(p_user, p_type);
$$;

-- university follower trigger also filters muted followers
CREATE OR REPLACE FUNCTION public.tg_notify_uni_followers() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog' AS $$
DECLARE o public.organizations%ROWTYPE; kind text; label text; ttl text;
BEGIN
  IF NOT coalesce(NEW.is_public, false) THEN RETURN NEW; END IF;
  SELECT * INTO o FROM public.organizations WHERE id = NEW.org_id;
  IF o.org_type <> 'university' OR o.entity_id IS NULL THEN RETURN NEW; END IF;
  IF TG_TABLE_NAME = 'org_events' THEN kind := 'uni_event'; label := ' نشرت فعالية جديدة'; ttl := NEW.title;
  ELSE kind := 'uni_announcement'; label := ' نشرت إعلاناً جديداً'; ttl := NEW.title; END IF;
  INSERT INTO public.notifications (user_id, type, title, body, link, severity, channel)
  SELECT f.follower_id, kind, coalesce(o.display_name,'جامعة') || label, left(coalesce(ttl,''),120), '/universities/' || o.entity_id, 'info', 'in_app'
  FROM public.follows f
  WHERE f.target_type='university' AND f.target_id = o.entity_id::text AND public.notif_allowed(f.follower_id, kind);
  RETURN NEW;
END; $$;

-- preferences: own-row RLS + read/write RPCs
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS np_own ON public.notification_preferences;
CREATE POLICY np_own ON public.notification_preferences FOR ALL USING (user_id=auth.uid()) WITH CHECK (user_id=auth.uid());

CREATE OR REPLACE FUNCTION public.get_notif_prefs()
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog' AS $$
DECLARE np public.notification_preferences%ROWTYPE;
BEGIN
  SELECT * INTO np FROM public.notification_preferences WHERE user_id=auth.uid();
  RETURN json_build_object(
    'global_mute',  coalesce(np.global_mute,false),
    'social',       coalesce((np.channels_by_type -> 'social' ->> 'in_app')::boolean, true),
    'universities', coalesce((np.channels_by_type -> 'universities' ->> 'in_app')::boolean, true),
    'content',      coalesce((np.channels_by_type -> 'content' ->> 'in_app')::boolean, true),
    'system',       coalesce((np.channels_by_type -> 'system' ->> 'in_app')::boolean, true)
  );
END; $$;

CREATE OR REPLACE FUNCTION public.set_notif_pref(p_category text, p_enabled boolean)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public','pg_catalog' AS $$
  INSERT INTO public.notification_preferences (user_id, channels_by_type)
  VALUES (auth.uid(), jsonb_build_object(p_category, jsonb_build_object('in_app', p_enabled)))
  ON CONFLICT (user_id) DO UPDATE
    SET channels_by_type = coalesce(public.notification_preferences.channels_by_type,'{}'::jsonb) || jsonb_build_object(p_category, jsonb_build_object('in_app', p_enabled)),
        updated_at = now();
$$;

CREATE OR REPLACE FUNCTION public.set_global_mute(p_bool boolean)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public','pg_catalog' AS $$
  INSERT INTO public.notification_preferences (user_id, global_mute) VALUES (auth.uid(), p_bool)
  ON CONFLICT (user_id) DO UPDATE SET global_mute=p_bool, updated_at=now();
$$;

GRANT EXECUTE ON FUNCTION public.get_notif_prefs()              TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_notif_pref(text, boolean)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_global_mute(boolean)       TO authenticated;
