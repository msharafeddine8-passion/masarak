'use client';
/**
 * /friends — Social system · Phase 2. Tabs: My Friends · Requests · Discover.
 * All data via the SECURITY DEFINER RPCs (friends.ts). Opt-in discovery only
 * (search/suggestions surface is_public profiles).
 */
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';
import PersonCard from '@/components/social/PersonCard';
import {
  listMyFriends, listFriendRequests, suggestedFriends, searchPeople,
  sendFriendRequest, respondFriendRequest, cancelFriendRequest, removeFriend,
  type PersonCard as TCard, type FriendRequests,
} from '@/lib/social/friends';

type Tab = 'friends' | 'requests' | 'discover';

export default function FriendsPage() {
  const { t } = useI18n();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<TCard[]>([]);
  const [reqs, setReqs] = useState<FriendRequests>({ incoming: [], outgoing: [] });
  const [suggestions, setSuggestions] = useState<TCard[]>([]);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<TCard[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [f, r, s] = await Promise.all([listMyFriends(), listFriendRequests(), suggestedFriends(12)]);
    setFriends(f); setReqs(r); setSuggestions(s);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setAuthed(false); return; }
      setAuthed(true);
      refresh();
    });
  }, [refresh]);

  async function act(key: string, fn: () => PromiseLike<any>) {
    setBusy(key);
    try { await fn(); await refresh(); if (results) await runSearch(q); }
    finally { setBusy(null); }
  }

  async function runSearch(query: string) {
    if (query.trim().length < 2) { setResults(null); return; }
    setResults(await searchPeople(query.trim()));
  }

  if (authed === false) {
    return (
      <div dir="rtl" className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-3">👥</div>
        <h1 className="text-2xl font-extrabold text-ink mb-2">{t('fr.title')}</h1>
        <p className="text-ink-muted mb-5">{t('fr.login_prompt')}</p>
        <Link href="/auth/login" className="btn-primary px-6 py-3 rounded-xl">{t('auth.login')}</Link>
      </div>
    );
  }

  const pendingCount = reqs.incoming.length;

  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-ink mb-1">👥 {t('fr.title')}</h1>
      <p className="text-ink-muted text-sm mb-5">{t('fr.subtitle')}</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border-soft">
        <TabBtn active={tab === 'friends'} onClick={() => setTab('friends')} label={`${t('fr.tab.friends')} (${friends.length})`} />
        <TabBtn active={tab === 'requests'} onClick={() => setTab('requests')} label={t('fr.tab.requests')} badge={pendingCount} />
        <TabBtn active={tab === 'discover'} onClick={() => setTab('discover')} label={t('fr.tab.discover')} />
      </div>

      {/* Friends */}
      {tab === 'friends' && (
        <div className="space-y-3">
          {friends.length === 0 && <Empty icon="🤝" text={t('fr.empty_friends')} />}
          {friends.map(p => (
            <PersonCard key={p.user_id} person={p} action={
              <button disabled={busy === p.user_id} onClick={() => act(p.user_id, () => removeFriend(p.user_id))}
                className="text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 text-ink-muted hover:bg-slate-200 disabled:opacity-50">
                {t('fr.remove')}
              </button>
            } />
          ))}
        </div>
      )}

      {/* Requests */}
      {tab === 'requests' && (
        <div className="space-y-6">
          <div>
            <h2 className="text-sm font-bold text-ink-subtle mb-2">{t('fr.incoming')}</h2>
            <div className="space-y-3">
              {reqs.incoming.length === 0 && <Empty icon="📥" text={t('fr.empty_incoming')} />}
              {reqs.incoming.map(({ id, person }) => (
                <PersonCard key={id} person={person} action={
                  <div className="flex gap-2">
                    <button disabled={busy === `in-${id}`} onClick={() => act(`in-${id}`, () => respondFriendRequest(id, true))}
                      className="text-xs font-bold px-3 py-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50">{t('fr.accept')}</button>
                    <button disabled={busy === `in-${id}`} onClick={() => act(`in-${id}`, () => respondFriendRequest(id, false))}
                      className="text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 text-ink-muted hover:bg-slate-200 disabled:opacity-50">{t('fr.reject')}</button>
                  </div>
                } />
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-sm font-bold text-ink-subtle mb-2">{t('fr.outgoing')}</h2>
            <div className="space-y-3">
              {reqs.outgoing.length === 0 && <Empty icon="📤" text={t('fr.empty_outgoing')} />}
              {reqs.outgoing.map(({ id, person }) => (
                <PersonCard key={id} person={person} action={
                  <button disabled={busy === `out-${id}`} onClick={() => act(`out-${id}`, () => cancelFriendRequest(id))}
                    className="text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 text-ink-muted hover:bg-slate-200 disabled:opacity-50">{t('fr.cancel')}</button>
                } />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Discover */}
      {tab === 'discover' && (
        <div className="space-y-6">
          <form onSubmit={(e) => { e.preventDefault(); runSearch(q); }} className="flex gap-2">
            <input value={q} onChange={(e) => { setQ(e.target.value); runSearch(e.target.value); }}
              placeholder={t('fr.search_ph')} className="flex-1 px-4 py-2.5 rounded-xl border border-border-soft bg-surface outline-none focus:border-primary" />
          </form>

          {results !== null ? (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-ink-subtle">{t('fr.results')}</h2>
              {results.length === 0 && <Empty icon="🔍" text={t('fr.no_results')} />}
              {results.map(p => <PersonCard key={p.user_id} person={p} action={<AddBtn p={p} busy={busy} act={act} t={t} />} />)}
            </div>
          ) : (
            <div className="space-y-3">
              <h2 className="text-sm font-bold text-ink-subtle">{t('fr.suggestions')}</h2>
              {suggestions.length === 0 && <Empty icon="✨" text={t('fr.no_suggestions')} />}
              {suggestions.map(p => <PersonCard key={p.user_id} person={p} action={<AddBtn p={p} busy={busy} act={act} t={t} />} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Add / Accept / status button for discover & search cards. send_friend_request
// auto-accepts when a reverse pending exists, so one action covers none+pending_in.
function AddBtn({ p, busy, act, t }: { p: TCard; busy: string | null; act: (k: string, fn: () => PromiseLike<any>) => void; t: (k: any) => string }) {
  if (p.status === 'friends') return <span className="text-xs font-bold text-primary px-2">{t('fr.is_friend')} ✓</span>;
  if (p.status === 'pending_out') return <span className="text-xs font-semibold text-ink-subtle px-2">{t('fr.sent')}</span>;
  const label = p.status === 'pending_in' ? t('fr.accept') : t('fr.add');
  return (
    <button disabled={busy === p.user_id} onClick={() => act(p.user_id, () => sendFriendRequest(p.user_id))}
      className="text-xs font-bold px-3 py-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50">{label}</button>
  );
}

function TabBtn({ active, onClick, label, badge }: { active: boolean; onClick: () => void; label: string; badge?: number }) {
  return (
    <button onClick={onClick} className={`px-3 py-2.5 text-sm font-bold border-b-2 -mb-px transition-colors ${active ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'}`}>
      {label}{badge ? <span className="mr-1.5 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-danger text-white text-[10px]">{badge}</span> : null}
    </button>
  );
}

function Empty({ icon, text }: { icon: string; text: string }) {
  return <div className="text-center py-10 text-ink-muted"><div className="text-4xl mb-2">{icon}</div><p className="text-sm">{text}</p></div>;
}
