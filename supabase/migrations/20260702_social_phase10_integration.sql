-- ============================================================================
-- SOCIAL SYSTEM · INTEGRATION (Feature 13) — social proof on entity pages.
-- ----------------------------------------------------------------------------
-- "Students who saved this" for any saved_items entity (scholarship, major,
-- university, …). Returns the total count (all savers) plus a few PUBLIC-profile
-- savers to show as avatars — never exposes private savers. Additive.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.savers_of(p_item_type text, p_item_id text, p_limit int DEFAULT 8)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog' AS $$
DECLARE me uuid := auth.uid();
BEGIN
  RETURN json_build_object(
    'count', (SELECT count(*)::int FROM public.saved_items WHERE item_type=p_item_type AND item_id=p_item_id),
    'people', (SELECT coalesce(json_agg(public.social_card(me, x.u)), '[]'::json)
               FROM (SELECT si.user_id AS u FROM public.saved_items si
                     JOIN public.student_profiles sp ON sp.user_id=si.user_id
                     WHERE si.item_type=p_item_type AND si.item_id=p_item_id AND sp.is_public=true
                     LIMIT greatest(p_limit,1)) x)
  );
END; $$;

GRANT EXECUTE ON FUNCTION public.savers_of(text, text, int) TO anon, authenticated;
