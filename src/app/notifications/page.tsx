'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchMyNotifications, markRead, markAllRead, type Notification } from '@/lib/notifications/client';

export default function NotificationsPage() {
  const [list, setList] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  async function load() {
    setLoading(true);
    const items = await fetchMyNotifications(100);
    setList(items);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = filter === 'unread' ? list.filter(n => !n.read_at) : list;

  async function onMarkAll() {
    await markAllRead();
    setList(list.map(n => ({ ...n, read_at: n.read_at || new Date().toISOString() })));
  }

  return (
    <main className="container-page py-10" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold text-primary">🔔 الإشعارات</h1>
          {list.some(n => !n.read_at) && (
            <button onClick={onMarkAll} className="text-sm font-bold text-primary hover:underline">
              علّم الكل كمقروء
            </button>
          )}
        </div>

        <div className="flex gap-2 mb-4">
          {(['all', 'unread'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={'px-4 py-2 rounded-xl text-sm font-bold ' +
                (filter === f ? 'bg-primary text-white' : 'bg-gray-100 text-ink-muted')}>
              {f === 'all' ? 'الكل' : 'غير مقروء'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">{[...Array(5)].map((_,i) => <div key={i} className="h-20 bg-gray-100 animate-pulse rounded-2xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-ink-muted">ما عندك إشعارات هون</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {filtered.map(n => {
              const isUnread = !n.read_at;
              const Wrapper = n.link_url ? Link : 'div';
              return (
                <li key={n.id}>
                  <Wrapper
                    {...(n.link_url ? { href: n.link_url } : {})}
                    onClick={() => { if (isUnread) markRead(n.id); }}
                    className={'block bg-white rounded-2xl p-4 border ' +
                      (isUnread ? 'border-primary/30 shadow-sm' : 'border-gray-100')}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {n.severity === 'urgent' ? '🚨' : n.severity === 'warn' ? '⚠️' : n.severity === 'success' ? '✅' : '🔔'}
                      </span>
                      <div className="flex-1">
                        <h3 className="font-extrabold text-ink">{n.title}</h3>
                        {n.body && <p className="text-sm text-ink-muted mt-1">{n.body}</p>}
                        <div className="text-xs text-ink-muted mt-2">{new Date(n.created_at).toLocaleString('ar')}</div>
                      </div>
                      {isUnread && <span className="w-2.5 h-2.5 rounded-full bg-primary mt-2" />}
                    </div>
                  </Wrapper>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </main>
  );
}
