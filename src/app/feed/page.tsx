'use client';
/** /feed — Smart Feed (Social · Phase 6). Personalized, never random: posts from
 *  my communities + friends, announcements from universities I follow, upcoming
 *  events, and recommended scholarships. */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { timeAgo } from '@/components/social/PostCard';
import { getFeed, getUpcoming, type FeedItem, type UpcomingItem } from '@/lib/social/feed';

type Schol = { id: number; name: string | null; amount: string | null };

export default function FeedPage() {
  const { t } = useI18n();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [items, setItems] = useState<FeedItem[]>([]);
  const [upcoming, setUpcoming] = useState<UpcomingItem[]>([]);
  const [schols, setSchols] = useState<Schol[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { setAuthed(false); return; }
      setAuthed(true);
      const [f, u, s] = await Promise.all([
        getFeed(),
        getUpcoming(),
        supabase.from('scholarships').select('id, name, amount').order('id', { ascending: false }).limit(4),
      ]);
      setItems(f); setUpcoming(u); setSchols((s.data as Schol[]) || []); setLoading(false);
    });
  }, []);

  if (authed === false) {
    return (
      <div dir="rtl" className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-3">📰</div>
        <h1 className="text-2xl font-extrabold text-ink mb-2">{t('feed.title')}</h1>
        <p className="text-ink-muted mb-5">{t('fr.login_prompt')}</p>
        <Link href="/auth/login" className="btn-primary px-6 py-3 rounded-xl">{t('auth.login')}</Link>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold text-ink mb-1">📰 {t('feed.title')}</h1>
      <p className="text-ink-muted text-sm mb-5">{t('feed.subtitle')}</p>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Timeline */}
        <div className="lg:col-span-2 space-y-3">
          {loading && <div className="text-center py-10 text-ink-muted">…</div>}
          {!loading && items.length === 0 && (
            <div className="bg-surface rounded-2xl p-8 text-center border border-border-soft">
              <div className="text-4xl mb-2">🌱</div>
              <p className="font-bold text-ink mb-1">{t('feed.empty')}</p>
              <p className="text-sm text-ink-muted mb-4">{t('feed.empty_cta')}</p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Link href="/community" className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm">🌐 {t('user.community')}</Link>
                <Link href="/friends" className="px-4 py-2 rounded-xl bg-mint-light text-primary font-bold text-sm">👥 {t('user.friends')}</Link>
                <Link href="/universities" className="px-4 py-2 rounded-xl bg-mint-light text-primary font-bold text-sm">🏛️ {t('nav.universities')}</Link>
              </div>
            </div>
          )}
          {items.map((it, i) => it.kind === 'community_post'
            ? <CommunityPostItem key={`p${it.data.post_id}`} it={it} t={t} />
            : <UniAnnItem key={`a${i}`} it={it} t={t} />)}
        </div>

        {/* Aside */}
        <aside className="space-y-4">
          {upcoming.length > 0 && (
            <Card title={`📅 ${t('feed.upcoming')}`}>
              {upcoming.map((e, i) => (
                <Link key={i} href={`/universities/${e.uni_id}`} className="block py-2 hover:opacity-90">
                  <div className="text-sm font-bold text-ink">{e.title}</div>
                  <div className="text-xs text-ink-muted">{e.uni_name} · {new Date(e.starts_at).toLocaleDateString('ar')}</div>
                </Link>
              ))}
            </Card>
          )}
          {schols.length > 0 && (
            <Card title={`🏆 ${t('feed.recommended_scholarships')}`}>
              {schols.map(s => (
                <Link key={s.id} href="/scholarships" className="block py-2 hover:opacity-90">
                  <div className="text-sm font-bold text-ink line-clamp-1">{s.name || '—'}</div>
                  {s.amount && <div className="text-xs text-accent">{s.amount}</div>}
                </Link>
              ))}
              <Link href="/scholarships" className="block text-center text-xs font-bold text-primary pt-2">{t('feed.all_scholarships')} ←</Link>
            </Card>
          )}
        </aside>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-2xl p-4 shadow-soft border border-border-soft">
      <h2 className="text-sm font-bold text-ink mb-2">{title}</h2>
      <div className="divide-y divide-border-soft">{children}</div>
    </div>
  );
}

function CommunityPostItem({ it, t }: { it: Extract<FeedItem, { kind: 'community_post' }>; t: (k: any) => string }) {
  const d = it.data;
  const name = d.author.full_name || 'طالب';
  return (
    <article className="bg-surface rounded-2xl p-4 shadow-soft border border-border-soft">
      <div className="flex items-center gap-2 text-xs text-ink-subtle mb-2">
        <Link href={`/community/${d.community.slug}`} className="inline-flex items-center gap-1 font-bold text-primary hover:underline">{d.community.icon} {d.community.name}</Link>
        <span>· {d.reason === 'friend' ? t('feed.via_friend') : t('feed.via_community')} · {timeAgo(it.ts, t)}</span>
      </div>
      <div className="flex items-center gap-2 mb-1">
        {d.author.avatar_url
          /* eslint-disable-next-line @next/next/no-img-element */
          ? <img src={d.author.avatar_url} alt="" className="w-7 h-7 rounded-lg object-cover" />
          : <div className="w-7 h-7 rounded-lg bg-gradient-mint-deep text-white flex items-center justify-center text-xs font-bold">{name.charAt(0)}</div>}
        <span className="text-sm font-bold text-ink">{d.author.slug ? <Link href={`/u/${d.author.slug}`} className="hover:underline">{name}</Link> : name}</span>
      </div>
      <Link href={`/community/post/${d.post_id}`} className="block">
        <p className="text-sm text-ink whitespace-pre-wrap break-words line-clamp-4">{d.body}</p>
      </Link>
      <div className="flex items-center gap-4 mt-2 text-xs text-ink-muted">
        <span>❤️ {d.like_count}</span>
        <Link href={`/community/post/${d.post_id}`} className="hover:text-primary">💬 {d.comment_count}</Link>
      </div>
    </article>
  );
}

function UniAnnItem({ it, t }: { it: Extract<FeedItem, { kind: 'uni_announcement' }>; t: (k: any) => string }) {
  const d = it.data;
  return (
    <Link href={`/universities/${d.uni_id}`} className="block bg-surface rounded-2xl p-4 shadow-soft border border-border-soft hover:shadow-card transition-shadow">
      <div className="text-xs text-ink-subtle mb-1">🏛️ <b className="text-primary">{d.uni_name}</b> · {t('feed.announced')} · {timeAgo(it.ts, t)}</div>
      <div className="font-bold text-ink">{d.title}</div>
      {d.body && <p className="text-sm text-ink-muted mt-1 line-clamp-2">{d.body}</p>}
    </Link>
  );
}
