'use client';
import { useEffect, useState } from 'react';
import { fetchUniversities, saveUniversity, deleteUniversity, seedUniversities } from '@/lib/entities';
import { Field, Input, Textarea, Select, Modal, ImageUpload, Toolbar, EmptyState } from './_shared';

export default function UniversitiesTab({ flash }: { flash: (m: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'id' | 'name' | 'rank' | 'students'>('rank');
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const load = async () => { setLoading(true); setItems(await fetchUniversities() as any); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.name || !editing.short) { flash('❌ الاسم والاختصار مطلوبان'); return; }
    const { error } = await saveUniversity(editing);
    if (error) { flash('❌ ' + error.message); return; }
    flash('✓ تم الحفظ'); setEditing(null); await load();
  };
  const remove = async (id: number) => {
    if (!confirm('حذف؟')) return;
    const { error } = await deleteUniversity(id);
    if (error) flash('❌ ' + error.message); else { flash('✓ حُذف'); await load(); }
  };
  const bulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`حذف ${selected.size}؟`)) return;
    for (const id of Array.from(selected)) await deleteUniversity(id);
    flash('✓'); setSelected(new Set()); await load();
  };
  const exportCSV = () => {
    const headers = ['ID', 'الاسم', 'الاختصار', 'المنطقة', 'النوع', 'الرسوم', 'التصنيف'];
    const rows = filtered.map(u => [u.id, u.name, u.short, u.region, u.type, u.tuitionMin, u.rank]);
    const csv = [headers, ...rows].map(r => r.map(c => `"${c || ''}"`).join(',')).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'universities.csv'; a.click();
  };
  const handleSeed = async () => {
    if (!confirm('استيراد 22 جامعة؟')) return;
    const { error } = await seedUniversities();
    if (error) flash('❌ ' + error.message); else { flash('✓'); await load(); }
  };

  let filtered = items.filter(u => !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.short?.toLowerCase().includes(search.toLowerCase()) || u.region?.toLowerCase().includes(search.toLowerCase()));
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sort === 'rank') return (b.rank || 0) - (a.rank || 0);
    if (sort === 'students') return (b.students || 0) - (a.students || 0);
    return (a.id || 0) - (b.id || 0);
  });

  const newUni = () => setEditing({
    id: 0, name: '', short: '', emoji: '🏛️', region: '', type: 'خاصة', rank: 3,
    tuitionMin: 0, tuitionMax: 0, lang: '', url: '', majors: [], scholarships: false,
    acceptance: 50, employRate: 75, desc: '', founded: 2000, students: 0, faculties: 0,
    campus: '', accred: '', color: 'from-blue-600 to-blue-800', paths: [], photo: '', logo: ''
  });

  return (
    <div>
      <Toolbar
        search={search} setSearch={setSearch} onAdd={newUni} addLabel="+ جامعة جديدة"
        onSeed={items.length === 0 ? handleSeed : undefined}
        count={filtered.length} total={items.length}
        extra={
          <>
            <Select value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <option value="rank">ترتيب: التصنيف</option>
              <option value="id">ترتيب: ID</option>
              <option value="name">ترتيب: الاسم</option>
              <option value="students">ترتيب: الطلاب</option>
            </Select>
            <button onClick={exportCSV} className="px-3 py-2 bg-bg-soft hover:bg-bg-soft rounded-lg font-bold text-sm whitespace-nowrap">📊 CSV</button>
            {selected.size > 0 && <button onClick={bulkDelete} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold text-sm">🗑️ ({selected.size})</button>}
          </>
        }
      />

      {loading ? <div className="text-center py-12">⏳</div> : filtered.length === 0 ? (
        <EmptyState text="لا جامعات. استورد أو أضف يدوياً." />
      ) : (
        <div className="bg-surface rounded-2xl border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft border-b">
              <tr>
                <th className="px-3 py-3"><input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={(e) => setSelected(e.target.checked ? new Set(filtered.map(u => u.id)) : new Set())} /></th>
                <th className="px-3 py-3 text-right">لوغو</th>
                <th className="px-3 py-3 text-right">صورة</th>
                <th className="px-3 py-3 text-right">ID</th>
                <th className="px-3 py-3 text-right">الاسم</th>
                <th className="px-3 py-3 text-right">الاختصار</th>
                <th className="px-3 py-3 text-right">التصنيف</th>
                <th className="px-3 py-3 text-right">المنطقة</th>
                <th className="px-3 py-3 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u: any) => (
                <tr key={u.id} className="border-t hover:bg-bg-soft">
                  <td className="px-3 py-3 text-center">
                    <input type="checkbox" checked={selected.has(u.id)} onChange={(e) => {
                      const s = new Set(selected); e.target.checked ? s.add(u.id) : s.delete(u.id); setSelected(s);
                    }} />
                  </td>
                  <td className="px-3 py-3">
                    {u.logo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={u.logo} alt="" className="w-9 h-9 rounded-full object-cover border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : <div className="w-9 h-9 rounded-full bg-bg-soft flex items-center justify-center text-lg">{u.emoji}</div>}
                  </td>
                  <td className="px-3 py-3">
                    {u.photo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={u.photo} alt="" className="w-12 h-9 object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : <div className="w-12 h-9 bg-bg-soft rounded"></div>}
                  </td>
                  <td className="px-3 py-3 text-ink-subtle font-mono text-xs">{u.id}</td>
                  <td className="px-3 py-3 font-semibold">{u.name}</td>
                  <td className="px-3 py-3 font-bold">{u.short}</td>
                  <td className="px-3 py-3 text-yellow-400 text-sm">{'★'.repeat(u.rank || 0)}</td>
                  <td className="px-3 py-3 text-xs">{u.region}</td>
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <button onClick={() => setEditing({ ...u })} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-bold ml-1">✏️</button>
                    <button onClick={() => remove(u.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? `تعديل: ${editing.name || editing.short}` : 'جامعة جديدة'} size="xl">
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="🎨 لوغو الجامعة (مربّع/دائري)">
                <ImageUpload value={editing.logo} onChange={(v) => setEditing({ ...editing, logo: v })} folder="universities/logos" />
              </Field>
              <Field label="🖼️ صورة الغلاف (Cover)">
                <ImageUpload value={editing.photo} onChange={(v) => setEditing({ ...editing, photo: v })} folder="universities" />
              </Field>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="ID"><Input type="number" value={editing.id || ''} onChange={(e) => setEditing({ ...editing, id: Number(e.target.value) })} /></Field>
              <Field label="الاختصار"><Input value={editing.short || ''} onChange={(e) => setEditing({ ...editing, short: e.target.value })} dir="ltr" /></Field>
              <Field label="إيموجي (احتياطي)"><Input value={editing.emoji || ''} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} /></Field>
              <Field label="الاسم" span={3}><Input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="المنطقة"><Input value={editing.region || ''} onChange={(e) => setEditing({ ...editing, region: e.target.value })} /></Field>
              <Field label="النوع"><Select value={editing.type || ''} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                <option value="خاصة">خاصة</option><option value="حكومية">حكومية</option>
              </Select></Field>
              <Field label="التصنيف (1-5 نجوم)"><Input type="number" min={1} max={5} value={editing.rank || 3} onChange={(e) => setEditing({ ...editing, rank: Number(e.target.value) })} /></Field>
              <Field label="الرسوم الدنيا ($)"><Input type="number" value={editing.tuitionMin || 0} onChange={(e) => setEditing({ ...editing, tuitionMin: Number(e.target.value) })} /></Field>
              <Field label="الرسوم القصوى ($)"><Input type="number" value={editing.tuitionMax || 0} onChange={(e) => setEditing({ ...editing, tuitionMax: Number(e.target.value) })} /></Field>
              <Field label="اللغة"><Input value={editing.lang || ''} onChange={(e) => setEditing({ ...editing, lang: e.target.value })} /></Field>
              <Field label="الموقع"><Input value={editing.url || ''} onChange={(e) => setEditing({ ...editing, url: e.target.value })} dir="ltr" /></Field>
              <Field label="منح متاحة"><Select value={String(editing.scholarships || false)} onChange={(e) => setEditing({ ...editing, scholarships: e.target.value === 'true' })}>
                <option value="true">نعم</option><option value="false">لا</option>
              </Select></Field>
              <Field label="معدل القبول %"><Input type="number" value={editing.acceptance || 0} onChange={(e) => setEditing({ ...editing, acceptance: Number(e.target.value) })} /></Field>
              <Field label="معدل التوظيف %"><Input type="number" value={editing.employRate || 0} onChange={(e) => setEditing({ ...editing, employRate: Number(e.target.value) })} /></Field>
              <Field label="سنة التأسيس"><Input type="number" value={editing.founded || ''} onChange={(e) => setEditing({ ...editing, founded: Number(e.target.value) })} /></Field>
              <Field label="عدد الطلاب"><Input type="number" value={editing.students || 0} onChange={(e) => setEditing({ ...editing, students: Number(e.target.value) })} /></Field>
              <Field label="عدد الكليات"><Input type="number" value={editing.faculties || 0} onChange={(e) => setEditing({ ...editing, faculties: Number(e.target.value) })} /></Field>
              <Field label="الحرم" span={2}><Input value={editing.campus || ''} onChange={(e) => setEditing({ ...editing, campus: e.target.value })} /></Field>
              <Field label="الاعتماد" span={3}><Input value={editing.accred || ''} onChange={(e) => setEditing({ ...editing, accred: e.target.value })} /></Field>
              <Field label="الهاتف"><Input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} dir="ltr" /></Field>
              <Field label="الإيميل"><Input value={editing.email || ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} dir="ltr" /></Field>
              <Field label="العنوان"><Input value={editing.address || ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></Field>
            </div>

            <Field label="الوصف"><Textarea value={editing.desc || ''} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} /></Field>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="التخصصات (سطر لكل واحد)"><Textarea value={(editing.majors || []).join('\n')} onChange={(e) => setEditing({ ...editing, majors: e.target.value.split('\n').filter(Boolean) })} /></Field>
              <Field label="المسارات (سطر لكل واحد)"><Textarea value={(editing.paths || []).join('\n')} onChange={(e) => setEditing({ ...editing, paths: e.target.value.split('\n').filter(Boolean) })} /></Field>
            </div>
            <Field label="آخر موعد تقديم"><Input value={editing.application_deadline || ''} onChange={(e) => setEditing({ ...editing, application_deadline: e.target.value })} /></Field>
            <Field label="شروط القبول"><Textarea value={editing.requirements || ''} onChange={(e) => setEditing({ ...editing, requirements: e.target.value })} /></Field>
            <Field label="ملاحظات"><Textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></Field>
            <Field label="لون الـ gradient"><Input value={editing.color || ''} onChange={(e) => setEditing({ ...editing, color: e.target.value })} dir="ltr" /></Field>
          </div>
          <div className="flex gap-2 mt-6 sticky bottom-0 bg-surface pt-4 border-t">
            <button onClick={save} className="px-6 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">💾 حفظ</button>
            <button onClick={() => setEditing(null)} className="px-6 py-2.5 bg-bg-soft rounded-lg font-bold">إلغاء</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
