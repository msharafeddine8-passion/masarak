'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

type DnaRow = { id: string; personality_type?: string | null; created_at: string };

const TYPE_LABELS: Record<string, string> = {
  R: 'واقعي (Realistic)', I: 'باحث (Investigative)', A: 'فنّي (Artistic)',
  S: 'اجتماعي (Social)', E: 'مغامر (Enterprising)', C: 'نظامي (Conventional)',
};

export default function CareerDnaCenterTab() {
  const [list, setList] = useState<DnaRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    // DNA completion + personality type live on student_profiles (no separate dna_results table).
    const { data, error } = await supabase.from('student_profiles')
      .select('id, personality_type, created_at')
      .eq('career_dna_completed', true)
      .order('created_at', { ascending: false })
      .limit(2000);
    if (error) { console.error('[dna]', error); setLoading(false); return; }
    setList((data || []) as DnaRow[]); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const total = list.length;
    const last7 = list.filter(r => new Date(r.created_at).getTime() > Date.now() - 7*24*3600*1000).length;
    const last30 = list.filter(r => new Date(r.created_at).getTime() > Date.now() - 30*24*3600*1000).length;
    const dist: Record<string, number> = {};
    for (const r of list) {
      const t = r.personality_type || 'unknown';
      dist[t] = (dist[t] || 0) + 1;
    }
    const sorted = Object.entries(dist).sort((a,b) => b[1] - a[1]);
    return { total, last7, last30, dist, top: sorted };
  }, [list]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <K label="إجمالي الاختبارات" value={stats.total} icon="🧬" tone="primary" />
        <K label="خلال 7 أيام" value={stats.last7} icon="📈" tone="success" />
        <K label="خلال 30 يوم" value={stats.last30} icon="📊" tone="info" />
        <K label="معدّل يومي" value={Math.round(stats.last30 / 30)} icon="⚡" tone="warn" />
      </div>

      <div className="bg-surface rounded-2xl border-2 border-line p-4">
        <h3 className="text-sm font-extrabold text-ink-muted mb-3">🎯 توزيع الشخصيات المهنية</h3>
        {loading ? (
          <div className="space-y-2">{[...Array(6)].map((_,i) => <div key={i} className="h-10 bg-bg-soft animate-pulse rounded-xl" />)}</div>
        ) : stats.top.length === 0 ? (
          <div className="py-12 text-center text-ink-muted">لا توجد نتائج بعد. سيظهر التحليل عندما يبدأ الطلاب بإجراء الاختبار.</div>
        ) : (
          <div className="space-y-2">
            {stats.top.map(([t, count]) => {
              const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
              return (
                <div key={t} className="flex items-center gap-3">
                  <div className="w-40 text-sm font-bold">{TYPE_LABELS[t] || t}</div>
                  <div className="flex-1 h-6 bg-bg-soft rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary to-mint" style={{ width: pct + '%' }} />
                  </div>
                  <div className="w-16 text-sm font-bold text-ink-muted text-left">{count} <span className="text-xs">({pct}%)</span></div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-violet-50 to-pink-50 rounded-2xl border border-white/40 p-4">
        <div className="font-extrabold mb-2">🚀 قريباً (يتفعّل مع AI key)</div>
        <ul className="text-sm text-ink-muted space-y-1">
          <li>✦ Trend detection: شخصيات صاعدة عبر الوقت</li>
          <li>✦ Skill gap analysis بحسب المنطقة</li>
          <li>✦ مقارنة بين الدول العربية</li>
          <li>✦ Most-clicked careers per personality</li>
        </ul>
      </div>
    </div>
  );
}

function K({ label, value, icon, tone }: { label: string; value: number | string; icon: string; tone: 'primary'|'success'|'warn'|'info' }) {
  const c = { primary:'from-blue-50 to-indigo-50', success:'from-emerald-50 to-teal-50', warn:'from-amber-50 to-yellow-50', info:'from-purple-50 to-pink-50' };
  return (
    <div className={'bg-gradient-to-br ' + c[tone] + ' rounded-2xl border border-white/40 p-4'}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1 font-bold">{label}</div>
    </div>
  );
}
