'use client';
/**
 * /messages — Social system · Phase 3. 1:1 messaging with Supabase Realtime.
 *  - Live messages via postgres_changes (RLS-gated to my conversations).
 *  - Typing indicator via broadcast; "active now" via presence.
 *  - Unread counts, read receipts, pinned chats, conversation search,
 *    share-cards (scholarship/university/major/article) and image/file attachments.
 */
import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { toast } from '@/lib/notify';
import { flagEmoji } from '@/lib/social/profile';
import {
  listConversations, getMessages, sendMessage, markConversationRead, togglePinConversation,
  touchLastSeen, uploadAttachment, type ConvSummary, type Message, type ShareType,
} from '@/lib/social/messages';

export default function MessagesPage() {
  return <Suspense fallback={<div className="p-10 text-center text-ink-muted">…</div>}><MessagesInner /></Suspense>;
}

function shareHref(type: ShareType | null, ref: string | null, data: Message['share_data']): string {
  if (data?.href) return data.href;
  switch (type) {
    case 'scholarship': return `/scholarships/${ref ?? ''}`;
    case 'university':  return `/universities/${ref ?? ''}`;
    case 'major':       return `/majors/${ref ?? ''}`;
    case 'article':     return `/blog/${ref ?? ''}`;
    default:            return '#';
  }
}

function MessagesInner() {
  const { t } = useI18n();
  const params = useSearchParams();
  const router = useRouter();

  const [me, setMe] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [convs, setConvs] = useState<ConvSummary[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [otherActive, setOtherActive] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const convChannel = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const active = useMemo(() => convs.find(c => c.conversation_id === activeId) || null, [convs, activeId]);

  const refreshList = useCallback(async () => setConvs(await listConversations()), []);

  // auth + initial load + inbox realtime + presence heartbeat
  useEffect(() => {
    let alive = true;
    supabase.auth.getUser().then(async ({ data }) => {
      if (!alive) return;
      if (!data.user) { setAuthed(false); return; }
      setMe(data.user.id); setAuthed(true);
      await refreshList();
      touchLastSeen();
    });
    const inbox = supabase.channel('inbox')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => { refreshList(); })
      .subscribe();
    const beat = setInterval(() => touchLastSeen(), 60000);
    return () => { alive = false; supabase.removeChannel(inbox); clearInterval(beat); };
  }, [refreshList]);

  // select conversation from ?c=
  useEffect(() => {
    const c = params.get('c');
    if (c) setActiveId(Number(c));
  }, [params]);

  // load thread + per-conversation realtime (messages + typing + presence)
  useEffect(() => {
    if (!activeId || !me) return;
    let alive = true;
    getMessages(activeId).then(m => { if (alive) { setMessages(m); setTimeout(scrollDown, 30); } });
    markConversationRead(activeId).then(refreshList);
    setOtherTyping(false); setOtherActive(false);

    const ch = supabase.channel(`conv:${activeId}`, { config: { presence: { key: me } } });
    ch.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `conversation_id=eq.${activeId}` }, ({ new: row }) => {
        const m = row as Message;
        setMessages(prev => prev.some(x => x.id === m.id) ? prev : [...prev, m]);
        setTimeout(scrollDown, 30);
        if (m.sender_id !== me) markConversationRead(activeId);
      })
      .on('broadcast', { event: 'typing' }, ({ payload }) => {
        if (payload?.user_id && payload.user_id !== me) {
          setOtherTyping(true);
          if (typingTimer.current) clearTimeout(typingTimer.current);
          typingTimer.current = setTimeout(() => setOtherTyping(false), 3000);
        }
      })
      .on('presence', { event: 'sync' }, () => {
        const state = ch.presenceState();
        setOtherActive(Object.keys(state).some(k => k !== me));
      })
      .subscribe(async status => { if (status === 'SUBSCRIBED') await ch.track({ online_at: new Date().toISOString() }); });
    convChannel.current = ch;
    return () => { alive = false; supabase.removeChannel(ch); convChannel.current = null; };
  }, [activeId, me, refreshList]);

  function scrollDown() { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }

  function onType(v: string) {
    setText(v);
    convChannel.current?.send({ type: 'broadcast', event: 'typing', payload: { user_id: me } });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!activeId || !text.trim() || sending) return;
    const body = text.trim(); setText(''); setSending(true);
    const { error } = await sendMessage(activeId, { body });
    setSending(false);
    if (error) { setText(body); return; }        // restore on failure
    await refreshList();                          // realtime echo appends the bubble
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file || !activeId || !me) return;
    if (file.size > 8 * 1024 * 1024) { toast(t('msg.file_too_big'), 'warn'); return; }
    setSending(true);
    const up = await uploadAttachment(me, file);
    if (up) await sendMessage(activeId, { attachment_url: up.url, attachment_type: up.type });
    setSending(false);
    if (fileRef.current) fileRef.current.value = '';
    await refreshList();
  }

  function openConv(id: number) { setActiveId(id); router.replace(`/messages?c=${id}`); }

  if (authed === false) {
    return (
      <div dir="rtl" className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-3">💬</div>
        <h1 className="text-2xl font-extrabold text-ink mb-2">{t('msg.title')}</h1>
        <p className="text-ink-muted mb-5">{t('fr.login_prompt')}</p>
        <Link href="/auth/login" className="btn-primary px-6 py-3 rounded-xl">{t('auth.login')}</Link>
      </div>
    );
  }

  const filtered = convs.filter(c => !search.trim() || (c.other.full_name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div dir="rtl" className="max-w-5xl mx-auto md:px-4 md:py-6">
      <div className="bg-surface md:rounded-2xl md:border border-border-soft md:shadow-soft overflow-hidden grid md:grid-cols-[300px_1fr] h-[calc(100vh-4rem)] md:h-[70vh]">
        {/* Conversation list */}
        <aside className={`border-l border-border-soft flex-col ${active ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-3 border-b border-border-soft">
            <h1 className="font-extrabold text-ink mb-2">💬 {t('msg.title')}</h1>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('msg.search_ph')}
              className="w-full px-3 py-2 rounded-lg border border-border-soft bg-bg text-sm outline-none focus:border-primary" />
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && <div className="p-8 text-center text-ink-muted text-sm">{t('msg.empty_convs')}</div>}
            {filtered.map(c => (
              <button key={c.conversation_id} onClick={() => openConv(c.conversation_id)}
                className={`w-full text-right p-3 flex items-center gap-3 hover:bg-bg-soft border-b border-border-soft ${activeId === c.conversation_id ? 'bg-mint-pale/40' : ''}`}>
                <Avatar name={c.other.full_name} url={c.other.avatar_url} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {c.is_pinned && <span className="text-xs">📌</span>}
                    <span className="font-bold text-ink text-sm truncate">{c.other.full_name || 'طالب'}</span>
                  </div>
                  <div className="text-xs text-ink-muted truncate">{lastPreview(c, t)}</div>
                </div>
                {c.unread > 0 && <span className="min-w-5 h-5 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{c.unread}</span>}
              </button>
            ))}
          </div>
        </aside>

        {/* Thread */}
        <section className={`flex-col ${active ? 'flex' : 'hidden md:flex'}`}>
          {!active ? (
            <div className="flex-1 flex items-center justify-center text-ink-muted text-sm p-8">{t('msg.pick_conv')}</div>
          ) : (
            <>
              <header className="p-3 border-b border-border-soft flex items-center gap-3">
                <button onClick={() => { setActiveId(null); router.replace('/messages'); }} className="md:hidden text-ink-muted">→</button>
                <Avatar name={active.other.full_name} url={active.other.avatar_url} />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink truncate">
                    {active.other.slug ? <Link href={`/u/${active.other.slug}`} className="hover:underline">{active.other.full_name || 'طالب'}</Link> : (active.other.full_name || 'طالب')}
                    {active.other.country_code && <span className="text-sm mr-1">{flagEmoji(active.other.country_code)}</span>}
                  </div>
                  <div className="text-[11px] text-ink-muted h-4">
                    {otherTyping ? <span className="text-primary">{t('msg.typing')}</span> : otherActive ? <span className="text-green-600">● {t('msg.active_now')}</span> : ''}
                  </div>
                </div>
                <button onClick={() => togglePinConversation(active.conversation_id, !active.is_pinned).then(refreshList)}
                  title={t('msg.pin')} className="text-ink-muted hover:text-primary">{active.is_pinned ? '📌' : '📍'}</button>
              </header>

              <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-bg/40">
                {messages.map(m => <Bubble key={m.id} m={m} mine={m.sender_id === me} t={t} />)}
                <div ref={endRef} />
              </div>

              <form onSubmit={submit} className="p-3 border-t border-border-soft flex items-center gap-2">
                <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={onFile} className="hidden" />
                <button type="button" onClick={() => fileRef.current?.click()} className="text-xl text-ink-muted hover:text-primary" title={t('msg.attach')}>📎</button>
                <input value={text} onChange={e => onType(e.target.value)} placeholder={t('msg.type_ph')}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-border-soft bg-bg outline-none focus:border-primary" />
                <button type="submit" disabled={sending || !text.trim()} className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold disabled:opacity-50">{t('msg.send')}</button>
              </form>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function lastPreview(c: ConvSummary, t: (k: any) => string): string {
  const lm = c.last_message;
  if (!lm) return '';
  if (lm.body) return lm.body;
  if (lm.share_type) return `🔗 ${t('msg.shared')}`;
  if (lm.attachment_type === 'image') return '📷';
  if (lm.attachment_type) return '📎';
  return '';
}

function Avatar({ name, url }: { name: string | null; url: string | null }) {
  if (url) /* eslint-disable-next-line @next/next/no-img-element */
    return <img src={url} alt={name || ''} className="w-10 h-10 rounded-xl object-cover shrink-0" />;
  return <div className="w-10 h-10 rounded-xl bg-gradient-mint-deep text-white flex items-center justify-center font-bold shrink-0">{(name || 'ط').charAt(0).toUpperCase()}</div>;
}

function Bubble({ m, mine, t }: { m: Message; mine: boolean; t: (k: any) => string }) {
  return (
    <div className={`flex ${mine ? 'justify-start' : 'justify-end'}`}>
      <div className={`max-w-[78%] rounded-2xl px-3 py-2 ${mine ? 'bg-primary text-white' : 'bg-surface border border-border-soft text-ink'}`}>
        {m.share_type && (
          <Link href={shareHref(m.share_type, m.share_ref, m.share_data)} className={`block rounded-xl p-2 mb-1 ${mine ? 'bg-white/15' : 'bg-mint-pale'}`}>
            <div className="text-lg">{m.share_data?.emoji || '🔗'}</div>
            <div className="font-bold text-sm">{m.share_data?.title || t('msg.shared')}</div>
            {m.share_data?.subtitle && <div className={`text-xs ${mine ? 'text-white/80' : 'text-ink-muted'}`}>{m.share_data.subtitle}</div>}
          </Link>
        )}
        {m.attachment_url && m.attachment_type === 'image' && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <a href={m.attachment_url} target="_blank" rel="noopener noreferrer"><img src={m.attachment_url} alt="" className="rounded-xl max-h-60 mb-1" /></a>
        )}
        {m.attachment_url && m.attachment_type !== 'image' && (
          <a href={m.attachment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 underline text-sm mb-1">📎 {t('msg.attachment')}</a>
        )}
        {m.body && <div className="text-sm whitespace-pre-wrap break-words">{m.body}</div>}
        <div className={`text-[10px] mt-0.5 ${mine ? 'text-white/60' : 'text-ink-subtle'}`}>{new Date(m.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
      </div>
    </div>
  );
}
