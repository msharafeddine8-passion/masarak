'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useI18n, type TranslationKey } from '@/lib/i18n';

const STATUS_KEYS: Record<string, { labelKey: TranslationKey; color: string }> = {
  planning:    { labelKey: 'pt.sch.s.planning',    color: 'bg-gray-100 text-gray-700' },
  in_progress: { labelKey: 'pt.sch.s.in_progress', color: 'bg-blue-100 text-blue-700' },
  submitted:   { labelKey: 'pt.sch.s.submitted',   color: 'bg-amber-100 text-amber-700' },
  accepted:    { labelKey: 'pt.sch.s.accepted',    color: 'bg-emerald-100 text-emerald-700' },
  rejected:    { labelKey: 'pt.sch.s.rejected',    color: 'bg-red-100 text-red-700' },
  expired:     { labelKey: 'pt.sch.s.expired',     color: 'bg-slate-200 text-slate-600' },
};

export default function ScholarshipsTab({ userId }: { userId: string }) {
  const { t, lang, dir } = useI18n();
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
    if (!confirm(t('pt.sch.confirm_delete'))) return;
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

  const locale = lang === 'ar' ? 'ar' : 'en';

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="📊" label={t('pt.sch.stat.total')}     value={stats.total}       color="bg-blue-50 text-blue-700" />
        <StatCard icon="📝" label={t('pt.sch.stat.progress')}  value={stats.in_progress} color="bg-amber-50 text-amber-700" />
        <StatCard icon="📨" label={t('pt.sch.stat.submitted')} value={stats.submitted}   color="bg-purple-50 text-purple-700" />
        <StatCard icon="🏆" label={t('pt.sch.stat.accepted')}  value={stats.accepted}    color="bg-emerald-50 text-emerald-700" />
      </div>

      {/* Upcoming deadlines */}
      {upcoming.length > 0 && (
        <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-2xl p-5">
          <h3 className="font-bold text-lg text-red-700 mb-3">{t('pt.sch.upcoming')}</h3>
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
                    {days} {t('pt.sch.day_suffix')}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add button */}
      <div className="flex justify-between items-center">
        <h3 className="font-bold text-xl text-[#1b3a6b]">{t('pt.sch.title')}</h3>
        <button onClick={() => setEditing({ scholarship_name: '', provider: '', status: 'planning', progress: 0, documents: [] })} className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm hover:bg-[#142d54]">{t('pt.sch.add')}</button>
      </div>

      {/* Applications List */}
      {loading ? <div className="text-center py-12">⏳</div> : apps.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border-2 border-dashed">
          <div className="text-6xl mb-3">🏆</div>
          <p className="text-slate-600 mb-2">{t('pt.sch.empty')}</p>
          <p className="text-sm text-slate-500">{t('pt.sch.empty_hint')}</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {apps.map(a => {
            const s = STATUS_KEYS[a.status as keyof typeof STATUS_KEYS] || STATUS_KEYS.planning;
            const docs = a.documents || [];
            return (
              <div key={a.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-lg transition">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-[#1b3a6b]">{a.scholarship_name}</h3>
                    {a.provider && <div className="text-sm text-slate-500">{a.provider}</div>}
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${s.color}`}>{t(s.labelKey)}</span>
                </div>
                {a.deadline && (
                  <div className="text-sm text-slate-600 mb-3">{t('pt.sch.deadline_label')} <span className="font-bold">{new Date(a.deadline).toLocaleDateString(locale)}</span></div>
                )}
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                    <span>{t('pt.sch.progress')}</span><span className="font-bold">{a.progress || 0}%</span>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#1b3a6b] to-[#5cc4b8]" style={{ width: `${a.progress || 0}%` }}></div>
                  </div>
                </div>
                {docs.length > 0 && (
                  <div className="text-xs text-slate-600 mb-3">
                    {t('pt.sch.docs')} {docs.filter((d: any) => d.done).length} / {docs.length}
                  </div>
                )}
                <div className="flex gap-2">
                  <button onClick={() => setEditing({ ...a })} className="flex-1 px-3 py-1.5 text-sm font-bold text-[#1b3a6b] hover:bg-[#1b3a6b]/5 rounded-lg">{t('pt.sch.edit')}</button>
                  <button onClick={() => remove(a.id)} className="px-3 py-1.5 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg">{t('pt.sch.delete')}</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6" dir={dir}>
            <h2 className="text-xl font-bold text-[#1b3a6b] mb-4">{editing.id ? t('pt.sch.modal.edit') : t('pt.sch.modal.new')}</h2>
            <div className="space-y-3">
              <Field label={t('pt.sch.f.name')}><input value={editing.scholarship_name || ''} onChange={(e) => setEditing({ ...editing, scholarship_name: e.target.value })} className={input} /></Field>
              <Field label={t('pt.sch.f.provider')}><input value={editing.provider || ''} onChange={(e) => setEditing({ ...editing, provider: e.target.value })} className={input} /></Field>
              <Field label={t('pt.sch.f.deadline')}><input type="date" value={editing.deadline || ''} onChange={(e) => setEditing({ ...editing, deadline: e.target.value })} className={input} /></Field>
              <Field label={t('pt.sch.f.status')}>
                <select value={editing.status || 'planning'} onChange={(e) => setEditing({ ...editing, status: e.target.value })} className={input + ' bg-white'}>
                  {Object.entries(STATUS_KEYS).map(([k, v]) => <option key={k} value={k}>{t(v.labelKey)}</option>)}
                </select>
              </Field>
              <Field label={`${t('pt.sch.f.progress')} (${editing.progress || 0}%)`}><input type="range" min={0} max={100} value={editing.progress || 0} onChange={(e) => setEditing({ ...editing, progress: Number(e.target.value) })} className="w-full" /></Field>
              <Field label={t('pt.sch.f.notes')}><textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} className={input + ' min-h-[80px]'} /></Field>
              <div className="flex gap-2 pt-3">
                <button onClick={save} className="flex-1 px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">{t('pt.sch.save')}</button>
                <button onClick={() => setEditing(null)} className="px-5 py-2.5 bg-slate-100 rounded-lg font-bold">{t('pt.sch.cancel')}</button>
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
