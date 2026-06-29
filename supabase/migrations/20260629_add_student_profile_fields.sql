-- Give the profile form's "homeless" fields real columns on student_profiles.
-- These were written by AcademicTab but existed on NO table, so they were silently
-- dropped on save (and previously 400'd the whole save). Purely additive + nullable
-- → zero data loss, safe to run on production directly.
alter table public.student_profiles add column if not exists city text;
alter table public.student_profiles add column if not exists gender text;
alter table public.student_profiles add column if not exists date_of_birth date;
alter table public.student_profiles add column if not exists bac_section text;
alter table public.student_profiles add column if not exists bac_grade numeric;
alter table public.student_profiles add column if not exists graduation_year integer;
alter table public.student_profiles add column if not exists preferred_universities text[];
-- The Academic tab's per-subject grades editor (subject/score/max) also had no home.
alter table public.student_profiles add column if not exists grades jsonb default '[]'::jsonb;
