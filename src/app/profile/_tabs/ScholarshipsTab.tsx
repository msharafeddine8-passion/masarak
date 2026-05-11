'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const STATUS_LABELS = {
  planning: { label: 'تخطيط', color: 'bg-gray-100 text-gray-700' },
  in_progress: { label: 'قيد التحضير', color: 'bg-blue-100 text-blue-700' },
  submitted: { label: 'تم التقديم', color: 'bg-amber-100 text-amber-700' },
  accepted: { label: 'مقبول', color: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'مرفوض', color: 'bg-red-100 text-red-700' },
  expired: { label: 'منتهي', color: 'bg-slate-200 text-slate-600' },
};

export default function ScholarshipsTab({ userId }: { userId: string }) {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [userId]);

  const load = async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await supabase.from('scholarship_applications').select('*').eq('user_id', userId).order('deadline', { ascending: true });
    setApps(data || []);
    setLoading(false);
  };

  const save = async () => {
    if (!editing.scholarship_name) return;
    const payload = { ...editing, user_id: userId };
    if (editing.id) {
      await supabase.from('scholarship_applications').update(payload).eq('id', editing.id);
    } else {
      delete payload.id;
      await supabase.from('scholarship_applications').insert(payload);
    }
    setEditing(null); await load();
  };

  const remove = async (id: number) => {
    if (!confirm('حذف؟')) return;
    await supabase.from('scholarship_applications').delete().eq('id', id);
    await load();
  };

  const upcoming = apps.filter(a => a.deadline && a.status !== 'submitted' && a.status !== 'accepted' && a.status !== 'rejected' && new Date(a.deadline) > new Date()).slice(0, 3);
  const stats = {
    total: apps.length,
    accepted: apps.filter(a => a.status === 'accepted').length,
    submitted: apps.filter(a => a.status === 'submitted').length,
    in_progress: apps.filter(a => a.status === 'in_progress' || a.status === 'planning').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="📊" label="إجمالي المتابعات" value={stats.total} color="bg-blue-50 text-blue-700" />
        <StatCard icon="📝" label="قيد التحضير" value={stats.in_progress} color="bg-amber-50 text-amber-700" />
        <StatCard icon="📨" label="تم التقديم" value={stats.submitted} color="bg-purple-50 text-purple-700" />
        <StatCard icon="🏆" label="مقبول" value={stats.accepted} color="bg-emerald-50 text-emerald-700" />
      </div>

      {/* Upcoming deadlines */}
      {upcoming.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-5">
          <h3 className="font-bold text-lg text-red-700 mb-3">⏰ مواعيد قريبة!</h3>
          <div className="space-y-2">
            {upcoming.map(a => {
              const days = Math.ceil((new Date(a.deadline).getTime() - Date.now()) / 86400000);
              return (
                <div key={a.id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div>
                    <div className="font-bold text-slate-800">{a.scholarship_name}</div>
                    <div className="text-xs text-slate-500">{a.provider}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${days <= 7 ? 'bg-red-100 text-red-700' : days <= 30 ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                    {days} يوم
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add button */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-xl text-[#1b3a6b]">🏆 منحك ومتابعاتك</h3>
        <button onClick={() => setEditing({ scholarship_name: '', provider: '', status: 'planning', progress: 0, documents: [] })} className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm hover:bg-[#142d54]">+ منحة جديدة</button>
      </div>

      {/* Applications List */}
      {loading ? <div className="text-center py-12">⏳</div> : apps.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed">
          <div className="text-6xl mb-3">🏆</div>
          <p className="text-slate-600 mb-2">ما عندك منح بعد</p>
          <p className="text-sm text-slate-500">سجّل المنح اللي بدّك تقدّم عليها لتتابعها هون</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {apps.map(a => {
            const s = STATUS_LABELS[a.status as keyof typeof STATUS_LABELS] || STATUS_LABELS.planning;
            const docs = a.documents || [];
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#1b3a6b]">{a.scholarship_name}</h3>
                    {a.provider && <div className="text-sm text-slate-500">{a.provider}</div>}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${s.color}`}>{s.label}</span>
                </div>
                {a.deadline && (
                  <div className="text-sm text-slate-600 mb-3">📅 الموعد النهائي: <span className="font-bold">{new Date(a.deadline).toLocaleDateString('ar')}</span></div>
                )}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>تقدّم التقديم</span><span className="font-bold">{a.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1b3a6b] to-[#5cc4b8]" style={{ width: `${a.progress || 0}%` }}></div>
                  </div>
                </div>
                {docs.length > 0 && (
                  <div className="text-xs text-slate-600 mb-3">
                    📎 المستندات: {docs.filter((d: any) => d.done).length} / {docs.length}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setEditing({ ...a })} className="flex-1 px-3 py-1.5 text-sm font-bold text-[#1b3a6b] hover:bg-[#1b3a6b]/5 rounded-lg">✏️ تعديل</button>
                  <button onClick={() => remove(a.id)} className="px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg">حذف</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" dir="rtl">
            <h2 className="text-xl font-bold text-[#1b3a6b] mb-4">{editing.id ? 'تعديل منحة' : 'منحة جديدة'}</h2>
            <div className="space-y-3">
              <Field label="اسم المنحة"><input value={editing.scholarship_name || ''} onChange={(e) => setEditing({ ...editing, scholarship_name: e.target.value })} className={input} /></Field>
              <Field label="الجهة المانحة"><input value={editing.provider || ''} onChange={(e) => setEditing({ ...editing, provider: e.target.value })} className={input} /></Field>
              <Field label="الموعد النهائي"><input type="date" value={editing.deadline || ''} onChange={(e) => setEditing({ ...editing, deadline: e.target.value })} className={input} /></Field>
              <Field label="الحالة">
                <select value={editing.status || 'planning'} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className={input + ' bg-white'}>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </Field>
              <Field label={`تقدّم التقديم (${editing.progress || 0}%)`}><input type="range" min={0} max={100} value={editing.progress || 0} onChange={(e) => setEditing({ ...editing, progress: Number(e.target.value) })} className="w-full" /></Field>
              <Field label="ملاحظات"><textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className={input + ' min-h-[80px]'} /></Field>
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
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-semibold mb-1">{label}</label>{children}</div>;
}
function StatCard({ icon, label, value, color }: any) {
  return (
    <div className={`${color} rounded-xl p-4`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-2xl font-extrabold">{value}</div>
      <div className="text-xs opacity-80 mt-1">{label}</div>
    </div>
  );
}
