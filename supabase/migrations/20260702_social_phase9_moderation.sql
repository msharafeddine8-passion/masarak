-- ============================================================================
-- SOCIAL SYSTEM · PHASE 9 (last core feature) — Moderation dashboard.
-- ----------------------------------------------------------------------------
-- content_reports + report_content already exist (Phase 4). This adds the
-- queue: list_reports (enriched with the reported content, scoped to what the
-- caller can moderate) + resolve_report (remove / dismiss / mark reviewed).
-- A caller may moderate a report if they are a platform admin, OR an admin/
-- moderator of the community the reported post/comment belongs to. Additive.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.list_reports(p_status text DEFAULT 'open', p_limit int DEFAULT 50)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog' AS $$
DECLARE me uuid := auth.uid();
BEGIN
  IF me IS NULL THEN RETURN '[]'::json; END IF;
  RETURN (
    SELECT coalesce(json_agg(item ORDER BY created_at DESC), '[]'::json)
    FROM (
      SELECT reps.item, reps.created_at
      FROM (
        SELECT r.created_at,
          CASE
            WHEN r.target_type='post'    THEN (SELECT p.community_id FROM public.community_posts p WHERE p.id = r.target_id::bigint)
            WHEN r.target_type='comment' THEN (SELECT p.community_id FROM public.community_comments cc JOIN public.community_posts p ON p.id=cc.post_id WHERE cc.id = r.target_id::bigint)
            ELSE NULL END AS comm_id,
          json_build_object(
            'id', r.id, 'target_type', r.target_type, 'target_id', r.target_id, 'reason', r.reason,
            'status', r.status, 'created_at', r.created_at, 'reporter', public.social_card(me, r.reporter_id),
            'content', CASE
              WHEN r.target_type='post'    THEN (SELECT json_build_object('body', left(p.body,300), 'author', public.social_card(me, p.author_id), 'community_slug', c.slug, 'community_name', c.name, 'post_id', p.id, 'is_removed', p.is_removed) FROM public.community_posts p JOIN public.communities c ON c.id=p.community_id WHERE p.id = r.target_id::bigint)
              WHEN r.target_type='comment' THEN (SELECT json_build_object('body', left(cc.body,300), 'author', public.social_card(me, cc.author_id), 'community_slug', c.slug, 'community_name', c.name, 'post_id', cc.post_id, 'is_removed', cc.is_removed) FROM public.community_comments cc JOIN public.community_posts p ON p.id=cc.post_id JOIN public.communities c ON c.id=p.community_id WHERE cc.id = r.target_id::bigint)
              ELSE NULL END
          ) AS item
        FROM public.content_reports r
        WHERE r.status = p_status
      ) reps
      WHERE public.is_admin() OR (reps.comm_id IS NOT NULL AND public.community_role(reps.comm_id) IN ('admin','moderator'))
      ORDER BY reps.created_at DESC
      LIMIT greatest(p_limit,1)
    ) t
  );
END; $$;

CREATE OR REPLACE FUNCTION public.resolve_report(p_id bigint, p_action text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog' AS $$
DECLARE me uuid := auth.uid(); r public.content_reports%ROWTYPE; comm bigint;
BEGIN
  SELECT * INTO r FROM public.content_reports WHERE id=p_id;
  IF NOT FOUND THEN RETURN; END IF;
  IF r.target_type='post'    THEN SELECT community_id INTO comm FROM public.community_posts WHERE id=r.target_id::bigint;
  ELSIF r.target_type='comment' THEN SELECT p.community_id INTO comm FROM public.community_comments cc JOIN public.community_posts p ON p.id=cc.post_id WHERE cc.id=r.target_id::bigint; END IF;
  IF NOT public.is_admin() AND (comm IS NULL OR public.community_role(comm) NOT IN ('admin','moderator')) THEN RAISE EXCEPTION 'not allowed'; END IF;

  IF p_action='remove' THEN
    IF r.target_type='post'    THEN PERFORM public.remove_post(r.target_id::bigint);
    ELSIF r.target_type='comment' THEN PERFORM public.remove_comment(r.target_id::bigint); END IF;
    UPDATE public.content_reports SET status='reviewed', reviewed_by=me, reviewed_at=now() WHERE id=p_id;
  ELSIF p_action='dismiss' THEN
    UPDATE public.content_reports SET status='dismissed', reviewed_by=me, reviewed_at=now() WHERE id=p_id;
  ELSE
    UPDATE public.content_reports SET status='reviewed', reviewed_by=me, reviewed_at=now() WHERE id=p_id;
  END IF;
END; $$;

GRANT EXECUTE ON FUNCTION public.list_reports(text, int)      TO authenticated;
GRANT EXECUTE ON FUNCTION public.resolve_report(bigint, text) TO authenticated;
