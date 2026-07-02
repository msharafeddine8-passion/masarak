-- ============================================================================
-- SOCIAL SYSTEM · PHASE 4 — Communities (interest groups, posts, comments,
-- reactions, moderation, reporting). Mirrors the org_* shape. Additive only.
-- ============================================================================

-- ── Tables ───────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.communities (
  id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  slug         text UNIQUE NOT NULL,
  name         text NOT NULL,
  description  text,
  icon         text DEFAULT '👥',
  cover_url    text,
  category     text,                       -- major | destination | stage | topic
  rules        text,
  member_count int NOT NULL DEFAULT 0,
  post_count   int NOT NULL DEFAULT 0,
  is_official  boolean NOT NULL DEFAULT false,
  is_active    boolean NOT NULL DEFAULT true,
  created_by   uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.community_members (
  community_id bigint NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  user_id      uuid   NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         text   NOT NULL DEFAULT 'member' CHECK (role IN ('admin','moderator','member')),
  joined_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (community_id, user_id)
);
CREATE INDEX IF NOT EXISTS community_members_user_idx ON public.community_members (user_id);

CREATE TABLE IF NOT EXISTS public.community_posts (
  id            bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  community_id  bigint NOT NULL REFERENCES public.communities(id) ON DELETE CASCADE,
  author_id     uuid   NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  body          text NOT NULL,
  image_url     text,
  tags          text[] DEFAULT '{}',
  is_pinned     boolean NOT NULL DEFAULT false,
  like_count    int NOT NULL DEFAULT 0,
  comment_count int NOT NULL DEFAULT 0,
  is_removed    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  edited_at     timestamptz
);
CREATE INDEX IF NOT EXISTS community_posts_feed_idx ON public.community_posts (community_id, is_pinned DESC, created_at DESC);

CREATE TABLE IF NOT EXISTS public.community_comments (
  id         bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id    bigint NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  author_id  uuid   NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  parent_id  bigint REFERENCES public.community_comments(id) ON DELETE CASCADE,
  body       text NOT NULL,
  like_count int NOT NULL DEFAULT 0,
  is_removed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS community_comments_post_idx ON public.community_comments (post_id, created_at ASC);

CREATE TABLE IF NOT EXISTS public.community_reactions (
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('post','comment')),
  target_id   bigint NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, target_type, target_id)
);

CREATE TABLE IF NOT EXISTS public.content_reports (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('post','comment','community','user','message')),
  target_id   text NOT NULL,
  reason      text,
  status      text NOT NULL DEFAULT 'open' CHECK (status IN ('open','reviewed','dismissed')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  reviewed_by uuid, reviewed_at timestamptz
);

-- ── Counter triggers ─────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.tg_member_count() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public','pg_catalog' AS $$
BEGIN
  IF TG_OP='INSERT' THEN UPDATE public.communities SET member_count=member_count+1 WHERE id=NEW.community_id;
  ELSE UPDATE public.communities SET member_count=greatest(member_count-1,0) WHERE id=OLD.community_id; END IF;
  RETURN NULL;
END; $$;
DROP TRIGGER IF EXISTS member_count ON public.community_members;
CREATE TRIGGER member_count AFTER INSERT OR DELETE ON public.community_members FOR EACH ROW EXECUTE FUNCTION public.tg_member_count();

CREATE OR REPLACE FUNCTION public.tg_post_count() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public','pg_catalog' AS $$
BEGIN
  IF TG_OP='INSERT' THEN UPDATE public.communities SET post_count=post_count+1 WHERE id=NEW.community_id;
  ELSIF TG_OP='DELETE' AND NOT coalesce(OLD.is_removed,false) THEN UPDATE public.communities SET post_count=greatest(post_count-1,0) WHERE id=OLD.community_id; END IF;
  RETURN NULL;
END; $$;
DROP TRIGGER IF EXISTS post_count ON public.community_posts;
CREATE TRIGGER post_count AFTER INSERT OR DELETE ON public.community_posts FOR EACH ROW EXECUTE FUNCTION public.tg_post_count();

CREATE OR REPLACE FUNCTION public.tg_comment_count() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public','pg_catalog' AS $$
BEGIN
  IF TG_OP='INSERT' THEN UPDATE public.community_posts SET comment_count=comment_count+1 WHERE id=NEW.post_id;
  ELSIF TG_OP='DELETE' AND NOT coalesce(OLD.is_removed,false) THEN UPDATE public.community_posts SET comment_count=greatest(comment_count-1,0) WHERE id=OLD.post_id; END IF;
  RETURN NULL;
END; $$;
DROP TRIGGER IF EXISTS comment_count ON public.community_comments;
CREATE TRIGGER comment_count AFTER INSERT OR DELETE ON public.community_comments FOR EACH ROW EXECUTE FUNCTION public.tg_comment_count();

CREATE OR REPLACE FUNCTION public.tg_reaction_count() RETURNS trigger LANGUAGE plpgsql SET search_path TO 'public','pg_catalog' AS $$
DECLARE d int; tt text; tid bigint;
BEGIN
  IF TG_OP='INSERT' THEN d:=1; tt:=NEW.target_type; tid:=NEW.target_id; ELSE d:=-1; tt:=OLD.target_type; tid:=OLD.target_id; END IF;
  IF tt='post' THEN UPDATE public.community_posts SET like_count=greatest(like_count+d,0) WHERE id=tid;
  ELSIF tt='comment' THEN UPDATE public.community_comments SET like_count=greatest(like_count+d,0) WHERE id=tid; END IF;
  RETURN NULL;
END; $$;
DROP TRIGGER IF EXISTS reaction_count ON public.community_reactions;
CREATE TRIGGER reaction_count AFTER INSERT OR DELETE ON public.community_reactions FOR EACH ROW EXECUTE FUNCTION public.tg_reaction_count();

-- ── Membership helpers ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_community_member(p_c bigint)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$ SELECT EXISTS (SELECT 1 FROM public.community_members WHERE community_id=p_c AND user_id=auth.uid()); $$;

CREATE OR REPLACE FUNCTION public.community_role(p_c bigint)
RETURNS text LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$ SELECT role FROM public.community_members WHERE community_id=p_c AND user_id=auth.uid(); $$;

-- ── RLS: public reads; all writes go through SECURITY DEFINER RPCs ───────────
ALTER TABLE public.communities        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_members  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports    ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS communities_read ON public.communities;
CREATE POLICY communities_read ON public.communities FOR SELECT USING (is_active OR public.is_admin());
DROP POLICY IF EXISTS cmembers_read ON public.community_members;
CREATE POLICY cmembers_read ON public.community_members FOR SELECT USING (true);
DROP POLICY IF EXISTS cposts_read ON public.community_posts;
CREATE POLICY cposts_read ON public.community_posts FOR SELECT USING (is_removed=false OR author_id=auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS ccomments_read ON public.community_comments;
CREATE POLICY ccomments_read ON public.community_comments FOR SELECT USING (is_removed=false OR author_id=auth.uid() OR public.is_admin());
DROP POLICY IF EXISTS creactions_read ON public.community_reactions;
CREATE POLICY creactions_read ON public.community_reactions FOR SELECT USING (true);
DROP POLICY IF EXISTS creports_admin ON public.content_reports;
CREATE POLICY creports_admin ON public.content_reports FOR SELECT USING (public.is_admin());

-- ── Action RPCs ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.create_community(p_slug text, p_name text, p_description text DEFAULT NULL, p_icon text DEFAULT '👥', p_category text DEFAULT 'topic', p_rules text DEFAULT NULL)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid(); cid bigint; s text := lower(regexp_replace(btrim(coalesce(p_slug,'')), '[^a-z0-9؀-ۿ]+', '-', 'gi'));
BEGIN
  IF me IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  s := btrim(s,'-'); IF s='' THEN RAISE EXCEPTION 'invalid slug'; END IF;
  IF EXISTS (SELECT 1 FROM public.communities WHERE slug=s) THEN RAISE EXCEPTION 'slug taken'; END IF;
  INSERT INTO public.communities (slug, name, description, icon, category, rules, created_by)
  VALUES (s, p_name, p_description, coalesce(p_icon,'👥'), coalesce(p_category,'topic'), p_rules, me) RETURNING id INTO cid;
  INSERT INTO public.community_members (community_id, user_id, role) VALUES (cid, me, 'admin');
  RETURN s;
END; $$;

CREATE OR REPLACE FUNCTION public.join_community(p_community bigint)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$ INSERT INTO public.community_members (community_id, user_id, role) VALUES (p_community, auth.uid(), 'member') ON CONFLICT (community_id, user_id) DO NOTHING; $$;

CREATE OR REPLACE FUNCTION public.leave_community(p_community bigint)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$ DELETE FROM public.community_members WHERE community_id=p_community AND user_id=auth.uid(); $$;

CREATE OR REPLACE FUNCTION public.create_post(p_community bigint, p_body text, p_image_url text DEFAULT NULL, p_tags text[] DEFAULT '{}')
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid(); pid bigint;
BEGIN
  IF NOT public.is_community_member(p_community) THEN RAISE EXCEPTION 'join the community to post'; END IF;
  IF coalesce(btrim(p_body),'')='' THEN RAISE EXCEPTION 'empty post'; END IF;
  INSERT INTO public.community_posts (community_id, author_id, body, image_url, tags)
  VALUES (p_community, me, btrim(p_body), p_image_url, coalesce(p_tags,'{}')) RETURNING id INTO pid;
  RETURN pid;
END; $$;

CREATE OR REPLACE FUNCTION public.create_comment(p_post bigint, p_body text, p_parent bigint DEFAULT NULL)
RETURNS bigint LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid(); cid bigint; comm bigint; post_author uuid; parent_author uuid; my_name text;
BEGIN
  SELECT community_id, author_id INTO comm, post_author FROM public.community_posts WHERE id=p_post AND is_removed=false;
  IF comm IS NULL THEN RAISE EXCEPTION 'post not found'; END IF;
  IF NOT public.is_community_member(comm) THEN RAISE EXCEPTION 'join the community to comment'; END IF;
  IF coalesce(btrim(p_body),'')='' THEN RAISE EXCEPTION 'empty comment'; END IF;
  INSERT INTO public.community_comments (post_id, author_id, parent_id, body) VALUES (p_post, me, p_parent, btrim(p_body)) RETURNING id INTO cid;
  SELECT coalesce(full_name,'أحد الطلاب') INTO my_name FROM public.student_profiles WHERE user_id=me;
  IF post_author IS NOT NULL AND post_author<>me THEN
    PERFORM public.social_notify(post_author, 'comment', coalesce(my_name,'') || ' علّق على منشورك', left(btrim(p_body),100), '/community/post/' || p_post);
  END IF;
  IF p_parent IS NOT NULL THEN
    SELECT author_id INTO parent_author FROM public.community_comments WHERE id=p_parent;
    IF parent_author IS NOT NULL AND parent_author<>me AND parent_author<>post_author THEN
      PERFORM public.social_notify(parent_author, 'reply', coalesce(my_name,'') || ' ردّ عليك', left(btrim(p_body),100), '/community/post/' || p_post);
    END IF;
  END IF;
  RETURN cid;
END; $$;

CREATE OR REPLACE FUNCTION public.toggle_reaction(p_target_type text, p_target_id bigint)
RETURNS boolean LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid(); liked boolean; author uuid; post_id bigint; my_name text;
BEGIN
  IF EXISTS (SELECT 1 FROM public.community_reactions WHERE user_id=me AND target_type=p_target_type AND target_id=p_target_id) THEN
    DELETE FROM public.community_reactions WHERE user_id=me AND target_type=p_target_type AND target_id=p_target_id;
    RETURN false;
  END IF;
  INSERT INTO public.community_reactions (user_id, target_type, target_id) VALUES (me, p_target_type, p_target_id);
  -- notify author on new like
  IF p_target_type='post' THEN SELECT author_id INTO author FROM public.community_posts WHERE id=p_target_id;
  ELSE SELECT author_id, post_id INTO author, post_id FROM public.community_comments WHERE id=p_target_id; END IF;
  IF author IS NOT NULL AND author<>me THEN
    SELECT coalesce(full_name,'أحد الطلاب') INTO my_name FROM public.student_profiles WHERE user_id=me;
    PERFORM public.social_notify(author, 'like', coalesce(my_name,'') || ' أعجبه ' || CASE WHEN p_target_type='post' THEN 'منشورك' ELSE 'تعليقك' END, NULL,
      '/community/post/' || coalesce(post_id, p_target_id));
  END IF;
  RETURN true;
END; $$;

CREATE OR REPLACE FUNCTION public.pin_post(p_post bigint, p_pinned boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE comm bigint;
BEGIN
  SELECT community_id INTO comm FROM public.community_posts WHERE id=p_post;
  IF public.community_role(comm) NOT IN ('admin','moderator') THEN RAISE EXCEPTION 'not allowed'; END IF;
  UPDATE public.community_posts SET is_pinned=p_pinned WHERE id=p_post;
END; $$;

CREATE OR REPLACE FUNCTION public.remove_post(p_post bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid(); comm bigint; author uuid;
BEGIN
  SELECT community_id, author_id INTO comm, author FROM public.community_posts WHERE id=p_post AND is_removed=false;
  IF comm IS NULL THEN RETURN; END IF;
  IF author<>me AND coalesce(public.community_role(comm),'') NOT IN ('admin','moderator') AND NOT public.is_admin() THEN RAISE EXCEPTION 'not allowed'; END IF;
  UPDATE public.community_posts SET is_removed=true WHERE id=p_post;
  UPDATE public.communities SET post_count=greatest(post_count-1,0) WHERE id=comm;
END; $$;

CREATE OR REPLACE FUNCTION public.remove_comment(p_comment bigint)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
DECLARE me uuid := auth.uid(); comm bigint; author uuid; pid bigint;
BEGIN
  SELECT cc.author_id, cc.post_id, cp.community_id INTO author, pid, comm
    FROM public.community_comments cc JOIN public.community_posts cp ON cp.id=cc.post_id
    WHERE cc.id=p_comment AND cc.is_removed=false;
  IF pid IS NULL THEN RETURN; END IF;
  IF author<>me AND coalesce(public.community_role(comm),'') NOT IN ('admin','moderator') AND NOT public.is_admin() THEN RAISE EXCEPTION 'not allowed'; END IF;
  UPDATE public.community_comments SET is_removed=true WHERE id=p_comment;
  UPDATE public.community_posts SET comment_count=greatest(comment_count-1,0) WHERE id=pid;
END; $$;

CREATE OR REPLACE FUNCTION public.set_member_role(p_community bigint, p_user uuid, p_role text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
BEGIN
  IF public.community_role(p_community) <> 'admin' AND NOT public.is_admin() THEN RAISE EXCEPTION 'admins only'; END IF;
  IF p_role NOT IN ('admin','moderator','member') THEN RAISE EXCEPTION 'bad role'; END IF;
  UPDATE public.community_members SET role=p_role WHERE community_id=p_community AND user_id=p_user;
END; $$;

CREATE OR REPLACE FUNCTION public.report_content(p_target_type text, p_target_id text, p_reason text DEFAULT NULL)
RETURNS void LANGUAGE sql SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$ INSERT INTO public.content_reports (reporter_id, target_type, target_id, reason) VALUES (auth.uid(), p_target_type, p_target_id, p_reason); $$;

-- ── Query RPCs ───────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.list_communities(p_q text DEFAULT NULL, p_category text DEFAULT NULL)
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  SELECT coalesce(json_agg(row ORDER BY row.is_official DESC, row.member_count DESC), '[]'::json)
  FROM (
    SELECT c.id, c.slug, c.name, c.description, c.icon, c.category, c.member_count, c.post_count, c.is_official,
           public.community_role(c.id) AS my_role
    FROM public.communities c
    WHERE c.is_active
      AND (p_category IS NULL OR c.category=p_category)
      AND (p_q IS NULL OR btrim(p_q)='' OR c.name ILIKE '%'||p_q||'%' OR c.description ILIKE '%'||p_q||'%')
  ) row;
$$;

CREATE OR REPLACE FUNCTION public.get_community(p_slug text)
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  SELECT CASE WHEN c.id IS NULL THEN NULL ELSE json_build_object(
    'id', c.id, 'slug', c.slug, 'name', c.name, 'description', c.description, 'icon', c.icon,
    'cover_url', c.cover_url, 'category', c.category, 'rules', c.rules,
    'member_count', c.member_count, 'post_count', c.post_count, 'is_official', c.is_official,
    'my_role', public.community_role(c.id)
  ) END
  FROM public.communities c WHERE c.slug=p_slug AND c.is_active;
$$;

CREATE OR REPLACE FUNCTION public.list_posts(p_community bigint, p_before timestamptz DEFAULT NULL, p_limit int DEFAULT 20)
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  SELECT coalesce(json_agg(row ORDER BY row.is_pinned DESC, row.created_at DESC), '[]'::json)
  FROM (
    SELECT p.id, p.body, p.image_url, p.tags, p.is_pinned, p.like_count, p.comment_count, p.created_at,
           public.social_card(auth.uid(), p.author_id) AS author,
           EXISTS (SELECT 1 FROM public.community_reactions r WHERE r.user_id=auth.uid() AND r.target_type='post' AND r.target_id=p.id) AS liked
    FROM public.community_posts p
    WHERE p.community_id=p_community AND p.is_removed=false
      AND (p_before IS NULL OR p.created_at < p_before)
    ORDER BY p.is_pinned DESC, p.created_at DESC
    LIMIT greatest(p_limit,1)
  ) row;
$$;

CREATE OR REPLACE FUNCTION public.list_comments(p_post bigint)
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  SELECT coalesce(json_agg(row ORDER BY row.created_at ASC), '[]'::json)
  FROM (
    SELECT c.id, c.parent_id, c.body, c.like_count, c.created_at,
           public.social_card(auth.uid(), c.author_id) AS author,
           EXISTS (SELECT 1 FROM public.community_reactions r WHERE r.user_id=auth.uid() AND r.target_type='comment' AND r.target_id=c.id) AS liked
    FROM public.community_comments c
    WHERE c.post_id=p_post AND c.is_removed=false
    ORDER BY c.created_at ASC
  ) row;
$$;

CREATE OR REPLACE FUNCTION public.get_post(p_post bigint)
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  SELECT CASE WHEN p.id IS NULL THEN NULL ELSE json_build_object(
    'id', p.id, 'community_id', p.community_id, 'community_slug', c.slug, 'community_name', c.name,
    'body', p.body, 'image_url', p.image_url, 'tags', p.tags, 'is_pinned', p.is_pinned,
    'like_count', p.like_count, 'comment_count', p.comment_count, 'created_at', p.created_at,
    'author', public.social_card(auth.uid(), p.author_id),
    'liked', EXISTS (SELECT 1 FROM public.community_reactions r WHERE r.user_id=auth.uid() AND r.target_type='post' AND r.target_id=p.id),
    'my_role', public.community_role(p.community_id)
  ) END
  FROM public.community_posts p JOIN public.communities c ON c.id=p.community_id
  WHERE p.id=p_post AND p.is_removed=false;
$$;

CREATE OR REPLACE FUNCTION public.my_communities()
RETURNS json LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public','pg_catalog'
AS $$
  SELECT coalesce(json_agg(json_build_object('id', c.id, 'slug', c.slug, 'name', c.name, 'icon', c.icon,
           'member_count', c.member_count, 'my_role', cm.role) ORDER BY c.name), '[]'::json)
  FROM public.communities c JOIN public.community_members cm ON cm.community_id=c.id AND cm.user_id=auth.uid()
  WHERE c.is_active;
$$;

-- ── Grants ────────────────────────────────────────────────────────────────────
GRANT EXECUTE ON FUNCTION public.create_community(text,text,text,text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_community(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.leave_community(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_post(bigint,text,text,text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_comment(bigint,text,bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.toggle_reaction(text,bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.pin_post(bigint,boolean) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_post(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.remove_comment(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.set_member_role(bigint,uuid,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.report_content(text,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.list_communities(text,text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_community(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_posts(bigint,timestamptz,int) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.list_comments(bigint) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_post(bigint) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.my_communities() TO authenticated;

-- ── Seed starter communities (official) ──────────────────────────────────────
INSERT INTO public.communities (slug, name, description, icon, category, is_official) VALUES
  ('medical',        'طب وعلوم صحية',        'نقاشات القبول والتخصص والحياة الجامعية لطلاب الطب والصحة.', '🩺', 'major',       true),
  ('engineering',    'هندسة',                 'كل ما يخص فروع الهندسة — القبول، المشاريع، سوق العمل.',      '🏗️', 'major',       true),
  ('business',       'إدارة أعمال',           'إدارة، تسويق، مالية، وريادة أعمال.',                          '💼', 'major',       true),
  ('cs',             'علوم حاسوب وبرمجة',     'برمجة، ذكاء اصطناعي، ومسارات التقنية.',                       '💻', 'major',       true),
  ('scholarships',   'المنح الدراسية',        'شارك فرص المنح وتجارب التقديم والقبول.',                      '🏆', 'topic',       true),
  ('study-germany',  'الدراسة في ألمانيا',    'القبول، اللغة، التكاليف، والحياة في ألمانيا.',               '🇩🇪', 'destination', true),
  ('study-turkey',   'الدراسة في تركيا',      'اليوس، المنح التركية، والجامعات.',                            '🇹🇷', 'destination', true),
  ('study-canada',   'الدراسة في كندا',       'القبول، تصاريح الدراسة، والحياة في كندا.',                   '🇨🇦', 'destination', true),
  ('high-school',    'طلاب الثانوية',         'نصائح الثانوية، اختيار الفرع، والتحضير للجامعة.',            '🎒', 'stage',       true),
  ('admissions',     'القبولات الجامعية',     'مواعيد ومتطلبات القبول ومقارنة الجامعات.',                   '📝', 'topic',       true)
ON CONFLICT (slug) DO NOTHING;
