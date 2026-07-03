-- ============================================================================
-- AUDIT PHASE 0 — Safe DB hardening  (see PLATFORM_AUDIT_2026-07.md)
-- ----------------------------------------------------------------------------
-- Additive & semantically-preserving ONLY. No app/page/component changes.
--   (1) Cover 9 foreign-key columns with indexes (scalability at 10k–100k rows).
--   (2) Wrap bare auth.uid() in 8 RLS policies as (select auth.uid()) — IDENTICAL
--       semantics, avoids per-row re-evaluation at scale. ALTER POLICY preserves
--       cmd / roles / permissive; only the boolean expression changes.
--   (3) Pin search_path on schools_set_defaults() (advisor: mutable search_path).
-- Fully reversible: DROP INDEX / re-ALTER POLICY / RESET search_path.
-- ============================================================================

-- (1) Foreign-key covering indexes -------------------------------------------
CREATE INDEX IF NOT EXISTS idx_communities_created_by            ON public.communities(created_by);
CREATE INDEX IF NOT EXISTS idx_community_comments_author_id      ON public.community_comments(author_id);
CREATE INDEX IF NOT EXISTS idx_community_comments_parent_id      ON public.community_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_community_posts_author_id         ON public.community_posts(author_id);
CREATE INDEX IF NOT EXISTS idx_content_reports_reporter_id       ON public.content_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_by          ON public.conversations(created_by);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id                ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_quiz_dna_categories_category_code ON public.quiz_dna_categories(category_code);
CREATE INDEX IF NOT EXISTS idx_user_blocks_blocked_id            ON public.user_blocks(blocked_id);

-- (2) Wrap auth.uid() in RLS policies (identical semantics, perf at scale) ----
ALTER POLICY ccomments_read ON public.community_comments
  USING ((is_removed = false) OR (author_id = (select auth.uid())) OR is_admin());

ALTER POLICY cposts_read ON public.community_posts
  USING ((is_removed = false) OR (author_id = (select auth.uid())) OR is_admin());

ALTER POLICY cp_update_self ON public.conversation_participants
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

ALTER POLICY follows_own ON public.follows
  USING (follower_id = (select auth.uid()))
  WITH CHECK (follower_id = (select auth.uid()));

ALTER POLICY friendships_delete_own ON public.friendships
  USING (((select auth.uid()) = requester_id) OR ((select auth.uid()) = addressee_id));

ALTER POLICY friendships_read_own ON public.friendships
  USING (((select auth.uid()) = requester_id) OR ((select auth.uid()) = addressee_id));

ALTER POLICY np_own ON public.notification_preferences
  USING (user_id = (select auth.uid()))
  WITH CHECK (user_id = (select auth.uid()));

ALTER POLICY blocks_own ON public.user_blocks
  USING ((select auth.uid()) = blocker_id)
  WITH CHECK ((select auth.uid()) = blocker_id);

-- (3) Pin function search_path (hardening) ------------------------------------
ALTER FUNCTION public.schools_set_defaults() SET search_path = 'public','pg_catalog';
