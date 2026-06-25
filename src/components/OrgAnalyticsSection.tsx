'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

type Ev = {
  event_name: string;
  entity_id: string | null;
  device: string | null;
  country_code: string | null;
  utm_source: string | null;
  created_at: string;
};

export default function OrgAnalyticsSection({ orgId, universityId }: { orgId: string; universityId?: number }) {
  const [events, setEvents] = useState<Ev[]>([]);
  const [saves, setSaves] = useState<number>(0);
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const since = new Date(Date.now() - days * 24 * 3600 * 1000).toISOString();

    // Try by university_id first; fall back to entity_id = orgId
    let query = supabase
      .from('analytics_events')
      .select('event_name, entity_id, device, country_code, utm_source, created_at')
      .gte('created_at', since)
      .in('event_name', ['view_entity', 'cta_click', 'save_item']);

    if (universityId) {
      query = query.eq('entity_type', 'university').eq('entity_id', String(universityId));
    } else {
      query = query.eq('entity_id', orgId);
    }

    const { data } = await query.limit(5000);
    setEvents((data || []) as Ev[]);

    if (universityId) {
      const { count } = await supabase
        .from('saved_items')
        .select('id', { count: 'exact', head: true })
        .eq('entity_type', 'university')
        .eq('entity_id', String(universityId));
      setSaves(count || 0);
    }
    setLoading(false);
  }
  useEffect(() => { load(); }, [days, orgId, universityId]);

  const stats = useMemo(() => {
    const views = events.filter(e => e.event_name === 'view_entity');
    const ctaClicks = events.filter(e => e.event_name === 'cta_click').length;

    // Daily views (last N days, sparkline)
    const byDay = new Map<string, number>();
    for (let i = 0; i < days; i++) {
      const d = new Date(Date.now() - (days - i - 1) * 24*3600*1000);
      byDay.set(d.toISOString().slice(0,10), 0);
    }
    for (const v of views) {
      const d = v.created_at.slice(0,10);
      if (byDay.has(d)) byDay.set(d, byDay.get(d)! + 1);
    }
    const daily = Array.from(byDay.entries());

    // Sources
    const sources: Record<string, number> = {};
    for (const v of views) {
      const s = v.utm_source || 'direct';
      sources[s] = (sources[s] || 0) + 1;
    }

    // Devices
    const devices: Record<string, number> = {};
    for (const v of views) {
      const d = v.device || 'unknown';
      devices[d] = (devices[d] || 0) + 1;
    }

    // Countries
    const countries: Record<string, number> = {};
    for (const v of views) {
      const c = v.country_code || 'unknown';
      countries[c] = (countries[c] || 0) + 1;
    }

    return {
      totalViews: views.length,
      ctaClicks,
      daily,
      sources: Object.entries(sources).sort((a,b) => b[1] - a[1]).slice(0, 5),
      devices: Object.entries(devices).sort((a,b) => b[1] - a[1]),
      countries: Object.entries(countries).sort((a,b) => b[1] - a[1]).slice(0, 6),
    };
  }, [events, days]);

  const max = Math.max(...stats.daily.map(d => d[1]), 1);
  const conversionPct = stats.totalViews > 0 ? Math.round((saves / stats.totalViews) * 100) : 0;

  return (
    <section id="analytics" className="bg-surface rounded-2xl border-2 border-line p-4 lg:p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-extrabold text-primary">📈 إحصاءاتك التفصيلية</h3>
        <select value={days} onChange={e => setDays(Number(e.target.value))} className="px-3 py-1.5 rounded-lg border-2 border-line text-sm font-bold">
          <option value="7">7 أيام</option>
          <option value="30">30 يوم</option>
          <option value="90">90 يوم</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <K label="مشاهدات" value={stats.totalViews} icon="👁️" tone="primary" />
        <K label="حفظ" value={saves} icon="📌" tone="success" />
        <K label="CTA Clicks" value={stats.ctaClicks} icon="🎯" tone="info" />
        <K label="معدل تحويل" value={conversionPct + '%'} icon="📊" tone="warn" />
      </div>

      {loading ? (
        <div className="text-sm text-ink-muted text-center py-8">جاري التحميل...</div>
      ) : (
        <>
          <div className="bg-bg-soft rounded-xl p-4 mb-4">
            <div className="text-sm font-bold mb-2 text-ink-muted">نمو المشاهدات</div>
            {stats.totalViews === 0 ? (
              <div className="text-xs text-ink-muted text-center py-6">لا توجد مشاهدات بعد بهذا الإطار الزمني</div>
            ) : (
              <svg viewBox="0 0 800 100" className="w-full h-24">
                {stats.daily.map((d, i) => {
                  const x = (i / Math.max(stats.daily.length-1,1)) * 780 + 10;
                  const y = 90 - (d[1] / max) * 80;
                  return <circle key={i} cx={x} cy={y} r={2} fill="#10B981" />;
                })}
                <polyline fill="none" stroke="#10B981" strokeWidth="2"
                  points={stats.daily.map((d, i) => {
                    const x = (i / Math.max(stats.daily.length-1,1)) * 780 + 10;
                    const y = 90 - (d[1] / max) * 80;
                    return x + ',' + y;
                  }).join(' ')} />
              </svg>
            )}
          </div>

          <div className="grid lg:grid-cols-3 gap-3">
            <Panel title="🌐 المصادر" rows={stats.sources} />
            <Panel title="📱 الأجهزة" rows={stats.devices} />
            <Panel title="🗺️ الدول" rows={stats.countries} />
          </div>
        </>
      )}
    </section>
  );
}

function K({ label, value, icon, tone }: { label: string; value: string | number; icon: string; tone: 'primary'|'success'|'warn'|'info' }) {
  const c = { primary:'from-blue-50 to-indigo-50', success:'from-emerald-50 to-teal-50', warn:'from-amber-50 to-yellow-50', info:'from-purple-50 to-pink-50' };
  return (
    <div className={'bg-gradient-to-br ' + c[tone] + ' rounded-2xl border border-white/40 p-3'}>
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-2xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-muted font-bold">{label}</div>
    </div>
  );
}

function Panel({ title, rows }: { title: string; rows: [string, number][] }) {
  const max = Math.max(...rows.map(r => r[1]), 1);
  return (
    <div className="bg-surface border-2 border-line rounded-xl p-3">
      <div className="text-sm font-extrabold mb-2">{title}</div>
      {rows.length === 0 ? (
        <div className="text-xs text-ink-muted text-center py-3">لا توجد بيانات</div>
      ) : (
        <div className="space-y-1">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center gap-2 text-xs">
              <div className="w-16 font-bold truncate">{k}</div>
              <div className="flex-1 h-4 bg-bg-soft rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: (v/max*100) + '%' }} />
              </div>
              <div className="w-8 text-left font-bold">{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
