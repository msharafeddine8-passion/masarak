'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { fetchMyNotifications, getUnreadCount, markRead, markAllRead, type Notification } from '@/lib/notifications/client';
import { supabase } from '@/lib/supabase';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!alive) return;
      setSignedIn(!!user);
      if (user) refresh();
    })();

    // Poll every 60s for new notifications
    const i = setInterval(() => { if (signedIn) refresh(); }, 60000);

    // Close dropdown when clicking outside
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);

    return () => { alive = false; clearInterval(i); document.removeEventListener('mousedown', onClick); };
  }, [signedIn]);

  async function refresh() {
    const [count, items] = await Promise.all([getUnreadCount(), fetchMyNotifications(15)]);
    setUnread(count);
    setList(items);
  }

  async function openPanel() {
    setOpen(o => !o);
    if (!open) { setLoading(true); await refresh(); setLoading(false); }
  }

  async function onClickItem(n: Notification) {
    if (!n.read_at) {
      await markRead(n.id);
      setUnread(u => Math.max(0, u - 1));
      setList(list.map(x => x.id === n.id ? { ...x, read_at: new Date().toISOString() } : x));
    }
    if (n.link_url) window.location.href = n.link_url;
    setOpen(false);
  }

  async function onClickAll() {
    await markAllRead();
    setUnread(0);
    setList(list.map(x => ({ ...x, read_at: x.read_at || new Date().toISOString() })));
  }

  if (!signedIn) return null;

  return (
    <div ref={ref} className="relative">
      <button onClick={openPanel}
        className="relative p-2 rounded-xl hover:bg-mint-pale transition-colors"
        aria-label="الإشعارات">
        <span className="text-xl">🔔</span>
        {unread > 0 && (
          <span className="absolute top-0 left-0 bg-rose-500 text-white text-[10px] font-extrabold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-0 mt-2 w-80 sm:w-96 bg-surface rounded-2xl shadow-floaty border border-white/10 z-50 max-h-[70vh] overflow-hidden flex flex-col" dir="rtl">
          <div className="flex items-center justify-between p-3 border-b border-white/10">
            <h3 className="font-extrabold text-primary">🔔 الإشعارات</h3>
            {unread > 0 && (
              <button onClick={onClickAll} className="text-xs font-bold text-primary hover:underline">
                علّم الكل كمقروء
              </button>
            )}
          </div>

          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="p-6 text-center text-sm text-ink-muted">جاري التحميل...</div>
            ) : list.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-2">📭</div>
                <p className="text-sm text-ink-muted">ما عندك إشعارات بعد</p>
              </div>
            ) : (
              <ul className="divide-y divide-white/10">
                {list.map(n => {
                  const isUnread = !n.read_at;
                  const sev = n.severity === 'urgent' ? '🚨'
                            : n.severity === 'warn'   ? '⚠️'
                            : n.severity === 'success'? '✅' : '🔔';
                  return (
                    <li key={n.id}>
                      <button onClick={() => onClickItem(n)}
                        className={'w-full text-right p-3 hover:bg-bg-soft ' + (isUnread ? 'bg-mint-pale/30' : '')}>
                        <div className="flex items-start gap-2">
                          <span className="text-lg shrink-0">{sev}</span>
                          <div className="flex-1 min-w-0">
                            <div className={'font-bold text-sm ' + (isUnread ? 'text-ink' : 'text-ink-muted')}>{n.title}</div>
                            {n.body && <div className="text-xs text-ink-muted mt-0.5 line-clamp-2">{n.body}</div>}
                            <div className="text-[10px] text-ink-muted mt-1">
                              {timeAgo(n.created_at)}
                              {n.link_url && <span className="text-primary mr-2">·  عرض ←</span>}
                            </div>
                          </div>
                          {isUnread && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          {list.length > 0 && (
            <Link href="/notifications" className="block text-center p-2 text-xs font-bold text-primary border-t border-white/10 hover:bg-bg-soft">
              عرض كل الإشعارات ←
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function timeAgo(iso: string): string {
  const sec = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (sec < 60) return 'الآن';
  const min = Math.floor(sec / 60);
  if (min < 60) return `قبل ${min} د`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `قبل ${hr} س`;
  const day = Math.floor(hr / 24);
  if (day < 30) return `قبل ${day} يوم`;
  return new Date(iso).toLocaleDateString('ar');
}
