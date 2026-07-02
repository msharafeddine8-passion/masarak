'use client';
/** Social layer for a university detail page (Phase 5): follow + followers count
 *  + share, and — for verified/premium universities — their OFFICIAL
 *  announcements, events and scholarships (reusing the existing org_* data). */
import { useEffect, useState } from 'react';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { isFollowing, followersCount, toggleFollow } from '@/lib/social/follows';
import {
  fetchOrgAnnouncements, fetchUpcomingEvents, fetchOrgScholarships,
  type Organization, type OrgAnnouncement, type OrgEvent, type OrgScholarship,
} from '@/lib/org';

export default function UniversityOfficialSection({ uniId, uniName, org }: { uniId: number; uniName: string; org: Organization | null }) {
  const { t } = useI18n();
  const [me, setMe] = useState<string | null>(null);
  const [count, setCount] = useState(0);
  const [following, setFollowing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [anns, setAnns] = useState<OrgAnnouncement[]>([]);
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [schols, setSchols] = useState<OrgScholarship[]>([]);
  const tid = String(uniId);
  const verified = org?.verification_status === 'verified';

  useEffect(() => {
    followersCount('university', tid).then(setCount);
    supabase.auth.getUser().then(({ data }) => { setMe(data.user?.id ?? null); if (data.user) isFollowing('university', tid).then(setFollowing); });
    if (verified && org) {
      fetchOrgAnnouncements(org.id).then(a => setAnns(a.filter(x => x.is_public).sort((x, y) => Number(y.pinned) - Number(x.pinned)).slice(0, 5)));
      fetchUpcomingEvents(org.id, 5).then(setEvents);
      fetchOrgScholarships(org.id).then(s => setSchols(s.filter(x => x.is_public).slice(0, 5)));
    }
  }, [tid, verified, org]);

  async function follow() {
    if (!me) { window.location.href = '/auth/login'; return; }
    setBusy(true);
    const now = await toggleFollow('university', tid);
    setFollowing(now); setCount(c => Math.max(0, c + (now ? 1 : -1))); setBusy(false);
  }
  async function share() {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/universities/${uniId}` : '';
    try { if (navigator.share) { await navigator.share({ title: uniName, url }); return; } } catch { /* cancelled */ }
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* blocked */ }
  }

  const hasOfficial = verified && (anns.length > 0 || events.length > 0 || schols.length > 0);

  return (
    <section className="bg-surface rounded-2xl p-5 shadow-soft border border-border-soft" dir="rtl">
      {/* Follow bar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1">
          <div className="text-sm text-ink-muted">👥 <b className="text-ink">{count.toLocaleString('en')}</b> {t('uni.followers')}</div>
        </div>
        <button onClick={follow} disabled={busy}
          className={`px-4 py-2 rounded-xl font-bold text-sm disabled:opacity-50 ${following ? 'bg-mint-light text-primary' : 'bg-primary text-white hover:bg-primary/90'}`}>
          {following ? `✓ ${t('uni.following')}` : `+ ${t('uni.follow')}`}
        </button>
        <button onClick={share} className="px-3 py-2 rounded-xl bg-mint-light text-primary font-bold text-sm">{copied ? '✓' : '🔗'} {t('uni.share')}</button>
      </div>

      {/* Official content (verified universities) */}
      {hasOfficial && (
        <div className="mt-4 pt-4 border-t border-border-soft space-y-4">
          <div className="text-xs font-bold text-primary">✔ {t('uni.official_page')}</div>

          {anns.length > 0 && (
            <Block title={`📢 ${t('uni.announcements')}`}>
              {anns.map(a => (
                <div key={a.id} className="py-1.5">
                  <div className="font-bold text-sm text-ink">{a.pinned && '📌 '}{a.title}</div>
                  {a.body && <p className="text-xs text-ink-muted mt-0.5 line-clamp-2">{a.body}</p>}
                </div>
              ))}
            </Block>
          )}

          {events.length > 0 && (
            <Block title={`📅 ${t('uni.events')}`}>
              {events.map(e => (
                <div key={e.id} className="py-1.5">
                  <div className="font-bold text-sm text-ink">{e.title}</div>
                  <div className="text-xs text-ink-muted">{new Date(e.starts_at).toLocaleDateString('ar')}{e.location ? ` · ${e.location}` : ''}</div>
                </div>
              ))}
            </Block>
          )}

          {schols.length > 0 && (
            <Block title={`🏆 ${t('uni.scholarships')}`}>
              {schols.map(s => (
                <div key={s.id} className="py-1.5">
                  <div className="font-bold text-sm text-ink">{s.title}</div>
                  <div className="text-xs text-ink-muted">{[s.amount, s.coverage, s.deadline && `${t('uni.deadline')}: ${new Date(s.deadline).toLocaleDateString('ar')}`].filter(Boolean).join(' · ')}</div>
                  {s.link && <a href={s.link} target="_blank" rel="noopener noreferrer nofollow" className="text-xs text-accent hover:underline">{t('uni.apply')} ←</a>}
                </div>
              ))}
            </Block>
          )}
        </div>
      )}
    </section>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-ink-subtle mb-1">{title}</h3>
      <div className="divide-y divide-border-soft">{children}</div>
    </div>
  );
}
