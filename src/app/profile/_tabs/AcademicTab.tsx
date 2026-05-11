'use client';
import { useState } from 'react';

export default function AcademicTab({ profile, update }: { profile: any; update: (p: any) => void }) {
  return (
    <div className="space-y-8">
      {/* Personal */}
      <Section title="👤 المعلومات الشخصية">
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="الاسم الكامل"><Input value={profile.full_name || ''} onChange={(e) => update({ full_name: e.target.value })} placeholder="مثلاً: محمد شرف الدين" /></Field>
          <Field label="رقم الهاتف"><Input value={profile.phone || ''} onChange={(e) => update({ phone: e.target.value })} placeholder="+961 70 000 000" dir="ltr" /></Field>
          <Field label="تاريخ الميلاد"><Input type="date" value={profile.date_of_birth || ''} onChange={(e) => update({ date_of_birth: e.target.value })} /></Field>
          <Field label="الجنس">
            <Select value={profile.gender || ''} onChange={(e) => update({ gender: e.target.value })}>
              <option value="">--</option><option value="male">ذكر</option><option value="female">أنثى</option>
            </Select>
          </Field>
          <Field label="المدينة"><Input value={profile.city || ''} onChange={(e) => update({ city: e.target.value })} /></Field>
          <Field label="الدولة">
            <Select value={profile.country || 'LB'} onChange={(e) => update({ country: e.target.value })}>
              <option value="LB">🇱🇧 لبنان</option><option value="SA">🇸🇦 السعودية</option><option value="AE">🇦🇪 الإمارات</option>
              <option value="EG">🇪🇬 مصر</option><option value="JO">🇯🇴 الأردن</option><option value="KW">🇰🇼 الكويت</option>
              <option value="QA">🇶🇦 قطر</option><option value="BH">🇧🇭 البحرين</option><option value="OM">🇴🇲 عمان</option><option value="other">أخرى</option>
            </Select>
          </Field>
          <div className="md:col-span-2"><Field label="نبذة عنك (Bio)"><Textarea value={profile.bio || ''} onChange={(e) => update({ bio: e.target.value })} placeholder="عرّف عن نفسك..." /></Field></div>
        </div>
      </Section>

      {/* Education */}
      <Section title="🎓 المرحلة الدراسية">
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="المدرسة / الجامعة الحالية"><Input value={profile.school_name || ''} onChange={(e) => update({ school_name: e.target.value })} placeholder="مثلاً: International College" /></Field>
          <Field label="المرحلة">
            <Select value={profile.grade_level || ''} onChange={(e) => update({ grade_level: e.target.value })}>
              <option value="">--</option>
              <option value="grade_10">صف 10 / EB1</option><option value="grade_11">صف 11 / EB2</option><option value="grade_12">صف 12 / EB3</option>
              <option value="freshman">سنة جامعية أولى</option><option value="university">طالب جامعي</option><option value="graduate">خريج</option>
            </Select>
          </Field>
          <Field label="سنة التخرّج المتوقعة"><Input type="number" min={2024} max={2030} value={profile.graduation_year || ''} onChange={(e) => update({ graduation_year: Number(e.target.value) || undefined })} /></Field>
          <Field label="فرع البكالوريا">
            <Select value={profile.bac_section || ''} onChange={(e) => update({ bac_section: e.target.value })}>
              <option value="">--</option><option value="GS">علوم عامة (GS)</option><option value="LS">علوم حياة (LS)</option>
              <option value="SE">اقتصاد واجتماع</option><option value="LH">آداب وإنسانيات</option><option value="IB">IB</option><option value="SAT">SAT / American</option>
            </Select>
          </Field>
          <Field label="معدّل البكالوريا (من 20)"><Input type="number" step="0.01" min={0} max={20} value={profile.bac_grade || ''} onChange={(e) => update({ bac_grade: Number(e.target.value) || undefined })} /></Field>
          <Field label="معدّل GPA (من 4)"><Input type="number" step="0.01" min={0} max={4} value={profile.overall_gpa || ''} onChange={(e) => update({ overall_gpa: Number(e.target.value) || undefined })} /></Field>
        </div>
      </Section>

      {/* Grades */}
      <Section title="📊 العلامات بالمواد">
        <ArrayEditor items={profile.grades || []} onChange={(arr) => update({ grades: arr })} fields={[
          { key: 'subject', label: 'المادة', type: 'text' },
          { key: 'score', label: 'العلامة', type: 'number' },
          { key: 'max', label: 'من', type: 'number', default: 20 },
        ]} addLabel="+ مادة" emptyLabel="لا علامات بعد" />
      </Section>

      {/* Skills + Languages + Interests */}
      <Section title="🛠️ المهارات واللغات والاهتمامات">
        <div className="grid md:grid-cols-3 gap-5">
          <Field label="المهارات">
            <ChipsInput value={profile.skills || []} onChange={(arr) => update({ skills: arr })} placeholder="Python, الكتابة, التصوير..." />
          </Field>
          <Field label="اللغات">
            <ChipsInput value={(profile.languages || []).map((l: any) => typeof l === 'string' ? l : l.name)} onChange={(arr) => update({ languages: arr.map((name) => ({ name })) })} placeholder="عربي, إنجليزي, فرنسي" />
          </Field>
          <Field label="الاهتمامات">
            <ChipsInput value={profile.interests || []} onChange={(arr) => update({ interests: arr })} placeholder="رياضة, موسيقى, برمجة" />
          </Field>
        </div>
      </Section>

      {/* Preferences */}
      <Section title="🎯 اختياراتك المستقبلية">
        <div className="grid md:grid-cols-3 gap-5">
          <Field label="الجامعات المفضلة (اختصارات)">
            <ChipsInput value={profile.preferred_universities || []} onChange={(arr) => update({ preferred_universities: arr })} placeholder="AUB, LAU, USJ" />
            <p className="text-xs text-slate-500 mt-1">📌 يفعّل إضافة تقييماتك لهذه الجامعات</p>
          </Field>
          <Field label="الدول المفضلة للدراسة">
            <ChipsInput value={profile.preferred_countries || []} onChange={(arr) => update({ preferred_countries: arr })} placeholder="LB, US, FR, AE" />
          </Field>
          <Field label="المسارات المهنية المفضلة">
            <ChipsInput value={profile.preferred_careers || []} onChange={(arr) => update({ preferred_careers: arr })} placeholder="هندسة, طب, تصميم" />
          </Field>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="font-bold text-xl text-[#1b3a6b] mb-4 pb-2 border-b border-slate-100">{title}</h3>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>{children}</div>;
}
function Input(p: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...p} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#1b3a6b] focus:outline-none focus:ring-2 focus:ring-[#1b3a6b]/10 transition" />; }
function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...p} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:border-[#1b3a6b] focus:outline-none focus:ring-2 focus:ring-[#1b3a6b]/10 min-h-[80px] transition" />; }
function Select({ children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select {...p} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:border-[#1b3a6b] focus:outline-none focus:ring-2 focus:ring-[#1b3a6b]/10 transition">{children}</select>; }

function ChipsInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');
  const add = () => { if (input.trim()) { onChange([...value, input.trim()]); setInput(''); } };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[2.5rem] p-2 bg-slate-50 border border-slate-200 rounded-lg">
        {value.length === 0 && <span className="text-xs text-slate-400 self-center">{placeholder}</span>}
        {value.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1b3a6b] text-white rounded-full text-sm">
            {v}
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center text-xs">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder="اكتب وأضف..." className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm" />
        <button type="button" onClick={add} className="px-3 py-1.5 bg-[#1b3a6b] text-white rounded-lg text-sm font-bold">+</button>
      </div>
    </div>
  );
}

function ArrayEditor({ items, onChange, fields, addLabel, emptyLabel }: { items: any[]; onChange: (arr: any[]) => void; fields: { key: string; label: string; type: string; default?: any }[]; addLabel: string; emptyLabel: string }) {
  const add = () => {
    const def: any = {}; fields.forEach(f => def[f.key] = f.default !== undefined ? f.default : (f.type === 'number' ? 0 : ''));
    onChange([...items, def]);
  };
  const edit = (i: number, k: string, v: any) => onChange(items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const rm = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <div className="space-y-2 mb-3">
        {items.length === 0 && <div className="text-center text-slate-400 py-6 border-2 border-dashed border-slate-200 rounded-xl text-sm">{emptyLabel}</div>}
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            {fields.map(f => (
              <div key={f.key} className={f.type === 'text' ? 'col-span-6' : 'col-span-3'}>
                <input type={f.type} value={it[f.key] ?? ''} onChange={(e) => edit(i, f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={f.label} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" />
              </div>
            ))}
            <button onClick={() => rm(i)} className="col-span-3 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-semibold">حذف</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="px-4 py-2 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm">{addLabel}</button>
    </div>
  );
}
