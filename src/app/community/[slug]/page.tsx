'use client';
/** /community/[slug] — a community: header, composer, feed, inline comments,
 *  reactions, and moderation. (Social system · Phase 4) */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { flagEmoji } from '@/lib/social/profile';
import {
  getCommunity, listPosts, listComments, joinCommunity, leaveCommunity,
  createPost, createComment, toggleReaction, pinPost, removePost, removeComment, reportContent,
  isMod, type Community, type Post, type Comment,
} from '@/lib/social/community';

function timeAgo(iso: string, t: (k: any) => string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return t('cm.now');
  if (s < 3600) return `${Math.floor(s / 60)}${t('cm.m')}`;
  if (s < 86400) return `${Math.floor(s / 3600)}${t('cm.h')}`;
  if (s < 2592000) return `${Math.floor(s / 86400)}${t('cm.d')}`;
  return new Date(iso).toLocaleDateString('ar');
}

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

function Author({ a, time }: { a: Post['author']; time: string }) {
  const name = a.full_name || 'طالب';
  return (
    <div className="flex items-center gap-2">
      {a.avatar_url
        /* eslint-disable-next-line @next/next/no-img-element */
        ? <img src={a.avatar_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
        : <div className="w-8 h-8 rounded-lg bg-gradient-mint-deep text-white flex items-center justify-center text-sm font-bold">{name.charAt(0)}</div>}
      <div className="leading-tight">
        <div className="text-sm font-bold text-ink">{a.slug ? <Link href={`/u/${a.slug}`} className="hover:underline">{name}</Link> : name} {a.country_code && <span className="text-xs">{flagEmoji(a.country_code)}</span>}</div>
        <div className="text-[10px] text-ink-subtle">{time}</div>
      </div>
    </div>
  );
}

function PostCard({ post, me, mod, t, onChange }: { post: Post; me: string | null; mod: boolean; t: (k: any) => string; onChange: () => void }) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.like_count);
  const [pinned, setPinned] = useState(post.is_pinned);
  const [removed, setRemoved] = useState(false);
  const [openComments, setOpenComments] = useState(false);
  const isAuthor = me === post.author.user_id;

  async function like() {
    if (!me) return;
    setLiked(v => !v); setLikes(n => n + (liked ? -1 : 1));
    await toggleReaction('post', post.id);
  }
  async function doRemove() { if (!confirm(t('cm.remove_confirm'))) return; await removePost(post.id); setRemoved(true); onChange(); }
  async function doPin() { await pinPost(post.id, !pinned); setPinned(v => !v); }
  async function doReport() { const r = prompt(t('cm.report_reason')); if (r !== null) { await reportContent('post', String(post.id), r); alert(t('cm.report_thanks')); } }

  if (removed) return null;
  return (
    <article className="bg-surface rounded-2xl p-4 shadow-soft border border-border-soft">
      <div className="flex items-start justify-between gap-2">
        <Author a={post.author} time={timeAgoLabel(post.created_at, t)} />
        <div className="flex items-center gap-1 text-xs">
          {pinned && <span title={t('cm.pinned')}>📌</span>}
          {mod && <button onClick={doPin} title={t('cm.pin')} className="text-ink-subtle hover:text-primary px-1">📌</button>}
          {(isAuthor || mod) && <button onClick={doRemove} title={t('cm.remove')} className="text-ink-subtle hover:text-danger px-1">🗑</button>}
          {!isAuthor && me && <button onClick={doReport} title={t('cm.report')} className="text-ink-subtle hover:text-danger px-1">⚑</button>}
        </div>
      </div>

      <p className="text-ink text-sm mt-2 whitespace-pre-wrap break-words">{post.body}</p>
      {post.image_url && /* eslint-disable-next-line @next/next/no-img-element */ <img src={post.image_url} alt="" className="rounded-xl mt-2 max-h-80" />}
      {post.tags && post.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">{post.tags.map((tg, i) => <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-mint-light text-primary">#{tg}</span>)}</div>
      )}

      <div className="flex items-center gap-4 mt-3 text-sm">
        <button onClick={like} disabled={!me} className={`inline-flex items-center gap-1 font-bold ${liked ? 'text-danger' : 'text-ink-muted hover:text-danger'} disabled:opacity-50`}>{liked ? '❤️' : '🤍'} {likes > 0 && likes}</button>
        <button onClick={() => setOpenComments(v => !v)} className="inline-flex items-center gap-1 font-bold text-ink-muted hover:text-primary">💬 {post.comment_count > 0 && post.comment_count}</button>
      </div>

      {openComments && <CommentsBlock postId={post.id} me={me} mod={mod} t={t} />}
    </article>
  );
}

function timeAgoLabel(iso: string, t: (k: any) => string) { return timeAgo(iso, t); }

function CommentsBlock({ postId, me, mod, t }: { postId: number; me: string | null; mod: boolean; t: (k: any) => string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [text, setText] = useState('');
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => setComments(await listComments(postId)), [postId]);
  useEffect(() => { load(); }, [load]);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); if (!text.trim() || !me) return;
    setBusy(true);
    const { error } = await createComment(postId, text.trim(), replyTo ?? undefined);
    setBusy(false);
    if (!error) { setText(''); setReplyTo(null); await load(); }
  }

  const top = comments.filter(c => !c.parent_id);
  const repliesOf = (id: number) => comments.filter(c => c.parent_id === id);

  return (
    <div className="mt-3 pt-3 border-t border-border-soft space-y-3">
      {top.map(c => (
        <div key={c.id}>
          <CommentRow c={c} me={me} mod={mod} t={t} onReply={() => setReplyTo(c.id)} onChange={load} />
          <div className="mr-8 mt-2 space-y-2">
            {repliesOf(c.id).map(r => <CommentRow key={r.id} c={r} me={me} mod={mod} t={t} onReply={() => setReplyTo(c.id)} onChange={load} />)}
          </div>
        </div>
      ))}
      {me && (
        <form onSubmit={submit} className="flex items-center gap-2 pt-1">
          <input value={text} onChange={e => setText(e.target.value)}
            placeholder={replyTo ? t('cm.reply_ph') : t('cm.comment_ph')}
            className="flex-1 px-3 py-2 rounded-lg border border-border-soft bg-bg outline-none focus:border-primary text-sm" />
          {replyTo && <button type="button" onClick={() => setReplyTo(null)} className="text-xs text-ink-subtle">✕</button>}
          <button type="submit" disabled={busy || !text.trim()} className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-bold disabled:opacity-50">{t('cm.send')}</button>
        </form>
      )}
    </div>
  );
}

function CommentRow({ c, me, mod, t, onReply, onChange }: { c: Comment; me: string | null; mod: boolean; t: (k: any) => string; onReply: () => void; onChange: () => void }) {
  const [liked, setLiked] = useState(c.liked);
  const [likes, setLikes] = useState(c.like_count);
  const [removed, setRemoved] = useState(false);
  const isAuthor = me === c.author.user_id;
  async function like() { if (!me) return; setLiked(v => !v); setLikes(n => n + (liked ? -1 : 1)); await toggleReaction('comment', c.id); }
  async function doRemove() { await removeComment(c.id); setRemoved(true); onChange(); }
  if (removed) return null;
  return (
    <div className="flex gap-2">
      <div className="flex-1 bg-bg rounded-xl p-2.5">
        <div className="flex items-center justify-between">
          <Author a={c.author} time={timeAgo(c.created_at, t)} />
          <div className="flex items-center gap-1.5 text-xs">
            <button onClick={like} disabled={!me} className={liked ? 'text-danger' : 'text-ink-subtle hover:text-danger'}>{liked ? '❤️' : '🤍'} {likes > 0 && likes}</button>
            {me && <button onClick={onReply} className="text-ink-subtle hover:text-primary">{t('cm.reply')}</button>}
            {(isAuthor || mod) && <button onClick={doRemove} className="text-ink-subtle hover:text-danger">🗑</button>}
          </div>
        </div>
        <p className="text-sm text-ink mt-1 whitespace-pre-wrap break-words">{c.body}</p>
      </div>
    </div>
  );
}
