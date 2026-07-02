-- ============================================================================
-- SOCIAL SYSTEM · PHASE 2 — Friends (requests / accept / block / suggest / search)
-- ----------------------------------------------------------------------------
-- Also reconciles the notifications table with the app code, which already
-- inserts/reads columns that never existed (link_url→we keep `link`, plus
-- severity / entity_type / entity_id / channel). Without this, EVERY
-- notifyUser() call (DNA reminders, scholarship alerts, and now friend
-- requests) fails silently. Additive only.
-- ============================================================================

-- ── A. Notifications reconciliation (additive columns the code expects) ──────
ALTER TABLE public.notifications
  ADD COLUMN IF NOT EXISTS severity    text DEFAULT 'info',
  ADD COLUMN IF NOT EXISTS entity_type text,
  ADD COLUMN IF NOT EXISTS entity_id   text,
  ADD COLUMN IF NOT EXISTS channel     text DEFAULT 'in_app';

-- ── B. Tables ───────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.friendships (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  requester_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  addressee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status       text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','accepted','declined')),
  created_at   timestamptz NOT NULL DEFAULT now(),
  responded_at timestamptz,
  CONSTRAINT friendship_not_self CHECK (requester_id <> addressee_id)
);
-- One relationship per unordered pair (regardless of who sent it).
CREATE UNIQUE INDEX IF NOT EXISTS friendships_pair_key
  ON public.friendships (least(requester_id, addressee_id), greatest(requester_id, addressee_id));
CREATE INDEX IF NOT EXISTS friendships_addressee_idx ON public.friendships (addressee_id, status);
CREATE INDEX IF NOT EXISTS friendships_requester_idx ON public.friendships (requester_id, status);

CREATE TABLE IF NOT EXISTS public.user_blocks (
  blocker_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  blocked_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id),
  CONSTRAINT block_not_self CHECK (blocker_id <> blocked_id)
);

ALTER TABLE public.friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_blocks ENABLE ROW LEVEL SECURITY;

-- Own-rows RLS (the RPCs below are SECURITY DEFINER and do the heavy lifting,
-- but these let a user read/manage their own relationships directly & safely).
DROP POLICY IF EXISTS friendships_read_own ON public.friendships;
CREATE POLICY friendships_read_own ON public.friendships FOR SELECT
  USING (auth.uid() IN (requester_id, addressee_id));
DROP POLICY IF EXISTS friendships_delete_own ON public.friendships;
CREATE POLICY friendships_delete_own ON public.friendships FOR DELETE
  USING (auth.uid() IN (requester_id, addressee_id));

DROP POLICY IF EXISTS blocks_own ON public.user_blocks;
CREATE POLICY blocks_own ON public.user_blocks FOR ALL
  USING (auth.uid() = blocker_id) WITH CHECK (auth.uid() = blocker_id);

-- ── C. Helper: a safe "person card" + viewer-relative status ────────────────
CREATE OR REPLACE FUNCTION public.social_card(p_viewer uuid, p_target uuid)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE sp public.student_profiles%ROWTYPE; up public.user_profiles%ROWTYPE; st text;
BEGIN
  SELECT * INTO sp FROM public.student_profiles WHERE user_id = p_target LIMIT 1;
  SELECT * INTO up FROM public.user_profiles     WHERE id = p_target LIMIT 1;

  IF p_target = p_viewer THEN st := 'self';
  ELSIF EXISTS (SELECT 1 FROM public.user_blocks WHERE blocker_id = p_viewer AND blocked_id = p_target) THEN st := 'blocked';
  ELSIF EXISTS (SELECT 1 FROM public.user_blocks WHERE blocker_id = p_target AND blocked_id = p_viewer) THEN st := 'blocked_by';
  ELSIF EXISTS (SELECT 1 FROM public.friendships f WHERE f.status='accepted'
                 AND ((f.requester_id=p_viewer AND f.addressee_id=p_target) OR (f.requester_id=p_target AND f.addressee_id=p_viewer))) THEN st := 'friends';
  ELSIF EXISTS (SELECT 1 FROM public.friendships f WHERE f.status='pending' AND f.requester_id=p_viewer AND f.addressee_id=p_target) THEN st := 'pending_out';
  ELSIF EXISTS (SELECT 1 FROM public.friendships f WHERE f.status='pending' AND f.requester_id=p_target AND f.addressee_id=p_viewer) THEN st := 'pending_in';
  ELSE st := 'none';
  END IF;

  RETURN json_build_object(
    'user_id', p_target,
    'slug', sp.public_slug,
    'full_name', coalesce(sp.full_name, up.full_name),
    'avatar_url', coalesce(sp.avatar_url, up.avatar_url),
    'major', sp.major,
    'university_name', sp.university_name,
    'school_name', sp.school_name,
    'city', sp.city,
    'country_code', up.country_code,
    'is_public', coalesce(sp.is_public, false),
    'status', st
  );
END; $$;

-- ── D. Notification helper (real columns; SECURITY DEFINER inserts) ──────────
CREATE OR REPLACE FUNCTION public.social_notify(p_user uuid, p_type text, p_title text, p_body text, p_link text)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  INSERT INTO public.notifications (user_id, type, title, body, link, severity, channel)
  VALUES (p_user, p_type, p_title, p_body, p_link, 'info', 'in_app');
$$;

-- ── E. Action RPCs ───────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.send_friend_request(p_addressee uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid(); my_name text; rev_id bigint;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF p_addressee = me THEN RAISE EXCEPTION 'cannot friend yourself'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_blocks WHERE (blocker_id=me AND blocked_id=p_addressee) OR (blocker_id=p_addressee AND blocked_id=me)) THEN
    RAISE EXCEPTION 'blocked';
  END IF;

  -- Already friends?
  IF EXISTS (SELECT 1 FROM public.friendships WHERE status='accepted'
      AND ((requester_id=me AND addressee_id=p_addressee) OR (requester_id=p_addressee AND addressee_id=me))) THEN
    RETURN 'friends';
  END IF;

  -- They already sent me one → accept it instead.
  SELECT id INTO rev_id FROM public.friendships
   WHERE status='pending' AND requester_id=p_addressee AND addressee_id=me LIMIT 1;
  IF rev_id IS NOT NULL THEN
    UPDATE public.friendships SET status='accepted', responded_at=now() WHERE id=rev_id;
    SELECT coalesce(full_name,'صديقك') INTO my_name FROM public.student_profiles WHERE user_id=me;
    PERFORM public.social_notify(p_addressee, 'friend_accept', 'قبِل طلب صداقتك',
      coalesce(my_name,'') || ' صار صديقك على مسارك 🎉', '/friends');
    RETURN 'accepted';
  END IF;

  -- Fresh request (idempotent on the pair unique index).
  INSERT INTO public.friendships (requester_id, addressee_id, status)
  VALUES (me, p_addressee, 'pending')
  ON CONFLICT (least(requester_id,addressee_id), greatest(requester_id,addressee_id)) DO NOTHING;

  SELECT coalesce(full_name,'أحد الطلاب') INTO my_name FROM public.student_profiles WHERE user_id=me;
  PERFORM public.social_notify(p_addressee, 'friend_request', 'طلب صداقة جديد',
    coalesce(my_name,'') || ' بعتلك طلب صداقة', '/friends');
  RETURN 'pending';
END; $$;

CREATE OR REPLACE FUNCTION public.respond_friend_request(p_id bigint, p_accept boolean)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid(); r public.friendships%ROWTYPE; my_name text; my_slug text;
BEGIN
  SELECT * INTO r FROM public.friendships WHERE id=p_id LIMIT 1;
  IF NOT FOUND OR r.addressee_id <> me OR r.status <> 'pending' THEN RAISE EXCEPTION 'invalid request'; END IF;

  IF p_accept THEN
    UPDATE public.friendships SET status='accepted', responded_at=now() WHERE id=p_id;
    SELECT coalesce(full_name,'صديقك'), public_slug INTO my_name, my_slug FROM public.student_profiles WHERE user_id=me;
    PERFORM public.social_notify(r.requester_id, 'friend_accept', 'قُبِل طلب صداقتك',
      coalesce(my_name,'') || ' قبِل طلب صداقتك 🎉', coalesce('/u/'||my_slug, '/friends'));
    RETURN 'accepted';
  ELSE
    UPDATE public.friendships SET status='declined', responded_at=now() WHERE id=p_id;
    RETURN 'declined';
  END IF;
END; $$;

CREATE OR REPLACE FUNCTION public.cancel_friend_request(p_id bigint)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  DELETE FROM public.friendships WHERE id=p_id AND requester_id=auth.uid() AND status='pending';
$$;

CREATE OR REPLACE FUNCTION public.remove_friend(p_other uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  DELETE FROM public.friendships
   WHERE status IN ('accepted','pending','declined')
     AND ((requester_id=auth.uid() AND addressee_id=p_other)
       OR (requester_id=p_other AND addressee_id=auth.uid()));
$$;

CREATE OR REPLACE FUNCTION public.block_user(p_other uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid();
BEGIN
  IF p_other = me THEN RAISE EXCEPTION 'cannot block yourself'; END IF;
  DELETE FROM public.friendships
    WHERE (requester_id=me AND addressee_id=p_other) OR (requester_id=p_other AND addressee_id=me);
  INSERT INTO public.user_blocks (blocker_id, blocked_id) VALUES (me, p_other)
    ON CONFLICT (blocker_id, blocked_id) DO NOTHING;
END; $$;

CREATE OR REPLACE FUNCTION public.unblock_user(p_other uuid)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  DELETE FROM public.user_blocks WHERE blocker_id=auth.uid() AND blocked_id=p_other;
$$;

-- ── F. Query RPCs ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.friendship_status(p_other uuid)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$ SELECT (public.social_card(auth.uid(), p_other) ->> 'status'); $$;

CREATE OR REPLACE FUNCTION public.friends_count(p_user uuid)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  SELECT count(*)::int FROM public.friendships
   WHERE status='accepted' AND (requester_id=p_user OR addressee_id=p_user);
$$;

CREATE OR REPLACE FUNCTION public.list_my_friends()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  SELECT coalesce(json_agg(public.social_card(auth.uid(), other) ORDER BY other), '[]'::json)
  FROM (
    SELECT CASE WHEN requester_id=auth.uid() THEN addressee_id ELSE requester_id END AS other
    FROM public.friendships
    WHERE status='accepted' AND (requester_id=auth.uid() OR addressee_id=auth.uid())
  ) s;
$$;

CREATE OR REPLACE FUNCTION public.list_friend_requests()
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid(); incoming json; outgoing json;
BEGIN
  SELECT coalesce(json_agg(json_build_object('id', f.id, 'person', public.social_card(me, f.requester_id)) ORDER BY f.created_at DESC), '[]'::json)
    INTO incoming FROM public.friendships f WHERE f.addressee_id=me AND f.status='pending';
  SELECT coalesce(json_agg(json_build_object('id', f.id, 'person', public.social_card(me, f.addressee_id)) ORDER BY f.created_at DESC), '[]'::json)
    INTO outgoing FROM public.friendships f WHERE f.requester_id=me AND f.status='pending';
  RETURN json_build_object('incoming', incoming, 'outgoing', outgoing);
END; $$;

CREATE OR REPLACE FUNCTION public.mutual_friends(p_other uuid)
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  WITH my AS (
    SELECT CASE WHEN requester_id=auth.uid() THEN addressee_id ELSE requester_id END AS uid
    FROM public.friendships WHERE status='accepted' AND (requester_id=auth.uid() OR addressee_id=auth.uid())
  ), theirs AS (
    SELECT CASE WHEN requester_id=p_other THEN addressee_id ELSE requester_id END AS uid
    FROM public.friendships WHERE status='accepted' AND (requester_id=p_other OR addressee_id=p_other)
  )
  SELECT coalesce(json_agg(public.social_card(auth.uid(), uid)), '[]'::json)
  FROM (SELECT uid FROM my INTERSECT SELECT uid FROM theirs) m;
$$;

-- Suggestions — opt-in discoverability (is_public), ranked by shared signals.
CREATE OR REPLACE FUNCTION public.suggested_friends(p_limit int DEFAULT 12)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid(); msp public.student_profiles%ROWTYPE; mup public.user_profiles%ROWTYPE;
BEGIN
  SELECT * INTO msp FROM public.student_profiles WHERE user_id=me;
  SELECT * INTO mup FROM public.user_profiles WHERE id=me;
  RETURN (
    SELECT coalesce(json_agg(public.social_card(me, x.user_id) ORDER BY x.score DESC, x.user_id), '[]'::json)
    FROM (
      SELECT sp.user_id,
        (CASE WHEN sp.school_name IS NOT NULL AND sp.school_name = msp.school_name THEN 3 ELSE 0 END
       + CASE WHEN sp.university_name IS NOT NULL AND sp.university_name = msp.university_name THEN 3 ELSE 0 END
       + CASE WHEN sp.major IS NOT NULL AND sp.major = msp.major THEN 2 ELSE 0 END
       + CASE WHEN up.country_code IS NOT NULL AND up.country_code = mup.country_code THEN 1 ELSE 0 END
       + coalesce(cardinality(ARRAY(SELECT unnest(coalesce(sp.interests,'{}')) INTERSECT SELECT unnest(coalesce(msp.interests,'{}')))), 0)
        ) AS score
      FROM public.student_profiles sp
      LEFT JOIN public.user_profiles up ON up.id = sp.user_id
      WHERE sp.is_public = true
        AND sp.user_id <> me
        AND NOT EXISTS (SELECT 1 FROM public.friendships f WHERE (f.requester_id=me AND f.addressee_id=sp.user_id) OR (f.requester_id=sp.user_id AND f.addressee_id=me))
        AND NOT EXISTS (SELECT 1 FROM public.user_blocks b WHERE (b.blocker_id=me AND b.blocked_id=sp.user_id) OR (b.blocker_id=sp.user_id AND b.blocked_id=me))
      ORDER BY score DESC, sp.user_id
      LIMIT greatest(p_limit, 1)
    ) x
  );
END; $$;

-- People search — opt-in discoverable profiles only (privacy/safety default).
CREATE OR REPLACE FUNCTION public.search_people(p_q text, p_limit int DEFAULT 20)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid(); q text := '%' || btrim(coalesce(p_q,'')) || '%';
BEGIN
  IF length(btrim(coalesce(p_q,''))) < 2 THEN RETURN '[]'::json; END IF;
  RETURN (
    SELECT coalesce(json_agg(public.social_card(me, sp.user_id) ORDER BY sp.full_name), '[]'::json)
    FROM public.student_profiles sp
    WHERE sp.is_public = true
      AND (me IS NULL OR sp.user_id <> me)
      AND (sp.full_name ILIKE q OR sp.major ILIKE q OR sp.university_name ILIKE q OR sp.school_name ILIKE q)
      AND NOT EXISTS (SELECT 1 FROM public.user_blocks b WHERE (b.blocker_id=me AND b.blocked_id=sp.user_id) OR (b.blocker_id=sp.user_id AND b.blocked_id=me))
    LIMIT greatest(p_limit, 1)
  );
END; $$;

-- ── G. Grants ────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.send_friend_request(uuid)        TO authenticated;
GRANT EXECUTE ON FUNCTION public.respond_friend_request(bigint, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.cancel_friend_request(bigint)    TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_friend(uuid)             TO authenticated;
GRANT EXECUTE ON FUNCTION public.block_user(uuid)                TO authenticated;
GRANT EXECUTE ON FUNCTION public.unblock_user(uuid)              TO authenticated;
GRANT EXECUTE ON FUNCTION public.friendship_status(uuid)         TO authenticated;
GRANT EXECUTE ON FUNCTION public.friends_count(uuid)            TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_my_friends()             TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_friend_requests()        TO authenticated;
GRANT EXECUTE ON FUNCTION public.mutual_friends(uuid)          TO authenticated;
GRANT EXECUTE ON FUNCTION public.suggested_friends(int)        TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_people(text, int)      TO authenticated;
-- social_card / social_notify are internal helpers (definer); no public grant needed.
