-- ============================================================================
-- Schools v2 — profile schema expansion + self-edit whitelist + unique Arabic
-- descriptions (Schools Module Rebuild, Wave 1).
-- ----------------------------------------------------------------------------
-- (1) 13 new profile columns (identity/story/people/facilities/activities) so a
--     school page can be a full profile, filled by the school via its dashboard.
-- (2) org_update_school() whitelist extended with the new fields + the existing
--     admission/accreditation/founded/students columns schools should own.
-- (3) Replace the 14 duplicated English boilerplate short_descriptions with a
--     UNIQUE Arabic description per school, composed ONLY from that school's
--     real fields (name/type/location/stages/curriculum/gender) via 4 rotating
--     sentence patterns — factual, no invention (rebuild rule #13).
-- Idempotent. NOT auto-applied — run in the SQL editor after review.
-- ============================================================================

-- (1) new columns -------------------------------------------------------------
ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS cover_image_url        text,
  ADD COLUMN IF NOT EXISTS history                text,
  ADD COLUMN IF NOT EXISTS mission                text,
  ADD COLUMN IF NOT EXISTS vision                 text,
  ADD COLUMN IF NOT EXISTS school_values          jsonb,
  ADD COLUMN IF NOT EXISTS why_choose             text,
  ADD COLUMN IF NOT EXISTS educational_philosophy text,
  ADD COLUMN IF NOT EXISTS principal_name         text,
  ADD COLUMN IF NOT EXISTS teachers_count         int,
  ADD COLUMN IF NOT EXISTS facilities             jsonb,
  ADD COLUMN IF NOT EXISTS activities             jsonb,
  ADD COLUMN IF NOT EXISTS learning_support       text,
  ADD COLUMN IF NOT EXISTS special_programs       text;

-- (2) extended self-edit whitelist ---------------------------------------------
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
    fees_min          = CASE WHEN p_patch ? 'fees_min'          THEN NULLIF(btrim(p_patch->>'fees_min'), '')::int      ELSE s.fees_min          END,
    fees_max          = CASE WHEN p_patch ? 'fees_max'          THEN NULLIF(btrim(p_patch->>'fees_max'), '')::int      ELSE s.fees_max          END,
    tuition_info      = CASE WHEN p_patch ? 'tuition_info'      THEN NULLIF(btrim(p_patch->>'tuition_info'), '')      ELSE s.tuition_info      END,
    -- v2: story & identity
    cover_image_url        = CASE WHEN p_patch ? 'cover_image_url'        THEN NULLIF(btrim(p_patch->>'cover_image_url'), '')        ELSE s.cover_image_url        END,
    history                = CASE WHEN p_patch ? 'history'                THEN NULLIF(btrim(p_patch->>'history'), '')                ELSE s.history                END,
    mission                = CASE WHEN p_patch ? 'mission'                THEN NULLIF(btrim(p_patch->>'mission'), '')                ELSE s.mission                END,
    vision                 = CASE WHEN p_patch ? 'vision'                 THEN NULLIF(btrim(p_patch->>'vision'), '')                 ELSE s.vision                 END,
    why_choose             = CASE WHEN p_patch ? 'why_choose'             THEN NULLIF(btrim(p_patch->>'why_choose'), '')             ELSE s.why_choose             END,
    educational_philosophy = CASE WHEN p_patch ? 'educational_philosophy' THEN NULLIF(btrim(p_patch->>'educational_philosophy'), '') ELSE s.educational_philosophy END,
    principal_name         = CASE WHEN p_patch ? 'principal_name'         THEN NULLIF(btrim(p_patch->>'principal_name'), '')         ELSE s.principal_name         END,
    learning_support       = CASE WHEN p_patch ? 'learning_support'       THEN NULLIF(btrim(p_patch->>'learning_support'), '')       ELSE s.learning_support       END,
    special_programs       = CASE WHEN p_patch ? 'special_programs'       THEN NULLIF(btrim(p_patch->>'special_programs'), '')       ELSE s.special_programs       END,
    -- v2: numbers schools should own
    teachers_count    = CASE WHEN p_patch ? 'teachers_count'    THEN NULLIF(btrim(p_patch->>'teachers_count'), '')::int ELSE s.teachers_count    END,
    founded           = CASE WHEN p_patch ? 'founded'           THEN NULLIF(btrim(p_patch->>'founded'), '')::int        ELSE s.founded           END,
    students          = CASE WHEN p_patch ? 'students'          THEN NULLIF(btrim(p_patch->>'students'), '')::int       ELSE s.students          END,
    -- v2: admission fields schools should own
    admission_info       = CASE WHEN p_patch ? 'admission_info'       THEN NULLIF(btrim(p_patch->>'admission_info'), '')       ELSE s.admission_info       END,
    requirements         = CASE WHEN p_patch ? 'requirements'         THEN NULLIF(btrim(p_patch->>'requirements'), '')         ELSE s.requirements         END,
    application_deadline = CASE WHEN p_patch ? 'application_deadline' THEN NULLIF(btrim(p_patch->>'application_deadline'), '') ELSE s.application_deadline END,
    accreditation        = CASE WHEN p_patch ? 'accreditation'        THEN NULLIF(btrim(p_patch->>'accreditation'), '')        ELSE s.accreditation        END,
    -- v2: lists (jsonb arrays of short Arabic labels)
    school_values     = CASE WHEN p_patch ? 'school_values'
                             THEN COALESCE((SELECT jsonb_agg(btrim(x)) FROM jsonb_array_elements_text(p_patch->'school_values') AS x WHERE btrim(x) <> ''), '[]'::jsonb)
                             ELSE s.school_values END,
    facilities        = CASE WHEN p_patch ? 'facilities'
                             THEN COALESCE((SELECT jsonb_agg(btrim(x)) FROM jsonb_array_elements_text(p_patch->'facilities') AS x WHERE btrim(x) <> ''), '[]'::jsonb)
                             ELSE s.facilities END,
    activities        = CASE WHEN p_patch ? 'activities'
                             THEN COALESCE((SELECT jsonb_agg(btrim(x)) FROM jsonb_array_elements_text(p_patch->'activities') AS x WHERE btrim(x) <> ''), '[]'::jsonb)
                             ELSE s.activities END,
    education_stages  = CASE WHEN p_patch ? 'education_stages'
                             THEN COALESCE((SELECT jsonb_agg(btrim(x)) FROM jsonb_array_elements_text(p_patch->'education_stages') AS x WHERE btrim(x) <> ''), '[]'::jsonb)
                             ELSE s.education_stages END
  WHERE s.id = p_school_id;
END; $$;

GRANT EXECUTE ON FUNCTION public.org_update_school(bigint, jsonb) TO authenticated;

-- (3) unique Arabic short descriptions ------------------------------------------
-- Targets only rows whose short_description contains no Arabic (i.e. the English
-- boilerplate) and that no school manages yet — never touches school-authored text.
WITH parts AS (
  SELECT id, name,
    COALESCE(
      CASE school_type
        WHEN 'private' THEN 'خاصة' WHEN 'official' THEN 'رسمية' WHEN 'international' THEN 'دولية'
        WHEN 'religious' THEN 'دينية' WHEN 'semi_private' THEN 'شبه مجانية'
        WHEN 'unrwa' THEN 'تابعة للأونروا' WHEN 'vocational' THEN 'مهنية'
      END,
      NULLIF(btrim(type), '')
    ) AS type_ar,
    CASE
      WHEN COALESCE(btrim(city_or_area),'') <> '' AND city_or_area ~ '[ء-ي]'
        THEN city_or_area || CASE WHEN COALESCE(btrim(governorate),'') <> '' AND governorate <> city_or_area THEN '، ' || governorate ELSE '' END
      WHEN COALESCE(btrim(governorate),'') <> ''
        THEN governorate || CASE WHEN COALESCE(btrim(city_or_area),'') <> '' THEN ' (' || city_or_area || ')' ELSE '' END
      ELSE NULLIF(btrim(city_or_area), '')
    END AS loc,
    (SELECT string_agg(
        CASE x WHEN 'kindergarten' THEN 'الروضة' WHEN 'primary' THEN 'الابتدائي'
               WHEN 'intermediate' THEN 'المتوسط' WHEN 'secondary' THEN 'الثانوي' ELSE x END,
        ' و' ORDER BY ord)
       FROM jsonb_array_elements_text(to_jsonb(education_stages)) WITH ORDINALITY t(x, ord)) AS stages_list,
    (to_jsonb(education_stages) @> '["kindergarten"]'::jsonb
     AND to_jsonb(education_stages) @> '["secondary"]'::jsonb) AS full_span,
    (SELECT string_agg(
        CASE x WHEN 'Lebanese' THEN 'المنهج اللبناني' WHEN 'French' THEN 'المنهج الفرنسي'
               WHEN 'American' THEN 'المنهج الأميركي' WHEN 'British' THEN 'المنهج البريطاني'
               WHEN 'IB' THEN 'البكالوريا الدولية (IB)' ELSE 'منهج ' || x END, ' و')
       FROM jsonb_array_elements_text(to_jsonb(curriculum)) t(x)) AS curr_ar,
    CASE gender_type WHEN 'boys' THEN 'للبنين' WHEN 'girls' THEN 'للبنات' END AS gender_ar
  FROM public.schools
  WHERE COALESCE(short_description,'') !~ '[ء-ي]'
    AND is_claimed = false
)
UPDATE public.schools s
SET short_description =
  CASE (p.id % 4)
    WHEN 0 THEN
      p.name
      || COALESCE(' مدرسة ' || p.type_ar, '')
      || COALESCE(' ' || p.gender_ar, '')
      || COALESCE(' في ' || p.loc, '')
      || CASE WHEN p.full_span THEN '، تغطّي المراحل من الروضة إلى الثانوي'
              WHEN p.stages_list IS NOT NULL THEN '، تقدّم مراحل ' || p.stages_list
              ELSE '' END
      || COALESCE(' وتعتمد ' || p.curr_ar, '') || '.'
    WHEN 1 THEN
      'تقع ' || p.name || COALESCE(' في ' || p.loc, '')
      || COALESCE('، وهي مدرسة ' || p.type_ar, '')
      || COALESCE(' ' || p.gender_ar, '')
      || CASE WHEN p.full_span THEN ' تستقبل الطلاب من الروضة حتى الثانوي'
              WHEN p.stages_list IS NOT NULL THEN ' تشمل مراحل ' || p.stages_list
              ELSE '' END
      || COALESCE('، وتدرّس وفق ' || p.curr_ar, '') || '.'
    WHEN 2 THEN
      COALESCE('مدرسة ' || p.type_ar || ' ', 'مدرسة ')
      || COALESCE(p.gender_ar || ' ', '')
      || COALESCE('في ' || p.loc || ': ', '')
      || p.name
      || CASE WHEN p.full_span THEN ' ترافق طلابها من الروضة إلى الثانوي'
              WHEN p.stages_list IS NOT NULL THEN ' تعلّم مراحل ' || p.stages_list
              ELSE '' END
      || COALESCE(' باعتماد ' || p.curr_ar, '') || '.'
    ELSE
      p.name || ' —'
      || COALESCE(' مدرسة ' || p.type_ar, ' مدرسة')
      || COALESCE(' ' || p.gender_ar, '')
      || COALESCE(' تخدم عائلات ' || p.loc, '')
      || CASE WHEN p.full_span THEN ' عبر كل المراحل من الروضة إلى الثانوي'
              WHEN p.stages_list IS NOT NULL THEN ' عبر مراحل ' || p.stages_list
              ELSE '' END
      || COALESCE('، وتعتمد في تعليمها ' || p.curr_ar, '') || '.'
  END,
  last_updated_at = now()
FROM parts p
WHERE s.id = p.id;
