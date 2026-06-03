-- ============================================================================
-- student_context — cross-device sync for student profile + saved items
-- ============================================================================
-- Per the audit (Jun 3 2026): "طلب student_context يعيد 404 — خلل فعلي".
-- The frontend reads from this table on auth load to restore profile/DNA/saved
-- items across devices. Until this migration is applied, the table is missing
-- and the fetch silently fails (we already swallow the error in
-- src/context/StudentContext.tsx with try/catch + .maybeSingle()), but content
-- never syncs from device A to device B.
--
-- Apply this migration to enable real cross-device sync.
-- ============================================================================

create table if not exists public.student_context (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  profile              jsonb,
  career_dna           jsonb,
  skill_gap            jsonb,
  saved_universities   jsonb default '[]'::jsonb,
  saved_scholarships   jsonb default '[]'::jsonb,
  saved_internships    jsonb default '[]'::jsonb,
  created_at           timestamptz default now(),
  updated_at           timestamptz default now()
);

-- Each user can only read/write their own row.
alter table public.student_context enable row level security;

drop policy if exists "student_context — own read"  on public.student_context;
drop policy if exists "student_context — own write" on public.student_context;

create policy "student_context — own read"
  on public.student_context for select
  using (auth.uid() = user_id);

create policy "student_context — own write"
  on public.student_context for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Optional index for updated_at — useful if you later want to find recently active users.
create index if not exists student_context_updated_at_idx
  on public.student_context (updated_at desc);
