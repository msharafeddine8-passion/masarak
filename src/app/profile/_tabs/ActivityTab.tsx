'use client';
import { useEffect, useState } from 'react';
import { getActivity } from '@/lib/savedItems';

const ICONS: Record<string, string> = { save: '❤️', unsave: '💔', review: '⭐', apply: '📝', view: '👁️', login: '🔐', complete: '✅', upload: '📤' };
const ACTIONS: Record<string, string> = { save: 'حفظ', unsave: 'إزالة من المحفوظات', review: 'نشر تقييم', apply: 'تقديم طلب', view: 'مشاهدة', login: 'تسجيل دخول', complete: 'إكمال', upload: 'رفع ملف' };
const ENTITIES: Record<string, string> = { university: 'جامعة', school: 'مدرسة', vocational: 'مسار مهني', scholarship: 'منحة', internship: 'تدريب', profile: 'الملف الشخصي' };

export default function ActivityTab({ userId }: { userId: string }) {
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
        <p className="text-slate-600">لا نشاطات بعد</p>
        <p className="text-sm text-slate-500 mt-2">كل ما تتفاعل مع الموقع، رح تظهر هون</p>
      </div>
    );
  }

  // Group by date
  const grouped = activities.reduce((acc: any, a) => {
    const date = new Date(a.created_at).toLocaleDateString('ar');
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
                      {ACTIONS[a.action] || a.action} {a.entity_type && ENTITIES[a.entity_type] ? `— ${ENTITIES[a.entity_type]}` : ''}
                    </div>
                    {a.meta?.name && <div className="text-xs text-slate-500 mt-0.5">{a.meta.name}</div>}
                    <div className="text-xs text-slate-400 mt-1">{new Date(a.created_at).toLocaleTimeString('ar', { hour: '2-digit', minute: '2-digit' })}</div>
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
