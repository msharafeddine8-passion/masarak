'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type Tab = 'basic' | 'grades' | 'training' | 'volunteer' | 'skills' | 'goals';

interface P {
  fullName: string; email: string; phone: string; age: string; city: string; bio: string;
  bacType: string; bacGrade: string; bacYear: string; gpa: string;
  certs: Array<{ n: string; i: string; y: string }>;
  trains: Array<{ n: string; o: string; d: string }>;
  vols: Array<{ a: string; o: string; h: string }>;
  skills: string[];
  langs: Array<{ l: string; v: string }>;
  goal: string; major: string; uni: string;
}

const E: P = { fullName: '', email: '', phone: '', age: '', city: '', bio: '', bacType: '', bacGrade: '', bacYear: '', gpa: '', certs: [], trains: [], vols: [], skills: [], langs: [], goal: '', major: '', uni: '' };

function compl(p: P): number {
  const f = [p.fullName, p.email, p.age, p.city, p.bio, p.bacType, p.bacGrade, p.bacYear, p.gpa, p.goal, p.major, p.uni].filter(Boolean).length
    + (p.certs.length ? 1 : 0) + (p.trains.length ? 1 : 0) + (p.vols.length ? 1 : 0) + (p.skills.length ? 1 : 0) + (p.langs.length ? 1 : 0);
  return Math.round((f / 17) * 100);
}

const tabsList: Array<{ id: Tab; l: string; i: string }> = [
  { id: 'basic', l: 'معلومات أساسية', i: '👤' },
  { id: 'grades', l: 'علامات وشهادات', i: '📊' },
  { id: 'training', l: 'تدريب وخبرة', i: '💼' },
  { id: 'volunteer', l: 'تطوّع ونشاطات', i: '🤝' },
  { id: 'skills', l: 'مهارات ولغات', i: '🧠' },
  { id: 'goals', l: 'أهداف مهنية', i: '🎯' },
];

export default function ProfilePage() {
  const [tab, setTab] = useState<Tab>('basic');
  const [p, setP] = useState<P>(E);
  const [saved, setSaved] = useState(false);
  const [si, setSi] = useState('');

  useEffect(() => {
    const s = typeof window !== 'undefined' ? localStorage.getItem('masarak_profile') : null;
    if (s) { try { setP({ ...E, ...JSON.parse(s) }); } catch {} }
  }, []);

  const u = (patch: Partial<P>) => {
    const n = { ...p, ...patch };
    setP(n);
    if (typeof window !== 'undefined') localStorage.setItem('masarak_profile', JSON.stringify(n));
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  const c = compl(p);
  const ini = (p.fullName?.[0] || p.email?.[0] || 'م').toUpperCase();

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-[#1b3a6b] via-[#2d5391] to-[#1b3a6b] text-white py-12 px-4">
        <div className="container mx-auto max-w-5xl flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white/15 rounded-full flex items-center justify-center text-4xl font-bold border-4 border-white/25">{ini}</div>
          <div className="flex-1 text-center md:text-right">
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">{p.fullName || 'ملفّك الشخصي'}</h1>
            <p className="opacity-90 mb-3">{p.email || 'أكمل ملفّك لتستفيد من كل ميزات مسارك'}</p>
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <div className="bg-white/15 rounded-full px-4 py-1.5 text-sm font-semibold">اكتمال الملف: {c}%</div>
              {saved && <div className="bg-emerald-400 text-emerald-900 rounded-full px-3 py-1 text-xs font-bold">✓ محفوظ</div>}
            </div>
            <div className="mt-3 w-full max-w-md bg-white/15 rounded-full h-2 overflow-hidden mx-auto md:mx-0">
              <div className="h-full bg-[#d4a574] transition-all" style={{ width: c + '%' }} />
            </div>
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-5xl px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="flex overflow-x-auto border-b border-slate-100 bg-slate-50">
            {tabsList.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-5 py-4 text-sm font-semibold whitespace-nowrap transition border-b-2 ${tab === t.id ? 'text-[#1b3a6b] border-[#1b3a6b] bg-white' : 'text-slate-500 border-transparent hover:bg-slate-100'}`}>
                <span>{t.i}</span><span>{t.l}</span>
              </button>
            ))}
          </div>

          <div className="p-6 md:p-8">
            {tab === 'basic' && (
              <div className="grid md:grid-cols-2 gap-5">
                <F l="الاسم الكامل" v={p.fullName} on={(v) => u({ fullName: v })} ph="مثال: أحمد علي" />
                <F l="البريد الإلكتروني" v={p.email} on={(v) => u({ email: v })} ph="example@email.com" t="email" />
                <F l="رقم الهاتف" v={p.phone} on={(v) => u({ phone: v })} ph="+961-XX-XXXXXX" />
                <F l="العمر" v={p.age} on={(v) => u({ age: v })} ph="18" t="number" />
                <F l="المدينة" v={p.city} on={(v) => u({ city: v })} ph="بيروت" />
                <div className="md:col-span-2"><T l="نبذة عنك" v={p.bio} on={(v) => u({ bio: v })} ph="أخبرنا عن نفسك..." /></div>
              </div>
            )}

            {tab === 'grades' && (
              <div className="space-y-6">
                <h3 className="font-bold text-lg text-[#1b3a6b]">علامات البكالوريا</h3>
                <div className="grid md:grid-cols-2 gap-5">
                  <S l="نوع البكالوريا" v={p.bacType} on={(v) => u({ bacType: v })} opts={['', 'علوم عامة', 'علوم حياة', 'اقتصاد واجتماع', 'آداب وإنسانيات', 'BAC FR', 'IB', 'SAT', 'A-Level']} />
                  <F l="المعدّل" v={p.bacGrade} on={(v) => u({ bacGrade: v })} ph="14.5/20 أو 85%" />
                  <F l="سنة التخرّج" v={p.bacYear} on={(v) => u({ bacYear: v })} ph="2026" t="number" />
                  <F l="GPA الجامعي (إن وجد)" v={p.gpa} on={(v) => u({ gpa: v })} ph="3.5/4.0" />
                </div>
                <LS title="الشهادات والكورسات" items={p.certs} on={(x) => u({ certs: x })} keys={[['n', 'اسم الشهادة'], ['i', 'الجهة المانحة'], ['y', 'السنة']]} hint="أضف الشهادات والكورسات يلي حصّلتها" />
              </div>
            )}

            {tab === 'training' && (
              <LS title="التدريب والخبرة العملية" items={p.trains} on={(x) => u({ trains: x })} keys={[['n', 'اسم التدريب/الوظيفة'], ['o', 'المؤسسة'], ['d', 'المدة']]} hint="أضف خبراتك التدريبية والمهنية" />
            )}

            {tab === 'volunteer' && (
              <LS title="ساعات التطوّع والنشاطات" items={p.vols} on={(x) => u({ vols: x })} keys={[['a', 'النشاط'], ['o', 'الجمعية/المؤسسة'], ['h', 'الساعات']]} hint="ساعات التطوّع بتفرق بطلبات الجامعات والمنح!" />
            )}

            {tab === 'skills' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-bold text-lg mb-4 text-[#1b3a6b]">المهارات</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {p.skills.map((s, i) => (
                      <span key={i} className="bg-[#1b3a6b]/10 text-[#1b3a6b] px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-2">
                        {s}<button onClick={() => u({ skills: p.skills.filter((_, x) => x !== i) })} className="text-xs hover:text-red-600">×</button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input value={si} onChange={(e) => setSi(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && si.trim()) { u({ skills: [...p.skills, si.trim()] }); setSi(''); } }} placeholder="أضف مهارة (Enter للإضافة)" className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1b3a6b]" />
                    <button onClick={() => { if (si.trim()) { u({ skills: [...p.skills, si.trim()] }); setSi(''); } }} className="px-5 py-2 bg-[#1b3a6b] text-white rounded-lg font-semibold hover:bg-[#142d54]">إضافة</button>
                  </div>
                </div>
                <LS title="اللغات" items={p.langs} on={(x) => u({ langs: x })} keys={[['l', 'اللغة'], ['v', 'المستوى']]} hint="أضف اللغات يلي بتعرفها" />
              </div>
            )}

            {tab === 'goals' && (
              <div className="space-y-5">
                <T l="هدفك المهني" v={p.goal} on={(v) => u({ goal: v })} ph="مثلاً: أريد أصير طبيب أطفال..." />
                <div className="grid md:grid-cols-2 gap-5">
                  <F l="التخصّص المستهدف" v={p.major} on={(v) => u({ major: v })} ph="هندسة حاسوب" />
                  <F l="الجامعة المستهدفة" v={p.uni} on={(v) => u({ uni: v })} ph="AUB" />
                </div>
                <div className="bg-[#1b3a6b]/5 border-2 border-[#1b3a6b]/20 rounded-2xl p-6 text-center">
                  <div className="text-3xl mb-3">🎯</div>
                  <p className="text-slate-700 mb-4">احتاج مساعدة بتحديد هدفك المهني؟</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Link href="/tools/career-ai" className="px-4 py-2 bg-[#1b3a6b] text-white rounded-lg text-sm font-semibold">المرشد المهني الذكي</Link>
                    <Link href="/tools/skill-strengths" className="px-4 py-2 bg-white text-[#1b3a6b] border-2 border-[#1b3a6b] rounded-lg text-sm font-semibold">اختبار نقاط القوة</Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 grid md:grid-cols-3 gap-4">
          <Link href="/dashboard" className="bg-white p-4 rounded-xl border border-slate-100 hover:border-[#1b3a6b]/30 hover:shadow-md transition flex items-center gap-3"><div className="w-10 h-10 bg-[#1b3a6b]/10 rounded-lg flex items-center justify-center text-xl">📊</div><div><div className="font-bold text-[#1b3a6b]">لوحة التحكّم</div><div className="text-xs text-slate-500">إحصائيات ومواعيد</div></div></Link>
          <Link href="/tools/cv-builder" className="bg-white p-4 rounded-xl border border-slate-100 hover:border-[#1b3a6b]/30 hover:shadow-md transition flex items-center gap-3"><div className="w-10 h-10 bg-[#1b3a6b]/10 rounded-lg flex items-center justify-center text-xl">📄</div><div><div className="font-bold text-[#1b3a6b]">سيرة ذاتية</div><div className="text-xs text-slate-500">CV من بياناتك</div></div></Link>
          <Link href="/scholarships" className="bg-white p-4 rounded-xl border border-slate-100 hover:border-[#1b3a6b]/30 hover:shadow-md transition flex items-center gap-3"><div className="w-10 h-10 bg-[#1b3a6b]/10 rounded-lg flex items-center justify-center text-xl">🏆</div><div><div className="font-bold text-[#1b3a6b]">المنح المناسبة</div><div className="text-xs text-slate-500">حسب ملفّك</div></div></Link>
        </div>
      </section>
    </main>
  );
}

function F({ l, v, on, ph, t = 'text' }: { l: string; v: string; on: (v: string) => void; ph?: string; t?: string }) {
  return (<div><label className="block text-sm font-semibold text-slate-700 mb-1.5">{l}</label><input type={t} value={v} onChange={(e) => on(e.target.value)} placeholder={ph} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1b3a6b]" /></div>);
}
function T({ l, v, on, ph }: { l: string; v: string; on: (v: string) => void; ph?: string }) {
  return (<div><label className="block text-sm font-semibold text-slate-700 mb-1.5">{l}</label><textarea value={v} onChange={(e) => on(e.target.value)} placeholder={ph} rows={4} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1b3a6b] resize-none" /></div>);
}
function S({ l, v, on, opts }: { l: string; v: string; on: (v: string) => void; opts: string[] }) {
  return (<div><label className="block text-sm font-semibold text-slate-700 mb-1.5">{l}</label><select value={v} onChange={(e) => on(e.target.value)} className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#1b3a6b] bg-white">{opts.map((o) => (<option key={o} value={o}>{o || '-- اختر --'}</option>))}</select></div>);
}

function LS<T extends Record<string, string>>({ title, items, on, keys, hint }: { title: string; items: T[]; on: (x: T[]) => void; keys: Array<[string, string]>; hint?: string }) {
  const [d, setD] = useState<Record<string, string>>({});
  const add = () => {
    if (keys.every(([k]) => !d[k])) return;
    on([...items, d as T]);
    setD({});
  };
  return (
    <div>
      <h3 className="font-bold text-lg mb-4 text-[#1b3a6b]">{title}</h3>
      {items.length > 0 ? (
        <div className="space-y-2 mb-5">
          {items.map((item, i) => (
            <div key={i} className="bg-slate-50 p-4 rounded-lg flex items-start justify-between gap-3 border border-slate-100">
              <div className="flex-1 grid md:grid-cols-3 gap-3 text-sm">
                {keys.map(([k, lbl]) => (
                  <div key={k}><span className="text-slate-500 text-xs">{lbl}: </span><span className="font-semibold text-slate-800">{(item as any)[k] || '-'}</span></div>
                ))}
              </div>
              <button onClick={() => on(items.filter((_, x) => x !== i))} className="text-red-500 hover:bg-red-50 w-8 h-8 rounded-lg flex items-center justify-center">×</button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-400 text-sm mb-5 py-4">{hint || 'لا توجد عناصر بعد'}</div>
      )}
      <div className="bg-[#1b3a6b]/5 p-4 rounded-xl border-2 border-dashed border-[#1b3a6b]/20">
        <div className="grid md:grid-cols-3 gap-3 mb-3">
          {keys.map(([k, lbl]) => (
            <input key={k} type="text" value={d[k] || ''} onChange={(e) => setD({ ...d, [k]: e.target.value })} placeholder={lbl} className="px-3 py-2 border border-slate-200 rounded-lg text-sm bg-white focus:outline-none focus:border-[#1b3a6b]" />
          ))}
        </div>
        <button onClick={add} className="w-full px-4 py-2 bg-[#1b3a6b] text-white rounded-lg text-sm font-bold hover:bg-[#142d54]">+ إضافة</button>
      </div>
    </div>
  );
}
