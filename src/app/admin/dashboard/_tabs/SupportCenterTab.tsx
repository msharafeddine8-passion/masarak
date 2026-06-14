'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminLog';

type Ticket = {
  id: number;
  user_id?: string | null;
  email?: string | null;
  name?: string | null;
  subject: string;
  body: string;
  category: string;
  priority: string;
  status: string;
  assigned_to?: string | null;
  resolution?: string | null;
  internal_notes?: string | null;
  created_at: string;
  resolved_at?: string | null;
  first_response_at?: string | null;
};

export default function SupportCenterTab({ flash }: { flash: (m: string) => void }) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'open' | 'in_progress' | 'resolved' | 'all'>('open');
  const [selected, setSelected] = useState<Ticket | null>(null);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false }).limit(500);
    setTickets((data || []) as Ticket[]); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => filter === 'all' ? tickets : tickets.filter(t => t.status === filter), [tickets, filter]);

  const stats = useMemo(() => {
    const resolved = tickets.filter(t => t.status === 'resolved' || t.status === 'closed');
    const avgRespMs = resolved.filter(t => t.first_response_at).reduce((sum, t) => {
      return sum + (new Date(t.first_response_at!).getTime() - new Date(t.created_at).getTime());
    }, 0);
    const avgRespHrs = resolved.length > 0 ? Math.round(avgRespMs / resolved.length / 3600000) : 0;
    return {
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in_progress').length,
      resolved: resolved.length,
      urgent: tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved').length,
      avgRespHrs,
    };
  }, [tickets]);

  async function resolve(t: Ticket) {
    const res = prompt('شو كان الحل؟');
    if (!res) return;
    await supabase.from('support_tickets').update({ status: 'resolved', resolution: res, resolved_at: new Date().toISOString() }).eq('id', t.id);
    await logAdminAction({ action: 'support_ticket_resolve', target_type: 'ticket', target_id: t.id, reason: res });
    flash('✓ تم حلّ التذكرة'); load();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <K label="مفتوحة" value={stats.open} icon="📥" tone="warn" />
        <K label="قيد المعالجة" value={stats.inProgress} icon="🔧" tone="info" />
        <K label="عاجلة" value={stats.urgent} icon="🚨" tone="danger" />
        <K label="محلولة" value={stats.resolved} icon="✅" tone="success" />
        <K label="متوسط الرد (ساعات)" value={stats.avgRespHrs} icon="⏰" tone="primary" />
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-100 p-3 lg:p-4">
        <div className="flex justify-between mb-3">
          <select value={filter} onChange={e=>setFilter(e.target.value as typeof filter)} className="px-3 py-2 rounded-xl border-2 border-gray-100 text-sm font-bold">
            <option value="open">المفتوحة</option>
            <option value="in_progress">قيد المعالجة</option>
            <option value="resolved">المحلولة</option>
            <option value="all">الكل</option>
          </select>
          <button onClick={load} className="px-3 py-2 rounded-xl bg-white border-2 border-gray-200 text-sm font-bold">🔄</button>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-ink-muted">لا يوجد تذاكر بهذا الفلتر. (التذاكر بتيجي من نموذج "تواصل معنا" + من الـ AI Assistant مستقبلاً)</div>
        ) : (
          <div className="space-y-2">
            {filtered.slice(0, 50).map(t => (
              <div key={t.id} className="border border-gray-100 rounded-xl p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={'text-xs font-bold px-2 py-0.5 rounded-full ' + (
                        t.priority === 'urgent' ? 'bg-rose-100 text-rose-700' :
                        t.priority === 'high' ? 'bg-amber-100 text-amber-700' :
                        'bg-gray-100 text-gray-600'
                      )}>{t.priority}</span>
                      <span className="text-xs text-ink-muted">{t.category}</span>
                      <span className="font-extrabold">{t.subject}</span>
                    </div>
                    <p className="text-sm text-ink-muted mt-1 line-clamp-2">{t.body}</p>
                    <div className="text-xs text-ink-muted mt-1">{t.email || t.user_id} · {new Date(t.created_at).toLocaleString('ar')}</div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => setSelected(t)} className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg">عرض</button>
                    {t.status !== 'resolved' && (
                      <button onClick={() => resolve(t)} className="text-xs font-bold bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-lg">✓ حلّ</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-extrabold text-lg">{selected.subject}</h3>
              <button onClick={() => setSelected(null)} className="text-2xl text-ink-muted">×</button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 rounded-xl p-3"><strong>السائل:</strong> {selected.email || selected.user_id}</div>
              <div className="bg-gray-50 rounded-xl p-3 whitespace-pre-wrap"><strong>المحتوى:</strong><br/>{selected.body}</div>
              {selected.resolution && (
                <div className="bg-emerald-50 rounded-xl p-3 whitespace-pre-wrap"><strong>الحل:</strong><br/>{selected.resolution}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function K({ label, value, icon, tone }: { label: string; value: number; icon: string; tone: 'primary'|'success'|'warn'|'info'|'danger' }) {
  const c = { primary:'from-blue-50 to-indigo-50', success:'from-emerald-50 to-teal-50', warn:'from-amber-50 to-yellow-50', info:'from-purple-50 to-pink-50', danger:'from-rose-50 to-red-50' };
  return (
    <div className={'bg-gradient-to-br ' + c[tone] + ' rounded-2xl border border-white/40 p-4'}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1 font-bold">{label}</div>
    </div>
  );
}
