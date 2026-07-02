'use client';
/** Shared community post card + inline threaded comments. Used by the community
 *  feed (/community/[slug]) and the post permalink (/community/post/[id]). */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { flagEmoji } from '@/lib/social/profile';
import {
  listComments, createComment, toggleReaction, pinPost, removePost, removeComment, reportContent,
  type Post, type Comment,
} from '@/lib/social/community';

export function timeAgo(iso: string, t: (k: any) => string): string {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return t('cm.now');
  if (s < 3600) return `${Math.floor(s / 60)}${t('cm.m')}`;
  if (s < 86400) return `${Math.floor(s / 3600)}${t('cm.h')}`;
  if (s < 2592000) return `${Math.floor(s / 86400)}${t('cm.d')}`;
  return new Date(iso).toLocaleDateString('ar');
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

export default function PostCard({ post, me, mod, t, onChange, defaultOpen }: {
  post: Post; me: string | null; mod: boolean; t: (k: any) => string; onChange: () => void; defaultOpen?: boolean;
}) {
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.like_count);
  const [pinned, setPinned] = useState(post.is_pinned);
  const [removed, setRemoved] = useState(false);
  const [openComments, setOpenComments] = useState(!!defaultOpen);
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
        <Author a={post.author} time={timeAgo(post.created_at, t)} />
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
