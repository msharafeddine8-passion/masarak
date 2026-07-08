'use client';
// Student's "university messages" pane, shown under the 🏛️ tab on /messages.
// Self-contained: its own list + thread + reply, reading org_messages (RLS-gated)
// and replying via message_university (which notifies the university's admins).
// Kept separate from the social-DM code so that fragile realtime path is untouched.
import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import { toast } from '@/lib/notify';
import {
  listUniThreads, getUniThread, markUniThreadRead, replyToUni,
  type UniThread, type UniMsg,
} from '@/lib/social/uniInbox';

export default function UniInboxPane({ me, onUnread }: { me: string; onUnread?: (n: number) => void }) {
  const { t } = useI18n();
  const [threads, setThreads] = useState<UniThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOrg, setActiveOrg] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<UniMsg[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const activeOrgRef = useRef<string | null>(null);

  const active = threads.find(x => x.org_id === activeOrg) || null;

  const refresh = useCallback(async () => {
    const list = await listUniThreads(me);
    setThreads(list);
    setLoading(false);
    onUnread?.(list.reduce((s, x) => s + x.unread, 0));
  }, [me, onUnread]);

  // initial load + realtime for incoming org→student replies (recipient_id = me)
  useEffect(() => {
    refresh();
    const ch = supabase.channel('uni-inbox')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'org_messages', filter: `recipient_id=eq.${me}` },
        () => { refresh(); const o = activeOrgRef.current; if (o) getUniThread(o, me).then(setMsgs); })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  // open a thread
  useEffect(() => {
    activeOrgRef.current = activeOrg;
    if (!activeOrg) return;
    getUniThread(activeOrg, me).then(m => { setMsgs(m); setTimeout(() => endRef.current?.scrollIntoView(), 30); });
    markUniThreadRead(activeOrg, me).then(refresh);
  }, [activeOrg, me, refresh]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || !active || sending) return;
    if (!active.uni_id) { toast(t('msg.uni.reply_unavailable'), 'warn'); return; }
    const body = text.trim(); setText(''); setSending(true);
    const { error } = await replyToUni(active.uni_id, body);
    setSending(false);
    if (error) { setText(body); toast(t('orgmsg.sendFailed'), 'warn'); return; }
    const m = await getUniThread(active.org_id, me);
    setMsgs(m); setTimeout(() => endRef.current?.scrollIntoView(), 30);
    refresh();
  }

  return (
    <>
      {/* Thread list */}
      <aside className={`border-l border-border-soft flex-col ${active ? 'hidden md:flex' : 'flex'}`}>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center text-ink-muted text-sm">…</div>
          ) : threads.length === 0 ? (
            <div className="p-8 text-center text-ink-muted text-sm">{t('msg.uni.empty')}</div>
          ) : threads.map(th => (
            <button key={th.org_id} onClick={() => setActiveOrg(th.org_id)}
              className={`w-full text-right p-3 flex items-center gap-3 hover:bg-bg-soft border-b border-border-soft ${activeOrg === th.org_id ? 'bg-mint-pale/40' : ''}`}>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">🏛️</div>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-ink text-sm truncate block">{th.uni_name}</span>
                <div className="text-xs text-ink-muted truncate">{th.last.body}</div>
              </div>
              {th.unread > 0 && <span className="min-w-5 h-5 px-1 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">{th.unread}</span>}
            </button>
          ))}
        </div>
      </aside>

      {/* Thread */}
      <section className={`flex-col ${active ? 'flex' : 'hidden md:flex'}`}>
        {!active ? (
          <div className="flex-1 flex items-center justify-center text-ink-muted text-sm p-8">{t('msg.uni.pick')}</div>
        ) : (
          <>
            <header className="p-3 border-b border-border-soft flex items-center gap-3">
              <button onClick={() => setActiveOrg(null)} className="md:hidden text-ink-muted">→</button>
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-lg shrink-0">🏛️</div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-ink truncate">
                  {active.uni_id
                    ? <Link href={`/universities/${active.uni_id}`} className="hover:underline">{active.uni_name}</Link>
                    : active.uni_name}
                </div>
                <div className="text-[11px] text-ink-muted">{t('msg.uni.official')}</div>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-bg/40">
              {msgs.map(m => {
                const mine = m.sender_type === 'student';
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-start' : 'justify-end'}`}>
                    <div className={`max-w-[78%] rounded-2xl px-3 py-2 ${mine ? 'bg-primary text-white' : 'bg-surface border border-border-soft text-ink'}`}>
                      <div className="text-sm whitespace-pre-wrap break-words">{m.body}</div>
                      <div className={`text-[9px] mt-1 ${mine ? 'opacity-80' : 'text-ink-muted'}`}>{new Date(m.created_at).toLocaleString('ar')}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={endRef} />
            </div>

            <form onSubmit={send} className="p-3 border-t border-border-soft flex items-center gap-2">
              <input value={text} onChange={e => setText(e.target.value)} placeholder={t('msg.type_ph')}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border-soft bg-bg outline-none focus:border-primary" />
              <button type="submit" disabled={sending || !text.trim()} className="px-4 py-2.5 rounded-xl bg-primary text-white font-bold disabled:opacity-50">{t('msg.send')}</button>
            </form>
          </>
        )}
      </section>
    </>
  );
}
