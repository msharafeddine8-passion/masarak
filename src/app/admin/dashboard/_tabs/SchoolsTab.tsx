'use client';
import { useEffect, useState } from 'react';
import { fetchSchools, saveSchool, deleteSchool, seedSchools } from '@/lib/entities';
import { Field, Input, Textarea, Select, Modal, ImageUpload, Toolbar, EmptyState } from './_shared';

export default function SchoolsTab({ flash }: { flash: (m: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => { setLoading(true); setItems(await fetchSchools() as any); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.name) { flash('❌ الاسم مطلوب'); return; }
    const { error } = await saveSchool(editing);
    if (error) flash('❌ ' + error.message); else { flash('✓ حُفظ'); setEditing(null); await load(); }
  };
  const remove = async (id: number) => {
    if (!confirm('حذف؟')) return;
    await deleteSchool(id); flash('✓ حُذف'); await load();
  };
  const handleSeed = async () => {
    if (!confirm('استيراد 30 مدرسة؟')) return;
    await seedSchools(); flash('✓ استورد'); await load();
  };

  const filtered = items.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));
  const newSchool = () => setEditing({ id: 0, name: '', region: '', area: '', type: 'خاصة', curriculum: [], lang: '', feesMin: 0, feesMax: 0, grades: 'KG-12', founded: 2000, students: 500, rating: 3, features: [], desc: '', emoji: '🏫', color: 'from-blue-500 to-blue-700' });

  return (
    <div>
      <Toolbar search={search} setSearch={setSearch} onAdd={newSchool} addLabel="+ مدرسة جديدة"
        onSeed={items.length === 0 ? handleSeed : undefined} count={filtered.length} total={items.length} />

      {loading ? <div className="text-center py-12">⏳</div> : filtered.length === 0 ? (
        <EmptyState text="لا مدارس بعد" />
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>
              <th className="px-3 py-3 text-right">ID</th>
              <th className="px-3 py-3 text-right">المدرسة</th>
              <th className="px-3 py-3 text-right">المنطقة</th>
              <th className="px-3 py-3 text-right">النوع</th>
              <th className="px-3 py-3 text-right">الرسوم</th>
              <th className="px-3 py-3 text-center">الإجراءات</th>
            </tr></thead>
            <tbody>
              {filtered.map((s: any) => (
                <tr key={s.id} className="border-t hover:bg-slate-50">
                  <td className="px-3 py-3 text-slate-500 font-mono text-xs">{s.id}</td>
                  <td className="px-3 py-3 font-semibold">{s.emoji} {s.name}</td>
                  <td className="px-3 py-3 text-slate-600 text-xs">{s.region} - {s.area}</td>
                  <td className="px-3 py-3"><span className="text-xs bg-slate-100 px-2 py-1 rounded">{s.type}</span></td>
                  <td className="px-3 py-3 text-xs">{s.feesMin === 0 ? 'مجاني' : `$${s.feesMin}-${s.feesMax}`}</td>
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <button onClick={() => setEditing({ ...s })} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-bold ml-1">✏️</button>
                    <button onClick={() => remove(s.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)} title={editing.id ? `تعديل: ${editing.name}` : 'مدرسة جديدة'} size="xl">
          <div className="space-y-5">
            <Field label="صورة الغلاف"><ImageUpload value={editing.photo} onChange={(v) => setEditing({ ...editing, photo: v })} folder="schools" /></Field>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Field label="ID"><Input type="number" value={editing.id || ''} onChange={(e) => setEditing({ ...editing, id: Number(e.target.value) })} /></Field>
              <Field label="إيموجي"><Input value={editing.emoji || ''} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} /></Field>
              <Field label="التقييم (1-5)"><Input type="number" min={1} max={5} value={editing.rating || 3} onChange={(e) => setEditing({ ...editing, rating: Number(e.target.value) })} /></Field>
              <Field label="الاسم" span={3}><Input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
              <Field label="المنطقة"><Input value={editing.region || ''} onChange={(e) => setEditing({ ...editing, region: e.target.value })} /></Field>
              <Field label="المنطقة التفصيلية"><Input value={editing.area || ''} onChange={(e) => setEditing({ ...editing, area: e.target.value })} /></Field>
              <Field label="النوع"><Select value={editing.type || ''} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
                <option value="خاصة">خاصة</option><option value="رسمية">رسمية</option><option value="دولية">دولية</option><option value="مهنية">مهنية</option>
              </Select></Field>
              <Field label="اللغة"><Input value={editing.lang || ''} onChange={(e) => setEditing({ ...editing, lang: e.target.value })} /></Field>
              <Field label="المراحل"><Input value={editing.grades || ''} onChange={(e) => setEditing({ ...editing, grades: e.target.value })} /></Field>
              <Field label="سنة التأسيس"><Input type="number" value={editing.founded || ''} onChange={(e) => setEditing({ ...editing, founded: Number(e.target.value) })} /></Field>
              <Field label="الرسوم الدنيا"><Input type="number" value={editing.feesMin || 0} onChange={(e) => setEditing({ ...editing, feesMin: Number(e.target.value) })} /></Field>
              <Field label="الرسوم القصوى"><Input type="number" value={editing.feesMax || 0} onChange={(e) => setEditing({ ...editing, feesMax: Number(e.target.value) })} /></Field>
              <Field label="عدد الطلاب"><Input type="number" value={editing.students || 0} onChange={(e) => setEditing({ ...editing, students: Number(e.target.value) })} /></Field>
              <Field label="الهاتف"><Input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} dir="ltr" /></Field>
              <Field label="الموقع"><Input value={editing.website || ''} onChange={(e) => setEditing({ ...editing, website: e.target.value })} dir="ltr" /></Field>
              <Field label="الإيميل"><Input value={editing.email || ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} dir="ltr" /></Field>
              <Field label="العنوان" span={3}><Input value={editing.address || ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></Field>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="المناهج (سطر لكل واحد)"><Textarea value={(editing.curriculum || []).join('\n')} onChange={(e) => setEditing({ ...editing, curriculum: e.target.value.split('\n').filter(Boolean) })} /></Field>
              <Field label="المميزات (سطر لكل واحد)"><Textarea value={(editing.features || []).join('\n')} onChange={(e) => setEditing({ ...editing, features: e.target.value.split('\n').filter(Boolean) })} /></Field>
            </div>
            <Field label="الوصف"><Textarea value={editing.desc || ''} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} /></Field>
            <Field label="ملاحظات"><Textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></Field>
            <Field label="لون الـ gradient"><Input value={editing.color || ''} onChange={(e) => setEditing({ ...editing, color: e.target.value })} dir="ltr" /></Field>
          </div>
          <div className="flex gap-2 mt-5 sticky bottom-0 bg-white pt-3 border-t">
            <button onClick={save} className="px-6 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">💾 حفظ</button>
            <button onClick={() => setEditing(null)} className="px-6 py-2.5 bg-slate-100 rounded-lg font-bold">إلغاء</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
