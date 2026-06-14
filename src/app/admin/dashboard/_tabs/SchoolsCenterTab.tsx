'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminLog';

type Sch = {
  id: number;
  name?: string | null;
  name_ar?: string | null;
  short?: string | null;
  slug?: string | null;
  logo_url?: string | null;
  city?: string | null;
  type?: string | null;
  language?: string | null;
  is_featured?: boolean | null;
  is_verified?: boolean | null;
  created_at?: string | null;
  saves_count?: number;
  views_30d?: number;
  completion?: number;
};

type Props = { flash: (m: string) => void };
const COMPLETE_FIELDS = ['name','name_ar','short','slug','logo_url','city','type','language'];

export default function SchoolsCenterTab({ flash }: Props) {
  const [list, setList] = useState<Sch[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Sch | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('schools').select('*').order('id');
    const arr = ((data || []) as Sch[]);

    const { data: saves } = await supabase.from('saved_items').select('entity_id').eq('entity_type', 'school');
    const sc: Record<string, number> = {};
    if (saves) for (const r of saves as { entity_id: string }[]) sc[r.entity_id] = (sc[r.entity_id] || 0) + 1;

    const since = new Date(Date.now() - 30*24*3600*1000).toISOString();
    const { data: views } = await supabase.from('analytics_events').select('entity_id')
      .eq('entity_type','school').eq('event_name','view_entity').gte('created_at', since);
    const vc: Record<string, number> = {};
    if (views) for (const r of views as { entity_id: string }[]) vc[r.entity_id] = (vc[r.entity_id] || 0) + 1;

    for (const s of arr) {
      let filled = 0;
      for (const f of COMPLETE_FIELDS) {
        const v = (s as unknown as Record<string, unknown>)[f];
        if (v != null && v !== '') filled++;
      }
      s.completion = Math.round((filled / COMPLETE_FIELDS.length) * 100);
      s.saves_count = sc[String(s.id)] || 0;
      s.views_30d = vc[String(s.id)] || 0;
    }
    setList(arr);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(s => (s.name||'').toLowerCase().includes(q) || (s.name_ar||'').toLowerCase().includes(q) || (s.slug||'').toLowerCase().includes(q));
  }, [list, search]);

  const stats = useMemo(() => ({
    total: list.length,
    featured: list.filter(s => s.is_featured).length,
    verified: list.filter(s => s.is_verified).length,
    avgCompletion: list.length ? Math.round(list.reduce((a,s)=>a+(s.completion||0),0)/list.length) : 0,
  }), [list]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <S label="إجمالي المدارس" value={stats.total} icon="🏫" tone="primary" />
        <S label="مميّزة" value={stats.featured} icon="⭐" tone="warn" />
        <S label="موثّقة" value={stats.verified} icon="✓" tone="success" />
        <S label="متوسط الاكتمال" value={stats.avgCompletion + '%'} icon="📊" tone="info" />
      </div>

      <div className="bg-white rounded-2xl border-2 border-gray-100 p-3 lg:p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث باسم المدرسة..." className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border-2 border-gray-100 outline-none text-sm" />
          <button onClick={load} className="px-3 py-2 rounded-xl bg-white border-2 border-gray-200 text-sm font-bold">🔄</button>
          <button onClick={() => setShowInvite(true)} className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark">📤 دعوة مدرسة</button>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="h-16 bg-gray-100 animate-pulse rounded-xl" />)}</div>
        ) : (
          <div className="space-y-2">
            {filtered.map(s => <SchRow key={s.id} s={s} onOpen={() => setSelected(s)} flash={flash} reload={load} />)}
          </div>
        )}
      </div>

      {selected && <SchDrawer s={selected} onClose={() => setSelected(null)} flash={flash} reload={load} />}
      {showInvite && <InviteSchool onClose={() => setShowInvite(false)} flash={flash} />}
    </div>
  );
}

function S({ label, value, icon, tone }: { label: string; value: number | string; icon: string; tone: 'primary' | 'success' | 'warn' | 'info' }) {
  const colors = { primary: 'from-blue-50 to-indigo-50', success: 'from-emerald-50 to-teal-50', warn: 'from-amber-50 to-yellow-50', info: 'from-purple-50 to-pink-50' };
  return (
    <div className={`bg-gradient-to-br ${colors[tone]} rounded-2xl border border-white/40 p-4`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1 font-bold">{label}</div>
    </div>
  );
}

function SchRow({ s, onOpen, flash, reload }: { s: Sch; onOpen: () => void; flash: (m: string) => void; reload: () => void }) {
  async function toggleFeat() {
    const next = !s.is_featured;
    const { error } = await supabase.from('schools').update({ is_featured: next }).eq('id', s.id);
    if (error) { flash('فشل: ' + error.message); return; }
    await logAdminAction({ action: 'school_update', target_type: 'school', target_id: s.id, details: { is_featured: next } });
    flash(next ? '⭐ مميّزة' : 'تم الإلغاء');
    reload();
  }
  async function toggleVerify() {
    const next = !s.is_verified;
    const { error } = await supabase.from('schools').update({ is_verified: next }).eq('id', s.id);
    if (error) { flash('فشل: ' + error.message); return; }
    await logAdminAction({ action: 'school_verify', target_type: 'school', target_id: s.id, details: { is_verified: next } });
    flash(next ? '✓ موثّقة' : 'تم الإلغاء');
    reload();
  }
  const comp = s.completion || 0;
  const compTone = comp >= 80 ? 'bg-emerald-500' : comp >= 50 ? 'bg-amber-500' : 'bg-rose-500';

  return (
    <div className="border border-gray-100 rounded-xl p-3 hover:border-primary/30 hover:bg-mint-pale/20">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-2xl shrink-0 overflow-hidden">
          {s.logo_url ? <img src={s.logo_url} alt="" className="w-full h-full object-contain" /> : '🏫'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold">{s.name_ar || s.name || `Sch #${s.id}`}</span>
            {s.is_verified && <span className="text-xs text-emerald-600 font-bold">✓</span>}
            {s.is_featured && <span className="text-xs text-amber-600 font-bold">⭐</span>}
          </div>
          <div className="text-xs text-ink-muted mt-1">{s.city || '—'} · {s.type || ''} · {s.language || ''}</div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${compTone}`} style={{ width: comp + '%' }} /></div>
            <span className="text-xs font-bold text-ink-muted w-10 text-left">{comp}%</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={onOpen} className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark">عرض/تعديل</button>
          <div className="flex gap-1">
            <button onClick={toggleVerify} className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">✓</button>
            <button onClick={toggleFeat} className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">⭐</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchDrawer({ s, onClose, flash, reload }: { s: Sch; onClose: () => void; flash: (m:string) => void; reload: () => void }) {
  const [form, setForm] = useState({
    name_ar: s.name_ar || '', name: s.name || '', short: s.short || '',
    slug: s.slug || '', logo_url: s.logo_url || '', city: s.city || '',
    type: s.type || '', language: s.language || '',
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const patch = Object.fromEntries(Object.entries(form).map(([k,v]) => [k, v || null]));
    const { error } = await supabase.from('schools').update(patch).eq('id', s.id);
    if (error) flash('فشل: ' + error.message);
    else {
      await logAdminAction({ action: 'school_update', target_type: 'school', target_id: s.id, details: patch });
      flash('✓ تم الحفظ'); reload(); onClose();
    }
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end lg:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
          <h3 className="font-extrabold text-lg">{s.name_ar || s.name} · #{s.id}</h3>
          <button onClick={onClose} className="text-2xl text-ink-muted">×</button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          {(['name_ar','name','short','slug','logo_url','city','type','language'] as const).map(k => (
            <div key={k}>
              <label className="text-xs font-bold text-ink-muted block mb-1">{k}</label>
              <input value={(form as Record<string,string>)[k] ?? ''} onChange={e => setForm({ ...form, [k]: e.target.value })} className="w-full px-3 py-2 rounded-xl border-2 border-gray-100 focus:border-primary outline-none" />
            </div>
          ))}
          <div className="flex gap-2 pt-3 border-t">
            <button disabled={busy} onClick={save} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark disabled:opacity-50">
              {busy ? 'جاري الحفظ...' : '💾 حفظ'}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-gray-100 font-bold">إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InviteSchool({ onClose, flash }: { onClose: () => void; flash: (m: string) => void }) {
  const [email, setEmail] = useState('');
  const [orgHint, setOrgHint] = useState('');
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  async function send() {
    if (!email.trim()) return flash('الإيميل مطلوب');
    setBusy(true);
    const { data, error } = await supabase.from('org_invites').insert({ email, org_type: 'school', org_hint: orgHint || null, role: 'owner' }).select('token').single();
    if (error) flash('فشل: ' + error.message);
    else {
      const url = `${window.location.origin}/org/redeem?token=${(data as { token: string }).token}`;
      setLink(url);
      await logAdminAction({ action: 'invite_create', target_type: 'org_invite', target_id: (data as { token: string }).token, details: { email, orgType: 'school' } });
      try { await navigator.clipboard.writeText(url); flash('✓ تم نسخ الرابط'); } catch { flash('✓ تم'); }
    }
    setBusy(false);
  }
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
        <h3 className="font-extrabold text-lg mb-3">📤 دعوة مدرسة</h3>
        <div className="space-y-3 text-sm">
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="إيميل المسؤول" className="w-full px-3 py-2 rounded-xl border-2 border-gray-100 outline-none" />
          <input value={orgHint} onChange={e=>setOrgHint(e.target.value)} placeholder="اسم المدرسة" className="w-full px-3 py-2 rounded-xl border-2 border-gray-100 outline-none" />
          {link && (
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-xl p-3">
              <div className="font-bold text-emerald-800 text-sm mb-1">✓ ابعت هاد الرابط:</div>
              <code className="block text-xs bg-white p-2 rounded break-all">{link}</code>
            </div>
          )}
          <button disabled={busy} onClick={send} className="w-full py-2.5 rounded-xl bg-primary text-white font-bold disabled:opacity-50">{busy ? 'جاري...' : 'إنشاء الدعوة'}</button>
        </div>
      </div>
    </div>
  );
}
