-- ============================================================================
-- SOCIAL SYSTEM · Anti-spam (Feature 9 "spam detection").
-- ----------------------------------------------------------------------------
-- Lightweight DB-level guards on the insert path (so every code path is covered,
-- no RPC surgery): per-user rate limits + exact-duplicate blocking. Thresholds
-- are generous — normal users never hit them; floods/duplicates get rejected.
-- Additive only.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.tg_spam_guard() RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog' AS $$
DECLARE cnt int;
BEGIN
  IF TG_TABLE_NAME='community_posts' THEN
    SELECT count(*) INTO cnt FROM public.community_posts
      WHERE author_id=NEW.author_id AND created_at > now() - interval '5 minutes';
    IF cnt >= 15 THEN
      RAISE EXCEPTION 'rate_limited: too many posts, slow down';
    ELSIF EXISTS (SELECT 1 FROM public.community_posts
                   WHERE author_id=NEW.author_id AND body=NEW.body AND created_at > now() - interval '10 minutes') THEN
      RAISE EXCEPTION 'duplicate: you just posted this';
    END IF;

  ELSIF TG_TABLE_NAME='community_comments' THEN
    SELECT count(*) INTO cnt FROM public.community_comments
      WHERE author_id=NEW.author_id AND created_at > now() - interval '3 minutes';
    IF cnt >= 25 THEN RAISE EXCEPTION 'rate_limited: too many comments, slow down'; END IF;

  ELSIF TG_TABLE_NAME='messages' THEN
    SELECT count(*) INTO cnt FROM public.messages
      WHERE sender_id=NEW.sender_id AND created_at > now() - interval '1 minute';
    IF cnt >= 40 THEN RAISE EXCEPTION 'rate_limited: too many messages, slow down'; END IF;
  END IF;

  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS spam_guard ON public.community_posts;
CREATE TRIGGER spam_guard BEFORE INSERT ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.tg_spam_guard();
DROP TRIGGER IF EXISTS spam_guard ON public.community_comments;
CREATE TRIGGER spam_guard BEFORE INSERT ON public.community_comments FOR EACH ROW EXECUTE FUNCTION public.tg_spam_guard();
DROP TRIGGER IF EXISTS spam_guard ON public.messages;
CREATE TRIGGER spam_guard BEFORE INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.tg_spam_guard();
