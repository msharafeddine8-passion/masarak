-- ============================================================================
-- SOCIAL SYSTEM · PHASE 5 — Follows + University official-page notifications.
-- ----------------------------------------------------------------------------
-- Net-new primitive: follow a university (generic target_type/target_id so it
-- can extend to orgs/topics later). Official announcements/events already have
-- public-read RLS (is_public + verified org), so the page reuses the existing
-- org_* fetch helpers; here we only add follows + follower notifications.
-- Additive only.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL,          -- 'university' (future: 'org','topic',...)
  target_id   text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, target_type, target_id)
);
CREATE INDEX IF NOT EXISTS follows_target_idx ON public.follows (target_type, target_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS follows_own ON public.follows;
CREATE POLICY follows_own ON public.follows FOR ALL USING (follower_id = auth.uid()) WITH CHECK (follower_id = auth.uid());

-- ── Follow RPCs ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.toggle_follow(p_target_type text, p_target_id text)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid();
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM public.follows WHERE follower_id=me AND target_type=p_target_type AND target_id=p_target_id) THEN
    DELETE FROM public.follows WHERE follower_id=me AND target_type=p_target_type AND target_id=p_target_id;
    RETURN false;
  END IF;
  INSERT INTO public.follows (follower_id, target_type, target_id) VALUES (me, p_target_type, p_target_id) ON CONFLICT DO NOTHING;
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.is_following(p_target_type text, p_target_id text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$ SELECT EXISTS (SELECT 1 FROM public.follows WHERE follower_id=auth.uid() AND target_type=p_target_type AND target_id=p_target_id); $$;

CREATE OR REPLACE FUNCTION public.followers_count(p_target_type text, p_target_id text)
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$ SELECT count(*)::int FROM public.follows WHERE target_type=p_target_type AND target_id=p_target_id; $$;

CREATE OR REPLACE FUNCTION public.my_follows(p_target_type text)
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$ SELECT coalesce(json_agg(target_id ORDER BY created_at DESC), '[]'::json) FROM public.follows WHERE follower_id=auth.uid() AND target_type=p_target_type; $$;

GRANT EXECUTE ON FUNCTION public.toggle_follow(text,text)  TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_following(text,text)   TO authenticated;
GRANT EXECUTE ON FUNCTION public.followers_count(text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.my_follows(text)          TO authenticated;

-- ── Notify followers when a verified university posts an announcement/event ──
CREATE OR REPLACE FUNCTION public.tg_notify_uni_followers() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE o public.organizations%ROWTYPE; kind text; label text; title text;
BEGIN
  IF NOT coalesce(NEW.is_public, false) THEN RETURN NEW; END IF;
  SELECT * INTO o FROM public.organizations WHERE id = NEW.org_id;
  IF o.org_type <> 'university' OR o.entity_id IS NULL THEN RETURN NEW; END IF;

  IF TG_TABLE_NAME = 'org_events' THEN kind := 'uni_event'; label := ' نشرت فعالية جديدة'; title := NEW.title;
  ELSE kind := 'uni_announcement'; label := ' نشرت إعلاناً جديداً'; title := NEW.title; END IF;

  INSERT INTO public.notifications (user_id, type, title, body, link, severity, channel)
  SELECT f.follower_id, kind, coalesce(o.display_name,'جامعة') || label, left(coalesce(title,''),120),
         '/universities/' || o.entity_id, 'info', 'in_app'
  FROM public.follows f
  WHERE f.target_type='university' AND f.target_id = o.entity_id::text;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS notify_uni_followers_ann ON public.org_announcements;
CREATE TRIGGER notify_uni_followers_ann AFTER INSERT ON public.org_announcements FOR EACH ROW EXECUTE FUNCTION public.tg_notify_uni_followers();
DROP TRIGGER IF EXISTS notify_uni_followers_evt ON public.org_events;
CREATE TRIGGER notify_uni_followers_evt AFTER INSERT ON public.org_events FOR EACH ROW EXECUTE FUNCTION public.tg_notify_uni_followers();
