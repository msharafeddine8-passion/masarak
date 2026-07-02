'use client';
/** /community/post/[id] — single-post permalink (where comment/reply/like
 *  notifications land). Reuses the shared <PostCard>. (Social · Phase 4) */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import PostCard from '@/components/social/PostCard';
import { getPost, isMod, type PostFull } from '@/lib/social/community';

export default function PostPermalinkPage({ params }: { params: { id: string } }) {
  const { t } = useI18n();
  const [me, setMe] = useState<string | null>(null);
  const [post, setPost] = useState<PostFull | null | undefined>(undefined);

  const reload = useCallback(async () => setPost(await getPost(Number(params.id))), [params.id]);
  useEffect(() => { supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null)); }, []);
  useEffect(() => { reload(); }, [reload]);

  if (post === undefined) return <div className="p-16 text-center text-ink-muted">…</div>;
  if (post === null) return (
    <div dir="rtl" className="p-16 text-center">
      <div className="text-4xl mb-2">🤔</div>
      <p className="text-ink-muted">{t('cm.not_found')}</p>
      <Link href="/community" className="text-primary font-bold">← {t('cm.title')}</Link>
    </div>
  );

  return (
    <div dir="rtl" className="max-w-2xl mx-auto px-4 py-6">
      <Link href={`/community/${post.community_slug}`} className="text-sm text-ink-muted hover:text-primary">← {post.community_name}</Link>
      <div className="mt-3">
        <PostCard post={post} me={me} mod={isMod(post.my_role)} t={t} onChange={reload} defaultOpen />
      </div>
    </div>
  );
}
