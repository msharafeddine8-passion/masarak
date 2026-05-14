'use client';
import { useEffect, useState } from 'react';
import { getActivity } from '@/lib/savedItems';
import { useI18n, type TranslationKey } from '@/lib/i18n';

const ICONS: Record<string, string> = { save: '❤️', unsave: '💔', review: '⭐', apply: '📝', view: '👁️', login: '🔐', complete: '✅', upload: '📤' };
const ACTIONS: Record<string, TranslationKey> = {
  save:     'pt.act_tab.a.save',
  unsave:   'pt.act_tab.a.unsave',
  review:   'pt.act_tab.a.review',
  apply:    'pt.act_tab.a.apply',
  view:     'pt.act_tab.a.view',
  login:    'pt.act_tab.a.login',
  complete: 'pt.act_tab.a.complete',
  upload:   'pt.act_tab.a.upload',
};
const ENTITIES: Record<string, TranslationKey> = {
  university:  'pt.ent.university',
  school:      'pt.ent.school',
  vocational:  'pt.ent.vocational',
  scholarship: 'pt.ent.scholarship',
  internship:  'pt.act_tab.e.internship',
  profile:     'pt.act_tab.e.profile',
};

export default function ActivityTab({ userId }: { userId: string }) {
  const { t, lang } = useI18n();
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    getActivity(userId, 100).then(d => { setActivities(d); setLoading(false); });
  }, [userId]);

  if (loading) return <div className="text-center py-12">⏳</div>;

  if (activities.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed">
        <div className="text-6xl mb-3">📭</div>
        <p className="text-slate-600">{t('pt.act_tab.empty')}</p>
        <p className="text-sm text-slate-500 mt-2">{t('pt.act_tab.empty_hint')}</p>
      </div>
    );
  }

  const locale = lang === 'ar' ? 'ar' : 'en';
  // Group by date
  const grouped = activities.reduce((acc: any, a) => {
    const date = new Date(a.created_at).toLocaleDateString(locale);
    if (!acc[date]) acc[date] = [];
    acc[date].push(a);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([date, items]: any) => (
        <div key={date}>
          <h3 className="font-bold text-[#1b3a6b] mb-3 sticky top-0 bg-white py-2 z-10">{date}</h3>
          <div className="space-y-2 border-r-2 border-slate-200 mr-3 pr-5">
            {items.map((a: any) => (
              <div key={a.id} className="relative bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                <div className="absolute -right-7 top-5 w-4 h-4 rounded-full bg-[#5cc4b8] border-2 border-white"></div>
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{ICONS[a.action] || '📌'}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-slate-800">
                      {ACTIONS[a.action] ? t(ACTIONS[a.action]) : a.action} {a.entity_type && ENTITIES[a.entity_type] ? `— ${t(ENTITIES[a.entity_type])}` : ''}
                    </div>
                    {a.meta?.name && <div className="text-xs text-slate-500 mt-0.5">{a.meta.name}</div>}
                    <div className="text-xs text-slate-400 mt-1">{new Date(a.created_at).toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
