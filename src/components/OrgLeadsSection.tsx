'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

type Lead = {
  id: string;
  org_id: string;
  student_id: string;
  source: string;
  status: 'new' | 'contacted' | 'engaged' | 'applied' | 'enrolled' | 'lost';
  score: number;
  first_interaction_at: string;
  last_interaction_at: string;
  notes?: string | null;
};

type StudentLite = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  grade?: string | null;
  city?: string | null;
};

const STATUS_LABELS: Record<Lead['status'], string> = {
  new: '🆕 جديد',
  contacted: '📞 تواصلنا',
  engaged: '💬 متفاعل',
  applied: '📝 قدّم',
  enrolled: '🎓 التحق',
  lost: '✗ خسرناه',
};

const STATUS_COLORS: Record<Lead['status'], string> = {
  new: 'bg-blue-50 border-blue-200 text-blue-800',
  contacted: 'bg-amber-50 border-amber-200 text-amber-800',
  engaged: 'bg-violet-50 border-violet-200 text-violet-800',
  applied: 'bg-emerald-50 border-emerald-200 text-emerald-800',
  enrolled: 'bg-green-50 border-green-300 text-green-900',
  lost: 'bg-bg-soft border-white/10 text-ink-subtle',
};

export default function OrgLeadsSection({ orgId }: { orgId: string }) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [students, setStudents] = useState<Record<string, StudentLite>>({});
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('org_leads')
      .select('*')
      .eq('org_id', orgId)
      .order('last_interaction_at', { ascending: false });
    if (error) {
      if (error.code !== '42P01' && error.code !== 'PGRST205') console.error('[leads]', error);
      setLoading(false); return;
    }
    setLeads((data || []) as Lead[]);

    const ids = Array.from(new Set((data || []).map((d: { student_id: string }) => d.student_id)));
    if (ids.length > 0) {
      const { data: sd } = await supabase
        .from('student_profiles')
        .select('id, email, full_name, grade, city')
        .in('id', ids);
      const map: Record<string, StudentLite> = {};
      for (const s of (sd || []) as StudentLite[]) map[s.id] = s;
      setStudents(map);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, [orgId]);

  const stats = useMemo(() => ({
    total: leads.length,
    hot: leads.filter(l => l.score >= 70).length,
    new: leads.filter(l => l.status === 'new').length,
    engaged: leads.filter(l => l.status === 'engaged').length,
  }), [leads]);

  const byStatus = useMemo(() => {
    const buckets: Record<Lead['status'], Lead[]> = {
      new: [], contacted: [], engaged: [], applied: [], enrolled: [], lost: [],
    };
    for (const l of leads) buckets[l.status].push(l);
    return buckets;
  }, [leads]);

  async function moveStatus(lead: Lead, next: Lead['status']) {
    const { error } = await supabase.from('org_leads')
      .update({ status: next, last_interaction_at: new Date().toISOString() })
      .eq('id', lead.id);
    if (error) { alert('فشل: ' + error.message); return; }
    setLeads(ls => ls.map(l => l.id === lead.id ? { ...l, status: next } : l));
    setSelected(null);
  }

  return (
    <section id="leads" className="bg-surface rounded-2xl border-2 border-white/10 p-4 lg:p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-primary">🎯 إدارة الطلاب المهتمين (Leads)</h3>
        <button onClick={load} className="text-xs font-bold bg-surface border-2 border-white/10 rounded-lg px-3 py-1.5 hover:border-primary">
          🔄 تحديث
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <Kpi label="إجمالي" value={stats.total} icon="👥" tone="primary" />
        <Kpi label="Hot (70+)" value={stats.hot} icon="🔥" tone="warn" />
        <Kpi label="جدد" value={stats.new} icon="🆕" tone="info" />
        <Kpi label="متفاعلين" value={stats.engaged} icon="💬" tone="success" />
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-ink-muted">جاري التحميل...</div>
      ) : leads.length === 0 ? (
        <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">📭</div>
          <p className="font-bold mb-1">لا يوجد leads بعد</p>
          <p className="text-xs text-ink-muted">
            لما يحفظ طالب صفحتك أو يسجّل بفعاليتك، رح يظهر هون تلقائياً مع scoring من 0 إلى 100.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-3 min-w-max">
            {(Object.keys(byStatus) as Lead['status'][]).map(status => (
              <div key={status} className="w-72 shrink-0">
                <div className={'rounded-xl border-2 p-3 mb-2 font-bold text-sm ' + STATUS_COLORS[status]}>
                  {STATUS_LABELS[status]} <span className="opacity-60">({byStatus[status].length})</span>
                </div>
                <div className="space-y-2">
                  {byStatus[status].map(l => {
                    const s = students[l.student_id];
                    return (
                      <button key={l.id} onClick={() => setSelected(l)}
                        className="w-full text-right bg-surface border border-white/10 rounded-xl p-3 hover:border-primary/40 hover:shadow-sm transition">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm truncate">{s?.full_name || s?.email || l.student_id.slice(0,8)}</span>
                          <span className={'text-xs font-extrabold px-2 py-0.5 rounded-full ' + (
                            l.score >= 70 ? 'bg-rose-100 text-rose-700' :
                            l.score >= 40 ? 'bg-amber-100 text-amber-700' :
                            'bg-bg-soft text-ink-subtle'
                          )}>{l.score}</span>
                        </div>
                        <div className="text-xs text-ink-muted">
                          {s?.grade || ''}{s?.city ? ' · ' + s.city : ''}
                        </div>
                        <div className="text-[10px] text-ink-muted mt-1">
                          {l.source === 'save' ? '⭐ حفظ' :
                           l.source === 'event_register' ? '📅 سجّل بفعالية' :
                           l.source === 'message' ? '💬 رسالة' :
                           l.source === 'cv_apply' ? '📝 CV' : l.source}
                          · آخر تفاعل {new Date(l.last_interaction_at).toLocaleDateString('ar')}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end lg:items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-surface rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-surface border-b p-4 flex justify-between items-center">
              <h4 className="font-extrabold">{students[selected.student_id]?.full_name || selected.student_id.slice(0,8)}</h4>
              <button onClick={() => setSelected(null)} className="text-2xl text-ink-muted">×</button>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <Field label="إيميل" value={students[selected.student_id]?.email || '—'} />
              <Field label="المدينة" value={students[selected.student_id]?.city || '—'} />
              <Field label="الصف" value={students[selected.student_id]?.grade || '—'} />
              <Field label="Score" value={String(selected.score) + ' / 100'} />
              <Field label="الحالة الحالية" value={STATUS_LABELS[selected.status]} />
              <Field label="مصدر" value={selected.source} />

              <div className="pt-3 border-t">
                <div className="text-xs font-bold text-ink-muted mb-2">انقل لحالة:</div>
                <div className="flex flex-wrap gap-1">
                  {(Object.keys(STATUS_LABELS) as Lead['status'][]).filter(s => s !== selected.status).map(s => (
                    <button key={s} onClick={() => moveStatus(selected, s)}
                      className={'text-xs font-bold border rounded-lg px-3 py-1.5 ' + STATUS_COLORS[s]}>
                      {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Kpi({ label, value, icon, tone }: { label: string; value: number; icon: string; tone: 'primary'|'warn'|'info'|'success' }) {
  const c = { primary:'from-blue-50 to-indigo-50', warn:'from-amber-50 to-yellow-50', info:'from-purple-50 to-pink-50', success:'from-emerald-50 to-teal-50' };
  return (
    <div className={'bg-gradient-to-br ' + c[tone] + ' rounded-2xl border border-white/40 p-3'}>
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-2xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-muted font-bold">{label}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-soft rounded-xl p-2.5">
      <div className="text-xs text-ink-muted font-bold mb-1">{label}</div>
      <div className="font-semibold text-sm break-all">{value}</div>
    </div>
  );
}
