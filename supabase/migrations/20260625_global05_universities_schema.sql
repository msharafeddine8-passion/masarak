-- ════════════════════════════════════════════════════════════════════════════
-- Masarak GLOBAL — universities_global table (additive; does NOT touch the live
-- Lebanon `universities` table). 25 June 2026. Volatile fields (tuition,
-- acceptance_rate) are intentionally nullable — never fabricated; users verify on
-- the official site. Rankings stored with rank_year, confidence 'aggregated'.
-- ════════════════════════════════════════════════════════════════════════════
create table if not exists universities_global (
  id bigserial primary key,
  country_code char(2) references countries(code),
  name_ar text not null, name_en text not null, slug text not null unique,
  city_ar text, city_en text,
  type text,                          -- public | private
  website text, logo_url text,
  qs_rank integer, the_rank integer, rank_year smallint,
  founded_year smallint, student_population integer,
  intl_students_pct numeric(5,2), acceptance_rate numeric(5,2),
  tuition_min numeric(12,2), tuition_max numeric(12,2), tuition_currency char(3),
  languages text[],
  description_short_ar text, description_short_en text,
  meta_title_ar text, meta_title_en text, meta_description_ar text, meta_description_en text,
  status text not null default 'published',     -- draft | published | archived
  source_confidence text, official_source text, last_verified_at timestamptz,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create index if not exists idx_uni_global_country on universities_global(country_code);
create index if not exists idx_uni_global_qs on universities_global(qs_rank);

alter table universities_global enable row level security;
create policy uni_g_read on universities_global for select using (status <> 'draft');
create policy uni_g_admin on universities_global for all
  using ((auth.jwt()->>'email')='msharafeddine8@gmail.com')
  with check ((auth.jwt()->>'email')='msharafeddine8@gmail.com');

-- Seed data (35 universities) is applied via global06/global07 and tracked in the
-- Supabase migration history.
