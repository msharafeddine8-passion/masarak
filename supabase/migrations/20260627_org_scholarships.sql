-- Per-institution scholarships managed from the org dashboard (🎓 المنح tab),
-- shown on the institution's public page (Campus Life). Mirrors org_announcements.
create table if not exists org_scholarships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  amount text,        -- flexible label: "ممولة بالكامل", "إعفاء 50%", "5000$"
  coverage text,      -- full | partial | other
  deadline date,
  link text,
  is_public boolean not null default true,
  created_by uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_org_scholarships_org on org_scholarships(org_id);

alter table org_scholarships enable row level security;

create policy schol_write on org_scholarships for all
  using (is_org_manager(org_id)) with check (is_org_manager(org_id));

create policy schol_read on org_scholarships for select using (
  is_org_manager(org_id)
  or (is_public and exists (
    select 1 from organizations o
    where o.id = org_scholarships.org_id and o.verification_status = 'verified'
  ))
);
