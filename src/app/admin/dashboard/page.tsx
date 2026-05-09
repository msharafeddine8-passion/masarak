'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

type V = 'home' | 'unis' | 'schol' | 'users' | 'media' | 'cfg';
interface U { id: number; s: string; n: string; r: string; t: string; f: number }
interface S { id: number; n: string; o: string; d: string; st: 'open' | 'soon' | 'closed' }
interface M { name: string; sz: string; u: string; created: string }

const SU: U[] = [
  { id: 1, s: 'AUB', n: 'الجامعة الأمريكية في بيروت', r: 'بيروت', t: 'خاصة', f: 16000 },
  { id: 2, s: 'LAU', n: 'الجامعة اللبنانية الأمريكية', r: 'بيروت وبيبلوس', t: 'خاصة', f: 12000 },
  { id: 3, s: 'USJ', n: 'جامعة القديس يوسف', r: 'بيروت', t: 'خاصة', f: 4000 },
];
const SS: S[] = [
  { id: 1, n: 'منحة AUB Need-Based', o: 'AUB', d: '2027-02-28', st: 'open' },
  { id: 2, n: 'منحة الحريري', o: 'مؤسسة الحريري', d: '2026-09-15', st: 'soon' },
];

export default function AdminDashboard() {
  const [v, setV] = useState<V>('home');
  const [unis, setU] = useState<U[]>(SU);
  const [sch, setS] = useState<S[]>(SS);
  const [media, setM] = useState<M[]>([]);
  const [name, setN] = useState('مسارك');
  const [email, setE] = useState('info@masaraklb.com');
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const u = localStorage.getItem('a_u'); if (u) setU(JSON.parse(u));
      const s = localStorage.getItem('a_s'); if (s) setS(JSON.parse(s));
      const c = localStorage.getItem('a_c'); if (c) { const x = JSON.parse(c); if (x.n) setN(x.n); if (x.e) setE(x.e); }
    } catch {}
  }, []);

  const save = (k: string, val: any) => {
    if (typeof window !== 'undefined') localStorage.setItem(k, JSON.stringify(val));
    setMsg('✓ تم الحفظ');
    setTimeout(() => setMsg(''), 2000);
  };

  const nav: Array<{ id: V; l: string; i: string; b?: number }> = [
    { id: 'home', l: 'نظرة عامة', i: '📊' },
    { id: 'unis', l: 'الجامعات', i: '🏛️', b: unis.length },
    { id: 'schol', l: 'المنح', i: '🏆', b: sch.length },
    { id: 'users', l: 'المستخدمون', i: '👥' },
    { id: 'media', l: 'مكتبة الصور', i: '🖼️', b: media.length },
    { id: 'cfg', l: 'الإعدادات', i: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex" dir="rtl">
      <aside className="w-64 bg-[#1b3a6b] text-white flex-shrink-0 sticky top-0 h-screen overflow-y-auto">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-white/15 rounded-lg flex items-center justify-center text-lg font-bold">م</div>
            <div><div className="font-bold">لوحة الإدارة</div><div className="text-[10px] opacity-70">Admin Panel</div></div>
          </Link>
        </div>
        <nav className="p-3">
          {nav.map(s => (
            <button key={s.id} onClick={() => setV(s.id)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-semibold transition ${v === s.id ? 'bg-white text-[#1b3a6b]' : 'hover:bg-white/10'}`}>
              <span className="text-lg">{s.i}</span><span className="flex-1 text-right">{s.l}</span>
              {s.b !== undefined && <span className={`text-xs px-2 py-0.5 rounded-full ${v === s.id ? 'bg-[#1b3a6b]/10' : 'bg-white/15'}`}>{s.b}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 mt-4">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-sm"><span>🏠</span><span>عودة للموقع</span></Link>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-[#1b3a6b]">{nav.find(s => s.id === v)?.i} {nav.find(s => s.id === v)?.l}</h1>
          {msg && <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold">{msg}</span>}
        </div>

        {v === 'home' && (
          <div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
              {[['🏛️', 'الجامعات', unis.length, 'bg-blue-50', 'unis' as V], ['🏆', 'المنح', sch.length, 'bg-amber-50', 'schol' as V], ['🖼️', 'الصور', media.length, 'bg-purple-50', 'media' as V], ['👥', 'المستخدمون', 1, 'bg-emerald-50', 'users' as V]].map(([i, l, n, c, t], idx) => (
                <button key={idx} onClick={() => setV(t as V)} className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md hover:border-[#1b3a6b]/30 transition text-right">
                  <div className={`w-12 h-12 ${c} rounded-xl flex items-center justify-center text-2xl mb-3`}>{i as string}</div>
                  <div className="text-3xl font-extrabold text-slate-800 mb-1">{n as number}</div>
                  <div className="text-sm text-slate-500 font-semibold">{l as string}</div>
                </button>
              ))}
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="font-bold text-lg mb-4 text-[#1b3a6b]">آخر النشاطات</h3>
                <div className="space-y-3 text-sm">
                  {[['✅', 'الصور صارت تنحفظ على Supabase Storage', 'الآن'], ['🔒', 'تفعيل حماية admin بالإيميل', 'منذ 5د'], ['🎨', 'تنظيف branding من الجذر', 'منذ ساعة'], ['📱', 'ربط masaraklb.com بـ Vercel', 'منذ ساعتين']].map(([i, t, tm], idx) => (
                    <div key={idx} className="flex items-center gap-3 pb-3 border-b border-slate-100 last:border-0">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center">{i}</div>
                      <div className="flex-1 text-slate-700">{t}</div>
                      <div className="text-xs text-slate-400">{tm}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-2xl p-6 border border-slate-100">
                <h3 className="font-bold text-lg mb-4 text-[#1b3a6b]">إجراءات سريعة</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[['🏛️', 'إضافة جامعة', 'unis' as V], ['🏆', 'إضافة منحة', 'schol' as V], ['🖼️', 'رفع صورة', 'media' as V], ['⚙️', 'إعدادات', 'cfg' as V]].map(([i, l, t], idx) => (
                    <button key={idx} onClick={() => setV(t as V)} className="bg-slate-50 hover:bg-[#1b3a6b]/5 hover:border-[#1b3a6b]/30 border-2 border-slate-100 p-4 rounded-xl text-center transition">
                      <div className="text-3xl mb-2">{i}</div><div className="text-sm font-semibold text-slate-700">{l}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {v === 'unis' && <Unis unis={unis} setU={(x) => { setU(x); save('a_u', x); }} />}
        {v === 'schol' && <Schol items={sch} setS={(x) => { setS(x); save('a_s', x); }} />}
        {v === 'users' && <Users />}
        {v === 'media' && <Media media={media} setM={setM} />}
        {v === 'cfg' && <Cfg n={name} setN={setN} e={email} setE={setE} onSave={() => save('a_c', { n: name, e: email })} />}
      </main>
    </div>
  );
}

function Unis({ unis, setU }: { unis: U[]; setU: (u: U[]) => void }) {
  const [d, setD] = useState<Partial<U>>({});
  const [edit, setEdit] = useState<number | null>(null);
  const save = () => {
    if (!d.s || !d.n) return;
    if (edit !== null) setU(unis.map(u => u.id === edit ? { ...u, ...d } as U : u));
    else { const id = Math.max(0, ...unis.map(u => u.id)) + 1; setU([...unis, { id, s: d.s!, n: d.n!, r: d.r || '', t: d.t || 'خاصة', f: Number(d.f) || 0 }]); }
    setD({}); setEdit(null);
  };
  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-right font-bold">الاختصار</th><th className="px-4 py-3 text-right font-bold">الاسم</th><th className="px-4 py-3 text-right font-bold">المنطقة</th><th className="px-4 py-3 text-right font-bold">النوع</th><th className="px-4 py-3 text-right font-bold">الرسوم</th><th className="px-4 py-3 text-center font-bold">الإجراءات</th></tr></thead>
          <tbody>
            {unis.map(u => (
              <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-bold">{u.s}</td><td className="px-4 py-3">{u.n}</td><td className="px-4 py-3 text-slate-600">{u.r}</td>
                <td className="px-4 py-3"><span className="text-xs bg-slate-100 px-2 py-1 rounded">{u.t}</span></td>
                <td className="px-4 py-3 font-semibold">{u.f ? '+' + u.f.toLocaleString() + '$' : '-'}</td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => { setD(u); setEdit(u.id); }} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-xs font-semibold ml-2">تعديل</button>
                  <button onClick={() => { if (confirm('متأكّد؟')) setU(unis.filter(x => x.id !== u.id)); }} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-xs font-semibold">حذف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-[#1b3a6b]/20">
        <h3 className="font-bold text-lg mb-4 text-[#1b3a6b]">{edit !== null ? 'تعديل جامعة' : 'إضافة جامعة جديدة'}</h3>
        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <input value={d.s || ''} onChange={(e) => setD({ ...d, s: e.target.value })} placeholder="الاختصار" className="px-4 py-2.5 border border-slate-200 rounded-lg" />
          <input value={d.n || ''} onChange={(e) => setD({ ...d, n: e.target.value })} placeholder="الاسم الكامل" className="px-4 py-2.5 border border-slate-200 rounded-lg" />
          <input value={d.r || ''} onChange={(e) => setD({ ...d, r: e.target.value })} placeholder="المنطقة" className="px-4 py-2.5 border border-slate-200 rounded-lg" />
          <select value={d.t || ''} onChange={(e) => setD({ ...d, t: e.target.value })} className="px-4 py-2.5 border border-slate-200 rounded-lg bg-white"><option value="">-- النوع --</option><option value="خاصة">خاصة</option><option value="حكومية">حكومية</option></select>
          <input type="number" value={d.f || ''} onChange={(e) => setD({ ...d, f: Number(e.target.value) })} placeholder="الرسوم بالدولار" className="px-4 py-2.5 border border-slate-200 rounded-lg" />
        </div>
        <div className="flex gap-2">
          <button onClick={save} className="px-6 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold hover:bg-[#142d54]">{edit !== null ? 'حفظ التعديل' : '+ إضافة'}</button>
          {edit !== null && <button onClick={() => { setD({}); setEdit(null); }} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold">إلغاء</button>}
        </div>
      </div>
    </div>
  );
}

function Schol({ items, setS }: { items: S[]; setS: (x: S[]) => void }) {
  const [d, setD] = useState<Partial<S>>({ st: 'open' });
  const add = () => {
    if (!d.n) return;
    const id = Math.max(0, ...items.map(s => s.id)) + 1;
    setS([...items, { id, n: d.n!, o: d.o || '', d: d.d || '', st: (d.st as any) || 'open' } as any]);
    setD({ st: 'open' });
  };
  const stColor = (st: string) => st === 'open' ? 'bg-emerald-100 text-emerald-700' : st === 'soon' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-600';
  const stLabel = (st: string) => st === 'open' ? 'مفتوحة' : st === 'soon' ? 'قريباً' : 'مغلقة';
  return (
    <div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-right font-bold">الاسم</th><th className="px-4 py-3 text-right font-bold">الجهة</th><th className="px-4 py-3 text-right font-bold">الموعد</th><th className="px-4 py-3 text-right font-bold">الحالة</th><th className="px-4 py-3"></th></tr></thead>
          <tbody>
            {items.map(s => (
              <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold">{s.n}</td><td className="px-4 py-3 text-slate-600">{s.o}</td><td className="px-4 py-3">{s.d}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-1 rounded font-semibold ${stColor(s.st)}`}>{stLabel(s.st)}</span></td>
                <td className="px-4 py-3 text-center"><button onClick={() => setS(items.filter(x => x.id !== s.id))} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-xs font-semibold">حذف</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-[#1b3a6b]/20">
        <h3 className="font-bold text-lg mb-4 text-[#1b3a6b]">إضافة منحة</h3>
        <div className="grid md:grid-cols-4 gap-3 mb-4">
          <input value={d.n || ''} onChange={(e) => setD({ ...d, n: e.target.value })} placeholder="اسم المنحة" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <input value={d.o || ''} onChange={(e) => setD({ ...d, o: e.target.value })} placeholder="الجهة" className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <input type="date" value={d.d || ''} onChange={(e) => setD({ ...d, d: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          <select value={d.st} onChange={(e) => setD({ ...d, st: e.target.value as any })} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white"><option value="open">مفتوحة</option><option value="soon">قريباً</option><option value="closed">مغلقة</option></select>
        </div>
        <button onClick={add} className="px-6 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">+ إضافة منحة</button>
      </div>
    </div>
  );
}

function Users() {
  return (
    <div>
      <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-900">ℹ️ المستخدمون يجي عرضهم من Supabase Auth. للربط الحقيقي احتاج Supabase service role key.</div>
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr><th className="px-4 py-3 text-right font-bold">البريد</th><th className="px-4 py-3 text-right font-bold">الدور</th><th className="px-4 py-3 text-right font-bold">التسجيل</th></tr></thead>
          <tbody><tr className="border-t border-slate-100"><td className="px-4 py-3 font-mono text-xs">msharafeddine8@gmail.com</td><td className="px-4 py-3"><span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded font-semibold">admin</span></td><td className="px-4 py-3 text-slate-600">2026-05-01</td></tr></tbody>
        </table>
      </div>
    </div>
  );
}

// ========== Media component ربط Supabase Storage ==========
function Media({ media, setM }: { media: M[]; setM: (m: M[]) => void }) {
  const r = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const BUCKET = 'images';

  // عند التحميل: اقرأ قائمة الصور من Supabase Storage
  useEffect(() => {
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadImages = async () => {
    setLoading(true);
    setErr('');
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });
      if (error) throw error;
      const items: M[] = (data || [])
        .filter((f: any) => f.name && !f.name.startsWith('.'))
        .map((f: any) => {
          const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
          const sz = f.metadata?.size ? (f.metadata.size / 1024).toFixed(1) + ' KB' : '—';
          return { name: f.name, sz, u: pub.publicUrl, created: f.created_at || '' };
        });
      setM(items);
    } catch (e: any) {
      setErr('خطأ بقراءة الصور: ' + (e.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = e.target.files;
    if (!fs || fs.length === 0) return;
    setLoading(true);
    setErr('');
    try {
      for (let i = 0; i < fs.length; i++) {
        const f = fs[i];
        // اسم فريد عبر إضافة timestamp
        const ext = f.name.split('.').pop() || 'jpg';
        const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const fileName = `${Date.now()}_${i}_${safeName}`;
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(fileName, f, {
          cacheControl: '3600',
          upsert: false,
        });
        if (upErr) throw upErr;
      }
      await loadImages();
    } catch (e: any) {
      setErr('خطأ بالرفع: ' + (e.message || 'تأكد إنك مسجّل دخول'));
    } finally {
      setLoading(false);
      if (r.current) r.current.value = '';
    }
  };

  const remove = async (name: string) => {
    if (!confirm(`متأكّد بدّك تحذف "${name}"؟`)) return;
    setLoading(true);
    setErr('');
    try {
      const { error } = await supabase.storage.from(BUCKET).remove([name]);
      if (error) throw error;
      await loadImages();
    } catch (e: any) {
      setErr('خطأ بالحذف: ' + (e.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const copyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert('✓ تم نسخ الرابط');
    } catch {
      prompt('انسخ الرابط:', url);
    }
  };

  return (
    <div>
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-6 text-sm text-emerald-900">
        ✅ الصور تُحفظ على <strong>Supabase Storage</strong> (bucket: <code>images</code>) — متاحة دائماً ومن أي جهاز.
      </div>

      {err && (
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 text-sm text-red-900">
          ❌ {err}
        </div>
      )}

      <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-[#1b3a6b]/30 mb-6 text-center">
        <div className="text-5xl mb-3">🖼️</div>
        <h3 className="font-bold text-lg mb-2 text-[#1b3a6b]">رفع صور جديدة</h3>
        <p className="text-sm text-slate-500 mb-4">JPG, PNG, WEBP — صورة واحدة أو أكثر</p>
        <input ref={r} type="file" accept="image/*" multiple onChange={handle} className="hidden" disabled={loading} />
        <button
          onClick={() => r.current?.click()}
          disabled={loading}
          className="px-6 py-3 bg-[#1b3a6b] text-white rounded-lg font-bold hover:bg-[#142d54] disabled:opacity-50"
        >
          {loading ? '⏳ جاري المعالجة...' : '+ اختر صور'}
        </button>
      </div>

      {loading && media.length === 0 ? (
        <div className="text-center text-slate-400 py-12">⏳ جاري التحميل...</div>
      ) : media.length > 0 ? (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((m) => (
            <div key={m.name} className="bg-white rounded-xl border border-slate-100 overflow-hidden group">
              <div className="aspect-video bg-slate-100 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.u} alt={m.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => remove(m.name)}
                  className="absolute top-2 left-2 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                  title="حذف"
                >
                  ×
                </button>
              </div>
              <div className="p-3">
                <div className="font-semibold text-sm truncate" title={m.name}>{m.name}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                  <span>{m.sz}</span>
                  <button onClick={() => copyUrl(m.u)} className="text-[#1b3a6b] hover:underline font-semibold">نسخ الرابط</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-400 py-12">لا توجد صور بعد — ارفع أول صورة!</div>
      )}
    </div>
  );
}

function Cfg({ n, setN, e, setE, onSave }: { n: string; setN: (v: string) => void; e: string; setE: (v: string) => void; onSave: () => void }) {
  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl p-6 border border-slate-100 mb-6">
        <h3 className="font-bold text-lg mb-4 text-[#1b3a6b]">إعدادات الموقع</h3>
        <div className="space-y-4">
          <div><label className="block text-sm font-semibold mb-1.5">اسم الموقع</label><input value={n} onChange={(ev) => setN(ev.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" /></div>
          <div><label className="block text-sm font-semibold mb-1.5">بريد التواصل</label><input type="email" value={e} onChange={(ev) => setE(ev.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg" /></div>
          <button onClick={onSave} className="px-6 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold hover:bg-[#142d54]">حفظ التغييرات</button>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-6 border border-slate-100">
        <h3 className="font-bold text-lg mb-4 text-[#1b3a6b]">معلومات النظام</h3>
        <dl className="text-sm space-y-2">
          <div className="flex justify-between border-b border-slate-100 py-2"><dt className="text-slate-500">الإصدار</dt><dd className="font-semibold">v1.0.0</dd></div>
          <div className="flex justify-between border-b border-slate-100 py-2"><dt className="text-slate-500">الإطار</dt><dd className="font-semibold">Next.js 14.2</dd></div>
          <div className="flex justify-between border-b border-slate-100 py-2"><dt className="text-slate-500">قاعدة البيانات</dt><dd className="font-semibold">Supabase</dd></div>
          <div className="flex justify-between py-2"><dt className="text-slate-500">المنظمة</dt><dd className="font-semibold">مسارك</dd></div>
        </dl>
      </div>
    </div>
  );
}
