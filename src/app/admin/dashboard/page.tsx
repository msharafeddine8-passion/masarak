'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import {
  fetchUniversities, saveUniversity, deleteUniversity, seedUniversities,
  fetchSchools, saveSchool, deleteSchool, seedSchools,
  fetchTracks, saveTrack, deleteTrack, seedTracks,
  fetchInstitutes, saveInstitute, deleteInstitute, seedInstitutes,
} from '@/lib/entities';

type V = 'home' | 'unis' | 'schools' | 'tracks' | 'institutes' | 'media' | 'cfg';
interface M { name: string; sz: string; u: string; created: string }

export default function AdminDashboard() {
  const [v, setV] = useState<V>('home');
  const [msg, setMsg] = useState('');

  // Counts for nav badges
  const [counts, setCounts] = useState({ unis: 0, schools: 0, tracks: 0, institutes: 0, media: 0 });

  const refreshCounts = async () => {
    const [u, s, t, i] = await Promise.all([fetchUniversities(), fetchSchools(), fetchTracks(), fetchInstitutes()]);
    setCounts((c) => ({ ...c, unis: u.length, schools: s.length, tracks: t.length, institutes: i.length }));
  };

  useEffect(() => { refreshCounts(); }, []);

  const flash = (m: string) => { setMsg(m); setTimeout(() => setMsg(''), 2500); };

  const nav: Array<{ id: V; l: string; i: string; b?: number }> = [
    { id: 'home', l: 'نظرة عامة', i: '📊' },
    { id: 'unis', l: 'الجامعات', i: '🏛️', b: counts.unis },
    { id: 'schools', l: 'المدارس', i: '🏫', b: counts.schools },
    { id: 'tracks', l: 'المسارات المهنية', i: '🛠️', b: counts.tracks },
    { id: 'institutes', l: 'المعاهد المهنية', i: '🏭', b: counts.institutes },
    { id: 'media', l: 'مكتبة الصور', i: '🖼️', b: counts.media },
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
          {nav.map((s) => (
            <button
              key={s.id}
              onClick={() => setV(s.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1 text-sm font-semibold transition ${
                v === s.id ? 'bg-white text-[#1b3a6b]' : 'hover:bg-white/10'
              }`}
            >
              <span className="text-lg">{s.i}</span>
              <span className="flex-1 text-right">{s.l}</span>
              {s.b !== undefined && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${v === s.id ? 'bg-[#1b3a6b]/10' : 'bg-white/15'}`}>{s.b}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10 mt-4">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 text-sm">
            <span>🏠</span><span>عودة للموقع</span>
          </Link>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-x-hidden">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-extrabold text-[#1b3a6b]">
            {nav.find((s) => s.id === v)?.i} {nav.find((s) => s.id === v)?.l}
          </h1>
          {msg && <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold">{msg}</span>}
        </div>

        {v === 'home' && <HomeTab counts={counts} onNavigate={setV} />}
        {v === 'unis' && <UnisTab onChange={refreshCounts} flash={flash} />}
        {v === 'schools' && <SchoolsTab onChange={refreshCounts} flash={flash} />}
        {v === 'tracks' && <TracksTab onChange={refreshCounts} flash={flash} />}
        {v === 'institutes' && <InstitutesTab onChange={refreshCounts} flash={flash} />}
        {v === 'media' && <MediaTab onCount={(n) => setCounts((c) => ({ ...c, media: n }))} />}
        {v === 'cfg' && <CfgTab />}
      </main>
    </div>
  );
}

// ============= HOME =============
function HomeTab({ counts, onNavigate }: { counts: any; onNavigate: (v: V) => void }) {
  return (
    <div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[
          ['🏛️', 'الجامعات', counts.unis, 'bg-blue-50', 'unis' as V],
          ['🏫', 'المدارس', counts.schools, 'bg-emerald-50', 'schools' as V],
          ['🛠️', 'المسارات المهنية', counts.tracks, 'bg-amber-50', 'tracks' as V],
          ['🏭', 'المعاهد', counts.institutes, 'bg-purple-50', 'institutes' as V],
        ].map(([i, l, n, c, t], idx) => (
          <button
            key={idx}
            onClick={() => onNavigate(t as V)}
            className="bg-white rounded-2xl p-5 border border-slate-100 hover:shadow-md hover:border-[#1b3a6b]/30 transition text-right"
          >
            <div className={`w-12 h-12 ${c} rounded-xl flex items-center justify-center text-2xl mb-3`}>{i as string}</div>
            <div className="text-3xl font-extrabold text-slate-800 mb-1">{n as number}</div>
            <div className="text-sm text-slate-500 font-semibold">{l as string}</div>
          </button>
        ))}
      </div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-sm text-emerald-900">
        <div className="font-bold mb-2">✅ كل الكيانات مربوطة بـ Supabase</div>
        <p>أي تعديل/إضافة/حذف بيتحفظ مباشرة على قاعدة البيانات وبيظهر فوراً على الموقع.</p>
        <p className="mt-2">إذا الجداول فاضية، اضغط زر <strong>"استيراد البيانات الأولية"</strong> داخل كل tab مرة وحدة.</p>
      </div>
    </div>
  );
}

// ============= GENERIC LIST/EDIT MODAL HELPERS =============
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}
function Input(p: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...p} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />;
}
function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...p} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm min-h-[80px]" />;
}
function Select({ children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...p} className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm">{children}</select>;
}

// ============= UNIVERSITIES TAB =============
function UnisTab({ onChange, flash }: { onChange: () => void; flash: (m: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => { setLoading(true); setItems(await fetchUniversities() as any); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing.name || !editing.short) { flash('❌ الاسم والاختصار مطلوبين'); return; }
    const { error } = await saveUniversity(editing);
    if (error) { flash('❌ ' + error.message); return; }
    flash('✓ تم الحفظ');
    setEditing(null);
    await load();
    onChange();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('متأكد بدّك تحذف هذه الجامعة؟')) return;
    const { error } = await deleteUniversity(id);
    if (error) { flash('❌ ' + error.message); return; }
    flash('✓ تم الحذف');
    await load();
    onChange();
  };

  const handleSeed = async () => {
    if (!confirm('استيراد كل البيانات الأولية (22 جامعة)؟')) return;
    const { error } = await seedUniversities();
    if (error) { flash('❌ ' + error.message); return; }
    flash('✓ تم الاستيراد');
    await load();
    onChange();
  };

  const filtered = items.filter((u) => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.short?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 بحث..." className="flex-1 min-w-[200px] px-4 py-2.5 border border-slate-200 rounded-lg" />
        <button onClick={() => setEditing({ id: 0, name: '', short: '', emoji: '🏛️', region: '', type: 'خاصة', rank: 3, tuitionMin: 0, tuitionMax: 0, lang: '', url: '', majors: [], scholarships: false, acceptance: 50, employRate: 75, desc: '', founded: 2000, students: 1000, faculties: 5, campus: '', accred: '', color: 'from-blue-600 to-blue-800', paths: [] })} className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm">+ جامعة جديدة</button>
        {items.length === 0 && (
          <button onClick={handleSeed} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm">📥 استيراد البيانات الأولية</button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400">⏳ جاري التحميل...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed">
          <div className="text-5xl mb-3">📂</div>
          <p className="text-slate-600 mb-4">الجدول فارغ. اضغط "استيراد البيانات الأولية" لتحميل 22 جامعة من الكود.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-right font-bold">ID</th>
                <th className="px-4 py-3 text-right font-bold">الاسم</th>
                <th className="px-4 py-3 text-right font-bold">الاختصار</th>
                <th className="px-4 py-3 text-right font-bold">المنطقة</th>
                <th className="px-4 py-3 text-right font-bold">النوع</th>
                <th className="px-4 py-3 text-right font-bold">الرسوم</th>
                <th className="px-4 py-3 text-center font-bold">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500 font-mono">{u.id}</td>
                  <td className="px-4 py-3 font-semibold">{u.emoji} {u.name}</td>
                  <td className="px-4 py-3 font-bold">{u.short}</td>
                  <td className="px-4 py-3 text-slate-600">{u.region}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-slate-100 px-2 py-1 rounded">{u.type}</span></td>
                  <td className="px-4 py-3">{u.tuitionMin ? `$${u.tuitionMin.toLocaleString()}–${u.tuitionMax?.toLocaleString()}` : '-'}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button onClick={() => setEditing({ ...u })} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-xs font-semibold ml-2">تعديل</button>
                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-xs font-semibold">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? `تعديل: ${editing.name}` : 'جامعة جديدة'}>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="ID (رقم)"><Input type="number" value={editing.id || ''} onChange={(e) => setEditing({ ...editing, id: Number(e.target.value) })} /></Field>
            <Field label="الاختصار"><Input value={editing.short || ''} onChange={(e) => setEditing({ ...editing, short: e.target.value })} /></Field>
            <Field label="الاسم الكامل"><Input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="إيموجي"><Input value={editing.emoji || ''} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} placeholder="🏛️" /></Field>
            <Field label="المنطقة"><Input value={editing.region || ''} onChange={(e) => setEditing({ ...editing, region: e.target.value })} /></Field>
            <Field label="النوع">
              <Select value={editing.type || ''} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                <option value="خاصة">خاصة</option>
                <option value="حكومية">حكومية</option>
              </Select>
            </Field>
            <Field label="الرسوم الدنيا ($)"><Input type="number" value={editing.tuitionMin || 0} onChange={(e) => setEditing({ ...editing, tuitionMin: Number(e.target.value) })} /></Field>
            <Field label="الرسوم القصوى ($)"><Input type="number" value={editing.tuitionMax || 0} onChange={(e) => setEditing({ ...editing, tuitionMax: Number(e.target.value) })} /></Field>
            <Field label="اللغة"><Input value={editing.lang || ''} onChange={(e) => setEditing({ ...editing, lang: e.target.value })} placeholder="إنجليزي" /></Field>
            <Field label="الموقع الإلكتروني"><Input value={editing.url || ''} onChange={(e) => setEditing({ ...editing, url: e.target.value })} dir="ltr" /></Field>
            <Field label="التصنيف (1-5)"><Input type="number" min={1} max={5} value={editing.rank || 3} onChange={(e) => setEditing({ ...editing, rank: Number(e.target.value) })} /></Field>
            <Field label="منح متاحة">
              <Select value={String(editing.scholarships || false)} onChange={(e) => setEditing({ ...editing, scholarships: e.target.value === 'true' })}>
                <option value="true">نعم</option>
                <option value="false">لا</option>
              </Select>
            </Field>
            <Field label="معدل القبول %"><Input type="number" value={editing.acceptance || 0} onChange={(e) => setEditing({ ...editing, acceptance: Number(e.target.value) })} /></Field>
            <Field label="معدل التوظيف %"><Input type="number" value={editing.employRate || 0} onChange={(e) => setEditing({ ...editing, employRate: Number(e.target.value) })} /></Field>
            <Field label="سنة التأسيس"><Input type="number" value={editing.founded || ''} onChange={(e) => setEditing({ ...editing, founded: Number(e.target.value) })} /></Field>
            <Field label="عدد الطلاب"><Input type="number" value={editing.students || 0} onChange={(e) => setEditing({ ...editing, students: Number(e.target.value) })} /></Field>
            <Field label="عدد الكليات"><Input type="number" value={editing.faculties || 0} onChange={(e) => setEditing({ ...editing, faculties: Number(e.target.value) })} /></Field>
            <Field label="الحرم الجامعي"><Input value={editing.campus || ''} onChange={(e) => setEditing({ ...editing, campus: e.target.value })} /></Field>
            <Field label="الاعتماد"><Input value={editing.accred || ''} onChange={(e) => setEditing({ ...editing, accred: e.target.value })} /></Field>
            <Field label="رابط الصورة"><Input value={editing.photo || ''} onChange={(e) => setEditing({ ...editing, photo: e.target.value })} dir="ltr" placeholder="https://..." /></Field>
          </div>
          <div className="mt-3"><Field label="الوصف"><Textarea value={editing.desc || ''} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} /></Field></div>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <Field label="التخصصات (واحد بكل سطر)"><Textarea value={(editing.majors || []).join('\n')} onChange={(e) => setEditing({ ...editing, majors: e.target.value.split('\n').filter(Boolean) })} /></Field>
            <Field label="المسارات (واحد بكل سطر)"><Textarea value={(editing.paths || []).join('\n')} onChange={(e) => setEditing({ ...editing, paths: e.target.value.split('\n').filter(Boolean) })} /></Field>
          </div>
          <Field label="لون الـ gradient (Tailwind)">
            <Input value={editing.color || ''} onChange={(e) => setEditing({ ...editing, color: e.target.value })} placeholder="from-blue-600 to-blue-800" dir="ltr" />
          </Field>

          <div className="flex gap-2 mt-5 sticky bottom-0 bg-white pt-3">
            <button onClick={handleSave} className="px-6 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">💾 حفظ</button>
            <button onClick={() => setEditing(null)} className="px-6 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold">إلغاء</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============= SCHOOLS TAB =============
function SchoolsTab({ onChange, flash }: { onChange: () => void; flash: (m: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => { setLoading(true); setItems(await fetchSchools() as any); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing.name) { flash('❌ الاسم مطلوب'); return; }
    const { error } = await saveSchool(editing);
    if (error) { flash('❌ ' + error.message); return; }
    flash('✓ تم الحفظ');
    setEditing(null); await load(); onChange();
  };
  const handleDelete = async (id: number) => {
    if (!confirm('متأكد؟')) return;
    const { error } = await deleteSchool(id);
    if (error) { flash('❌ ' + error.message); return; }
    flash('✓ تم الحذف'); await load(); onChange();
  };
  const handleSeed = async () => {
    if (!confirm('استيراد كل المدارس الأولية (30 مدرسة)؟')) return;
    const { error } = await seedSchools();
    if (error) { flash('❌ ' + error.message); return; }
    flash('✓ تم الاستيراد'); await load(); onChange();
  };

  const filtered = items.filter((s) => !search || s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 بحث..." className="flex-1 min-w-[200px] px-4 py-2.5 border border-slate-200 rounded-lg" />
        <button onClick={() => setEditing({ id: 0, name: '', region: '', area: '', type: 'خاصة', curriculum: [], lang: '', feesMin: 0, feesMax: 0, grades: 'KG-12', founded: 2000, students: 500, rating: 3, features: [], desc: '', emoji: '🏫', color: 'from-blue-500 to-blue-700' })} className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm">+ مدرسة جديدة</button>
        {items.length === 0 && <button onClick={handleSeed} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm">📥 استيراد البيانات الأولية</button>}
      </div>

      {loading ? <div className="text-center py-12 text-slate-400">⏳</div> : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed">
          <div className="text-5xl mb-3">📂</div>
          <p className="text-slate-600">الجدول فارغ. استورد البيانات الأولية أو أضف مدرسة يدوياً.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="px-4 py-3 text-right font-bold">ID</th>
              <th className="px-4 py-3 text-right font-bold">الاسم</th>
              <th className="px-4 py-3 text-right font-bold">المنطقة</th>
              <th className="px-4 py-3 text-right font-bold">النوع</th>
              <th className="px-4 py-3 text-right font-bold">الرسوم</th>
              <th className="px-4 py-3 text-center font-bold">الإجراءات</th>
            </tr></thead>
            <tbody>
              {filtered.map((s: any) => (
                <tr key={s.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500 font-mono">{s.id}</td>
                  <td className="px-4 py-3 font-semibold">{s.emoji} {s.name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.region} - {s.area}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-slate-100 px-2 py-1 rounded">{s.type}</span></td>
                  <td className="px-4 py-3">{s.feesMin === 0 ? 'مجاني' : `$${s.feesMin}-${s.feesMax}`}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button onClick={() => setEditing({ ...s })} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-xs font-semibold ml-2">تعديل</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-xs font-semibold">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? `تعديل: ${editing.name}` : 'مدرسة جديدة'}>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="ID"><Input type="number" value={editing.id || ''} onChange={(e) => setEditing({ ...editing, id: Number(e.target.value) })} /></Field>
            <Field label="الاسم"><Input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="المنطقة"><Input value={editing.region || ''} onChange={(e) => setEditing({ ...editing, region: e.target.value })} /></Field>
            <Field label="المنطقة التفصيلية"><Input value={editing.area || ''} onChange={(e) => setEditing({ ...editing, area: e.target.value })} /></Field>
            <Field label="النوع"><Select value={editing.type || ''} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
              <option value="خاصة">خاصة</option><option value="رسمية">رسمية</option><option value="دولية">دولية</option><option value="مهنية">مهنية</option>
            </Select></Field>
            <Field label="اللغة"><Input value={editing.lang || ''} onChange={(e) => setEditing({ ...editing, lang: e.target.value })} /></Field>
            <Field label="الرسوم الدنيا"><Input type="number" value={editing.feesMin || 0} onChange={(e) => setEditing({ ...editing, feesMin: Number(e.target.value) })} /></Field>
            <Field label="الرسوم القصوى"><Input type="number" value={editing.feesMax || 0} onChange={(e) => setEditing({ ...editing, feesMax: Number(e.target.value) })} /></Field>
            <Field label="المراحل"><Input value={editing.grades || ''} onChange={(e) => setEditing({ ...editing, grades: e.target.value })} placeholder="KG-12" /></Field>
            <Field label="سنة التأسيس"><Input type="number" value={editing.founded || ''} onChange={(e) => setEditing({ ...editing, founded: Number(e.target.value) })} /></Field>
            <Field label="عدد الطلاب"><Input type="number" value={editing.students || 0} onChange={(e) => setEditing({ ...editing, students: Number(e.target.value) })} /></Field>
            <Field label="التقييم (1-5)"><Input type="number" min={1} max={5} value={editing.rating || 3} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} /></Field>
            <Field label="إيموجي"><Input value={editing.emoji || ''} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} /></Field>
            <Field label="الهاتف"><Input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} dir="ltr" /></Field>
            <Field label="الموقع"><Input value={editing.website || ''} onChange={(e) => setEditing({ ...editing, website: e.target.value })} dir="ltr" /></Field>
            <Field label="لون الـ gradient"><Input value={editing.color || ''} onChange={(e) => setEditing({ ...editing, color: e.target.value })} placeholder="from-blue-500 to-blue-700" dir="ltr" /></Field>
          </div>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <Field label="المناهج (سطر لكل واحد)"><Textarea value={(editing.curriculum || []).join('\n')} onChange={(e) => setEditing({ ...editing, curriculum: e.target.value.split('\n').filter(Boolean) })} /></Field>
            <Field label="المميزات (سطر لكل واحد)"><Textarea value={(editing.features || []).join('\n')} onChange={(e) => setEditing({ ...editing, features: e.target.value.split('\n').filter(Boolean) })} /></Field>
          </div>
          <Field label="الوصف"><Textarea value={editing.desc || ''} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} /></Field>
          <div className="flex gap-2 mt-5 sticky bottom-0 bg-white pt-3">
            <button onClick={handleSave} className="px-6 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">💾 حفظ</button>
            <button onClick={() => setEditing(null)} className="px-6 py-2.5 bg-slate-100 rounded-lg font-bold">إلغاء</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============= TRACKS TAB =============
function TracksTab({ onChange, flash }: { onChange: () => void; flash: (m: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => { setLoading(true); setItems(await fetchTracks() as any); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing.id || !editing.name) { flash('❌ ID والاسم مطلوبين'); return; }
    const { error } = await saveTrack(editing);
    if (error) { flash('❌ ' + error.message); return; }
    flash('✓ تم الحفظ'); setEditing(null); await load(); onChange();
  };
  const handleDelete = async (id: string) => {
    if (!confirm('متأكد؟')) return;
    const { error } = await deleteTrack(id);
    if (error) { flash('❌ ' + error.message); return; }
    flash('✓'); await load(); onChange();
  };
  const handleSeed = async () => {
    if (!confirm('استيراد كل المسارات الأولية؟')) return;
    const { error } = await seedTracks();
    if (error) { flash('❌ ' + error.message); return; }
    flash('✓ تم الاستيراد'); await load(); onChange();
  };

  const filtered = items.filter((t) => !search || t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="🔍 بحث..." className="flex-1 min-w-[200px] px-4 py-2.5 border border-slate-200 rounded-lg" />
        <button onClick={() => setEditing({ id: '', code: 'BT', name: '', duration: '', level: 'BT', sector: '', desc: '', subjects: [], salaryLB: '', salaryGulf: '', demand: 'متوسط', emoji: '🛠️' })} className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm">+ مسار جديد</button>
        {items.length === 0 && <button onClick={handleSeed} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm">📥 استيراد البيانات الأولية</button>}
      </div>

      {loading ? <div className="text-center py-12">⏳</div> : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed">
          <div className="text-5xl mb-3">📂</div><p className="text-slate-600">الجدول فارغ.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="px-4 py-3 text-right">ID</th><th className="px-4 py-3 text-right">الاسم</th>
              <th className="px-4 py-3 text-right">المستوى</th><th className="px-4 py-3 text-right">القطاع</th>
              <th className="px-4 py-3 text-right">الراتب لبنان</th><th className="px-4 py-3 text-center">الإجراءات</th>
            </tr></thead>
            <tbody>
              {filtered.map((t: any) => (
                <tr key={t.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                  <td className="px-4 py-3 font-semibold">{t.emoji} {t.name}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{t.level}</span></td>
                  <td className="px-4 py-3">{t.sector}</td>
                  <td className="px-4 py-3">{t.salaryLB}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button onClick={() => setEditing({ ...t })} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-xs font-semibold ml-2">تعديل</button>
                    <button onClick={() => handleDelete(t.id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-xs font-semibold">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id && items.find((x: any) => x.id === editing.id) ? 'تعديل مسار' : 'مسار جديد'}>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="ID (مثلاً: bt-elec)"><Input value={editing.id || ''} onChange={(e) => setEditing({ ...editing, id: e.target.value })} dir="ltr" /></Field>
            <Field label="الاسم"><Input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="المستوى"><Select value={editing.level || ''} onChange={(e) => setEditing({ ...editing, level: e.target.value, code: e.target.value })}>
              <option value="LT">LT</option><option value="BT">BT</option><option value="TS">TS</option><option value="licence">إجازة</option>
            </Select></Field>
            <Field label="المدة"><Input value={editing.duration || ''} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} /></Field>
            <Field label="القطاع"><Input value={editing.sector || ''} onChange={(e) => setEditing({ ...editing, sector: e.target.value })} /></Field>
            <Field label="إيموجي"><Input value={editing.emoji || ''} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} /></Field>
            <Field label="الراتب لبنان"><Input value={editing.salaryLB || ''} onChange={(e) => setEditing({ ...editing, salaryLB: e.target.value })} /></Field>
            <Field label="الراتب الخليج"><Input value={editing.salaryGulf || ''} onChange={(e) => setEditing({ ...editing, salaryGulf: e.target.value })} /></Field>
            <Field label="الطلب"><Select value={editing.demand || ''} onChange={(e) => setEditing({ ...editing, demand: e.target.value })}>
              <option value="عالٍ جداً">عالٍ جداً</option><option value="عالٍ">عالٍ</option><option value="متوسط">متوسط</option><option value="منخفض">منخفض</option>
            </Select></Field>
            <Field label="معادلة جامعية"><Input value={editing.uniEquiv || ''} onChange={(e) => setEditing({ ...editing, uniEquiv: e.target.value })} /></Field>
          </div>
          <Field label="الوصف"><Textarea value={editing.desc || ''} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} /></Field>
          <Field label="المواد (سطر لكل واحدة)"><Textarea value={(editing.subjects || []).join('\n')} onChange={(e) => setEditing({ ...editing, subjects: e.target.value.split('\n').filter(Boolean) })} /></Field>
          <div className="flex gap-2 mt-5 sticky bottom-0 bg-white pt-3">
            <button onClick={handleSave} className="px-6 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">💾 حفظ</button>
            <button onClick={() => setEditing(null)} className="px-6 py-2.5 bg-slate-100 rounded-lg font-bold">إلغاء</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============= INSTITUTES TAB =============
function InstitutesTab({ onChange, flash }: { onChange: () => void; flash: (m: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => { setLoading(true); setItems(await fetchInstitutes() as any); setLoading(false); };
  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!editing.name) { flash('❌'); return; }
    const { error } = await saveInstitute(editing);
    if (error) { flash('❌ ' + error.message); return; }
    flash('✓'); setEditing(null); await load(); onChange();
  };
  const handleDelete = async (id: number) => {
    if (!confirm('متأكد؟')) return;
    await deleteInstitute(id); flash('✓'); await load(); onChange();
  };
  const handleSeed = async () => {
    if (!confirm('استيراد المعاهد الأولية؟')) return;
    await seedInstitutes(); flash('✓'); await load(); onChange();
  };

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-5">
        <button onClick={() => setEditing({ id: 0, name: '', region: '', type: 'رسمي', specialties: [], emoji: '🏭' })} className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm">+ معهد جديد</button>
        {items.length === 0 && <button onClick={handleSeed} className="px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-bold text-sm">📥 استيراد البيانات الأولية</button>}
      </div>

      {loading ? <div className="text-center py-12">⏳</div> : items.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed"><div className="text-5xl">📂</div><p className="mt-3 text-slate-600">الجدول فارغ.</p></div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="px-4 py-3 text-right">ID</th><th className="px-4 py-3 text-right">الاسم</th>
              <th className="px-4 py-3 text-right">المنطقة</th><th className="px-4 py-3 text-right">النوع</th>
              <th className="px-4 py-3 text-right">التخصصات</th><th className="px-4 py-3 text-center">الإجراءات</th>
            </tr></thead>
            <tbody>
              {items.map((i: any) => (
                <tr key={i.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500 font-mono">{i.id}</td>
                  <td className="px-4 py-3 font-semibold">{i.emoji} {i.name}</td>
                  <td className="px-4 py-3">{i.region}</td>
                  <td className="px-4 py-3"><span className="text-xs bg-slate-100 px-2 py-1 rounded">{i.type}</span></td>
                  <td className="px-4 py-3 text-xs">{(i.specialties || []).join(', ')}</td>
                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <button onClick={() => setEditing({ ...i })} className="text-blue-600 hover:bg-blue-50 px-3 py-1 rounded text-xs font-semibold ml-2">تعديل</button>
                    <button onClick={() => handleDelete(i.id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-xs font-semibold">حذف</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? `تعديل: ${editing.name}` : 'معهد جديد'}>
          <div className="grid md:grid-cols-2 gap-3">
            <Field label="ID"><Input type="number" value={editing.id || ''} onChange={(e) => setEditing({ ...editing, id: Number(e.target.value) })} /></Field>
            <Field label="الاسم"><Input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="المنطقة"><Input value={editing.region || ''} onChange={(e) => setEditing({ ...editing, region: e.target.value })} /></Field>
            <Field label="النوع"><Select value={editing.type || ''} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
              <option value="رسمي">رسمي</option><option value="خاص">خاص</option><option value="مهني">مهني</option>
            </Select></Field>
            <Field label="إيموجي"><Input value={editing.emoji || ''} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} /></Field>
            <Field label="الموقع"><Input value={editing.website || ''} onChange={(e) => setEditing({ ...editing, website: e.target.value })} dir="ltr" /></Field>
          </div>
          <Field label="التخصصات (سطر لكل واحدة)"><Textarea value={(editing.specialties || []).join('\n')} onChange={(e) => setEditing({ ...editing, specialties: e.target.value.split('\n').filter(Boolean) })} /></Field>
          <div className="flex gap-2 mt-5 sticky bottom-0 bg-white pt-3">
            <button onClick={handleSave} className="px-6 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">💾 حفظ</button>
            <button onClick={() => setEditing(null)} className="px-6 py-2.5 bg-slate-100 rounded-lg font-bold">إلغاء</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ============= MEDIA TAB (Supabase Storage) =============
function MediaTab({ onCount }: { onCount: (n: number) => void }) {
  const r = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<M[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');
  const BUCKET = 'images';

  const load = async () => {
    setLoading(true); setErr('');
    try {
      const { data, error } = await supabase.storage.from(BUCKET).list('', { limit: 100, sortBy: { column: 'created_at', order: 'desc' } });
      if (error) throw error;
      const items: M[] = (data || []).filter((f: any) => f.name && !f.name.startsWith('.')).map((f: any) => {
        const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
        return { name: f.name, sz: f.metadata?.size ? (f.metadata.size / 1024).toFixed(1) + ' KB' : '—', u: pub.publicUrl, created: f.created_at || '' };
      });
      setMedia(items); onCount(items.length);
    } catch (e: any) { setErr(e.message || 'خطأ'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const handle = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fs = e.target.files; if (!fs || fs.length === 0) return;
    setLoading(true); setErr('');
    try {
      for (let i = 0; i < fs.length; i++) {
        const f = fs[i];
        const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const { error: upErr } = await supabase.storage.from(BUCKET).upload(`${Date.now()}_${i}_${safeName}`, f, { cacheControl: '3600', upsert: false });
        if (upErr) throw upErr;
      }
      await load();
    } catch (e: any) { setErr(e.message); }
    finally { setLoading(false); if (r.current) r.current.value = ''; }
  };

  const remove = async (name: string) => {
    if (!confirm(`حذف "${name}"؟`)) return;
    await supabase.storage.from(BUCKET).remove([name]); await load();
  };
  const copyUrl = async (url: string) => { await navigator.clipboard.writeText(url); alert('✓ تم النسخ'); };

  return (
    <div>
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 mb-6 text-sm text-emerald-900">
        ✅ الصور تُحفظ على <strong>Supabase Storage</strong> — bucket <code>images</code>
      </div>
      {err && <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6 text-sm text-red-900">❌ {err}</div>}
      <div className="bg-white rounded-2xl p-6 border-2 border-dashed border-[#1b3a6b]/30 mb-6 text-center">
        <div className="text-5xl mb-3">🖼️</div>
        <input ref={r} type="file" accept="image/*" multiple onChange={handle} className="hidden" disabled={loading} />
        <button onClick={() => r.current?.click()} disabled={loading} className="px-6 py-3 bg-[#1b3a6b] text-white rounded-lg font-bold disabled:opacity-50">{loading ? '⏳' : '+ اختر صور'}</button>
      </div>
      {media.length > 0 ? (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
          {media.map((m) => (
            <div key={m.name} className="bg-white rounded-xl border border-slate-100 overflow-hidden group">
              <div className="aspect-video bg-slate-100 relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.u} alt={m.name} className="w-full h-full object-cover" />
                <button onClick={() => remove(m.name)} className="absolute top-2 left-2 bg-red-500 text-white w-8 h-8 rounded-full opacity-0 group-hover:opacity-100 transition flex items-center justify-center">×</button>
              </div>
              <div className="p-3">
                <div className="font-semibold text-sm truncate">{m.name}</div>
                <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                  <span>{m.sz}</span>
                  <button onClick={() => copyUrl(m.u)} className="text-[#1b3a6b] hover:underline font-semibold">نسخ الرابط</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : <div className="text-center text-slate-400 py-12">لا توجد صور بعد</div>}
    </div>
  );
}

// ============= CFG TAB =============
function CfgTab() {
  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-100 max-w-2xl">
      <h3 className="font-bold text-lg mb-4 text-[#1b3a6b]">معلومات النظام</h3>
      <dl className="text-sm space-y-2">
        <div className="flex justify-between border-b border-slate-100 py-2"><dt className="text-slate-500">الإصدار</dt><dd className="font-semibold">v2.0.0</dd></div>
        <div className="flex justify-between border-b border-slate-100 py-2"><dt className="text-slate-500">الإطار</dt><dd className="font-semibold">Next.js 14.2</dd></div>
        <div className="flex justify-between border-b border-slate-100 py-2"><dt className="text-slate-500">قاعدة البيانات</dt><dd className="font-semibold">Supabase</dd></div>
        <div className="flex justify-between py-2"><dt className="text-slate-500">المنظمة</dt><dd className="font-semibold">مسارك</dd></div>
      </dl>
    </div>
  );
}

// ============= Modal =============
function Modal({ onClose, title, children }: { onClose: () => void; title: string; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-[#1b3a6b]">{title}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-xl">×</button>
        </div>
        <div className="p-6 space-y-3">{children}</div>
      </div>
    </div>
  );
}
