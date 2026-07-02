-- ============================================================================
-- SOCIAL SYSTEM · PHASE 3 — Private Messaging (1:1 chat + Realtime + shares)
-- ----------------------------------------------------------------------------
-- Conversations / participants / messages, member-scoped RLS, Realtime on
-- messages, and RPCs for the whole flow. Attachments (image/pdf) + educational
-- share-cards (scholarship/university/major/article) live on the message row.
--
-- SAFETY: a DM can only be *started* between accepted friends (prevents
-- strangers messaging students, who may be minors). Existing conversations
-- keep working; a block stops delivery either way. Additive only.
-- ============================================================================

-- ── Tables ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  is_group        boolean NOT NULL DEFAULT false,
  title           text,
  created_by      uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      timestamptz NOT NULL DEFAULT now(),
  last_message_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id bigint NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id         uuid   NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  joined_at       timestamptz NOT NULL DEFAULT now(),
  last_read_at    timestamptz NOT NULL DEFAULT now(),
  is_pinned       boolean NOT NULL DEFAULT false,
  is_muted        boolean NOT NULL DEFAULT false,
  PRIMARY KEY (conversation_id, user_id)
);
CREATE INDEX IF NOT EXISTS conv_participants_user_idx ON public.conversation_participants (user_id);

CREATE TABLE IF NOT EXISTS public.messages (
  id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id bigint NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       uuid   NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body            text,
  attachment_url  text,
  attachment_type text CHECK (attachment_type IN ('image','pdf','file')),
  share_type      text CHECK (share_type IN ('scholarship','university','major','article')),
  share_ref       text,
  share_data      jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  edited_at       timestamptz,
  CONSTRAINT message_not_empty CHECK (body IS NOT NULL OR attachment_url IS NOT NULL OR share_type IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS messages_conv_idx ON public.messages (conversation_id, created_at DESC);

ALTER TABLE public.conversations             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages                  ENABLE ROW LEVEL SECURITY;

-- ── Membership helper (SECURITY DEFINER → avoids RLS recursion) ──────────────
CREATE OR REPLACE FUNCTION public.is_conv_member(p_conv bigint)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$ SELECT EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id=p_conv AND user_id=auth.uid()); $$;

-- ── RLS ──────────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS conv_member_read ON public.conversations;
CREATE POLICY conv_member_read ON public.conversations FOR SELECT USING (public.is_conv_member(id));

DROP POLICY IF EXISTS cp_member_read ON public.conversation_participants;
CREATE POLICY cp_member_read ON public.conversation_participants FOR SELECT USING (public.is_conv_member(conversation_id));
DROP POLICY IF EXISTS cp_update_self ON public.conversation_participants;
CREATE POLICY cp_update_self ON public.conversation_participants FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS msg_member_read ON public.messages;
CREATE POLICY msg_member_read ON public.messages FOR SELECT USING (public.is_conv_member(conversation_id));
DROP POLICY IF EXISTS msg_member_insert ON public.messages;
CREATE POLICY msg_member_insert ON public.messages FOR INSERT WITH CHECK (sender_id = auth.uid() AND public.is_conv_member(conversation_id));

-- ── Realtime (clients subscribe to postgres_changes on messages; RLS gates it) ─
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication_tables WHERE pubname='supabase_realtime' AND schemaname='public' AND tablename='messages') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;
END $$;

-- ── RPCs ─────────────────────────────────────────────────────────────────────
-- Start (or fetch) a 1:1 conversation — friends only for NEW conversations.
CREATE OR REPLACE FUNCTION public.get_or_create_dm(p_other uuid)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid(); conv bigint;
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF p_other = me THEN RAISE EXCEPTION 'cannot message yourself'; END IF;
  IF EXISTS (SELECT 1 FROM public.user_blocks WHERE (blocker_id=me AND blocked_id=p_other) OR (blocker_id=p_other AND blocked_id=me)) THEN
    RAISE EXCEPTION 'blocked';
  END IF;

  -- existing 1:1?
  SELECT c.id INTO conv
  FROM public.conversations c
  JOIN public.conversation_participants p1 ON p1.conversation_id=c.id AND p1.user_id=me
  JOIN public.conversation_participants p2 ON p2.conversation_id=c.id AND p2.user_id=p_other
  WHERE c.is_group=false LIMIT 1;
  IF conv IS NOT NULL THEN RETURN conv; END IF;

  -- new conversation requires accepted friendship
  IF NOT EXISTS (SELECT 1 FROM public.friendships WHERE status='accepted'
      AND ((requester_id=me AND addressee_id=p_other) OR (requester_id=p_other AND addressee_id=me))) THEN
    RAISE EXCEPTION 'must be friends to start a conversation';
  END IF;

  INSERT INTO public.conversations (is_group, created_by) VALUES (false, me) RETURNING id INTO conv;
  INSERT INTO public.conversation_participants (conversation_id, user_id) VALUES (conv, me), (conv, p_other);
  RETURN conv;
END; $$;

CREATE OR REPLACE FUNCTION public.send_message(
  p_conversation bigint, p_body text DEFAULT NULL,
  p_attachment_url text DEFAULT NULL, p_attachment_type text DEFAULT NULL,
  p_share_type text DEFAULT NULL, p_share_ref text DEFAULT NULL, p_share_data jsonb DEFAULT NULL)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid(); mid bigint; other uuid; my_name text; my_slug text; preview text;
BEGIN
  IF NOT public.is_conv_member(p_conversation) THEN RAISE EXCEPTION 'not a member'; END IF;
  IF coalesce(btrim(p_body),'')='' AND p_attachment_url IS NULL AND p_share_type IS NULL THEN
    RAISE EXCEPTION 'empty message';
  END IF;

  -- block check against the other 1:1 participant
  SELECT user_id INTO other FROM public.conversation_participants WHERE conversation_id=p_conversation AND user_id<>me LIMIT 1;
  IF other IS NOT NULL AND EXISTS (SELECT 1 FROM public.user_blocks WHERE (blocker_id=me AND blocked_id=other) OR (blocker_id=other AND blocked_id=me)) THEN
    RAISE EXCEPTION 'blocked';
  END IF;

  INSERT INTO public.messages (conversation_id, sender_id, body, attachment_url, attachment_type, share_type, share_ref, share_data)
  VALUES (p_conversation, me, nullif(btrim(coalesce(p_body,'')),''), p_attachment_url, p_attachment_type, p_share_type, p_share_ref, p_share_data)
  RETURNING id INTO mid;

  UPDATE public.conversations SET last_message_at=now() WHERE id=p_conversation;

  -- notify the other participant (unless muted)
  IF other IS NOT NULL THEN
    SELECT coalesce(full_name,'صديقك'), public_slug INTO my_name, my_slug FROM public.student_profiles WHERE user_id=me;
    preview := coalesce(nullif(btrim(coalesce(p_body,'')),''),
                        CASE WHEN p_share_type IS NOT NULL THEN 'شارك معك ' || p_share_type
                             WHEN p_attachment_type='image' THEN '📷 صورة'
                             WHEN p_attachment_type IS NOT NULL THEN '📎 ملف' ELSE 'رسالة' END);
    IF NOT EXISTS (SELECT 1 FROM public.conversation_participants WHERE conversation_id=p_conversation AND user_id=other AND is_muted=true) THEN
      PERFORM public.social_notify(other, 'message', coalesce(my_name,'') || ' بعتلك رسالة', left(preview,120), '/messages?c=' || p_conversation);
    END IF;
  END IF;

  RETURN mid;
END; $$;

CREATE OR REPLACE FUNCTION public.list_conversations()
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid();
BEGIN
  RETURN (
    SELECT coalesce(json_agg(row ORDER BY row.is_pinned DESC, row.last_message_at DESC), '[]'::json)
    FROM (
      SELECT c.id AS conversation_id, c.last_message_at, mp.is_pinned, mp.is_muted,
        public.social_card(me, op.user_id) AS other,
        (SELECT json_build_object('body', m.body, 'share_type', m.share_type, 'attachment_type', m.attachment_type,
                                  'sender_id', m.sender_id, 'created_at', m.created_at)
         FROM public.messages m WHERE m.conversation_id=c.id ORDER BY m.created_at DESC LIMIT 1) AS last_message,
        (SELECT count(*) FROM public.messages m
          WHERE m.conversation_id=c.id AND m.sender_id<>me AND m.created_at > mp.last_read_at)::int AS unread
      FROM public.conversations c
      JOIN public.conversation_participants mp ON mp.conversation_id=c.id AND mp.user_id=me
      JOIN public.conversation_participants op ON op.conversation_id=c.id AND op.user_id<>me
      WHERE c.is_group=false
    ) row
  );
END; $$;

CREATE OR REPLACE FUNCTION public.get_messages(p_conversation bigint, p_before timestamptz DEFAULT NULL, p_limit int DEFAULT 40)
RETURNS json LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
BEGIN
  IF NOT public.is_conv_member(p_conversation) THEN RAISE EXCEPTION 'not a member'; END IF;
  RETURN (
    SELECT coalesce(json_agg(row ORDER BY row.created_at ASC), '[]'::json)
    FROM (
      SELECT m.id, m.sender_id, m.body, m.attachment_url, m.attachment_type,
             m.share_type, m.share_ref, m.share_data, m.created_at, m.edited_at
      FROM public.messages m
      WHERE m.conversation_id=p_conversation
        AND (p_before IS NULL OR m.created_at < p_before)
      ORDER BY m.created_at DESC
      LIMIT greatest(p_limit,1)
    ) row
  );
END; $$;

CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_conversation bigint)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$ UPDATE public.conversation_participants SET last_read_at=now() WHERE conversation_id=p_conversation AND user_id=auth.uid(); $$;

CREATE OR REPLACE FUNCTION public.total_unread_messages()
RETURNS integer LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  SELECT coalesce(count(*),0)::int
  FROM public.messages m
  JOIN public.conversation_participants mp ON mp.conversation_id=m.conversation_id AND mp.user_id=auth.uid()
  WHERE m.sender_id<>auth.uid() AND m.created_at > mp.last_read_at;
$$;

CREATE OR REPLACE FUNCTION public.toggle_pin_conversation(p_conversation bigint, p_pinned boolean)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$ UPDATE public.conversation_participants SET is_pinned=p_pinned WHERE conversation_id=p_conversation AND user_id=auth.uid(); $$;

CREATE OR REPLACE FUNCTION public.touch_last_seen()
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$ UPDATE public.user_profiles SET last_seen_at=now() WHERE id=auth.uid(); $$;

-- ── Grants ────────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.get_or_create_dm(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_message(bigint, text, text, text, text, text, jsonb) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_conversations() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_messages(bigint, timestamptz, int) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.total_unread_messages() TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_pin_conversation(bigint, boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.touch_last_seen() TO authenticated;
