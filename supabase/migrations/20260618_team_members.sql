-- ============================================================
-- team_members: admin-controlled team page content
-- ============================================================

create table if not exists public.team_members (
  id             uuid        primary key default gen_random_uuid(),
  name_ar        text        not null,
  name           text,
  role_ar        text        not null,
  role           text,
  bio_ar         text,
  bio            text,
  avatar_url     text,
  avatar_emoji   text        not null default '👤',
  email          text,
  linkedin_url   text,
  display_order  integer     not null default 0,
  is_visible     boolean     not null default true,
  created_at     timestamptz not null default now()
);

-- Row-level security
alter table public.team_members enable row level security;

-- Public: read visible members only
create policy "team_members_public_select"
  on public.team_members
  for select
  using (is_visible = true);

-- Admin: full access
create policy "team_members_admin_all"
  on public.team_members
  for all
  using (
    (select email from auth.users where id = auth.uid()) = 'msharafeddine8@gmail.com'
  )
  with check (
    (select email from auth.users where id = auth.uid()) = 'msharafeddine8@gmail.com'
  );

-- Seed: founder record (migrated from hardcoded page)
insert into public.team_members (
  name_ar, name,
  role_ar, role,
  bio_ar,
  avatar_emoji, email,
  display_order, is_visible
)
values (
  'محمد شرف الدين',
  'Mohamad Sharafeddine',
  'المؤسس والمدير التنفيذي',
  'Founder & CEO',
  'خريج لبناني، شغل ٥+ سنين بالتكنولوجيا والتسويق الرقمي. بنى مسارك بعد ما شاف صديقتو الصغيرة عم تختار جامعتها بناءً على إعلانات Instagram بدل بيانات حقيقية.',
  '👨‍💻',
  'mohamad@masaraklb.com',
  1,
  true
)
on conflict do nothing;
