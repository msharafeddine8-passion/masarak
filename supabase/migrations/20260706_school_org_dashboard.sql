-- ============================================================================
-- Schools become first-class organizations (school profile + dashboard v1).
-- ----------------------------------------------------------------------------
-- Owner decision: a school gets a full profile + dashboard like a university,
-- and can edit its own details. We reuse the existing org system end-to-end
-- (claim / invite+redeem → org_members → /org/dashboard). This migration adds
-- the three missing pieces:
--   (1) seed an UNCLAIMED organizations row for every school in the directory
--       (linked via entity_id) so schools are claimable/verifiable like unis;
--   (2) org_update_school() — SECURITY DEFINER RPC that lets a VERIFIED school
--       org's managers edit their own schools row. The column whitelist lives
--       INSIDE the function: identity/SEO/verification columns (name, slug,
--       seo_index_status, is_verified, is_claimed, profile_status, data_source)
--       are NOT touchable — they stay admin-only;
--   (3) a sync trigger: when a school org's verification_status changes, the
--       schools row's is_claimed / is_verified flags follow, so the public
--       "موثّقة" badge and admin stats stay truthful automatically.
-- Idempotent. NOT auto-applied — run in the SQL editor after review.
-- ============================================================================

-- (1) Seed unclaimed org rows for schools that don't have one yet ------------
INSERT INTO public.organizations (org_type, entity_id, slug, display_name, verification_status, is_active)
SELECT 'school', s.id, 'school-' || s.slug, s.name, 'unclaimed', true
FROM public.schools s
WHERE s.slug IS NOT NULL AND btrim(s.slug) <> ''
  AND NOT EXISTS (
    SELECT 1 FROM public.organizations o
    WHERE o.org_type = 'school' AND o.entity_id = s.id
  )
ON CONFLICT (slug) DO NOTHING;

-- (2) School self-service edit RPC -------------------------------------------
CREATE OR REPLACE FUNCTION public.org_update_school(p_school_id bigint, p_patch jsonb)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE
  me uuid := auth.uid();
  v_org public.organizations%ROWTYPE;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF p_patch IS NULL OR jsonb_typeof(p_patch) <> 'object' THEN
    RAISE EXCEPTION 'invalid patch';
  END IF;

  -- Caller must manage the VERIFIED school org attached to this school row.
  SELECT * INTO v_org FROM public.organizations
   WHERE org_type = 'school' AND entity_id = p_school_id AND verification_status = 'verified'
   LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'school org not found or not verified'; END IF;
  IF NOT EXISTS (
    SELECT 1 FROM public.org_members m
    WHERE m.org_id = v_org.id AND m.user_id = me AND m.role IN ('owner','admin','editor')
  ) THEN
    RAISE EXCEPTION 'not an org manager';
  END IF;

  -- Whitelisted patch: only content/contact fields. Anything else in p_patch is
  -- silently ignored (name, slug, seo_index_status, is_verified… stay admin-only).
  UPDATE public.schools s SET
    name_en           = CASE WHEN p_patch ? 'name_en'           THEN NULLIF(btrim(p_patch->>'name_en'), '')           ELSE s.name_en           END,
    short_description = CASE WHEN p_patch ? 'short_description' THEN NULLIF(btrim(p_patch->>'short_description'), '') ELSE s.short_description END,
    description       = CASE WHEN p_patch ? 'description'       THEN NULLIF(btrim(p_patch->>'description'), '')       ELSE s.description       END,
    school_type       = CASE WHEN p_patch ? 'school_type'       THEN NULLIF(btrim(p_patch->>'school_type'), '')       ELSE s.school_type       END,
    lang              = CASE WHEN p_patch ? 'lang'              THEN NULLIF(btrim(p_patch->>'lang'), '')              ELSE s.lang              END,
    governorate       = CASE WHEN p_patch ? 'governorate'       THEN NULLIF(btrim(p_patch->>'governorate'), '')       ELSE s.governorate       END,
    district          = CASE WHEN p_patch ? 'district'          THEN NULLIF(btrim(p_patch->>'district'), '')          ELSE s.district          END,
    city_or_area      = CASE WHEN p_patch ? 'city_or_area'      THEN NULLIF(btrim(p_patch->>'city_or_area'), '')      ELSE s.city_or_area      END,
    address           = CASE WHEN p_patch ? 'address'           THEN NULLIF(btrim(p_patch->>'address'), '')           ELSE s.address           END,
    phone             = CASE WHEN p_patch ? 'phone'             THEN NULLIF(btrim(p_patch->>'phone'), '')             ELSE s.phone             END,
    email             = CASE WHEN p_patch ? 'email'             THEN NULLIF(btrim(p_patch->>'email'), '')             ELSE s.email             END,
    website           = CASE WHEN p_patch ? 'website'           THEN NULLIF(btrim(p_patch->>'website'), '')           ELSE s.website           END,
    logo_url          = CASE WHEN p_patch ? 'logo_url'          THEN NULLIF(btrim(p_patch->>'logo_url'), '')          ELSE s.logo_url          END,
    -- education_stages is a jsonb column → rebuild it as a clean jsonb array.
    education_stages  = CASE WHEN p_patch ? 'education_stages'
                             THEN COALESCE((SELECT jsonb_agg(btrim(x)) FROM jsonb_array_elements_text(p_patch->'education_stages') AS x WHERE btrim(x) <> ''), '[]'::jsonb)
                             ELSE s.education_stages END
  WHERE s.id = p_school_id;
END; $$;

GRANT EXECUTE ON FUNCTION public.org_update_school(bigint, jsonb) TO authenticated;

-- (3) Verification sync: school org status → schools row flags ----------------
CREATE OR REPLACE FUNCTION public.sync_school_org_verification()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
BEGIN
  IF NEW.org_type = 'school' AND NEW.entity_id IS NOT NULL
     AND (TG_OP = 'INSERT' OR NEW.verification_status IS DISTINCT FROM OLD.verification_status) THEN
    UPDATE public.schools SET
      is_verified = (NEW.verification_status = 'verified'),
      is_claimed  = (NEW.verification_status IN ('verified','pending') OR NEW.claimed_by IS NOT NULL)
    WHERE id = NEW.entity_id;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_sync_school_org_verification ON public.organizations;
CREATE TRIGGER trg_sync_school_org_verification
  AFTER INSERT OR UPDATE OF verification_status ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.sync_school_org_verification();
