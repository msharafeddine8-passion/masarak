'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

const STATUS = {
  planning: { label: 'تخطيط', color: 'bg-gray-100 text-gray-700', icon: '📋' },
  applied: { label: 'مقدّم', color: 'bg-blue-100 text-blue-700', icon: '📨' },
  interview: { label: 'مقابلة', color: 'bg-amber-100 text-amber-700', icon: '🎤' },
  offer: { label: 'عرض', color: 'bg-emerald-100 text-emerald-700', icon: '🏆' },
  rejected: { label: 'رفض', color: 'bg-red-100 text-red-700', icon: '❌' },
};

export default function InternshipsTab({ userId }: { userId: string }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const load = async () => {
    if (!userId) return;
    const { data } = await supabase.from('internship_applications').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    setApps(data || []); setLoading(false);
  };

  const save = async () => {
    if (!editing.company) return;
    const payload = { ...editing, user_id: userId };
    if (editing.id) await supabase.from('internship_applications').update(payload).eq('id', editing.id);
    else { delete payload.id; await supabase.from('internship_applications').insert(payload); }
    setEditing(null); await load();
  };

  const remove = async (id: number) => {
    if (!confirm('حذف؟')) return;
    await supabase.from('internship_applications').delete().eq('id', id);
    await load();
  };

  const stats = {
    total: apps.length,
    applied: apps.filter(a => a.status === 'applied').length,
    interview: apps.filter(a => a.status === 'interview').length,
    offer: apps.filter(a => a.status === 'offer').length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="📋" label="إجمالي" value={stats.total} color="bg-blue-50 text-blue-700" />
        <StatCard icon="📨" label="مقدّم" value={stats.applied} color="bg-purple-50 text-purple-700" />
        <StatCard icon="🎤" label="مقابلات" value={stats.interview} color="bg-amber-50 text-amber-700" />
        <StatCard icon="🏆" label="عروض" value={stats.offer} color="bg-emerald-50 text-emerald-700" />
      </div>

      {/* Tools cards */}
      <div className="grid md:grid-cols-3 gap-3">
        <Link href="/tools/cv-builder" className="bg-gradient-to-br from-blue-500 to-blue-700 text-white rounded-2xl p-5 hover:scale-105 transition">
          <div className="text-3xl mb-2">📄</div>
          <div className="font-bold">بناء CV</div>
          <div className="text-xs opacity-80 mt-1">حضّر سيرتك الذاتية</div>
        </Link>
        <Link href="/tools/interview-prep" className="bg-gradient-to-br from-purple-500 to-pink-600 text-white rounded-2xl p-5 hover:scale-105 transition">
          <div className="text-3xl mb-2">🎤</div>
          <div className="font-bold">تحضير المقابلات</div>
          <div className="text-xs opacity-80 mt-1">تدرّب على الأسئلة الشائعة</div>
        </Link>
        <Link href="/internships/hub" className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-5 hover:scale-105 transition">
          <div className="text-3xl mb-2">🔍</div>
          <div className="font-bold">فرص متاحة</div>
          <div className="text-xs opacity-80 mt-1">شوف التدريبات المتوفرة</div>
        </Link>
      </div>

      {/* Add */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-xl text-[#1b3a6b]">💼 تطبيقاتك</h3>
        <button onClick={() => setEditing({ company: '', role: '', status: 'planning' })} className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm">+ تطبيق جديد</button>
      </div>

      {loading ? <div className="text-center py-12">⏳</div> : apps.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed">
          <div className="text-6xl mb-3">💼</div>
          <p className="text-slate-600">سجّل تطبيقاتك للتدريبات هون</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="px-4 py-3 text-right font-bold">الشركة</th>
                <th className="px-4 py-3 text-right font-bold">الدور</th>
                <th className="px-4 py-3 text-right font-bold">التاريخ</th>
                <th className="px-4 py-3 text-right font-bold">الحالة</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {apps.map(a => {
                const s = STATUS[a.status as keyof typeof STATUS] || STATUS.planning;
                return (
                  <tr key={a.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold">{a.company}</td>
                    <td className="px-4 py-3">{a.role || '-'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">{a.applied_at ? new Date(a.applied_at).toLocaleDateString('ar') : '-'}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded-full font-bold ${s.color}`}>{s.icon} {s.label}</span></td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <button onClick={() => setEditing({ ...a })} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-bold">تعديل</button>
                      <button onClick={() => remove(a.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold mr-1">حذف</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6" dir="rtl">
            <h2 className="text-xl font-bold text-[#1b3a6b] mb-4">{editing.id ? 'تعديل' : 'تطبيق جديد'}</h2>
            <div className="space-y-3">
              <div><label className="block text-sm font-bold mb-1">الشركة</label><input value={editing.company || ''} onChange={(e) => setEditing({ ...editing, company: e.target.value })} className={input} /></div>
              <div><label className="block text-sm font-bold mb-1">الدور</label><input value={editing.role || ''} onChange={(e) => setEditing({ ...editing, role: e.target.value })} className={input} /></div>
              <div><label className="block text-sm font-bold mb-1">تاريخ التقديم</label><input type="date" value={editing.applied_at || ''} onChange={(e) => setEditing({ ...editing, applied_at: e.target.value })} className={input} /></div>
              <div><label className="block text-sm font-bold mb-1">الحالة</label>
                <select value={editing.status || 'planning'} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className={input + ' bg-white'}>
                  {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.icon} {v.label}</option>)}
                </select>
              </div>
              <div><label className="block text-sm font-bold mb-1">ملاحظات</label><textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className={input + ' min-h-[80px]'} /></div>
              <div className="flex gap-2 pt-3">
                <button onClick={save} className="flex-1 px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">💾 حفظ</button>
                <button onClick={() => setEditing(null)} className="px-5 py-2.5 bg-slate-100 rounded-lg font-bold">إلغاء</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const input = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm';
function StatCard({ icon, label, value, color }: any) {
  return <div className={`${color} rounded-xl p-4`}><div className="text-2xl mb-1">{icon}</div><div className="text-2xl font-extrabold">{value}</div><div className="text-xs opacity-80 mt-1">{label}</div></div>;
}
