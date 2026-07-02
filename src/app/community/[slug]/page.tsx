'use client';
/** /community/[slug] — a community: header, composer, feed. Post + comment UI is
 *  the shared <PostCard> (also used by the post permalink). (Social · Phase 4) */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import PostCard from '@/components/social/PostCard';
import {
  getCommunity, listPosts, joinCommunity, leaveCommunity, createPost, isMod,
  type Community, type Post,
} from '@/lib/social/community';

export default function CommunityDetailPage({ params }: { params: { slug: string } }) {
  const { t } = useI18n();
  const [me, setMe] = useState<string | null>(null);
  const [community, setCommunity] = useState<Community | null | undefined>(undefined);
  const [posts, setPosts] = useState<Post[]>([]);
  const [body, setBody] = useState('');
  const [tags, setTags] = useState('');
  const [busy, setBusy] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const loadPosts = useCallback(async (id: number) => setPosts(await listPosts(id)), []);
  const reload = useCallback(async () => {
    const c = await getCommunity(params.slug);
    setCommunity(c);
    if (c) await loadPosts(c.id);
  }, [params.slug, loadPosts]);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null)); }, []);
  useEffect(() => { reload(); }, [reload]);

  if (community === undefined) return <div className="p-16 text-center text-ink-muted">…</div>;
  if (community === null) return <div dir="rtl" className="p-16 text-center"><div className="text-4xl mb-2">🤔</div><p className="text-ink-muted">{t('cm.not_found')}</p><Link href="/community" className="text-primary font-bold">← {t('cm.title')}</Link></div>;

  const member = !!community.my_role;
  const mod = isMod(community.my_role);

  async function toggleMembership() {
    if (!community) return;
    setBusy(true);
    try { member ? await leaveCommunity(community.id) : await joinCommunity(community.id); await reload(); }
    finally { setBusy(false); }
  }

  async function submitPost(e: React.FormEvent) {
    e.preventDefault();
    if (!community || !body.trim()) return;
    setBusy(true);
    const tagArr = tags.split(',').map(s => s.trim()).filter(Boolean).slice(0, 5);
    const { error } = await createPost(community.id, body.trim(), undefined, tagArr);
    setBusy(false);
    if (!error) { setBody(''); setTags(''); await loadPosts(community.id); }
  }

  return (
    <div dir="rtl" className="max-w-2xl mx-auto px-4 py-6">
      <Link href="/community" className="text-sm text-ink-muted hover:text-primary">← {t('cm.title')}</Link>

      {/* Header */}
      <header className="bg-surface rounded-2xl p-5 shadow-soft border border-border-soft mt-3 mb-4">
        <div className="flex items-start gap-4">
          <span className="text-5xl">{community.icon}</span>
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-extrabold text-ink flex items-center gap-1">{community.name} {community.is_official && <span title={t('cm.official')} className="text-primary text-sm">✔</span>}</h1>
            {community.description && <p className="text-sm text-ink-muted mt-1">{community.description}</p>}
            <div className="text-xs text-ink-subtle mt-2">{community.member_count} {t('cm.members')} · {community.post_count} {t('cm.posts')}</div>
          </div>
          {me && (
            <button onClick={toggleMembership} disabled={busy}
              className={`shrink-0 px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50 ${member ? 'bg-mint-light text-primary' : 'bg-primary text-white hover:bg-primary/90'}`}>
              {member ? t('cm.leave') : t('cm.join')}
            </button>
          )}
        </div>
        {community.rules && (
          <div className="mt-3 pt-3 border-t border-border-soft">
            <button onClick={() => setShowRules(v => !v)} className="text-xs font-bold text-ink-subtle">📋 {t('cm.rules')} {showRules ? '▲' : '▼'}</button>
            {showRules && <p className="text-xs text-ink-muted mt-2 whitespace-pre-line">{community.rules}</p>}
          </div>
        )}
      </header>

      {/* Composer */}
      {member ? (
        <form onSubmit={submitPost} className="bg-surface rounded-2xl p-4 shadow-soft border border-border-soft mb-4">
          <textarea value={body} onChange={e => setBody(e.target.value)} placeholder={t('cm.post_ph')} rows={3}
            className="w-full px-3 py-2 rounded-lg border border-border-soft bg-bg outline-none focus:border-primary text-sm resize-none" />
          <div className="flex items-center gap-2 mt-2">
            <input value={tags} onChange={e => setTags(e.target.value)} placeholder={t('cm.tags_ph')} className="flex-1 px-3 py-1.5 rounded-lg border border-border-soft bg-bg outline-none focus:border-primary text-xs" />
            <button type="submit" disabled={busy || !body.trim()} className="px-5 py-2 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-50">{t('cm.publish')}</button>
          </div>
        </form>
      ) : me ? (
        <div className="bg-mint-pale rounded-2xl p-4 text-center text-sm text-ink-muted mb-4">{t('cm.join_to_post')}</div>
      ) : (
        <div className="bg-mint-pale rounded-2xl p-4 text-center text-sm mb-4"><Link href="/auth/login" className="text-primary font-bold">{t('cm.login_to_join')}</Link></div>
      )}

      {/* Feed */}
      <div className="space-y-3">
        {posts.length === 0 && <div className="text-center py-10 text-ink-muted text-sm">{t('cm.no_posts')}</div>}
        {posts.map(p => <PostCard key={p.id} post={p} me={me} mod={mod} t={t} onChange={() => community && loadPosts(community.id)} />)}
      </div>
    </div>
  );
}
