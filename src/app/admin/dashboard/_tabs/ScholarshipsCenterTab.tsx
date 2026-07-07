'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminLog';

type Sch = {
  id: number;
  // Actual columns on public.scholarships (legacy single-language table)
  name?: string | null;
  org?: string | null;
  amount?: string | null;
  country_code?: string | null;
  deadline?: string | null;
  is_featured?: boolean | null;
  active?: boolean | null;
  views?: number;
  applies?: number;
  saves?: number;
};

export default function ScholarshipsCenterTab({ flash }: { flash: (m: string) => void }) {
  const [list, setList] = useState<Sch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'expiring' | 'featured' | 'expired'>('all');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('scholarships').select('*').order('id', { ascending: false }).limit(500);
    const arr = ((data || []) as Sch[]);

    const { data: saves } = await supabase.from('saved_items').select('item_id').eq('item_type', 'scholarship');
    const sc: Record<string, number> = {};
    if (saves) for (const r of saves as { item_id: string }[]) sc[r.item_id] = (sc[r.item_id] || 0) + 1;

    const since = new Date(Date.now() - 30*24*3600*1000).toISOString();
    const { data: views } = await supabase.from('analytics_events').select('entity_id, event_name')
      .eq('entity_type', 'scholarship').gte('created_at', since);
    const vc: Record<string, number> = {}; const ac: Record<string, number> = {};
    if (views) for (const r of views as { entity_id: string; event_name: string }[]) {
      if (r.event_name === 'view_entity') vc[r.entity_id] = (vc[r.entity_id] || 0) + 1;
      if (r.event_name === 'cta_click') ac[r.entity_id] = (ac[r.entity_id] || 0) + 1;
    }

    for (const s of arr) { s.saves = sc[String(s.id)] || 0; s.views = vc[String(s.id)] || 0; s.applies = ac[String(s.id)] || 0; }
    setList(arr); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const now = Date.now();
  const filtered = useMemo(() => {
    let l = list;
    if (search.trim()) {
      const q = search.toLowerCase();
      l = l.filter(s => (s.name||'').toLowerCase().includes(q) || (s.org||'').toLowerCase().includes(q));
    }
    if (filter === 'expiring') l = l.filter(s => s.deadline && new Date(s.deadline).getTime() - now < 14*24*3600*1000 && new Date(s.deadline).getTime() > now);
    if (filter === 'featured') l = l.filter(s => s.is_featured);
    if (filter === 'expired') l = l.filter(s => s.deadline && new Date(s.deadline).getTime() < now);
    return l;
  }, [list, search, filter]);

  const stats = useMemo(() => {
    const totalViews = list.reduce((a,s) => a + (s.views || 0), 0);
    const totalSaves = list.reduce((a,s) => a + (s.saves || 0), 0);
    const expiringSoon = list.filter(s => s.deadline && new Date(s.deadline).getTime() - now < 14*24*3600*1000 && new Date(s.deadline).getTime() > now).length;
    const conversionPct = totalViews > 0 ? Math.round((totalSaves / totalViews) * 100) : 0;
    return { total: list.length, views30: totalViews, saves: totalSaves, expiringSoon, conversionPct };
  }, [list, now]);

  async function toggleFeature(s: Sch) {
    const next = !s.is_featured;
    const { error } = await supabase.from('scholarships').update({ is_featured: next }).eq('id', s.id);
    if (error) { flash('فشل: ' + error.message); return; }
    await logAdminAction({ action: 'university_feature', target_type: 'scholarship', target_id: s.id, details: { featured: next } });
    flash(next ? '⭐ مميّزة' : 'تم الإلغاء'); load();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <K label="إجمالي المنح" value={stats.total} icon="🏆" tone="primary" />
        <K label="مشاهدات 30 يوم" value={stats.views30} icon="👁️" tone="info" />
        <K label="حفظ من الطلاب" value={stats.saves} icon="📌" tone="success" />
        <K label="تنتهي خلال 14 يوم" value={stats.expiringSoon} icon="⏳" tone="warn" />
        <K label="معدل التحويل" value={stats.conversionPct + '%'} icon="🎯" tone="info" />
      </div>

      <div className="bg-surface rounded-2xl border-2 border-line p-3 lg:p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث بالمنحة..." className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border-2 border-line outline-none text-sm" />
          <select value={filter} onChange={e=>setFilter(e.target.value as typeof filter)} className="px-3 py-2 rounded-xl border-2 border-line text-sm font-bold">
            <option value="all">الكل</option>
            <option value="expiring">تنتهي خلال 14 يوم</option>
            <option value="featured">مميّزة</option>
            <option value="expired">منتهية</option>
          </select>
          <button onClick={load} className="px-3 py-2 rounded-xl bg-surface border-2 border-line text-sm font-bold">🔄</button>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="h-16 bg-bg-soft animate-pulse rounded-xl" />)}</div>
        ) : (
          <div className="space-y-2">
            {filtered.slice(0, 100).map(s => {
              const dlMs = s.deadline ? new Date(s.deadline).getTime() : 0;
              const days = dlMs ? Math.ceil((dlMs - now) / (24*3600*1000)) : null;
              return (
                <div key={s.id} className="border border-line rounded-xl p-3 hover:border-primary/30">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🏆</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold">{s.name || 'Scholarship #' + s.id}</span>
                        {s.is_featured && <span className="text-xs text-amber-600 font-bold">⭐</span>}
                        {s.country_code && <span className="text-xs px-2 py-0.5 rounded-full bg-bg-soft font-bold">{s.country_code}</span>}
                      </div>
                      <div className="text-xs text-ink-muted mt-1">
                        {s.org || '—'} · {s.amount || 'مبلغ غير محدد'} · مشاهدات: {s.views || 0} · حفظ: {s.saves || 0}
                      </div>
                      {days !== null && (
                        <div className="text-xs mt-1">
                          {days < 0 ? <span className="text-rose-600 font-bold">⛔ منتهية</span> :
                           days <= 3 ? <span className="text-rose-600 font-bold">🚨 {days} أيام متبقية</span> :
                           days <= 14 ? <span className="text-amber-600 font-bold">⏳ {days} يوم متبقي</span> :
                           <span className="text-emerald-600 font-bold">✓ {days} يوم</span>}
                        </div>
                      )}
                    </div>
                    <button onClick={() => toggleFeature(s)} className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">⭐</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function K({ label, value, icon, tone }: { label: string; value: number | string; icon: string; tone: 'primary'|'success'|'warn'|'info'|'danger' }) {
  const c = { primary:'from-blue-50 to-indigo-50', success:'from-emerald-50 to-teal-50', warn:'from-amber-50 to-yellow-50', info:'from-purple-50 to-pink-50', danger:'from-rose-50 to-red-50' };
  return (
    <div className={'bg-gradient-to-br ' + c[tone] + ' rounded-2xl border border-white/40 p-4'}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1 font-bold">{label}</div>
    </div>
  );
}
