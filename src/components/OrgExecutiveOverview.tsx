'use client';

import { useEffect, useState } from 'react';

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
    { label: 'مشاهدات الملف',          value: stats.profileViews,        icon: '👁️',  color: 'from-blue-50  to-indigo-50',  href: '#analytics' },
    { label: 'طلاب مهتمّون',           value: stats.interestedStudents,  icon: '🎓',  color: 'from-mint-pale to-bg-mint',   href: '#students' },
    { label: 'Leads',                  value: stats.leads,               icon: '📥',  color: 'from-amber-50  to-orange-50', href: '#messaging' },
    { label: 'تسجيلات الفعاليات',      value: stats.eventRegistrations,  icon: '📅',  color: 'from-purple-50 to-pink-50',   href: '#events' },
    { label: 'مشاهدات المنح',          value: stats.scholarshipViews,    icon: '🏆',  color: 'from-yellow-50 to-amber-50',  href: '#scholarships' },
    { label: 'معدّل التحويل',          value: stats.conversionRate,      icon: '🎯',  color: 'from-emerald-50 to-green-50', href: '#analytics', suffix: '%' },
  ];

  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-extrabold text-primary">📊 نظرة تنفيذية</h2>
        <div className="flex gap-2">
          <button className="px-3 py-1.5 text-xs font-bold bg-surface border-2 border-white/10 rounded-lg hover:border-primary">
            آخر ٣٠ يوم ▼
          </button>
          <button className="px-3 py-1.5 text-xs font-bold bg-primary text-white rounded-lg hover:bg-primary-dark">
            تصدير
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-4">
        {cards.map((c) => (
          <a key={c.label} href={c.href}
             className={`bg-gradient-to-br ${c.color} rounded-2xl border border-white/40 p-4 hover:shadow-md transition-all`}>
            <div className="text-2xl mb-1">{c.icon}</div>
            <div className="text-3xl font-extrabold text-ink">
              {c.value}{c.suffix || ''}
            </div>
            <div className="text-xs text-ink-muted mt-1 font-semibold">{c.label}</div>
          </a>
        ))}
      </div>

      {isEmpty && (
        <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-4 text-sm">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-bold text-blue-900 mb-1">جديد على مسارك؟</p>
              <p className="text-blue-700 leading-relaxed">
                لما يبدأ الطلاب يطّلعو على ملف <strong>{orgName}</strong>، الإحصاءات هون رح تتعبأ تلقائياً.
                {' '}بلّش بإضافة معلومات المؤسسة، فعاليات، ومنح من التبويبات تحت.
              </p>
            </div>
          </div>
        </div>
      )}

      <nav className="bg-surface rounded-2xl border-2 border-white/10 p-3 mt-4 overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {[
            { id: 'overview',     label: '📊 نظرة عامة',     href: '#overview' },
            { id: 'students',     label: '🎓 الطلاب المهتمون', href: '#students' },
            { id: 'profile',      label: '🏛️ ملف المؤسسة',    href: '#profile' },
            { id: 'events',       label: '📅 الفعاليات',     href: '#events' },
            { id: 'scholarships', label: '🏆 المنح',         href: '#scholarships' },
            { id: 'news',         label: '📰 الأخبار',       href: '#news' },
            { id: 'analytics',    label: '📈 تحليلات',       href: '#analytics' },
            { id: 'marketing',    label: '💼 تسويق',         href: '#marketing' },
            { id: 'messaging',    label: '💬 الرسائل',       href: '#messaging' },
            { id: 'reports',      label: '📋 تقارير',        href: '#reports' },
            { id: 'verification', label: '✓ التحقق',         href: '#verification' },
            { id: 'ai',           label: '🤖 الذكاء الاصطناعي', href: '#ai' },
          ].map(tab => (
            <a key={tab.id} href={tab.href}
               className="px-3 py-1.5 rounded-lg text-sm font-bold text-ink hover:bg-mint-light hover:text-primary transition-colors whitespace-nowrap">
              {tab.label}
            </a>
          ))}
        </div>
      </nav>
    </section>
  );
}
