-- ════════════════════════════════════════════════════════════════════════════
-- Masarak GLOBAL — Foundation (additive). 24 June 2026.
-- Builds the bilingual, globally-structured foundation ALONGSIDE the existing
-- Lebanon tables — it does NOT touch or break `scholarships` / `universities`
-- (the live site keeps working). New global content lives in *_global tables and
-- new reference tables. Switch the app over later, country by country.
-- Guardrail: only the 6 human-verified scholarships from the seed CSV are loaded;
-- everything else must come from the ingestion+review pipeline (no fabrication).
-- ════════════════════════════════════════════════════════════════════════════

-- ── Reference / dimension tables ────────────────────────────────────────────
create table if not exists countries (
  code            char(2) primary key,
  name_ar         text not null,
  name_en         text not null,
  slug            text not null unique,
  region          text,
  currency_code   char(3),
  flag_emoji      text,
  is_destination  boolean not null default false,
  is_active       boolean not null default true,
  meta_title_ar text, meta_title_en text, meta_description_ar text, meta_description_en text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table if not exists degree_levels (
  code       text primary key,
  name_ar    text not null,
  name_en    text not null,
  sort_order smallint not null
);

create table if not exists fields_of_study (
  id        bigserial primary key,
  parent_id bigint references fields_of_study(id),
  name_ar   text not null,
  name_en   text not null,
  slug      text not null unique,
  riasec_codes text[],
  icon      text
);

create table if not exists scholarships_global (
  id               bigserial primary key,
  slug             text not null unique,
  name_ar          text not null,
  name_en          text not null,
  host_country     char(2) references countries(code),
  is_multi_country boolean not null default false,
  provider_type    text not null,            -- government|university|private|ngo|research_grant
  funding_type     text not null,            -- fully_funded|partial
  coverage_en      text, coverage_ar text,
  min_gpa          numeric(4,2),
  language         text,
  ielts_min        numeric(3,1),
  toefl_min        smallint,
  seats            text,
  eligibility_en   text, eligibility_ar text,
  renewal_en       text, renewal_ar text,
  deadline         date, deadline_note text, intake text,
  application_link text, official_source text,
  description_short_en text, description_short_ar text,
  description_long_en  text, description_long_ar  text,
  meta_title_ar text, meta_title_en text, meta_description_ar text, meta_description_en text,
  status           text not null default 'unknown',  -- open|closed|upcoming|annual|unknown
  source_confidence text,                              -- official|aggregated|user_submitted
  last_verified_at timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create table if not exists scholarship_degree_levels (
  scholarship_id bigint references scholarships_global(id) on delete cascade,
  degree_code    text references degree_levels(code),
  primary key (scholarship_id, degree_code)
);

create table if not exists scholarship_host_countries (
  scholarship_id bigint references scholarships_global(id) on delete cascade,
  country_code   char(2) references countries(code),
  primary key (scholarship_id, country_code)
);

create index if not exists idx_sch_global_host   on scholarships_global(host_country);
create index if not exists idx_sch_global_status on scholarships_global(status);

-- ── RLS (consistent with the platform: public read, admin write) ────────────
alter table countries                  enable row level security;
alter table degree_levels              enable row level security;
alter table fields_of_study            enable row level security;
alter table scholarships_global        enable row level security;
alter table scholarship_degree_levels  enable row level security;
alter table scholarship_host_countries enable row level security;

create policy countries_read   on countries           for select using (is_active = true);
create policy degree_read      on degree_levels        for select using (true);
create policy fields_read      on fields_of_study      for select using (true);
create policy sch_g_read       on scholarships_global  for select using (status <> 'draft');
create policy sch_dl_read      on scholarship_degree_levels  for select using (true);
create policy sch_hc_read      on scholarship_host_countries for select using (true);

create policy countries_admin  on countries           for all using ((auth.jwt()->>'email')='msharafeddine8@gmail.com') with check ((auth.jwt()->>'email')='msharafeddine8@gmail.com');
create policy degree_admin     on degree_levels        for all using ((auth.jwt()->>'email')='msharafeddine8@gmail.com') with check ((auth.jwt()->>'email')='msharafeddine8@gmail.com');
create policy fields_admin     on fields_of_study      for all using ((auth.jwt()->>'email')='msharafeddine8@gmail.com') with check ((auth.jwt()->>'email')='msharafeddine8@gmail.com');
create policy sch_g_admin      on scholarships_global  for all using ((auth.jwt()->>'email')='msharafeddine8@gmail.com') with check ((auth.jwt()->>'email')='msharafeddine8@gmail.com');
create policy sch_dl_admin     on scholarship_degree_levels  for all using ((auth.jwt()->>'email')='msharafeddine8@gmail.com') with check ((auth.jwt()->>'email')='msharafeddine8@gmail.com');
create policy sch_hc_admin     on scholarship_host_countries for all using ((auth.jwt()->>'email')='msharafeddine8@gmail.com') with check ((auth.jwt()->>'email')='msharafeddine8@gmail.com');

-- ── Seed: degree levels ─────────────────────────────────────────────────────
insert into degree_levels (code, name_ar, name_en, sort_order) values
  ('diploma','دبلوم','Diploma',1),
  ('bachelor','بكالوريوس','Bachelor''s',2),
  ('master','ماجستير','Master''s',3),
  ('phd','دكتوراه','PhD',4),
  ('postdoc','ما بعد الدكتوراه','Postdoctoral',5)
on conflict (code) do nothing;

-- ── Seed: countries (28 — 13 study destinations + Arab markets + Lebanon) ────
insert into countries (code, name_ar, name_en, slug, region, currency_code, flag_emoji, is_destination) values
  ('US','الولايات المتحدة','United States','united-states','North America','USD','🇺🇸',true),
  ('GB','المملكة المتحدة','United Kingdom','united-kingdom','Europe','GBP','🇬🇧',true),
  ('CA','كندا','Canada','canada','North America','CAD','🇨🇦',true),
  ('AU','أستراليا','Australia','australia','Oceania','AUD','🇦🇺',true),
  ('DE','ألمانيا','Germany','germany','Europe','EUR','🇩🇪',true),
  ('FR','فرنسا','France','france','Europe','EUR','🇫🇷',true),
  ('IT','إيطاليا','Italy','italy','Europe','EUR','🇮🇹',true),
  ('NL','هولندا','Netherlands','netherlands','Europe','EUR','🇳🇱',true),
  ('CH','سويسرا','Switzerland','switzerland','Europe','CHF','🇨🇭',false),
  ('SE','السويد','Sweden','sweden','Europe','SEK','🇸🇪',false),
  ('NO','النرويج','Norway','norway','Europe','NOK','🇳🇴',false),
  ('DK','الدنمارك','Denmark','denmark','Europe','DKK','🇩🇰',false),
  ('TR','تركيا','Turkey','turkey','Middle East','TRY','🇹🇷',true),
  ('MY','ماليزيا','Malaysia','malaysia','Asia','MYR','🇲🇾',true),
  ('CN','الصين','China','china','Asia','CNY','🇨🇳',true),
  ('JP','اليابان','Japan','japan','Asia','JPY','🇯🇵',true),
  ('KR','كوريا الجنوبية','South Korea','south-korea','Asia','KRW','🇰🇷',true),
  ('SA','السعودية','Saudi Arabia','saudi-arabia','Middle East','SAR','🇸🇦',false),
  ('AE','الإمارات','United Arab Emirates','uae','Middle East','AED','🇦🇪',false),
  ('QA','قطر','Qatar','qatar','Middle East','QAR','🇶🇦',false),
  ('KW','الكويت','Kuwait','kuwait','Middle East','KWD','🇰🇼',false),
  ('BH','البحرين','Bahrain','bahrain','Middle East','BHD','🇧🇭',false),
  ('OM','عُمان','Oman','oman','Middle East','OMR','🇴🇲',false),
  ('JO','الأردن','Jordan','jordan','Middle East','JOD','🇯🇴',false),
  ('EG','مصر','Egypt','egypt','Africa','EGP','🇪🇬',false),
  ('MA','المغرب','Morocco','morocco','Africa','MAD','🇲🇦',false),
  ('TN','تونس','Tunisia','tunisia','Africa','TND','🇹🇳',false),
  ('LB','لبنان','Lebanon','lebanon','Middle East','LBP','🇱🇧',false)
on conflict (code) do nothing;
