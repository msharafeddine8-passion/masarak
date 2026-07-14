'use client';
// The school's OFFICIAL layer on its public page (Rebuild Wave 1):
// - verified school → its published announcements + upcoming events (from the
//   org system the school manages in /org/dashboard);
// - not verified → an honest "data pending verification" strip + the claim CTA
//   («هل أنت من إدارة المدرسة؟») — truth for parents, a funnel for us.
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchOrgForEntity, fetchOrgAnnouncements, fetchOrgEvents,
  type Organization, type OrgAnnouncement, type OrgEvent } from '@/lib/org';

export default function SchoolOrgSection({ schoolId }: { schoolId: number }) {
  const [org, setOrg] = useState<Organization | null>(null);
  const [ready, setReady] = useState(false);
  const [anns, setAnns] = useState<OrgAnnouncement[]>([]);
  const [events, setEvents] = useState<OrgEvent[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      const o = await fetchOrgForEntity('school', schoolId).catch(() => null);
      if (!alive) return;
      setOrg(o);
      if (o && o.verification_status === 'verified') {
        const [a, e] = await Promise.all([
          fetchOrgAnnouncements(o.id).catch(() => []),
          fetchOrgEvents(o.id).catch(() => []),
        ]);
        if (!alive) return;
        setAnns(a.slice(0, 3));
        const now = Date.now();
        setEvents(e.filter((ev) => !ev.starts_at || new Date(ev.starts_at).getTime() >= now - 86400000).slice(0, 3));
      }
      setReady(true);
    })();
    return () => { alive = false; };
  }, [schoolId]);

  if (!ready) return null;

  // Verified: official announcements + events
  if (org?.verification_status === 'verified') {
    if (anns.length === 0 && events.length === 0) return null;
    return (
      <div className="bg-surface rounded-2xl p-6 shadow-sm border-2 border-primary/15">
        <h2 className="font-bold text-lg text-primary mb-4">📣 من إدارة المدرسة</h2>
        <div className="space-y-3">
          {anns.map((a) => (
            <div key={a.id} className="bg-bg-soft rounded-xl p-4">
              <div className="font-bold text-ink text-sm mb-1">{a.title}</div>
              {a.body && <p className="text-xs text-ink-muted leading-relaxed line-clamp-3 whitespace-pre-line">{a.body}</p>}
            </div>
          ))}
          {events.map((ev) => (
            <div key={ev.id} className="bg-mint-pale/60 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">📅</span>
              <div>
                <div className="font-bold text-ink text-sm">{ev.title}</div>
                <div className="text-xs text-ink-muted mt-0.5">
                  {ev.starts_at && new Date(ev.starts_at).toLocaleDateString('ar', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {ev.location ? ` · ${ev.location}` : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Not verified: honest note + claim funnel
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-3">
      <div className="flex-1">
        <div className="font-bold text-amber-900 text-sm mb-1">⚠️ بيانات أوّلية بانتظار التحقّق</div>
        <p className="text-xs text-amber-800 leading-relaxed m-0">
          معلومات هذه الصفحة مجموعة من مصادر عامة ولم تتحقق منها إدارة المدرسة بعد — تحقّقوا من التفاصيل المهمة (كالأقساط والتسجيل) مباشرةً مع المدرسة.
        </p>
      </div>
      <Link href="/org/claim" className="shrink-0 bg-primary text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-primary/90 text-center">
        من إدارة المدرسة؟ أدِر صفحتك مجاناً ←
      </Link>
    </div>
  );
}
