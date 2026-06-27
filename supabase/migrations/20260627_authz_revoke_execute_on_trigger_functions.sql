-- Defense-in-depth: pure trigger functions are invoked by triggers (which run as the
-- table owner), never by API callers. Revoke the redundant anon/authenticated EXECUTE
-- so they cannot be reached via /rest/v1/rpc/* and drop the linter's noise.
revoke execute on function public.ensure_student_card()      from anon, authenticated;
revoke execute on function public.org_affiliation_to_lead()  from anon, authenticated;
revoke execute on function public.sync_signup_role()         from anon, authenticated;
revoke execute on function public.touch_updated_at()         from anon, authenticated;
