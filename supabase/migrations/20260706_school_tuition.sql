-- ============================================================================
-- School tuition transparency v1 (safe, school-provided) — «متتبّع الأقساط».
-- ----------------------------------------------------------------------------
-- The public school page already RENDERS fees (schools.fees_min / fees_max /
-- tuition_info), but schools had no way to edit them. This extends the
-- org_update_school() whitelist to those three columns so a verified school can
-- publish its own current fees (in USD) from its dashboard. Authoritative
-- (school's own data) — NOT crowd-sourced; the parent-verification layer is a
-- separate, later decision.
--
-- This is a CREATE OR REPLACE of the function from 20260706_school_org_dashboard
-- with fees_min / fees_max / tuition_info added. Idempotent. NOT auto-applied.
-- ============================================================================

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
    -- Tuition (USD) — school-published; empty string clears to NULL.
    fees_min          = CASE WHEN p_patch ? 'fees_min'          THEN NULLIF(btrim(p_patch->>'fees_min'), '')::int      ELSE s.fees_min          END,
    fees_max          = CASE WHEN p_patch ? 'fees_max'          THEN NULLIF(btrim(p_patch->>'fees_max'), '')::int      ELSE s.fees_max          END,
    tuition_info      = CASE WHEN p_patch ? 'tuition_info'      THEN NULLIF(btrim(p_patch->>'tuition_info'), '')      ELSE s.tuition_info      END,
    education_stages  = CASE WHEN p_patch ? 'education_stages'
                             THEN COALESCE((SELECT jsonb_agg(btrim(x)) FROM jsonb_array_elements_text(p_patch->'education_stages') AS x WHERE btrim(x) <> ''), '[]'::jsonb)
                             ELSE s.education_stages END
  WHERE s.id = p_school_id;
END; $$;

GRANT EXECUTE ON FUNCTION public.org_update_school(bigint, jsonb) TO authenticated;
