-- Partnership lead capture — Jun-4 RBAC Slice 2.
-- Schools and universities cannot self-register. They submit a partnership
-- request via the public marketing page, an admin reviews it, and only then
-- creates the org account.

create type if not exists partnership_org_type as enum ('school', 'university');
create type if not exists partnership_status   as enum ('new', 'contacted', 'approved', 'rejected');

create table if not exists public.partnership_requests (
  id              uuid primary key default gen_random_uuid(),
  org_type        partnership_org_type not null,
  org_name        text not null,
  contact_person  text not null,
  position        text,
  email           text not null,
  phone           text,
  -- school-specific:
  num_students    integer,
  city            text,
  -- university-specific:
  country         text,
  student_capacity integer,
  -- shared:
  message         text,
  status          partnership_status default 'new',
  admin_notes     text,
  reviewed_by     uuid references auth.users(id) on delete set null,
  reviewed_at     timestamptz,
  created_at      timestamptz default now()
);

create index if not exists partnership_requests_status_idx on public.partnership_requests (status, created_at desc);
create index if not exists partnership_requests_type_idx on public.partnership_requests (org_type);

-- RLS: anyone (even anonymous) can INSERT a request. Only admins can read/update.
alter table public.partnership_requests enable row level security;

drop policy if exists "partnership — anon insert" on public.partnership_requests;
drop policy if exists "partnership — admin read" on public.partnership_requests;
drop policy if exists "partnership — admin write" on public.partnership_requests;

create policy "partnership — anon insert"
  on public.partnership_requests for insert
  with check (true);

create policy "partnership — admin read"
  on public.partnership_requests for select
  using (auth.jwt() ->> 'email' in ('msharafeddine8@gmail.com'));

create policy "partnership — admin write"
  on public.partnership_requests for update
  using (auth.jwt() ->> 'email' in ('msharafeddine8@gmail.com'))
  with check (auth.jwt() ->> 'email' in ('msharafeddine8@gmail.com'));
