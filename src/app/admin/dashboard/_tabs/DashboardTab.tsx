'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Counts { unis: number; schools: number; tracks: number; institutes: number; reviews: number; users: number; }

export default function DashboardTab({ onNavigate }: { onNavigate: (v: any) => void }) {
  const [c, setC] = useState<Counts>({ unis: 0, schools: 0, tracks: 0, institutes: 0, reviews: 0, users: 0 });
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [growth, setGrowth] = useState<{ date: string; count: number }[]>([]);

  useEffect(() => {
    (async () => {
      const head = { count: 'exact' as const, head: true };
      const [u, sc, t, i, r] = await Promise.all([
        supabase.from('universities').select('id', head).eq('is_active', true),
        supabase.from('schools').select('id', head).eq('is_active', true),
        supabase.from('vocational_programs').select('id', head).eq('is_active', true),
        supabase.from('vocational_institutes').select('id', head).eq('is_active', true),
        supabase.from('entity_reviews').select('id', head),
      ]);
      const { count: userCount } = await supabase.from('student_profiles').select('user_id', head);
      setC({ unis: u.count || 0, schools: sc.count || 0, tracks: t.count || 0, institutes: i.count || 0, reviews: r.count || 0, users: userCount || 0 });

      const { data: rvs } = await supabase.from('entity_reviews').select('*').order('created_at', { ascending: false }).limit(5);
      setRecentReviews(rvs || []);
      const { data: us } = await supabase.from('student_profiles').select('user_id, full_name, created_at, last_active').order('created_at', { ascending: false }).limit(5);
      setRecentUsers(us || []);

      // Growth — group profiles by date (last 7 days)
      const { data: prof } = await supabase.from('student_profiles').select('created_at');
      const days: Record<string, number> = {};
      const now = Date.now();
      for (let d = 6; d >= 0; d--) {
        const day = new Date(now - d * 86400000).toISOString().slice(0, 10);
        days[day] = 0;
      }
      (prof || []).forEach((p: any) => {
        const day = p.created_at ? p.created_at.slice(0, 10) : null;
        if (day && days[day] !== undefined) days[day]++;
      });
      setGrowth(Object.entries(days).map(([date, count]) => ({ date, count })));
    })();
  }, []);

  const max = Math.max(1, ...growth.map(g => g.count));

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <KPI icon="👥" label="مستخدمون" value={c.users} color="from-blue-500 to-blue-700" onClick={() => onNavigate('users')} />
        <KPI icon="🏛️" label="جامعات" value={c.unis} color="from-purple-500 to-purple-700" onClick={() => onNavigate('universities')} />
        <KPI icon="🏫" label="مدارس" value={c.schools} color="from-emerald-500 to-emerald-700" onClick={() => onNavigate('schools')} />
        <KPI icon="🛠️" label="مسارات مهنية" value={c.tracks} color="from-amber-500 to-orange-600" onClick={() => onNavigate('vocational')} />
        <KPI icon="🏭" label="معاهد" value={c.institutes} color="from-pink-500 to-rose-600" onClick={() => onNavigate('institutes')} />
        <KPI icon="⭐" label="تقييمات" value={c.reviews} color="from-yellow-500 to-amber-600" onClick={() => onNavigate('reviews')} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Growth Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg text-[#1b3a6b]">📈 نمو المستخدمين</h3>
              <p className="text-xs text-slate-500">آخر 7 أيام</p>
            </div>
            <div className="text-2xl font-extrabold text-[#1b3a6b]">+{growth.reduce((s, g) => s + g.count, 0)}</div>
          </div>
          <div className="h-40 flex items-end gap-2">
            {growth.map((g) => (
              <div key={g.date} className="flex-1 flex flex-col items-center justify-end gap-1">
                <div className="text-xs font-bold text-slate-600">{g.count || ''}</div>
                <div className="w-full bg-gradient-to-t from-[#1b3a6b] to-[#5cc4b8] rounded-t hover:opacity-80 transition" style={{ height: `${(g.count / max) * 100}%`, minHeight: '4px' }}></div>
                <div className="text-[10px] text-slate-500">{new Date(g.date).toLocaleDateString('ar', { weekday: 'short' })}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-gradient-to-br from-[#1b3a6b] to-[#5cc4b8] rounded-2xl p-6 text-white">
          <h3 className="font-bold text-lg mb-4">⚡ إجراءات سريعة</h3>
          <div className="grid grid-cols-2 gap-2">
            <QuickAction onClick={() => onNavigate('universities')} icon="🏛️" label="إضافة جامعة" />
            <QuickAction onClick={() => onNavigate('schools')} icon="🏫" label="إضافة مدرسة" />
            <QuickAction onClick={() => onNavigate('media')} icon="🖼️" label="رفع صورة" />
            <QuickAction onClick={() => onNavigate('notifications')} icon="🔔" label="إشعار جديد" />
          </div>
        </div>

        {/* Recent Reviews */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-lg text-[#1b3a6b] mb-4">⭐ آخر التقييمات</h3>
          {recentReviews.length === 0 ? (
            <div className="text-center text-slate-400 py-8 text-sm">لا تقييمات بعد</div>
          ) : (
            <div className="space-y-3">
              {recentReviews.map(r => (
                <div key={r.id} className="border-b border-slate-100 pb-2 last:border-0">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-yellow-400">{'★'.repeat(r.rating)}</span>
                    <span className="text-xs text-slate-500">{r.entity_type} #{r.entity_id}</span>
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 mt-1">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Users */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h3 className="font-bold text-lg text-[#1b3a6b] mb-4">🆕 آخر المسجّلين</h3>
          {recentUsers.length === 0 ? (
            <div className="text-center text-slate-400 py-8 text-sm">لا مستخدمين بعد</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr><th className="px-3 py-2 text-right">الاسم</th><th className="px-3 py-2 text-right">تاريخ التسجيل</th><th className="px-3 py-2 text-right">آخر نشاط</th></tr>
              </thead>
              <tbody>
                {recentUsers.map(u => (
                  <tr key={u.user_id} className="border-t border-slate-100">
                    <td className="px-3 py-2 font-semibold">{u.full_name || '—'}</td>
                    <td className="px-3 py-2 text-slate-500 text-xs">{u.created_at ? new Date(u.created_at).toLocaleDateString('ar') : '—'}</td>
                    <td className="px-3 py-2 text-slate-500 text-xs">{u.last_active ? new Date(u.last_active).toLocaleDateString('ar') : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function KPI({ icon, label, value, color, onClick }: any) {
  return (
    <button onClick={onClick} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 hover:shadow-lg hover:-translate-y-1 transition text-right">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-lg mb-2`}>{icon}</div>
      <div className="text-2xl font-extrabold text-[#1b3a6b]">{value.toLocaleString()}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </button>
  );
}

function QuickAction({ icon, label, onClick }: any) {
  return (
    <button onClick={onClick} className="bg-white/15 backdrop-blur border border-white/20 rounded-xl p-3 hover:bg-white/25 transition text-right">
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-xs font-bold">{label}</div>
    </button>
  );
}
