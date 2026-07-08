-- ============================================================================
-- Notify a student when their university replies (org → student).
-- ----------------------------------------------------------------------------
-- Student → university messages already notify the org's admins (inside the
-- message_university RPC). The reverse direction did not: when a university
-- replied (an org_messages row with sender_type='org'), the student got no
-- notification and their reply lived only in the org dashboard.
--
-- A trigger handles it with zero client changes: on any org→student org_messages
-- insert, drop a notification for the recipient linking to /messages (where the
-- student now sees the university thread under the 🏛️ tab). SECURITY DEFINER on
-- the trigger function lets it write the notification across RLS.
-- Idempotent. NOT yet applied — production trigger; apply after review.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.notify_student_on_org_reply()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE uni_name text;
BEGIN
  IF NEW.sender_type = 'org' AND NEW.recipient_id IS NOT NULL THEN
    SELECT name INTO uni_name FROM public.organizations WHERE id = NEW.org_id;
    BEGIN
      INSERT INTO public.notifications (user_id, type, title, body, link, severity, channel)
      VALUES (
        NEW.recipient_id,
        'uni_reply',
        coalesce(uni_name,'الجامعة') || ' ردّت على رسالتك 🏛️',
        left(NEW.body,120),
        '/messages',
        'info',
        'in_app'
      );
    EXCEPTION WHEN others THEN NULL; -- notifications are best-effort, never block the reply
    END;
  END IF;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS trg_notify_student_on_org_reply ON public.org_messages;
CREATE TRIGGER trg_notify_student_on_org_reply
  AFTER INSERT ON public.org_messages
  FOR EACH ROW EXECUTE FUNCTION public.notify_student_on_org_reply();
