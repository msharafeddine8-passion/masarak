'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type Stats = {
  profileViews: number;
  interestedStudents: number;
  leads: number;
  eventRegistrations: number;
  scholarshipViews: number;
  conversionRate: number;
};

type Props = {
  orgId: string;
  orgName: string;
  entityId?: number | null;
  entityType?: string | null;
};

// The public pages emit canonical events ('student.viewed_university', …) while
// the legacy taxonomy uses short names ('view_entity'). Count both so the numbers
// match what actually gets logged.
const VIEW_EVENTS = ['view_entity', 'student.viewed_university', 'student.viewed_school', 'student.viewed_vocational'];
const SAVE_EVENTS = ['save_item', 'student.saved_university', 'student.saved_school'];

const ZERO: Stats = { profileViews: 0, interestedStudents: 0, leads: 0, eventRegistrations: 0, scholarshipViews: 0, conversionRate: 0 };

/**
 * Executive Overview — top-of-dashboard KPI header.
 * Numbers are computed live from the same sources the detailed sections use:
 *   • org_leads         → interested students, leads, event registrations
 *   • analytics_events  → profile views, saves (→ conversion), scholarship views
 * org_leads is always readable by the org manager, so the student-interest
 * signal shows even if analytics_events reads are restricted.
 */
export default function OrgExecutiveOverview({ orgId, orgName, entityId, entityType }: Props) {
  const { t } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      // 1) Leads — proven source (who interacted + their info)
      const { data: leadRows } = await supabase
        .from('org_leads')
        .select('student_id, source')
        .eq('org_id', orgId);
      const leads = (leadRows || []) as { student_id: string; source: string }[];
      const interestedStudents = new Set(leads.map((l) => l.student_id)).size;
      const eventRegistrations = leads.filter((l) => l.source === 'event_register').length;
      const viewsFromLeads = leads.filter((l) => l.source === 'view').length;

      // 2) Profile views + saves from analytics_events for the linked entity
      let analyticsViews = 0;
      let saves = 0;
      if (entityId != null) {
        const et = entityType || 'university';
        const [viewsRes, savesRes] = await Promise.all([
          supabase.from('analytics_events').select('id', { count: 'exact', head: true })
            .eq('entity_type', et).eq('entity_id', String(entityId)).in('event_name', VIEW_EVENTS),
          supabase.from('analytics_events').select('id', { count: 'exact', head: true })
            .eq('entity_type', et).eq('entity_id', String(entityId)).in('event_name', SAVE_EVENTS),
        ]);
        analyticsViews = viewsRes.count || 0;
        saves = savesRes.count || 0;
        if (saves === 0) {
          const { count } = await supabase.from('saved_items').select('id', { count: 'exact', head: true })
            .eq('entity_type', et).eq('entity_id', String(entityId));
          saves = count || 0;
        }
      }
      // Fall back to the leads-derived view count when analytics reads are empty/blocked.
      const profileViews = Math.max(analyticsViews, viewsFromLeads);

      // 3) Scholarship views — best-effort: views of this org's own scholarships
      let scholarshipViews = 0;
      const { data: sch } = await supabase.from('org_scholarships').select('id').eq('org_id', orgId);
      const schIds = (sch || []).map((s: { id: string | number }) => String(s.id));
      if (schIds.length > 0) {
        const { count } = await supabase.from('analytics_events').select('id', { count: 'exact', head: true })
          .eq('entity_type', 'scholarship').in('entity_id', schIds)
          .in('event_name', ['view_entity', 'student.viewed_scholarship']);
        scholarshipViews = count || 0;
      }

      const conversionRate = profileViews > 0 ? Math.round((saves / profileViews) * 100) : 0;

      if (!cancelled) {
        setStats({ profileViews, interestedStudents, leads: leads.length, eventRegistrations, scholarshipViews, conversionRate });
      }
    })().catch(() => { if (!cancelled) setStats(ZERO); });

    return () => { cancelled = true; };
  }, [orgId, entityId, entityType]);

  if (!stats) return null;
  const isEmpty =
    stats.profileViews + stats.interestedStudents + stats.leads +
    stats.eventRegistrations + stats.scholarshipViews === 0;

  const cards = [
    { labelKey: 'orgexec.cardProfileViews',   value: stats.profileViews,        icon: '👁️',  color: 'from-blue-50  to-indigo-50',  href: '#analytics' },
    { labelKey: 'orgexec.cardInterested',     value: stats.interestedStudents,  icon: '🎓',  color: 'from-mint-pale to-bg-mint',   href: '#students' },
    { labelKey: 'orgexec.cardLeads',          value: stats.leads,               icon: '📥',  color: 'from-amber-50  to-orange-50', href: '#messaging' },
    { labelKey: 'orgexec.cardEventRegs',      value: stats.eventRegistrations,  icon: '📅',  color: 'from-purple-50 to-pink-50',   href: '#events' },
    { labelKey: 'orgexec.cardScholarshipViews', value: stats.scholarshipViews,  icon: '🏆',  color: 'from-yellow-50 to-amber-50',  href: '#scholarships' },
    { labelKey: 'orgexec.cardConversion',     value: stats.conversionRate,      icon: '🎯',  color: 'from-emerald-50 to-green-50', href: '#analytics', suffix: '%' },
  ];

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-primary">📊 {t('orgexec.heading')}</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-bold bg-surface border-2 border-line rounded-lg hover:border-primary">
            {t('orgexec.last30days')} ▼
          </button>
          <button className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary-dark">
            {t('orgexec.export')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {cards.map((c) => (
          <div key={c.labelKey}
             className={`bg-gradient-to-br ${c.color} rounded-2xl border border-white/40 p-4`}>
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-3xl font-extrabold text-ink">
              {c.value}{c.suffix || ''}
            </div>
            <div className="text-xs text-ink-muted mt-1 font-semibold">{t(c.labelKey as TranslationKey)}</div>
          </div>
        ))}
      </div>

      {isEmpty && (
        <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-bold text-blue-900 mb-1">{t('orgexec.emptyTitle')}</p>
              <p className="text-blue-700 leading-relaxed">
                {t('orgexec.emptyBefore')} <strong>{orgName}</strong>{t('orgexec.emptyAfter')}
                {' '}{t('orgexec.emptyHint')}
              </p>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}
