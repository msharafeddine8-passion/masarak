"use client";
import { useEffect, useState } from "react";
import {
  fetchOrgMedia, fetchUpcomingEvents, fetchOrgAnnouncements,
  fetchOrgLeaderboard, fetchAffiliationCount,
  EVENT_TYPE_LABEL, AFFILIATION_LABEL,
  type Organization, type OrgMedia, type OrgEvent, type OrgAnnouncement,
  type LeaderboardEntry,
} from "@/lib/org";

/**
 * Campus Life — the "alive" section rendered inside a verified institution's
 * public page. Pulse strip + students + events + media + announcements.
 * All queries lightweight & parallel.
 */
export default function CampusLife({ org }: { org: Organization }) {
  const [media, setMedia] = useState<OrgMedia[]>([]);
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [announcements, setAnnouncements] = useState<OrgAnnouncement[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchOrgMedia(org.id),
      fetchUpcomingEvents(org.id, 4),
      fetchOrgAnnouncements(org.id),
      fetchOrgLeaderboard(org.id, 10),
      fetchAffiliationCount(org.id),
    ]).then(([m, e, a, lb, cnt]) => {
      setMedia(m);
      setEvents(e);
      setAnnouncements(a.filter((x) => x.is_public));
      setLeaderboard(lb);
      setStudentCount(cnt);
      setLoading(false);
    });
  }, [org.id]);

  if (loading) {
    return (
      <div className="py-12 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  const pinned = announcements.find((a) => a.pinned);
  const photos = media.filter((m) => m.kind === "photo");
  const totalXP = leaderboard.reduce((s, e) => s + e.xp, 0);

  const hasContent = org.about || org.banner_url || media.length || events.length
    || announcements.length || leaderboard.length;
  if (!hasContent) {
    return (
      <div className="py-12 text-center text-ink-subtle">
        <div className="text-4xl mb-2">🌱</div>
        <p className="text-sm">هذه المؤسسة بدأت للتو — محتوى صفحتها قيد الإعداد.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pulse strip */}
      {(studentCount > 0 || leaderboard.length > 0) && (
        <div className="grid grid-cols-3 gap-3">
          <PulseTile icon="🎓" value={studentCount} label="طالب منتسب" />
          <PulseTile icon="⚡" value={totalXP.toLocaleString()} label="نقطة خبرة" />
          <PulseTile icon="🔥" value={Math.max(0, ...leaderboard.map((e) => e.streak))} label="أطول سلسلة" />
        </div>
      )}

      {/* Leaderboard */}
      {leaderboard.length > 0 && (
        <div className="bg-surface rounded-2xl border border-white/10 p-6">
          <h3 className="font-extrabold text-primary mb-4">🏆 طلاب متميّزون</h3>
          <div className="space-y-2">
            {leaderboard.slice(0, 5).map((e, i) => (
              <div key={e.user_id} className="flex items-center gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                  i === 0 ? "bg-yellow-100 text-yellow-700"
                  : i === 1 ? "bg-bg-soft text-ink-muted"
                  : i === 2 ? "bg-orange-100 text-orange-700"
                  : "bg-bg-soft text-ink-subtle"
                }`}>
                  {i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1}
                </div>
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary flex-shrink-0 overflow-hidden">
                  {e.avatar
                    ? /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={e.avatar} alt="" className="w-full h-full object-cover" />
                    : e.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-ink text-sm truncate">{e.name}</div>
                  <div className="text-xs text-ink-subtle">
                    {AFFILIATION_LABEL[e.affiliation]} · Level {e.level}
                  </div>
                </div>
                <div className="text-sm font-extrabold text-primary">{e.xp.toLocaleString()} XP</div>
              </div>
            ))}
          </div>
          {leaderboard.length > 5 && (
            <p className="text-xs text-ink-subtle text-center mt-3">+{leaderboard.length - 5} طالب آخر</p>
          )}
        </div>
      )}

      {/* Banner */}
      {org.banner_url && (
        <div className="rounded-2xl overflow-hidden aspect-[3/1] bg-bg-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={org.banner_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {/* Tagline + About */}
      {(org.tagline || org.about) && (
        <div className="bg-surface rounded-2xl border border-white/10 p-6">
          {org.tagline && <p className="text-lg font-bold text-primary mb-2">{org.tagline}</p>}
          {org.about && <p className="text-ink-muted leading-relaxed whitespace-pre-line">{org.about}</p>}
          {org.social && Object.keys(org.social).length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {org.social.website && <SocialLink href={org.social.website} icon="🌐" label="الموقع" />}
              {org.social.instagram && <SocialLink href={org.social.instagram} icon="📷" label="Instagram" />}
              {org.social.facebook && <SocialLink href={org.social.facebook} icon="👍" label="Facebook" />}
              {org.social.linkedin && <SocialLink href={org.social.linkedin} icon="💼" label="LinkedIn" />}
            </div>
          )}
        </div>
      )}

      {/* Pinned announcement */}
      {pinned && (
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-1">
            <span>📌</span>
            <h3 className="font-bold text-blue-900">{pinned.title}</h3>
          </div>
          {pinned.body && <p className="text-sm text-blue-800 leading-relaxed">{pinned.body}</p>}
        </div>
      )}

      {/* Upcoming events */}
      {events.length > 0 && (
        <div className="bg-surface rounded-2xl border border-white/10 p-6">
          <h3 className="font-extrabold text-primary mb-4">📅 فعاليات قادمة</h3>
          <div className="space-y-3">
            {events.map((ev) => {
              const d = new Date(ev.starts_at);
              return (
                <div key={ev.id} className="flex gap-3 items-start">
                  <div className="w-14 h-14 rounded-xl bg-primary text-white flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-[10px] leading-none">{d.toLocaleDateString("ar", { month: "short" })}</span>
                    <span className="text-xl font-extrabold leading-none mt-0.5">{d.getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-ink">{ev.title}</span>
                      <span className="text-[10px] bg-bg-soft px-1.5 py-0.5 rounded-full">{EVENT_TYPE_LABEL[ev.event_type]}</span>
                    </div>
                    <div className="text-xs text-ink-subtle">
                      {d.toLocaleTimeString("ar", { hour: "2-digit", minute: "2-digit" })}
                      {ev.location && ` · 📍 ${ev.location}`}
                    </div>
                    {ev.description && <p className="text-sm text-ink-muted mt-0.5 line-clamp-2">{ev.description}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Photo gallery */}
      {photos.length > 0 && (
        <div className="bg-surface rounded-2xl border border-white/10 p-6">
          <h3 className="font-extrabold text-primary mb-4">🖼️ من الحرم الجامعي</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {photos.map((m) => (
              <figure key={m.id} className="rounded-xl overflow-hidden bg-bg-soft">
                <div className="aspect-video">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={m.url} alt={m.caption || ""} className="w-full h-full object-cover" />
                </div>
                {m.caption && <figcaption className="text-xs text-ink-subtle p-2">{m.caption}</figcaption>}
              </figure>
            ))}
          </div>
        </div>
      )}

      {/* Other announcements */}
      {announcements.filter((a) => !a.pinned).length > 0 && (
        <div className="bg-surface rounded-2xl border border-white/10 p-6">
          <h3 className="font-extrabold text-primary mb-4">📣 إعلانات</h3>
          <div className="space-y-3">
            {announcements.filter((a) => !a.pinned).map((a) => (
              <div key={a.id} className="border-r-2 border-primary/20 pr-3">
                <div className="font-bold text-ink text-sm">{a.title}</div>
                {a.body && <p className="text-sm text-ink-muted leading-relaxed">{a.body}</p>}
                <div className="text-[11px] text-ink-subtle mt-0.5">
                  {new Date(a.created_at).toLocaleDateString("ar")}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PulseTile({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="bg-gradient-to-br from-primary/5 to-mint/10 rounded-2xl p-4 text-center border border-primary/10">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xl font-extrabold text-primary">{value}</div>
      <div className="text-[11px] text-ink-subtle mt-0.5">{label}</div>
    </div>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: string; label: string }) {
  const url = href.startsWith("http") ? href : `https://${href}`;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 text-sm bg-bg-soft hover:bg-bg-soft border border-white/10 rounded-full px-3 py-1.5 text-ink-muted">
      <span>{icon}</span><span>{label}</span>
    </a>
  );
}
