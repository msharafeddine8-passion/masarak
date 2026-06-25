-- ════════════════════════════════════════════════════════════════════════════
-- Audit Fix #05 — FK indexes (M-9) + role-escalation guard (H-3) — 24 June 2026
--   • M-9 — add a covering index for every foreign key that lacked one (advisor
--           "unindexed_foreign_keys"): faster joins + cascades.
--   • H-3 — block self-service role escalation: a BEFORE UPDATE trigger silently
--           reverts any change to profiles.role / user_profiles.primary_role /
--           user_profiles.active_role unless the caller is the platform admin.
--           Safe: the app never updates these columns directly (it updates
--           student_profiles.role only, via admin), and the signup trigger INSERTs
--           (triggers here are UPDATE-only).
-- ════════════════════════════════════════════════════════════════════════════

-- ── M-9: covering indexes for unindexed foreign keys ────────────────────────
create index if not exists idx_internship_applications_user_id on public.internship_applications (user_id);
create index if not exists idx_notifications_created_by on public.notifications (created_by);
create index if not exists idx_org_access_requests_org_id on public.org_access_requests (org_id);
create index if not exists idx_org_access_requests_reviewed_by on public.org_access_requests (reviewed_by);
create index if not exists idx_org_activity_actor_id on public.org_activity (actor_id);
create index if not exists idx_org_affiliations_requested_by on public.org_affiliations (requested_by);
create index if not exists idx_org_affiliations_verified_by on public.org_affiliations (verified_by);
create index if not exists idx_org_announcements_created_by on public.org_announcements (created_by);
create index if not exists idx_org_events_created_by on public.org_events (created_by);
create index if not exists idx_org_invites_invited_by on public.org_invites (invited_by);
create index if not exists idx_org_invites_redeemed_by on public.org_invites (redeemed_by);
create index if not exists idx_org_media_created_by on public.org_media (created_by);
create index if not exists idx_org_members_invited_by on public.org_members (invited_by);
create index if not exists idx_org_messages_org_id on public.org_messages (org_id);
create index if not exists idx_org_messages_sender_id on public.org_messages (sender_id);
create index if not exists idx_organizations_claimed_by on public.organizations (claimed_by);
create index if not exists idx_quiz_user_badges_badge_id on public.quiz_user_badges (badge_id);
create index if not exists idx_quiz_user_history_question_id on public.quiz_user_history (question_id);
create index if not exists idx_scholarship_applications_user_id on public.scholarship_applications (user_id);
create index if not exists idx_scholarship_tracker_scholarship_id on public.scholarship_tracker (scholarship_id);
create index if not exists idx_sponsor_applications_reviewed_by on public.sponsor_applications (reviewed_by);
create index if not exists idx_university_reviews_user_id on public.university_reviews (user_id);
create index if not exists idx_user_badges_badge_id on public.user_badges (badge_id);
create index if not exists idx_user_challenges_challenge_id on public.user_challenges (challenge_id);

-- ── H-3: guard privileged role columns against self-escalation ──────────────
create or replace function public.guard_role_columns()
returns trigger
language plpgsql
security definer
set search_path = public, pg_catalog
as $$
begin
  -- Platform admin may change roles freely.
  if (auth.jwt() ->> 'email') = 'msharafeddine8@gmail.com' then
    return new;
  end if;
  -- Everyone else: keep the existing privileged values (silent no-op).
  if tg_table_name = 'profiles' then
    new.role := old.role;
  elsif tg_table_name = 'user_profiles' then
    new.primary_role := old.primary_role;
    new.active_role  := old.active_role;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_guard_profiles_role on public.profiles;
create trigger trg_guard_profiles_role before update on public.profiles
  for each row execute function public.guard_role_columns();

drop trigger if exists trg_guard_user_profiles_role on public.user_profiles;
create trigger trg_guard_user_profiles_role before update on public.user_profiles
  for each row execute function public.guard_role_columns();
