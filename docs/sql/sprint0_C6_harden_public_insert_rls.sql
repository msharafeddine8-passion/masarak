-- Sprint 0 — Audit finding C6
-- Replace the 4 "always true" public INSERT RLS policies with conservative
-- WITH CHECK constraints. Public inserts stay allowed (the forms keep working),
-- but anonymous callers can no longer:
--   • forge admin/workflow columns (e.g. a pre-"approved" sponsor application,
--     a support ticket with internal_notes/resolution),
--   • impersonate another user in analytics (user_id must be null or self),
--   • submit oversized payloads.
-- Every legitimate form submission satisfies these checks.
--
-- HOW TO RUN: paste into Supabase Dashboard → SQL Editor → Run.
-- Safe/reversible: only changes the WITH CHECK expression of existing policies.

ALTER POLICY ns_public_insert ON public.newsletter_subscribers
  WITH CHECK (
    char_length(email) BETWEEN 5 AND 320
    AND position('@' in email) > 1
    AND (source IS NULL OR char_length(source) <= 100)
    AND (language IS NULL OR char_length(language) <= 12)
    AND unsubscribed IS NOT TRUE
  );

ALTER POLICY st_insert_anyone ON public.support_tickets
  WITH CHECK (
    char_length(subject) BETWEEN 1 AND 200
    AND char_length(body) BETWEEN 1 AND 5000
    AND (email IS NULL OR char_length(email) <= 320)
    AND (name IS NULL OR char_length(name) <= 120)
    AND internal_notes IS NULL
    AND resolution IS NULL
    AND assigned_to IS NULL
    AND resolved_at IS NULL
    AND first_response_at IS NULL
  );

ALTER POLICY "anyone can insert" ON public.sponsor_applications
  WITH CHECK (
    char_length(org_name) BETWEEN 1 AND 200
    AND char_length(contact_name) BETWEEN 1 AND 120
    AND char_length(contact_email) BETWEEN 5 AND 320
    AND (message IS NULL OR char_length(message) <= 5000)
    AND (website IS NULL OR char_length(website) <= 500)
    AND reviewed_by IS NULL
    AND reviewed_at IS NULL
    AND admin_notes IS NULL
  );

ALTER POLICY ae_insert_anyone ON public.analytics_events
  WITH CHECK (
    char_length(event_name) BETWEEN 1 AND 100
    AND (user_id IS NULL OR user_id = (SELECT auth.uid()))
    AND (page_url IS NULL OR char_length(page_url) <= 2000)
    AND (referrer IS NULL OR char_length(referrer) <= 2000)
  );

-- Verify afterwards:
--   SELECT tablename, policyname, with_check FROM pg_policies
--   WHERE schemaname='public'
--     AND tablename IN ('analytics_events','newsletter_subscribers','sponsor_applications','support_tickets')
--     AND cmd='INSERT';
