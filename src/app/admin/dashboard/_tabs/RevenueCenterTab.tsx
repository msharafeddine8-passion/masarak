'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

type Sub = {
  id: number;
  user_id?: string | null;
  org_id?: string | null;
  plan: string;
  status: string;
  amount_usd?: number | null;
  currency?: string | null;
  created_at: string;
  current_period_end?: string | null;
  stripe_subscription_id?: string | null;
};

const PLAN_LABELS: Record<string, string> = {
  free: 'مجاني', premium: 'بريميوم', lifetime: 'مدى الحياة',
  school_basic: 'مدرسة (أساسي)', school_pro: 'مدرسة (متقدم)',
  uni_basic: 'جامعة (أساسي)', uni_pro: 'جامعة (متقدم)',
  sponsor: 'راعي',
};

export default function RevenueCenterTab() {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('subscriptions').select('*').eq('status', 'active');
    setSubs((data || []) as Sub[]); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const kpi = useMemo(() => {
    const recurring = subs.filter(s => s.plan !== 'lifetime' && s.plan !== 'free');
    const mrr = recurring.reduce((sum, s) => sum + Number(s.amount_usd || 0), 0);
    const arr = mrr * 12;
    const byPlan = Object.entries(subs.reduce((acc, s) => {
      acc[s.plan] = (acc[s.plan] || 0) + Number(s.amount_usd || 0);
      return acc;
    }, {} as Record<string, number>)).sort((a,b) => b[1] - a[1]);
    const sources = subs.reduce((acc, s) => {
      const k = s.stripe_subscription_id ? 'Stripe' : 'Manual';
      acc[k] = (acc[k] || 0) + Number(s.amount_usd || 0);
      return acc;
    }, {} as Record<string, number>);
    return { mrr, arr, byPlan, sources, totalSubs: subs.length };
  }, [subs]);

  const forecast = useMemo(() => {
    // Simple linear projection: MRR holds, +5% MoM growth assumption (only if real data exists)
    const m = kpi.mrr;
    return {
      nextMonth: m * 1.05,
      nextQuarter: m * 3 * 1.10,
      nextYear: kpi.arr * 1.20,
    };
  }, [kpi]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <K label="MRR" value={'$' + kpi.mrr.toLocaleString()} icon="💰" tone="success" />
        <K label="ARR" value={'$' + kpi.arr.toLocaleString()} icon="📊" tone="primary" />
        <K label="مشترك فعّال" value={kpi.totalSubs} icon="👥" tone="info" />
        <K label="متوسط لكل مشترك" value={'$' + (kpi.totalSubs > 0 ? Math.round(kpi.mrr / kpi.totalSubs) : 0)} icon="🎯" tone="warn" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <h3 className="font-extrabold mb-3">📈 توزيع الإيرادات حسب الخطة</h3>
          {loading ? (
            <div className="space-y-2">{[...Array(4)].map((_,i) => <div key={i} className="h-8 bg-gray-100 animate-pulse rounded" />)}</div>
          ) : kpi.byPlan.length === 0 ? (
            <div className="text-sm text-ink-muted py-8 text-center">ما في إيرادات بعد. الـ MRR رح يظهر هون لما تبلش الاشتراكات</div>
          ) : (
            <div className="space-y-2">
              {kpi.byPlan.map(([plan, amount]) => {
                const pct = kpi.mrr > 0 ? Math.round((amount / (kpi.mrr + (kpi.byPlan.find(([p]) => p === 'lifetime')?.[1] ?? 0) || kpi.mrr || 1)) * 100) : 0;
                return (
                  <div key={plan} className="flex items-center gap-3">
                    <div className="w-32 text-sm font-bold">{PLAN_LABELS[plan] || plan}</div>
                    <div className="flex-1 h-6 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500" style={{ width: pct + '%' }} />
                    </div>
                    <div className="w-20 text-sm font-bold text-left">${amount.toFixed(0)}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-100 p-4">
          <h3 className="font-extrabold mb-3">🔮 توقعات (Forecast)</h3>
          <div className="space-y-3">
            <Forecast label="الشهر القادم" value={forecast.nextMonth} />
            <Forecast label="الربع القادم" value={forecast.nextQuarter} />
            <Forecast label="السنة القادمة" value={forecast.nextYear} />
          </div>
          <p className="text-xs text-ink-muted mt-3">* Forecast بسيط، يفترض نمو 5% شهرياً. للتنبؤ الذكي، يلزم AI key.</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-violet-50 to-pink-50 border-2 border-violet-100 rounded-2xl p-4">
        <div className="font-extrabold mb-2">💳 Stripe Status</div>
        <p className="text-sm text-ink-muted">
          {kpi.sources.Stripe ? `Stripe بيغطّي $${kpi.sources.Stripe.toFixed(0)} من الـ MRR.` : 'Stripe غير مفعّل. الاشتراكات يدوية حالياً.'}
        </p>
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

function Forecast({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center">
      <span className="text-sm font-bold">{label}</span>
      <span className="text-xl font-extrabold text-success">${value.toFixed(0)}</span>
    </div>
  );
}
