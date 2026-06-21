'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminLog';

type Sub = {
  id: number;
  user_id?: string | null;
  org_id?: string | null;
  plan: string;
  status: string;
  starts_at: string;
  current_period_end?: string | null;
  amount_usd?: number | null;
  currency?: string | null;
  granted_by?: string | null;
  stripe_subscription_id?: string | null;
  created_at: string;
};

type Props = { flash: (m: string) => void };

const PLANS = ['premium', 'lifetime', 'school_basic', 'school_pro', 'uni_basic', 'uni_pro', 'sponsor'];
const stripeConnected = false; // toggle when Stripe webhook is wired

export default function SubscriptionsCenterTab({ flash }: Props) {
  const [subs, setSubs] = useState<Sub[]>([]);
  const [loading, setLoading] = useState(true);
  const [showGrant, setShowGrant] = useState(false);
  const [hasTable, setHasTable] = useState(true);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('subscriptions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (error) {
      if (error.code === '42P01' || error.code === 'PGRST205') {
        setHasTable(false);
      } else {
        flash('فشل التحميل: ' + error.message);
      }
      setLoading(false);
      return;
    }
    setSubs((data || []) as Sub[]);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const kpi = useMemo(() => {
    const active = subs.filter(s => s.status === 'active');
    const mrr = active.filter(s => !['lifetime'].includes(s.plan)).reduce((sum, s) => sum + Number(s.amount_usd || 0), 0);
    const lifetime = active.filter(s => s.plan === 'lifetime').length;
    const churn30 = subs.filter(s => s.status === 'canceled' && s.created_at > new Date(Date.now() - 30*24*3600*1000).toISOString()).length;
    return {
      active: active.length,
      mrr,
      arr: mrr * 12,
      lifetime,
      churn30,
      byPlan: PLANS.reduce((acc, p) => { acc[p] = active.filter(s => s.plan === p).length; return acc; }, {} as Record<string,number>),
    };
  }, [subs]);

  if (!hasTable) {
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
        <h2 className="text-xl font-extrabold text-amber-900 mb-2">⚙️ Subscriptions table غير موجود بعد</h2>
        <p className="text-amber-800 mb-3">شغّل ملف الـ SQL <code className="bg-surface px-2 py-0.5 rounded">supabase/migrations/20260614_super_admin.sql</code> ليتفعّل.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!stripeConnected && (
        <div className="bg-gradient-to-r from-violet-50 to-pink-50 border-2 border-violet-100 rounded-2xl p-4 flex items-center justify-between gap-3">
          <div>
            <div className="font-extrabold text-violet-900">💳 Stripe غير مفعّل</div>
            <div className="text-xs text-violet-700 mt-1">حالياً Subscriptions بتنزل يدوياً (admin grant). لما تكون جاهز لتفعيل البلنق، ضيف <code>STRIPE_SECRET_KEY</code> بـ Vercel env واطلب رابط الـ webhook.</div>
          </div>
          <button className="text-sm font-bold bg-surface border-2 border-violet-200 px-3 py-2 rounded-xl text-violet-700">⚙️ Connect</button>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <K label="MRR" value={'$'+kpi.mrr.toLocaleString()} icon="💰" tone="success" />
        <K label="ARR" value={'$'+kpi.arr.toLocaleString()} icon="📊" tone="primary" />
        <K label="مشتركين نشطين" value={kpi.active} icon="👥" tone="info" />
        <K label="Lifetime members" value={kpi.lifetime} icon="🏆" tone="warn" />
        <K label="Churn (30 يوم)" value={kpi.churn30} icon="📉" tone="danger" />
      </div>

      <div className="bg-surface rounded-2xl border-2 border-line p-4">
        <h3 className="text-sm font-extrabold text-ink-muted mb-3">توزيع حسب الخطّة</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {PLANS.map(p => (
            <div key={p} className="bg-bg-soft rounded-xl p-3 text-center">
              <div className="text-xs text-ink-muted font-bold mb-1">{p}</div>
              <div className="text-2xl font-extrabold text-ink">{kpi.byPlan[p] || 0}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-surface rounded-2xl border-2 border-line p-3 lg:p-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-extrabold">الاشتراكات الفعّالة</h3>
          <div className="flex gap-2">
            <button onClick={load} className="px-3 py-1.5 rounded-lg bg-bg-soft text-sm font-bold">🔄</button>
            <button onClick={() => setShowGrant(true)} className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-bold">+ منح اشتراك يدوي</button>
          </div>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="h-12 bg-bg-soft animate-pulse rounded-xl" />)}</div>
        ) : subs.length === 0 ? (
          <div className="py-12 text-center text-ink-muted">لا توجد اشتراكات بعد.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right border-b border-line">
                  <th className="py-2 px-2 font-bold text-ink-muted">المشترك</th>
                  <th className="py-2 px-2 font-bold text-ink-muted">الخطة</th>
                  <th className="py-2 px-2 font-bold text-ink-muted">الحالة</th>
                  <th className="py-2 px-2 font-bold text-ink-muted">المبلغ</th>
                  <th className="py-2 px-2 font-bold text-ink-muted">المصدر</th>
                  <th className="py-2 px-2 font-bold text-ink-muted">تاريخ البدء</th>
                  <th className="py-2 px-2 font-bold text-ink-muted">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {subs.slice(0, 100).map(s => (
                  <tr key={s.id} className="border-b border-gray-50">
                    <td className="py-2 px-2 text-xs">{s.user_id?.slice(0, 8) || s.org_id?.slice(0, 8) || '—'}</td>
                    <td className="py-2 px-2 font-bold">{s.plan}</td>
                    <td className="py-2 px-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        s.status === 'active' ? 'bg-emerald-100 text-emerald-700' :
                        s.status === 'past_due' ? 'bg-amber-100 text-amber-700' :
                        'bg-bg-soft text-ink-subtle'
                      }`}>{s.status}</span>
                    </td>
                    <td className="py-2 px-2">${s.amount_usd || 0}</td>
                    <td className="py-2 px-2 text-xs">{s.stripe_subscription_id ? '💳 Stripe' : (s.granted_by ? `👤 ${s.granted_by.slice(0,12)}` : '—')}</td>
                    <td className="py-2 px-2 text-xs text-ink-muted">{new Date(s.created_at).toLocaleDateString('ar')}</td>
                    <td className="py-2 px-2">
                      {s.status === 'active' && (
                        <button onClick={async () => {
                          if (!confirm('إلغاء هذا الاشتراك؟')) return;
                          await supabase.from('subscriptions').update({ status: 'canceled', cancel_at: new Date().toISOString() }).eq('id', s.id);
                          await logAdminAction({ action: 'subscription_revoke', target_type: 'subscription', target_id: s.id });
                          flash('تم الإلغاء');
                          load();
                        }} className="text-xs font-bold text-rose-600 hover:underline">إلغاء</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showGrant && <GrantModal onClose={() => setShowGrant(false)} flash={flash} reload={load} />}
    </div>
  );
}

function K({ label, value, icon, tone }: { label: string; value: string | number; icon: string; tone: 'primary'|'success'|'warn'|'info'|'danger' }) {
  const colors = { primary: 'from-blue-50 to-indigo-50', success: 'from-emerald-50 to-teal-50', warn: 'from-amber-50 to-yellow-50', info: 'from-purple-50 to-pink-50', danger: 'from-rose-50 to-red-50' };
  return (
    <div className={`bg-gradient-to-br ${colors[tone]} rounded-2xl border border-white/40 p-4`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1 font-bold">{label}</div>
    </div>
  );
}

function GrantModal({ onClose, flash, reload }: { onClose: () => void; flash: (m:string) => void; reload: () => void }) {
  const [userId, setUserId] = useState('');
  const [plan, setPlan] = useState('premium');
  const [amount, setAmount] = useState('');
  const [days, setDays] = useState('365');
  const [busy, setBusy] = useState(false);

  async function grant() {
    if (!userId.trim()) return flash('User ID مطلوب');
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    const ends = new Date(Date.now() + Number(days) * 24 * 3600 * 1000).toISOString();
    const { error } = await supabase.from('subscriptions').insert({
      user_id: userId.trim(),
      plan,
      status: 'active',
      amount_usd: amount ? Number(amount) : null,
      current_period_end: plan === 'lifetime' ? null : ends,
      granted_by: user?.email,
      notes: 'Manually granted by admin',
    });
    if (error) flash('فشل: ' + error.message);
    else {
      await logAdminAction({ action: 'subscription_grant', target_type: 'subscription', details: { userId, plan, amount, days } });
      flash('✓ تم منح الاشتراك');
      reload();
      onClose();
    }
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-3xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-extrabold text-lg mb-3">+ منح اشتراك يدوي</h3>
        <div className="space-y-3 text-sm">
          <input value={userId} onChange={e=>setUserId(e.target.value)} placeholder="User ID (UUID)" className="w-full px-3 py-2 rounded-xl border-2 border-line outline-none font-mono text-xs" />
          <select value={plan} onChange={e=>setPlan(e.target.value)} className="w-full px-3 py-2 rounded-xl border-2 border-line">
            {PLANS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="المبلغ USD (اختياري)" className="w-full px-3 py-2 rounded-xl border-2 border-line" />
          <input value={days} onChange={e=>setDays(e.target.value)} placeholder="عدد الأيام" className="w-full px-3 py-2 rounded-xl border-2 border-line" />
          <button disabled={busy} onClick={grant} className="w-full py-2.5 rounded-xl bg-primary text-white font-bold disabled:opacity-50">{busy ? 'جاري...' : 'منح'}</button>
        </div>
      </div>
    </div>
  );
}
