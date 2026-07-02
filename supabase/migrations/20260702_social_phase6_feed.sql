-- ============================================================================
-- SOCIAL SYSTEM · PHASE 6 — Smart Feed (personalized, no random content).
-- ----------------------------------------------------------------------------
-- Pure query layer over what already exists: posts from my communities + my
-- friends, and announcements from universities I follow. Plus an "upcoming"
-- query (events from followed universities). Additive only — no new tables.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_feed(p_limit int DEFAULT 30, p_before timestamptz DEFAULT NULL)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid();
BEGIN
  IF me IS NULL THEN RETURN '[]'::json; END IF;
  RETURN (
    SELECT coalesce(json_agg(json_build_object('kind', kind, 'ts', ts, 'data', item) ORDER BY ts DESC), '[]'::json)
    FROM (
      -- Posts from communities I'm in, OR by my friends (deduped by post id)
      SELECT 'community_post' AS kind, p.created_at AS ts,
        json_build_object(
          'post_id', p.id,
          'community', json_build_object('slug', c.slug, 'name', c.name, 'icon', c.icon),
          'author', public.social_card(me, p.author_id),
          'body', left(p.body, 240),
          'like_count', p.like_count, 'comment_count', p.comment_count,
          'reason', CASE WHEN EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id=p.community_id AND cm.user_id=me)
                         THEN 'community' ELSE 'friend' END
        ) AS item
      FROM public.community_posts p
      JOIN public.communities c ON c.id = p.community_id
      WHERE p.is_removed = false
        AND (p_before IS NULL OR p.created_at < p_before)
        AND (
          EXISTS (SELECT 1 FROM public.community_members cm WHERE cm.community_id=p.community_id AND cm.user_id=me)
          OR EXISTS (SELECT 1 FROM public.friendships f WHERE f.status='accepted'
                      AND ((f.requester_id=me AND f.addressee_id=p.author_id) OR (f.requester_id=p.author_id AND f.addressee_id=me)))
        )

      UNION ALL

      -- Announcements from universities I follow
      SELECT 'uni_announcement' AS kind, a.created_at AS ts,
        json_build_object('uni_id', o.entity_id, 'uni_name', o.display_name,
                          'title', a.title, 'body', left(coalesce(a.body,''), 240)) AS item
      FROM public.org_announcements a
      JOIN public.organizations o ON o.id = a.org_id
      WHERE a.is_public AND o.org_type='university' AND o.verification_status='verified' AND o.entity_id IS NOT NULL
        AND (p_before IS NULL OR a.created_at < p_before)
        AND EXISTS (SELECT 1 FROM public.follows f WHERE f.follower_id=me AND f.target_type='university' AND f.target_id=o.entity_id::text)

      ORDER BY ts DESC
      LIMIT greatest(p_limit, 1)
    ) feed
  );
END; $$;

-- Upcoming events from followed universities (sorted soonest-first).
CREATE OR REPLACE FUNCTION public.get_upcoming(p_limit int DEFAULT 6)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid();
BEGIN
  IF me IS NULL THEN RETURN '[]'::json; END IF;
  RETURN (
    SELECT coalesce(json_agg(json_build_object('uni_id', uni_id, 'uni_name', uni_name, 'title', title,
                                               'location', location, 'event_type', event_type, 'starts_at', starts_at)
                             ORDER BY starts_at ASC), '[]'::json)
    FROM (
      SELECT o.entity_id AS uni_id, o.display_name AS uni_name, e.title, e.location, e.event_type, e.starts_at
      FROM public.org_events e
      JOIN public.organizations o ON o.id = e.org_id
      WHERE e.is_public AND o.org_type='university' AND o.verification_status='verified' AND o.entity_id IS NOT NULL
        AND e.starts_at >= now()
        AND EXISTS (SELECT 1 FROM public.follows f WHERE f.follower_id=me AND f.target_type='university' AND f.target_id=o.entity_id::text)
      ORDER BY e.starts_at ASC
      LIMIT greatest(p_limit, 1)
    ) up
  );
END; $$;

GRANT EXECUTE ON FUNCTION public.get_feed(int, timestamptz) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_upcoming(int)          TO authenticated;
