'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminLog';

type Sponsor = {
  id: number;
  user_id?: string | null;
  org_id?: string | null;
  plan: string;
  status: string;
  amount_usd?: number | null;
  notes?: string | null;
  created_at: string;
  current_period_end?: string | null;
};

export default function SponsorsCenterTab({ flash }: { flash: (m: string) => void }) {
  const [list, setList] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('subscriptions').select('*').eq('plan', 'sponsor').order('created_at', { ascending: false });
    setList((data || []) as Sponsor[]); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const stats = useMemo(() => ({
    active: list.filter(s => s.status === 'active').length,
    totalRev: list.filter(s => s.status === 'active').reduce((a,s) => a + Number(s.amount_usd || 0), 0),
    avgDeal: list.length > 0 ? Math.round(list.reduce((a,s) => a + Number(s.amount_usd || 0), 0) / list.length) : 0,
    expiringSoon: list.filter(s => s.current_period_end && new Date(s.current_period_end).getTime() - Date.now() < 30*24*3600*1000 && s.status === 'active').length,
  }), [list]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <K label="رعاة فعّالين" value={stats.active} icon="🤝" tone="success" />
        <K label="إيرادات الرعاة" value={'$' + stats.totalRev.toLocaleString()} icon="💰" tone="primary" />
        <K label="متوسط الصفقة" value={'$' + stats.avgDeal} icon="📊" tone="info" />
        <K label="ينتهي خلال 30 يوم" value={stats.expiringSoon} icon="⏳" tone="warn" />
      </div>

      <div className="bg-surface rounded-2xl border-2 border-white/10 p-4">
        <div className="flex justify-between mb-3">
          <h3 className="font-extrabold">🤝 الرعاة والشركاء</h3>
          <button onClick={() => setShowAdd(true)} className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-bold">+ إضافة راعي جديد</button>
        </div>
        {loading ? (
          <div className="space-y-2">{[...Array(3)].map((_,i) => <div key={i} className="h-14 bg-bg-soft animate-pulse rounded-xl" />)}</div>
        ) : list.length === 0 ? (
          <div className="py-12 text-center text-ink-muted">لا يوجد رعاة بعد. اضغط "إضافة راعي جديد" لتسجيل أول عقد.</div>
        ) : (
          <div className="space-y-2">
            {list.map(s => (
              <div key={s.id} className="border border-white/10 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="font-bold">{s.notes || 'راعي #' + s.id}</div>
                  <div className="text-xs text-ink-muted">${s.amount_usd || 0} · {s.status} · بدأ {new Date(s.created_at).toLocaleDateString('ar')}</div>
                </div>
                <span className={'text-xs font-bold px-2 py-1 rounded-full ' + (
                  s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-bg-soft text-ink-subtle'
                )}>{s.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border border-white/40 p-4">
        <div className="font-extrabold mb-2">🚀 قريباً</div>
        <ul className="text-sm text-ink-muted space-y-1">
          <li>✦ Sponsored placements (featured cards على نتائج البحث)</li>
          <li>✦ Banner ads على صفحات محدّدة</li>
          <li>✦ Email sponsorships (newsletter ads)</li>
          <li>✦ ROI dashboard لكل راعي (impressions، clicks، leads)</li>
        </ul>
      </div>

      {showAdd && <AddSponsor onClose={() => setShowAdd(false)} flash={flash} reload={load} />}
    </div>
  );
}

function AddSponsor({ onClose, flash, reload }: { onClose: () => void; flash: (m: string) => void; reload: () => void }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [months, setMonths] = useState('12');
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!name.trim()) return flash('الاسم مطلوب');
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    const ends = new Date(Date.now() + Number(months) * 30 * 24*3600*1000).toISOString();
    const { error } = await supabase.from('subscriptions').insert({
      org_id: '00000000-0000-0000-0000-000000000000', // placeholder until sponsor org structure exists
      plan: 'sponsor', status: 'active',
      amount_usd: amount ? Number(amount) : null,
      current_period_end: ends,
      granted_by: user?.email, notes: name,
    });
    if (error) flash('فشل: ' + error.message);
    else {
      await logAdminAction({ action: 'subscription_grant', target_type: 'sponsor', details: { name, amount, months } });
      flash('✓ تم تسجيل الراعي'); reload(); onClose();
    }
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-3xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-extrabold text-lg mb-3">+ إضافة راعي جديد</h3>
        <div className="space-y-3 text-sm">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="اسم الراعي/المؤسسة" className="w-full px-3 py-2 rounded-xl border-2 border-white/10 outline-none" />
          <input value={amount} onChange={e=>setAmount(e.target.value)} placeholder="المبلغ USD" type="number" className="w-full px-3 py-2 rounded-xl border-2 border-white/10 outline-none" />
          <input value={months} onChange={e=>setMonths(e.target.value)} placeholder="مدّة العقد (أشهر)" type="number" className="w-full px-3 py-2 rounded-xl border-2 border-white/10 outline-none" />
          <button disabled={busy} onClick={save} className="w-full py-2.5 rounded-xl bg-primary text-white font-bold disabled:opacity-50">{busy ? 'جاري...' : 'حفظ'}</button>
        </div>
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
