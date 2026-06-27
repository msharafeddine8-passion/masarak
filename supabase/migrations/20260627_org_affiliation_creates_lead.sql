-- When a student requests affiliation (انتساب) with an institution, surface them
-- in that org's Leads pipeline as an 'applied' lead — previously affiliation
-- requests only landed in org_affiliations (the Students tab) and never showed up
-- as leads, so institutions didn't see applicants in their pipeline.
-- org_leads.student_id references auth.users, so we use the affiliation's user_id.
create or replace function org_affiliation_to_lead() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into org_leads (org_id, student_id, source, status, score, first_interaction_at, last_interaction_at)
  values (NEW.org_id, NEW.user_id, 'affiliation', 'applied', 70, now(), now())
  on conflict (org_id, student_id) do update
    set status = case when org_leads.status in ('new','contacted','engaged') then 'applied' else org_leads.status end,
        last_interaction_at = now(),
        score = greatest(coalesce(org_leads.score, 0), 70);
  return NEW;
end$$;

drop trigger if exists trg_affiliation_to_lead on org_affiliations;
create trigger trg_affiliation_to_lead
  after insert on org_affiliations
  for each row execute function org_affiliation_to_lead();

-- Backfill existing affiliations into the leads pipeline.
insert into org_leads (org_id, student_id, source, status, score, first_interaction_at, last_interaction_at)
select org_id, user_id, 'affiliation', 'applied', 70, created_at, now()
from org_affiliations
on conflict (org_id, student_id) do nothing;
