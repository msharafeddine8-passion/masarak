'use client';
import { useState } from 'react';
import { useI18n, type TranslationKey } from '@/lib/i18n';

export default function AcademicTab({ profile, update }: { profile: any; update: (p: any) => void }) {
  const { t } = useI18n();
  return (
    <div className="space-y-8">
      {/* Personal */}
      <Section title={t('pt.ac.s_personal')}>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label={t('pt.ac.f.full_name')}><Input value={profile.full_name || ''} onChange={(e) => update({ full_name: e.target.value })} placeholder="" /></Field>
          <Field label={t('pt.ac.f.phone')}><Input value={profile.phone || ''} onChange={(e) => update({ phone: e.target.value })} placeholder="+961 70 000 000" dir="ltr" /></Field>
          <Field label={t('pt.ac.f.dob')}><Input type="date" value={profile.date_of_birth || ''} onChange={(e) => update({ date_of_birth: e.target.value })} /></Field>
          <Field label={t('pt.ac.f.gender')}>
            <Select value={profile.gender || ''} onChange={(e) => update({ gender: e.target.value })}>
              <option value="">--</option><option value="male">{t('pt.ac.f.male')}</option><option value="female">{t('pt.ac.f.female')}</option>
            </Select>
          </Field>
          <Field label={t('pt.ac.f.city')}><Input value={profile.city || ''} onChange={(e) => update({ city: e.target.value })} /></Field>
          <Field label={t('pt.ac.f.country')}>
            <Select value={profile.country || 'LB'} onChange={(e) => update({ country: e.target.value })}>
              <option value="LB">🇱🇧 Lebanon</option><option value="SA">🇸🇦 Saudi Arabia</option><option value="AE">🇦🇪 UAE</option>
              <option value="EG">🇪🇬 Egypt</option><option value="JO">🇯🇴 Jordan</option><option value="KW">🇰🇼 Kuwait</option>
              <option value="QA">🇶🇦 Qatar</option><option value="BH">🇧🇭 Bahrain</option><option value="OM">🇴🇲 Oman</option>
              <option value="other">{t('pt.ac.f.other')}</option>
            </Select>
          </Field>
          <div className="md:col-span-2"><Field label={t('pt.ac.f.bio')}><Textarea value={profile.bio || ''} onChange={(e) => update({ bio: e.target.value })} placeholder="" /></Field></div>
        </div>
      </Section>

      {/* Education */}
      <Section title={t('pt.ac.s_edu')}>
        <div className="grid md:grid-cols-2 gap-5">
          <Field label={t('pt.ac.f.school')}><Input value={profile.school_name || ''} onChange={(e) => update({ school_name: e.target.value })} /></Field>
          <Field label={t('pt.ac.f.grade_level')}>
            <Select value={profile.grade_level || ''} onChange={(e) => update({ grade_level: e.target.value })}>
              <option value="">--</option>
              <option value="grade_10">Grade 10 / EB1</option><option value="grade_11">Grade 11 / EB2</option><option value="grade_12">Grade 12 / EB3</option>
              <option value="freshman">Freshman</option><option value="university">University student</option><option value="graduate">Graduate</option>
            </Select>
          </Field>
          <Field label={t('pt.ac.f.grad_year')}><Input type="number" min={2024} max={2030} value={profile.graduation_year || ''} onChange={(e) => update({ graduation_year: Number(e.target.value) || undefined })} /></Field>
          <Field label={t('pt.ac.f.bac_section')}>
            <Select value={profile.bac_section || ''} onChange={(e) => update({ bac_section: e.target.value })}>
              <option value="">--</option><option value="GS">GS</option><option value="LS">LS</option>
              <option value="SE">SE</option><option value="LH">LH</option><option value="IB">IB</option><option value="SAT">SAT / American</option>
            </Select>
          </Field>
          <Field label={t('pt.ac.f.bac_grade')}><Input type="number" step="0.01" min={0} max={20} value={profile.bac_grade || ''} onChange={(e) => update({ bac_grade: Number(e.target.value) || undefined })} /></Field>
          <Field label={t('pt.ac.f.gpa')}><Input type="number" step="0.01" min={0} max={4} value={profile.overall_gpa || ''} onChange={(e) => update({ overall_gpa: Number(e.target.value) || undefined })} /></Field>
        </div>
      </Section>

      {/* Grades */}
      <Section title={t('pt.ac.s_grades')}>
        <ArrayEditor items={profile.grades || []} onChange={(arr) => update({ grades: arr })} fields={[
          { key: 'subject', labelKey: 'pt.ac.grade_subject', type: 'text' },
          { key: 'score',   labelKey: 'pt.ac.grade_score',   type: 'number' },
          { key: 'max',     labelKey: 'pt.ac.grade_max',     type: 'number', default: 20 },
        ]} addLabel={t('pt.ac.add.grade')} emptyLabel={t('pt.ac.empty.grades')} delLabel={t('pt.ac.del')} />
      </Section>

      {/* Skills + Languages + Interests */}
      <Section title={t('pt.ac.s_skills')}>
        <div className="grid md:grid-cols-3 gap-5">
          <Field label={t('pt.ac.f.skills')}>
            <ChipsInput value={profile.skills || []} onChange={(arr) => update({ skills: arr })} placeholder="" addLabel={t('pt.ac.add.skill')} />
          </Field>
          <Field label={t('pt.ac.f.langs')}>
            <ChipsInput value={(profile.languages || []).map((l: any) => typeof l === 'string' ? l : l.name)} onChange={(arr) => update({ languages: arr.map((name) => ({ name })) })} placeholder="" addLabel={t('pt.ac.add.skill')} />
          </Field>
          <Field label={t('pt.ac.f.interests')}>
            <ChipsInput value={profile.interests || []} onChange={(arr) => update({ interests: arr })} placeholder="" addLabel={t('pt.ac.add.skill')} />
          </Field>
        </div>
      </Section>

      {/* Achievements / Awards */}
      <Section title={t('pt.ac.s_awards')}>
        <p className="text-sm text-ink-subtle mb-3">{t('pt.ac.s_awards_d')}</p>
        <ArrayEditor items={profile.achievements || []} onChange={(arr) => update({ achievements: arr })} fields={[
          { key: 'title', labelKey: 'pt.ac.award_title', type: 'text' },
          { key: 'year',  labelKey: 'pt.ac.award_year',  type: 'number', default: 2024 },
          { key: 'desc',  labelKey: 'pt.ac.award_desc',  type: 'text' },
        ]} addLabel={t('pt.ac.add.award')} emptyLabel={t('pt.ac.empty.awards')} delLabel={t('pt.ac.del')} />
      </Section>

      {/* Certificates */}
      <Section title={t('pt.ac.s_certs')}>
        <p className="text-sm text-ink-subtle mb-3">{t('pt.ac.s_certs_d')}</p>
        <ArrayEditor items={profile.certificates || []} onChange={(arr) => update({ certificates: arr })} fields={[
          { key: 'name',   labelKey: 'pt.ac.cert_name',   type: 'text' },
          { key: 'issuer', labelKey: 'pt.ac.cert_issuer', type: 'text' },
          { key: 'year',   labelKey: 'pt.ac.cert_year',   type: 'number', default: 2024 },
        ]} addLabel={t('pt.ac.add.cert')} emptyLabel={t('pt.ac.empty.certs')} delLabel={t('pt.ac.del')} />
      </Section>

      {/* Volunteer Activities */}
      <Section title={t('pt.ac.s_volunteer')}>
        <p className="text-sm text-ink-subtle mb-3">{t('pt.ac.s_volunteer_d')}</p>
        <ArrayEditor items={profile.volunteer_activities || []} onChange={(arr) => update({ volunteer_activities: arr })} fields={[
          { key: 'org',  labelKey: 'pt.ac.vol_org',  type: 'text' },
          { key: 'role', labelKey: 'pt.ac.vol_role', type: 'text' },
          { key: 'year', labelKey: 'pt.ac.vol_year', type: 'number', default: 2024 },
        ]} addLabel={t('pt.ac.add.volunteer')} emptyLabel={t('pt.ac.empty.volunteer')} delLabel={t('pt.ac.del')} />
      </Section>

      {/* Preferences */}
      <Section title={t('pt.ac.s_prefs')}>
        <div className="grid md:grid-cols-3 gap-5">
          <Field label={t('pt.ac.f.fav_unis')}>
            <ChipsInput value={profile.preferred_universities || []} onChange={(arr) => update({ preferred_universities: arr })} placeholder="AUB, LAU, USJ" addLabel={t('pt.ac.add.skill')} />
            <p className="text-xs text-ink-subtle mt-1">{t('pt.ac.f.fav_unis_hint')}</p>
          </Field>
          <Field label={t('pt.ac.f.fav_countries')}>
            <ChipsInput value={profile.preferred_countries || []} onChange={(arr) => update({ preferred_countries: arr })} placeholder="LB, US, FR, AE" addLabel={t('pt.ac.add.skill')} />
          </Field>
          <Field label={t('pt.ac.f.fav_careers')}>
            <ChipsInput value={profile.preferred_careers || []} onChange={(arr) => update({ preferred_careers: arr })} placeholder="" addLabel={t('pt.ac.add.skill')} />
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
  return <div><label className="block text-sm font-semibold text-ink-muted mb-1.5">{label}</label>{children}</div>;
}
function Input(p: React.InputHTMLAttributes<HTMLInputElement>) { return <input {...p} className="w-full px-4 py-2.5 border border-white/10 rounded-lg focus:border-[#1b3a6b] focus:outline-none focus:ring-2 focus:ring-[#1b3a6b]/10 transition" />; }
function Textarea(p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) { return <textarea {...p} className="w-full px-4 py-2.5 border border-white/10 rounded-lg focus:border-[#1b3a6b] focus:outline-none focus:ring-2 focus:ring-[#1b3a6b]/10 min-h-[80px] transition" />; }
function Select({ children, ...p }: React.SelectHTMLAttributes<HTMLSelectElement>) { return <select {...p} className="w-full px-4 py-2.5 border border-white/10 rounded-lg bg-surface focus:border-[#1b3a6b] focus:outline-none focus:ring-2 focus:ring-[#1b3a6b]/10 transition">{children}</select>; }

function ChipsInput({ value, onChange, placeholder, addLabel }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel: string }) {
  const [input, setInput] = useState('');
  const add = () => { if (input.trim()) { onChange([...value, input.trim()]); setInput(''); } };
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1.5 min-h-[2.5rem] p-2 bg-bg-soft border border-white/10 rounded-lg">
        {value.length === 0 && <span className="text-xs text-slate-400 self-center">{placeholder}</span>}
        {value.map((v, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#1b3a6b] text-white rounded-full text-sm">
            {v}
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="hover:bg-surface/20 rounded-full w-4 h-4 flex items-center justify-center text-xs">×</button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }} placeholder={addLabel} className="flex-1 px-3 py-1.5 border border-white/10 rounded-lg text-sm" />
        <button type="button" onClick={add} className="px-3 py-1.5 bg-[#1b3a6b] text-white rounded-lg text-sm font-bold">+</button>
      </div>
    </div>
  );
}

function ArrayEditor({ items, onChange, fields, addLabel, emptyLabel, delLabel }: { items: any[]; onChange: (arr: any[]) => void; fields: { key: string; labelKey: TranslationKey; type: string; default?: any }[]; addLabel: string; emptyLabel: string; delLabel: string }) {
  const { t } = useI18n();
  const add = () => {
    const def: any = {}; fields.forEach(f => def[f.key] = f.default !== undefined ? f.default : (f.type === 'number' ? 0 : ''));
    onChange([...items, def]);
  };
  const edit = (i: number, k: string, v: any) => onChange(items.map((it, idx) => idx === i ? { ...it, [k]: v } : it));
  const rm = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  return (
    <div>
      <div className="space-y-2 mb-3">
        {items.length === 0 && <div className="text-center text-slate-400 py-6 border-2 border-dashed border-white/10 rounded-xl text-sm">{emptyLabel}</div>}
        {items.map((it, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 items-center">
            {fields.map(f => (
              <div key={f.key} className={f.type === 'text' ? 'col-span-6' : 'col-span-3'}>
                <input type={f.type} value={it[f.key] ?? ''} onChange={(e) => edit(i, f.key, f.type === 'number' ? Number(e.target.value) : e.target.value)} placeholder={t(f.labelKey)} className="w-full px-3 py-2 border border-white/10 rounded-lg text-sm" />
              </div>
            ))}
            <button onClick={() => rm(i)} className="col-span-3 text-red-600 hover:bg-red-50 py-2 rounded-lg text-sm font-semibold">{delLabel}</button>
          </div>
        ))}
      </div>
      <button type="button" onClick={add} className="px-4 py-2 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm">{addLabel}</button>
    </div>
  );
}
