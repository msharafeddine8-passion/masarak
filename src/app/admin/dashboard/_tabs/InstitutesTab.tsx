'use client';
import { useEffect, useState } from 'react';
import { fetchInstitutes, saveInstitute, deleteInstitute, seedInstitutes } from '@/lib/entities';
import { Field, Input, Textarea, Select, Modal, Toolbar, EmptyState } from './_shared';

export default function InstitutesTab({ flash }: { flash: (m: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => { setLoading(true); setItems(await fetchInstitutes() as any); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.name) { flash('❌'); return; }
    const { error } = await saveInstitute(editing);
    if (error) flash('❌ ' + error.message); else { flash('✓'); setEditing(null); await load(); }
  };
  const remove = async (id: number) => { if (!confirm('حذف؟')) return; await deleteInstitute(id); flash('✓'); await load(); };
  const handleSeed = async () => { await seedInstitutes(); flash('✓'); await load(); };

  const filtered = items.filter(i => !search || i.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <Toolbar search={search} setSearch={setSearch}
        onAdd={() => setEditing({ id: 0, name: '', region: '', type: 'رسمي', specialties: [], emoji: '🏭' })}
        addLabel="+ معهد جديد"
        onSeed={items.length === 0 ? handleSeed : undefined} count={filtered.length} total={items.length} />
      {loading ? <div className="text-center py-12">⏳</div> : filtered.length === 0 ? (
        <EmptyState text="لا معاهد بعد" />
      ) : (
        <div className="bg-surface rounded-2xl border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft"><tr>
              <th className="px-3 py-3 text-right">ID</th><th className="px-3 py-3 text-right">الاسم</th>
              <th className="px-3 py-3 text-right">المنطقة</th><th className="px-3 py-3 text-right">النوع</th>
              <th className="px-3 py-3 text-center">الإجراءات</th>
            </tr></thead>
            <tbody>
              {filtered.map((i: any) => (
                <tr key={i.id} className="border-t hover:bg-bg-soft">
                  <td className="px-3 py-3 font-mono text-xs">{i.id}</td>
                  <td className="px-3 py-3 font-semibold">{i.emoji} {i.name}</td>
                  <td className="px-3 py-3 text-xs">{i.region}</td>
                  <td className="px-3 py-3"><span className="text-xs bg-bg-soft px-2 py-1 rounded">{i.type}</span></td>
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <button onClick={() => setEditing({ ...i })} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-bold ml-1">✏️</button>
                    <button onClick={() => remove(i.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold">🗑️</button>
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
            <Field label="إيموجي"><Input value={editing.emoji || ''} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} /></Field>
            <Field label="الاسم" span={2}><Input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="المنطقة"><Input value={editing.region || ''} onChange={(e) => setEditing({ ...editing, region: e.target.value })} /></Field>
            <Field label="النوع"><Select value={editing.type || ''} onChange={(e) => setEditing({ ...editing, type: e.target.value })}>
              <option value="رسمي">رسمي</option><option value="خاص">خاص</option><option value="مهني">مهني</option>
            </Select></Field>
            <Field label="الموقع" span={2}><Input value={editing.website || ''} onChange={(e) => setEditing({ ...editing, website: e.target.value })} dir="ltr" /></Field>
            <Field label="الهاتف"><Input value={editing.phone || ''} onChange={(e) => setEditing({ ...editing, phone: e.target.value })} dir="ltr" /></Field>
            <Field label="الإيميل"><Input value={editing.email || ''} onChange={(e) => setEditing({ ...editing, email: e.target.value })} dir="ltr" /></Field>
            <Field label="العنوان" span={2}><Input value={editing.address || ''} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></Field>
          </div>
          <div className="mt-3">
            <Field label="التخصصات (سطر لكل واحدة)"><Textarea value={(editing.specialties || []).join('\n')} onChange={(e) => setEditing({ ...editing, specialties: e.target.value.split('\n').filter(Boolean) })} /></Field>
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
