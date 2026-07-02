'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';

type Msg = {
  id: number;
  org_id: string;
  thread_key: string;
  sender_type: 'org' | 'student';
  sender_id: string;
  recipient_id: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
};

type ThreadSummary = {
  thread_key: string;
  student_id: string;
  studentName?: string;
  studentEmail?: string;
  lastMsg: Msg;
  unreadCount: number;
};

export default function OrgMessagesSection({ orgId, currentUserId }: { orgId: string; currentUserId: string }) {
  const { t } = useI18n();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [students, setStudents] = useState<Record<string, { full_name?: string; email?: string }>>({});
  const [loading, setLoading] = useState(true);
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('org_messages')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(500);
    setMessages((data || []) as Msg[]);

    const studentIds = Array.from(new Set((data || [])
      .map((m: { sender_type: string; sender_id: string; recipient_id: string | null }) =>
        m.sender_type === 'student' ? m.sender_id : (m.recipient_id ?? '')
      )
      .filter(Boolean)));
    if (studentIds.length > 0) {
      const { data: sd } = await supabase.from('student_profiles')
        .select('id, full_name, email')
        .in('id', studentIds);
      const map: Record<string, { full_name?: string; email?: string }> = {};
      for (const s of (sd || []) as { id: string; full_name?: string; email?: string }[]) map[s.id] = s;
      setStudents(map);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, [orgId]);

  const threads: ThreadSummary[] = useMemo(() => {
    const byThread: Record<string, Msg[]> = {};
    for (const m of messages) {
      (byThread[m.thread_key] ||= []).push(m);
    }
    const summaries: ThreadSummary[] = [];
    for (const [tk, msgs] of Object.entries(byThread)) {
      const sorted = [...msgs].sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      const studentId = tk.split(':').pop() || '';
      const unread = msgs.filter(m => m.recipient_id === currentUserId && !m.read_at).length;
      summaries.push({
        thread_key: tk,
        student_id: studentId,
        studentName: students[studentId]?.full_name,
        studentEmail: students[studentId]?.email,
        lastMsg: sorted[0],
        unreadCount: unread,
      });
    }
    return summaries.sort((a,b) => new Date(b.lastMsg.created_at).getTime() - new Date(a.lastMsg.created_at).getTime());
  }, [messages, students, currentUserId]);

  const activeMessages = useMemo(() => {
    if (!activeThread) return [];
    return [...messages.filter(m => m.thread_key === activeThread)]
      .sort((a,b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [activeThread, messages]);

  async function send() {
    if (!draft.trim() || !activeThread) return;
    setSending(true);
    const studentId = activeThread.split(':').pop() || '';
    const { error } = await supabase.from('org_messages').insert({
      org_id: orgId,
      thread_key: activeThread,
      sender_type: 'org',
      sender_id: currentUserId,
      recipient_id: studentId,
      body: draft.trim(),
    });
    if (error) alert(t('orgmsg.sendFailed') + ' ' + error.message);
    else { setDraft(''); await load(); }
    setSending(false);
  }

  return (
    <section id="messaging" className="bg-surface rounded-2xl border-2 border-line p-4 lg:p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-primary">💬 {t('orgmsg.title')}</h3>
        <button onClick={load} className="text-xs font-bold bg-surface border-2 border-line rounded-lg px-3 py-1.5">🔄</button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-sm text-ink-muted">{t('orgmsg.loading')}</div>
      ) : threads.length === 0 ? (
        <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">📭</div>
          <p className="font-bold mb-1">{t('orgmsg.emptyTitle')}</p>
          <p className="text-xs text-ink-muted">
            {t('orgmsg.emptyHint')}
          </p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[280px_1fr] gap-4 h-[500px]">
          {/* Threads list */}
          <div className="border-2 border-line rounded-xl overflow-y-auto">
            {threads.map(t => {
              const active = activeThread === t.thread_key;
              return (
                <button key={t.thread_key} onClick={() => setActiveThread(t.thread_key)}
                  className={'w-full text-right p-3 border-b border-gray-50 hover:bg-mint-pale/30 ' +
                    (active ? 'bg-mint-pale/50' : '')}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm truncate">{t.studentName || t.studentEmail || t.student_id.slice(0,8)}</span>
                    {t.unreadCount > 0 && (
                      <span className="text-[10px] font-extrabold bg-rose-500 text-white rounded-full px-1.5">
                        {t.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-ink-muted truncate">{t.lastMsg.body}</div>
                  <div className="text-[10px] text-ink-muted mt-1">{new Date(t.lastMsg.created_at).toLocaleString('ar')}</div>
                </button>
              );
            })}
          </div>

          {/* Active thread */}
          <div className="border-2 border-line rounded-xl flex flex-col">
            {!activeThread ? (
              <div className="flex-1 flex items-center justify-center text-sm text-ink-muted">
                {t('orgmsg.selectThread')}
              </div>
            ) : (
              <>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {activeMessages.map(m => (
                    <div key={m.id} className={'flex ' + (m.sender_type === 'org' ? 'justify-end' : 'justify-start')}>
                      <div className={'max-w-[80%] rounded-2xl px-3 py-2 text-sm ' + (
                        m.sender_type === 'org' ? 'bg-primary text-white' : 'bg-bg-soft text-ink'
                      )}>
                        <div>{m.body}</div>
                        <div className={'text-[9px] mt-1 ' + (m.sender_type === 'org' ? 'opacity-80' : 'text-ink-muted')}>
                          {new Date(m.created_at).toLocaleString('ar')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-line p-3">
                  <div className="flex gap-2">
                    <textarea value={draft} onChange={e => setDraft(e.target.value)}
                      rows={2} placeholder={t('orgmsg.inputPlaceholder')}
                      className="flex-1 px-3 py-2 rounded-xl border-2 border-line focus:border-primary outline-none text-sm resize-none" />
                    <button disabled={sending || !draft.trim()} onClick={send}
                      className="px-4 rounded-xl bg-primary text-white font-bold text-sm disabled:opacity-50 self-stretch">
                      {sending ? '...' : '↑'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
