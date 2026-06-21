'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

type Ev = {
  event_name: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  device?: string | null;
  country_code?: string | null;
  created_at: string;
};

export default function MarketingCenterTab() {
  const [events, setEvents] = useState<Ev[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  async function load() {
    setLoading(true);
    const since = new Date(Date.now() - days*24*3600*1000).toISOString();
    const { data } = await supabase.from('analytics_events')
      .select('event_name, utm_source, utm_medium, utm_campaign, device, country_code, created_at')
      .gte('created_at', since).limit(20000);
    setEvents((data || []) as Ev[]); setLoading(false);
  }
  useEffect(() => { load(); }, [days]);

  const stats = useMemo(() => {
    const total = events.length;
    const pageViews = events.filter(e => e.event_name === 'page_view').length;
    const signups = events.filter(e => e.event_name === 'register_complete').length;
    const dnaStarts = events.filter(e => e.event_name === 'start_dna').length;
    const dnaCompletes = events.filter(e => e.event_name === 'complete_dna').length;
    const ctaClicks = events.filter(e => e.event_name === 'cta_click').length;
    const dnaConv = dnaStarts > 0 ? Math.round((dnaCompletes / dnaStarts) * 100) : 0;
    const signupConv = pageViews > 0 ? +(signups / pageViews * 100).toFixed(2) : 0;

    const sourcesMap: Record<string, number> = {};
    const mediumMap: Record<string, number> = {};
    const campaignMap: Record<string, number> = {};
    const deviceMap: Record<string, number> = {};

    for (const e of events) {
      if (e.event_name !== 'page_view') continue;
      const src = e.utm_source || 'direct';
      const med = e.utm_medium || 'none';
      const cmp = e.utm_campaign || 'none';
      const dev = e.device || 'unknown';
      sourcesMap[src] = (sourcesMap[src] || 0) + 1;
      mediumMap[med] = (mediumMap[med] || 0) + 1;
      campaignMap[cmp] = (campaignMap[cmp] || 0) + 1;
      deviceMap[dev] = (deviceMap[dev] || 0) + 1;
    }

    return {
      total, pageViews, signups, dnaStarts, dnaCompletes, ctaClicks,
      dnaConv, signupConv,
      topSources: Object.entries(sourcesMap).sort((a,b) => b[1] - a[1]).slice(0, 8),
      topMediums: Object.entries(mediumMap).sort((a,b) => b[1] - a[1]).slice(0, 6),
      topCampaigns: Object.entries(campaignMap).sort((a,b) => b[1] - a[1]).slice(0, 6),
      devices: Object.entries(deviceMap).sort((a,b) => b[1] - a[1]),
    };
  }, [events]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-ink-muted">📊 آخر {days} يوم</h3>
        <select value={days} onChange={e=>setDays(Number(e.target.value))} className="px-3 py-1.5 rounded-lg border-2 border-white/10 text-sm font-bold">
          <option value="7">7 أيام</option><option value="30">30 يوم</option><option value="90">90 يوم</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <K label="مشاهدات صفحات" value={stats.pageViews} icon="👁️" tone="primary" />
        <K label="تسجيلات جديدة" value={stats.signups} icon="✨" tone="success" />
        <K label="معدّل تحويل التسجيل" value={stats.signupConv + '%'} icon="🎯" tone="info" />
        <K label="معدّل إكمال DNA" value={stats.dnaConv + '%'} icon="🧬" tone="warn" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Panel title="🌐 أعلى المصادر (UTM Source)" rows={stats.topSources} loading={loading} />
        <Panel title="📣 الحملات الأعلى" rows={stats.topCampaigns} loading={loading} />
        <Panel title="📱 الأجهزة" rows={stats.devices} loading={loading} />
        <Panel title="🔗 وسائل الوصول (Medium)" rows={stats.topMediums} loading={loading} />
      </div>

      <div className="bg-surface rounded-2xl border-2 border-white/10 p-4">
        <h3 className="font-extrabold mb-3">🛒 Funnel: زائر → طالب موثّق</h3>
        <FunnelBar steps={[
          { label: 'مشاهدة صفحة', value: stats.pageViews },
          { label: 'CTA Click', value: stats.ctaClicks },
          { label: 'بدء DNA', value: stats.dnaStarts },
          { label: 'إكمال DNA', value: stats.dnaCompletes },
          { label: 'تسجيل حساب', value: stats.signups },
        ]} />
      </div>
    </div>
  );
}

function K({ label, value, icon, tone }: { label: string; value: string | number; icon: string; tone: 'primary'|'success'|'warn'|'info' }) {
  const c = { primary:'from-blue-50 to-indigo-50', success:'from-emerald-50 to-teal-50', warn:'from-amber-50 to-yellow-50', info:'from-purple-50 to-pink-50' };
  return (
    <div className={'bg-gradient-to-br ' + c[tone] + ' rounded-2xl border border-white/40 p-4'}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1 font-bold">{label}</div>
    </div>
  );
}

function Panel({ title, rows, loading }: { title: string; rows: [string, number][]; loading: boolean }) {
  const max = Math.max(...rows.map(r => r[1]), 1);
  return (
    <div className="bg-surface rounded-2xl border-2 border-white/10 p-4">
      <h3 className="font-extrabold mb-3">{title}</h3>
      {loading ? (
        <div className="space-y-2">{[...Array(4)].map((_,i) => <div key={i} className="h-6 bg-bg-soft animate-pulse rounded" />)}</div>
      ) : rows.length === 0 ? (
        <div className="text-sm text-ink-muted py-6 text-center">لا توجد بيانات بعد</div>
      ) : (
        <div className="space-y-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex items-center gap-2">
              <div className="w-24 text-xs font-bold truncate">{k}</div>
              <div className="flex-1 h-5 bg-bg-soft rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500" style={{ width: (v/max*100) + '%' }} />
              </div>
              <div className="w-12 text-xs font-bold text-left">{v}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FunnelBar({ steps }: { steps: { label: string; value: number }[] }) {
  const max = steps[0]?.value || 1;
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const pct = max > 0 ? Math.round((s.value / max) * 100) : 0;
        const dropoff = i > 0 && steps[i-1].value > 0 ? Math.round(((steps[i-1].value - s.value) / steps[i-1].value) * 100) : 0;
        return (
          <div key={s.label} className="flex items-center gap-3">
            <div className="w-32 text-sm font-bold">{s.label}</div>
            <div className="flex-1 h-8 bg-bg-soft rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 flex items-center justify-end px-3 text-white text-xs font-bold" style={{ width: pct + '%' }}>
                {s.value > 0 && s.value}
              </div>
            </div>
            <div className="w-20 text-xs font-bold text-left">
              {pct}% {i > 0 && <span className="text-rose-500">(-{dropoff}%)</span>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
