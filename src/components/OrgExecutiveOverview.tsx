'use client';

import { useEffect, useState } from 'react';
import { useI18n, type TranslationKey } from '@/lib/i18n';

type Stats = {
  profileViews: number;
  interestedStudents: number;
  leads: number;
  eventRegistrations: number;
  scholarshipViews: number;
  conversionRate: number;
  monthlyGrowth: number;
};

type Props = {
  orgId: string;
  orgName: string;
};

/**
 * Executive Overview — premium SaaS dashboard header.
 * For now, shows placeholder zero-state metrics with clear explanations.
 * Once analytics events flow in (Sprint 1.6 GA4 → custom analytics table),
 * these numbers populate automatically.
 */
export default function OrgExecutiveOverview({ orgId, orgName }: Props) {
  const { t } = useI18n();
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    // Placeholder: in a future migration, an `org_analytics_daily` table
    // populated by event tracking will feed these values.
    setStats({
      profileViews: 0,
      interestedStudents: 0,
      leads: 0,
      eventRegistrations: 0,
      scholarshipViews: 0,
      conversionRate: 0,
      monthlyGrowth: 0,
    });
  }, [orgId]);

  if (!stats) return null;
  const isEmpty = stats.profileViews === 0;

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
