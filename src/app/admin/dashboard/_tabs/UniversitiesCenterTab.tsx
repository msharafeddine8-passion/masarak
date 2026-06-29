'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminLog';

// Manages public.universities_global — the pan-Arab / global catalogue (222 rows
// across all countries). The legacy single-country `universities` table (35 LB
// rows, used only by the public Lebanon page) is intentionally NOT managed here.
type Uni = {
  id: number;
  country_code?: string | null;
  name_ar?: string | null;
  name_en?: string | null;
  slug?: string | null;
  city_ar?: string | null;
  city_en?: string | null;
  type?: string | null;
  website?: string | null;
  logo_url?: string | null;
  qs_rank?: number | null;
  the_rank?: number | null;
  student_population?: number | null;
  acceptance_rate?: number | null;
  tuition_min?: number | null;
  tuition_max?: number | null;
  tuition_currency?: string | null;
  description_short_ar?: string | null;
  description_short_en?: string | null;
  status?: string | null;
  last_verified_at?: string | null;
  // derived
  views_30d?: number;
  saves_count?: number;
  completion?: number;
};

type Props = { flash: (m: string) => void };

const FIELDS_FOR_COMPLETION = [
  'name_ar', 'name_en', 'slug', 'city_ar', 'logo_url', 'website', 'type',
  'qs_rank', 'student_population', 'acceptance_rate', 'tuition_min',
  'description_short_ar',
];

export default function UniversitiesCenterTab({ flash }: Props) {
  const [unis, setUnis] = useState<Uni[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'incomplete'>('all');
  const [country, setCountry] = useState('all');
  const [selected, setSelected] = useState<Uni | null>(null);
  const [showInvite, setShowInvite] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from('universities_global')
      .select('*')
      .order('country_code', { ascending: true })
      .order('name_en', { ascending: true })
      .limit(2000);
    if (error) { console.error('[uni]', error); flash('تعذّر تحميل الجامعات: ' + error.message); setLoading(false); return; }

    const list = (data || []) as Uni[];

    // Derive saves count (best-effort)
    const { data: saves } = await supabase
      .from('saved_items')
      .select('entity_id')
      .eq('entity_type', 'university');
    const saveCounts: Record<string, number> = {};
    if (saves) for (const r of saves as { entity_id: string }[]) {
      saveCounts[r.entity_id] = (saveCounts[r.entity_id] || 0) + 1;
    }

    // Derive 30d views (best-effort)
    const since = new Date(Date.now() - 30*24*3600*1000).toISOString();
    const { data: views } = await supabase
      .from('analytics_events')
      .select('entity_id')
      .eq('entity_type', 'university')
      .eq('event_name', 'view_entity')
      .gte('created_at', since);
    const viewCounts: Record<string, number> = {};
    if (views) for (const r of views as { entity_id: string }[]) {
      viewCounts[r.entity_id] = (viewCounts[r.entity_id] || 0) + 1;
    }

    for (const u of list) {
      let filled = 0;
      for (const f of FIELDS_FOR_COMPLETION) {
        const v = (u as unknown as Record<string, unknown>)[f];
        if (v != null && v !== '' && !(Array.isArray(v) && v.length === 0)) filled++;
      }
      u.completion = Math.round((filled / FIELDS_FOR_COMPLETION.length) * 100);
      u.saves_count = saveCounts[String(u.id)] || 0;
      u.views_30d = viewCounts[String(u.id)] || 0;
    }

    setUnis(list);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const countries = useMemo(() => {
    const set = new Set<string>();
    for (const u of unis) if (u.country_code) set.add(u.country_code);
    return Array.from(set).sort();
  }, [unis]);

  const filtered = useMemo(() => {
    let list = unis;
    if (country !== 'all') list = list.filter(u => u.country_code === country);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(u =>
        (u.name_en || '').toLowerCase().includes(q) ||
        (u.name_ar || '').toLowerCase().includes(q) ||
        (u.slug || '').toLowerCase().includes(q) ||
        (u.city_en || '').toLowerCase().includes(q)
      );
    }
    switch (filter) {
      case 'published': list = list.filter(u => u.status === 'published'); break;
      case 'draft': list = list.filter(u => u.status !== 'published'); break;
      case 'incomplete': list = list.filter(u => (u.completion || 0) < 50); break;
    }
    return list;
  }, [unis, search, filter, country]);

  const stats = useMemo(() => ({
    total: unis.length,
    countries: countries.length,
    published: unis.filter(u => u.status === 'published').length,
    avgCompletion: unis.length ? Math.round(unis.reduce((s,u) => s + (u.completion || 0), 0) / unis.length) : 0,
    incomplete: unis.filter(u => (u.completion || 0) < 50).length,
  }), [unis, countries]);

  async function togglePublish(u: Uni) {
    const next = u.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('universities_global').update({ status: next }).eq('id', u.id);
    if (error) { flash('فشل: ' + error.message); return; }
    await logAdminAction({ action: 'university_verify', target_type: 'university_global', target_id: u.id, details: { status: next } });
    flash(next === 'published' ? '✓ تم النشر' : 'تم التحويل لمسودّة');
    load();
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="إجمالي الجامعات" value={stats.total} icon="🏛️" tone="primary" />
        <Stat label="الدول المغطّاة" value={stats.countries} icon="🌍" tone="info" />
        <Stat label="منشورة" value={stats.published} icon="✓" tone="success" />
        <Stat label="متوسط الاكتمال" value={stats.avgCompletion + '%'} icon="📊" tone="info" />
        <Stat label="ناقصة (< 50%)" value={stats.incomplete} icon="⚠️" tone="danger" />
      </div>

      <div className="bg-surface rounded-2xl border-2 border-line p-3 lg:p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث باسم الجامعة أو المدينة..."
            className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border-2 border-line focus:border-primary outline-none text-sm"
          />
          <select value={country} onChange={e => setCountry(e.target.value)}
            className="px-3 py-2 rounded-xl border-2 border-line text-sm font-bold">
            <option value="all">كل الدول</option>
            {countries.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 rounded-xl border-2 border-line text-sm font-bold">
            <option value="all">الكل</option>
            <option value="published">المنشورة</option>
            <option value="draft">مسودّات</option>
            <option value="incomplete">ناقصة (&lt; 50%)</option>
          </select>
          <button onClick={load} className="px-3 py-2 rounded-xl bg-surface border-2 border-line text-sm font-bold">🔄</button>
          <button onClick={() => setShowInvite(true)} className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark">
            📤 إرسال دعوة لمؤسسة
          </button>
        </div>

        <div className="text-xs text-ink-muted mb-2">عرض {filtered.length} من {stats.total}</div>

        {loading ? (
          <div className="space-y-2">{[...Array(6)].map((_,i) => <div key={i} className="h-16 bg-bg-soft animate-pulse rounded-xl" />)}</div>
        ) : (
          <div className="space-y-2">
            {filtered.slice(0, 200).map(u => <UniRow key={u.id} u={u} onOpen={() => setSelected(u)} onPublish={togglePublish} />)}
            {filtered.length > 200 && (
              <div className="text-xs text-ink-muted mt-3 text-center">عرض 200 من {filtered.length} — استعمل البحث/الفلتر للتصفية</div>
            )}
          </div>
        )}
      </div>

      {selected && <UniDrawer u={selected} onClose={() => setSelected(null)} flash={flash} reload={load} />}
      {showInvite && <InviteOrgPanel onClose={() => setShowInvite(false)} flash={flash} defaultOrgType="university" />}
    </div>
  );
}

function Stat({ label, value, icon, tone }: { label: string; value: number | string; icon: string; tone: 'primary' | 'success' | 'warn' | 'info' | 'danger' }) {
  const colors = {
    primary: 'from-blue-50 to-indigo-50',
    success: 'from-emerald-50 to-teal-50',
    warn:    'from-amber-50 to-yellow-50',
    info:    'from-purple-50 to-pink-50',
    danger:  'from-rose-50 to-red-50',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[tone]} rounded-2xl border border-white/40 p-4`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1 font-bold">{label}</div>
    </div>
  );
}

function UniRow({ u, onOpen, onPublish }: { u: Uni; onOpen: () => void; onPublish: (u: Uni) => void }) {
  const comp = u.completion || 0;
  const compTone = comp >= 80 ? 'bg-emerald-500' : comp >= 50 ? 'bg-amber-500' : 'bg-rose-500';
  const rank = u.qs_rank || u.the_rank;
  return (
    <div className="border border-line rounded-xl p-3 hover:border-primary/30 hover:bg-mint-pale/20">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-lg bg-bg-soft flex items-center justify-center text-2xl shrink-0 overflow-hidden">
          {u.logo_url ? <img src={u.logo_url} alt="" className="w-full h-full object-contain" /> : '🏛️'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-extrabold">{u.name_ar || u.name_en || `Uni #${u.id}`}</span>
            {u.country_code && <span className="text-xs px-2 py-0.5 rounded-full bg-bg-soft text-ink-muted font-bold">{u.country_code}</span>}
            {u.status === 'published'
              ? <span className="text-xs text-emerald-600 font-bold">✓ منشورة</span>
              : <span className="text-xs text-amber-600 font-bold">✎ مسودّة</span>}
            {rank && <span className="text-xs text-ink-muted">#{rank}</span>}
          </div>
          <div className="text-xs text-ink-muted mt-1">
            {u.city_ar || u.city_en || '—'} · مشاهدات (30 يوم): {u.views_30d || 0} · حفظ: {u.saves_count || 0}
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-bg-soft rounded-full overflow-hidden">
              <div className={`h-full ${compTone}`} style={{ width: comp + '%' }} />
            </div>
            <span className="text-xs font-bold text-ink-muted w-10 text-left">{comp}%</span>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <button onClick={onOpen} className="text-xs font-bold bg-primary text-white px-3 py-1.5 rounded-lg hover:bg-primary-dark">عرض/تعديل</button>
          <button onClick={() => onPublish(u)} className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg" title="نشر/مسودّة">
            {u.status === 'published' ? '↩︎ مسودّة' : '✓ نشر'}
          </button>
        </div>
      </div>
    </div>
  );
}

function UniDrawer({ u, onClose, flash, reload }: { u: Uni; onClose: () => void; flash: (m: string) => void; reload: () => void }) {
  const [form, setForm] = useState({
    name_ar: u.name_ar || '',
    name_en: u.name_en || '',
    slug: u.slug || '',
    city_ar: u.city_ar || '',
    city_en: u.city_en || '',
    website: u.website || '',
    logo_url: u.logo_url || '',
    tuition_min: u.tuition_min ?? '',
    tuition_max: u.tuition_max ?? '',
    acceptance_rate: u.acceptance_rate ?? '',
    description_short_ar: u.description_short_ar || '',
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    const patch: Record<string, unknown> = {
      name_ar: form.name_ar || null,
      name_en: form.name_en || null,
      slug: form.slug || null,
      city_ar: form.city_ar || null,
      city_en: form.city_en || null,
      website: form.website || null,
      logo_url: form.logo_url || null,
      tuition_min: form.tuition_min === '' ? null : Number(form.tuition_min),
      tuition_max: form.tuition_max === '' ? null : Number(form.tuition_max),
      acceptance_rate: form.acceptance_rate === '' ? null : Number(form.acceptance_rate),
      description_short_ar: form.description_short_ar || null,
      last_verified_at: new Date().toISOString(),
    };
    const { error } = await supabase.from('universities_global').update(patch).eq('id', u.id);
    if (error) {
      flash('فشل الحفظ: ' + error.message);
    } else {
      await logAdminAction({ action: 'university_update', target_type: 'university_global', target_id: u.id, details: patch });
      flash('✓ تم الحفظ');
      reload();
      onClose();
    }
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end lg:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-surface border-b border-line p-4 flex items-center justify-between">
          <h3 className="font-extrabold text-lg">{u.name_ar || u.name_en} · {u.country_code} · #{u.id}</h3>
          <button onClick={onClose} className="text-2xl text-ink-muted">×</button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <Inp label="الاسم بالعربي" v={form.name_ar} on={x => setForm({ ...form, name_ar: x })} />
          <Inp label="Name (EN)" v={form.name_en} on={x => setForm({ ...form, name_en: x })} />
          <Inp label="Slug" v={form.slug} on={x => setForm({ ...form, slug: x })} />
          <Inp label="المدينة (عربي)" v={form.city_ar} on={x => setForm({ ...form, city_ar: x })} />
          <Inp label="City (EN)" v={form.city_en} on={x => setForm({ ...form, city_en: x })} />
          <Inp label="الموقع الإلكتروني" v={form.website} on={x => setForm({ ...form, website: x })} />
          <Inp label="Logo URL" v={form.logo_url} on={x => setForm({ ...form, logo_url: x })} />
          <Inp label="الرسوم (أدنى)" v={String(form.tuition_min)} on={x => setForm({ ...form, tuition_min: x as unknown as number })} />
          <Inp label="الرسوم (أعلى)" v={String(form.tuition_max)} on={x => setForm({ ...form, tuition_max: x as unknown as number })} />
          <Inp label="معدل القبول %" v={String(form.acceptance_rate)} on={x => setForm({ ...form, acceptance_rate: x as unknown as number })} />
          <div>
            <label className="text-xs font-bold text-ink-muted block mb-1">وصف مختصر (عربي)</label>
            <textarea value={form.description_short_ar} onChange={e => setForm({ ...form, description_short_ar: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-xl border-2 border-line focus:border-primary outline-none" />
          </div>

          <div className="flex gap-2 pt-3 border-t border-line">
            <button disabled={busy} onClick={save} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark disabled:opacity-50">
              {busy ? 'جاري الحفظ...' : '💾 حفظ التغييرات'}
            </button>
            <button onClick={onClose} className="px-4 py-2.5 rounded-xl bg-bg-soft font-bold hover:bg-bg-soft">إلغاء</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Inp({ label, v, on }: { label: string; v: string; on: (x: string) => void }) {
  return (
    <div>
      <label className="text-xs font-bold text-ink-muted block mb-1">{label}</label>
      <input value={v ?? ''} onChange={e => on(e.target.value)} className="w-full px-3 py-2 rounded-xl border-2 border-line focus:border-primary outline-none" />
    </div>
  );
}

// ─── Invite Org modal (embedded inside admin — no separate page needed) ─────
type InviteFormProps = { onClose: () => void; flash: (m: string) => void; defaultOrgType: 'university' | 'school' | 'sponsor' };
function InviteOrgPanel({ onClose, flash, defaultOrgType }: InviteFormProps) {
  const [email, setEmail] = useState('');
  const [orgHint, setOrgHint] = useState('');
  const [orgType, setOrgType] = useState<'university' | 'school' | 'sponsor'>(defaultOrgType);
  const [role, setRole] = useState<'owner' | 'editor'>('owner');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<string | null>(null);

  async function send() {
    if (!email.trim()) { flash('الإيميل مطلوب'); return; }
    setBusy(true);
    const { data, error } = await supabase
      .from('org_invites')
      .insert({ email: email.trim(), org_type: orgType, org_hint: orgHint || null, role, message: message || null })
      .select('token')
      .single();
    if (error) {
      flash('فشل: ' + error.message);
    } else {
      const url = `${window.location.origin}/org/redeem?token=${(data as { token: string }).token}`;
      setLink(url);
      await logAdminAction({ action: 'invite_create', target_type: 'org_invite', target_id: (data as { token: string }).token, details: { email, orgType, role } });
      try { await navigator.clipboard.writeText(url); flash('✓ تم نسخ رابط الدعوة'); }
      catch { flash('✓ تم إنشاء الدعوة'); }
    }
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end lg:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-3xl max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <div className="border-b border-line p-4 flex items-center justify-between">
          <h3 className="font-extrabold text-lg">📤 إرسال دعوة لمؤسسة</h3>
          <button onClick={onClose} className="text-2xl text-ink-muted">×</button>
        </div>
        <div className="p-6 space-y-3 text-sm">
          <Inp label="إيميل الشخص المستلم" v={email} on={setEmail} />
          <Inp label="اسم المؤسسة (مثلاً AUB)" v={orgHint} on={setOrgHint} />
          <div>
            <label className="text-xs font-bold text-ink-muted block mb-1">نوع المؤسسة</label>
            <select value={orgType} onChange={e => setOrgType(e.target.value as typeof orgType)} className="w-full px-3 py-2 rounded-xl border-2 border-line">
              <option value="university">جامعة</option>
              <option value="school">مدرسة</option>
              <option value="sponsor">راعي/شريك</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-ink-muted block mb-1">الدور</label>
            <select value={role} onChange={e => setRole(e.target.value as 'owner' | 'editor')} className="w-full px-3 py-2 rounded-xl border-2 border-line">
              <option value="owner">مالك (Owner)</option>
              <option value="editor">محرّر (Editor)</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-bold text-ink-muted block mb-1">رسالة (اختيارية)</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={2} className="w-full px-3 py-2 rounded-xl border-2 border-line focus:border-primary outline-none" />
          </div>

          {link && (
            <div className="bg-emerald-50 border-2 border-emerald-100 rounded-xl p-3">
              <div className="font-bold text-emerald-800 text-sm mb-1">✓ تم إنشاء الدعوة. ابعت هاد الرابط:</div>
              <code className="block text-xs bg-surface p-2 rounded border border-emerald-200 break-all">{link}</code>
            </div>
          )}

          <button disabled={busy} onClick={send} className="w-full py-2.5 rounded-xl bg-primary text-white font-bold hover:bg-primary-dark disabled:opacity-50">
            {busy ? 'جاري الإنشاء...' : 'إنشاء الدعوة + نسخ الرابط'}
          </button>
        </div>
      </div>
    </div>
  );
}
