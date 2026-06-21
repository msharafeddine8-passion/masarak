'use client';
import { useEffect, useState } from 'react';
import { fetchSchools, saveSchool, deleteSchool, seedSchools } from '@/lib/entities';
import { Field, Input, Textarea, Select, Modal, ImageUpload, Toolbar, EmptyState } from './_shared';

export default function SchoolsTab({ flash }: { flash: (m: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<'rating' | 'name' | 'id'>('rating');

  const load = async () => { setLoading(true); setItems(await fetchSchools() as any); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.name) { flash('❌ الاسم مطلوب'); return; }
    const { error } = await saveSchool(editing);
    if (error) flash('❌ ' + error.message); else { flash('✓ حُفظ'); setEditing(null); await load(); }
  };
  const remove = async (id: number) => { if (!confirm('حذف؟')) return; await deleteSchool(id); flash('✓'); await load(); };
  const handleSeed = async () => { if (!confirm('استيراد 30 مدرسة؟')) return; await seedSchools(); flash('✓'); await load(); };

  let filtered = items.filter(s => !search || s.name.toLowerCase().includes(search.toLowerCase()));
  filtered = [...filtered].sort((a, b) => {
    if (sort === 'name') return (a.name || '').localeCompare(b.name || '');
    if (sort === 'rating') return (b.rating || 0) - (a.rating || 0);
    return (a.id || 0) - (b.id || 0);
  });

  const newSchool = () => setEditing({
    id: 0, name: '', region: '', area: '', type: 'خاصة', curriculum: [], lang: '',
    feesMin: 0, feesMax: 0, grades: 'KG-12', founded: 2000, students: 500, rating: 3,
    features: [], desc: '', emoji: '🏫', color: 'from-blue-500 to-blue-700', photo: '', logo: ''
  });

  return (
    <div>
      <Toolbar
        search={search} setSearch={setSearch} onAdd={newSchool} addLabel="+ مدرسة جديدة"
        onSeed={items.length === 0 ? handleSeed : undefined}
        count={filtered.length} total={items.length}
        extra={
          <Select value={sort} onChange={(e) => setSort(e.target.value as any)}>
            <option value="rating">ترتيب: التقييم</option>
            <option value="name">ترتيب: الاسم</option>
            <option value="id">ترتيب: ID</option>
          </Select>
        }
      />

      {loading ? <div className="text-center py-12">⏳</div> : filtered.length === 0 ? (
        <EmptyState text="لا مدارس بعد" />
      ) : (
        <div className="bg-surface rounded-2xl border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft"><tr>
              <th className="px-3 py-3 text-right">لوغو</th>
              <th className="px-3 py-3 text-right">صورة</th>
              <th className="px-3 py-3 text-right">ID</th>
              <th className="px-3 py-3 text-right">المدرسة</th>
              <th className="px-3 py-3 text-right">التقييم</th>
              <th className="px-3 py-3 text-right">المنطقة</th>
              <th className="px-3 py-3 text-right">النوع</th>
              <th className="px-3 py-3 text-center">الإجراءات</th>
            </tr></thead>
            <tbody>
              {filtered.map((s: any) => (
                <tr key={s.id} className="border-t hover:bg-bg-soft">
                  <td className="px-3 py-3">
                    {s.logo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={s.logo} alt="" className="w-9 h-9 rounded-full object-cover border" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : <div className="w-9 h-9 rounded-full bg-bg-soft flex items-center justify-center text-lg">{s.emoji}</div>}
                  </td>
                  <td className="px-3 py-3">
                    {s.photo ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={s.photo} alt="" className="w-12 h-9 object-cover rounded" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : <div className="w-12 h-9 bg-bg-soft rounded"></div>}
                  </td>
                  <td className="px-3 py-3 text-ink-subtle font-mono text-xs">{s.id}</td>
                  <td className="px-3 py-3 font-semibold">{s.name}</td>
                  <td className="px-3 py-3 text-yellow-400">{'★'.repeat(s.rating || 0)}</td>
                  <td className="px-3 py-3 text-xs">{s.region} - {s.area}</td>
                  <td className="px-3 py-3"><span className="text-xs bg-bg-soft px-2 py-1 rounded">{s.type}</span></td>
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
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="🎨 لوغو المدرسة">
                <ImageUpload value={editing.logo} onChange={(v) => setEditing({ ...editing, logo: v })} folder="schools/logos" />
              </Field>
              <Field label="🖼️ صورة الغلاف">
                <ImageUpload value={editing.photo} onChange={(v) => setEditing({ ...editing, photo: v })} folder="schools" />
              </Field>
            </div>

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
          <div className="flex gap-2 mt-5 sticky bottom-0 bg-surface pt-3 border-t">
            <button onClick={save} className="px-6 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">💾 حفظ</button>
            <button onClick={() => setEditing(null)} className="px-6 py-2.5 bg-bg-soft rounded-lg font-bold">إلغاء</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
