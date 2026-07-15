-- ============================================================================
-- Schools Wave 2b — slug repair + 301 redirects + quality_score (spec M2, J).
-- ----------------------------------------------------------------------------
-- (1) school_slug_redirects: permanent old→new slug map. The profile page falls
--     back to it and 301s, so old links (and any indexed URLs) never 404.
--     MUST land before indexing ever opens (spec Sprint-0 #6).
-- (2) Repair the 6 broken French-transliteration slugs (ç→c, œ→oe) + the
--     "Capucinns" typo, and register their old slugs as redirects.
-- (3) quality_score (0–100): computed per spec Part J (adapted to the live
--     schema), stored on the row, recomputed by trigger on every write, and
--     backfilled for all rows. Powers admin KPIs + future server-side sort and
--     the indexability gate.
-- Idempotent. NOT auto-applied — run in the SQL editor after review.
-- ============================================================================

-- (1) redirects table ---------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.school_slug_redirects (
  old_slug   text PRIMARY KEY,
  school_id  bigint NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.school_slug_redirects ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS ssr_public_read ON public.school_slug_redirects;
CREATE POLICY ssr_public_read ON public.school_slug_redirects FOR SELECT USING (true);

-- (2) repair the six broken slugs (register old first, then update) -----------
INSERT INTO public.school_slug_redirects (old_slug, school_id) VALUES
  ('college-saint-fran-ois-des-peres-capucinns', 107),
  ('college-protestant-fran-ais',                108),
  ('lycee-fran-ais-international-elite',         111),
  ('college-des-s-urs-des-saints-c-urs-hadath',  181),
  ('college-de-besan-on',                        237),
  ('ecole-val-pere-jacques-des-s-urs-de-la-croix', 241)
ON CONFLICT (old_slug) DO NOTHING;

UPDATE public.schools SET slug = 'college-saint-francois-des-peres-capucins',
  name = 'Collège Saint François des Pères Capucins',
  name_en = 'Collège Saint François des Pères Capucins'
  WHERE id = 107 AND slug = 'college-saint-fran-ois-des-peres-capucinns';
UPDATE public.schools SET slug = 'college-protestant-francais'
  WHERE id = 108 AND slug = 'college-protestant-fran-ais';
UPDATE public.schools SET slug = 'lycee-francais-international-elite'
  WHERE id = 111 AND slug = 'lycee-fran-ais-international-elite';
UPDATE public.schools SET slug = 'college-des-soeurs-des-saints-coeurs-hadath'
  WHERE id = 181 AND slug = 'college-des-s-urs-des-saints-c-urs-hadath';
UPDATE public.schools SET slug = 'college-de-besancon'
  WHERE id = 237 AND slug = 'college-de-besan-on';
UPDATE public.schools SET slug = 'ecole-val-pere-jacques-des-soeurs-de-la-croix'
  WHERE id = 241 AND slug = 'ecole-val-pere-jacques-des-s-urs-de-la-croix';

-- DATA RULE (spec Part C): the 8 governorate slugs are reserved URLs and must
-- never be assigned to a school:
--   beirut, mount-lebanon, north, akkar, bekaa, baalbek-hermel, south, nabatieh

-- (3) quality_score ------------------------------------------------------------
ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS quality_score smallint NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.fn_school_quality(s public.schools)
RETURNS smallint
LANGUAGE sql IMMUTABLE
AS $$
  SELECT LEAST(100,
    -- identity & classification (15)
    3
    + (CASE WHEN COALESCE(btrim(s.name_en),'') <> '' THEN 3 ELSE 0 END)
    + (CASE WHEN COALESCE(s.school_type, s.type) IS NOT NULL THEN 3 ELSE 0 END)
    + (CASE WHEN s.gender_type IS NOT NULL THEN 3 ELSE 0 END)
    + (CASE WHEN s.founded IS NOT NULL THEN 3 ELSE 0 END)
    -- location (15)
    + (CASE WHEN COALESCE(btrim(s.governorate),'') <> '' THEN 3 ELSE 0 END)
    + (CASE WHEN COALESCE(btrim(s.district),'') <> '' THEN 3 ELSE 0 END)
    + (CASE WHEN COALESCE(btrim(s.city_or_area),'') <> '' THEN 3 ELSE 0 END)
    + (CASE WHEN COALESCE(btrim(s.address),'') <> '' THEN 3 ELSE 0 END)
    + (CASE WHEN s.latitude IS NOT NULL AND s.longitude IS NOT NULL THEN 3 ELSE 0 END)
    -- contact (10)
    + (CASE WHEN COALESCE(btrim(s.phone),'') <> '' THEN 4 ELSE 0 END)
    + (CASE WHEN COALESCE(btrim(s.website),'') <> '' OR COALESCE(btrim(s.email),'') <> '' THEN 3 ELSE 0 END)
    + (CASE WHEN s.social_links IS NOT NULL AND s.social_links::text NOT IN ('{}','null') THEN 3 ELSE 0 END)
    -- narrative (20)
    + (CASE WHEN COALESCE(btrim(s.description),'') <> '' THEN 10 ELSE 0 END)
    + (CASE WHEN ((CASE WHEN COALESCE(btrim(s.history),'')<>'' THEN 1 ELSE 0 END)
                 +(CASE WHEN COALESCE(btrim(s.mission),'')<>'' THEN 1 ELSE 0 END)
                 +(CASE WHEN COALESCE(btrim(s.vision),'')<>''  THEN 1 ELSE 0 END)) >= 2 THEN 6 ELSE 0 END)
    + (CASE WHEN COALESCE(btrim(s.why_choose),'') <> '' THEN 4 ELSE 0 END)
    -- academic (15)
    + (CASE WHEN s.education_stages IS NOT NULL AND jsonb_array_length(to_jsonb(s.education_stages)) > 0 THEN 4 ELSE 0 END)
    + (CASE WHEN s.curriculum IS NOT NULL AND jsonb_array_length(to_jsonb(s.curriculum)) > 0 THEN 4 ELSE 0 END)
    + (CASE WHEN COALESCE(btrim(s.lang),'') <> '' OR (s.teaching_languages IS NOT NULL AND jsonb_array_length(to_jsonb(s.teaching_languages)) > 0) THEN 4 ELSE 0 END)
    + (CASE WHEN COALESCE(btrim(s.accreditation),'') <> '' THEN 3 ELSE 0 END)
    -- student life + facilities (10)
    + (CASE WHEN s.activities IS NOT NULL AND jsonb_array_length(to_jsonb(s.activities)) >= 3 THEN 5 ELSE 0 END)
    + (CASE WHEN s.facilities IS NOT NULL AND jsonb_array_length(to_jsonb(s.facilities)) >= 3 THEN 5 ELSE 0 END)
    -- media (10)
    + (CASE WHEN COALESCE(btrim(s.logo_url),'') <> '' THEN 4 ELSE 0 END)
    + (CASE WHEN COALESCE(btrim(s.cover_image_url),'') <> '' THEN 3 ELSE 0 END)
    + (CASE WHEN s.images IS NOT NULL AND jsonb_array_length(to_jsonb(s.images)) >= 3 THEN 3 ELSE 0 END)
    -- trust (5)
    + (CASE WHEN s.is_verified THEN 5 ELSE 0 END)
  )::smallint;
$$;

CREATE OR REPLACE FUNCTION public.trg_school_quality()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.quality_score := public.fn_school_quality(NEW);
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS school_quality_biu ON public.schools;
CREATE TRIGGER school_quality_biu
  BEFORE INSERT OR UPDATE ON public.schools
  FOR EACH ROW EXECUTE FUNCTION public.trg_school_quality();

-- backfill every row (fires the trigger)
UPDATE public.schools SET quality_score = public.fn_school_quality(schools.*);

-- quick sanity report
SELECT count(*) AS total,
       round(avg(quality_score)) AS avg_score,
       count(*) FILTER (WHERE quality_score >= 40) AS indexable_band,
       max(quality_score) AS best
FROM public.schools;
