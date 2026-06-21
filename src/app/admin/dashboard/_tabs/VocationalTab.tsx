'use client';
import { useEffect, useState } from 'react';
import { fetchTracks, saveTrack, deleteTrack, seedTracks } from '@/lib/entities';
import { Field, Input, Textarea, Select, Modal, Toolbar, EmptyState } from './_shared';

export default function VocationalTab({ flash }: { flash: (m: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => { setLoading(true); setItems(await fetchTracks() as any); setLoading(false); };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing.id || !editing.name) { flash('❌ ID والاسم مطلوبان'); return; }
    const { error } = await saveTrack(editing);
    if (error) flash('❌ ' + error.message); else { flash('✓ حُفظ'); setEditing(null); await load(); }
  };
  const remove = async (id: string) => {
    if (!confirm('حذف؟')) return;
    await deleteTrack(id); flash('✓'); await load();
  };
  const handleSeed = async () => { if (!confirm('استيراد المسارات؟')) return; await seedTracks(); flash('✓'); await load(); };

  const filtered = items.filter(t => !search || t.name.toLowerCase().includes(search.toLowerCase()));
  const newTrack = () => setEditing({ id: '', code: 'BT', name: '', duration: '', level: 'BT', sector: '', desc: '', subjects: [], salaryLB: '', salaryGulf: '', demand: 'متوسط', emoji: '🛠️' });

  return (
    <div>
      <Toolbar search={search} setSearch={setSearch} onAdd={newTrack} addLabel="+ مسار جديد"
        onSeed={items.length === 0 ? handleSeed : undefined} count={filtered.length} total={items.length} />
      {loading ? <div className="text-center py-12">⏳</div> : filtered.length === 0 ? (
        <EmptyState text="لا مسارات بعد" />
      ) : (
        <div className="bg-surface rounded-2xl border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft"><tr>
              <th className="px-3 py-3 text-right">ID</th><th className="px-3 py-3 text-right">الاسم</th>
              <th className="px-3 py-3 text-right">المستوى</th><th className="px-3 py-3 text-right">القطاع</th>
              <th className="px-3 py-3 text-right">الراتب</th><th className="px-3 py-3 text-center">الإجراءات</th>
            </tr></thead>
            <tbody>
              {filtered.map((t: any) => (
                <tr key={t.id} className="border-t hover:bg-bg-soft">
                  <td className="px-3 py-3 font-mono text-xs">{t.id}</td>
                  <td className="px-3 py-3 font-semibold">{t.emoji} {t.name}</td>
                  <td className="px-3 py-3"><span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold">{t.level}</span></td>
                  <td className="px-3 py-3 text-xs">{t.sector}</td>
                  <td className="px-3 py-3 text-xs">{t.salaryLB}</td>
                  <td className="px-3 py-3 text-center whitespace-nowrap">
                    <button onClick={() => setEditing({ ...t })} className="text-blue-600 hover:bg-blue-50 px-2 py-1 rounded text-xs font-bold ml-1">✏️</button>
                    <button onClick={() => remove(t.id)} className="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-xs font-bold">🗑️</button>
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
            <Field label="إيموجي"><Input value={editing.emoji || ''} onChange={(e) => setEditing({ ...editing, emoji: e.target.value })} /></Field>
            <Field label="الاسم" span={2}><Input value={editing.name || ''} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <Field label="المستوى"><Select value={editing.level || ''} onChange={(e) => setEditing({ ...editing, level: e.target.value, code: e.target.value })}>
              <option value="LT">LT</option><option value="BT">BT</option><option value="TS">TS</option><option value="licence">إجازة</option>
            </Select></Field>
            <Field label="المدة"><Input value={editing.duration || ''} onChange={(e) => setEditing({ ...editing, duration: e.target.value })} /></Field>
            <Field label="القطاع"><Input value={editing.sector || ''} onChange={(e) => setEditing({ ...editing, sector: e.target.value })} /></Field>
            <Field label="الراتب لبنان"><Input value={editing.salaryLB || ''} onChange={(e) => setEditing({ ...editing, salaryLB: e.target.value })} /></Field>
            <Field label="الراتب الخليج"><Input value={editing.salaryGulf || ''} onChange={(e) => setEditing({ ...editing, salaryGulf: e.target.value })} /></Field>
            <Field label="الطلب"><Select value={editing.demand || ''} onChange={(e) => setEditing({ ...editing, demand: e.target.value })}>
              <option value="عالٍ جداً">عالٍ جداً</option><option value="عالٍ">عالٍ</option><option value="متوسط">متوسط</option><option value="منخفض">منخفض</option>
            </Select></Field>
            <Field label="معادلة جامعية" span={2}><Input value={editing.uniEquiv || ''} onChange={(e) => setEditing({ ...editing, uniEquiv: e.target.value })} /></Field>
          </div>
          <div className="mt-3 space-y-3">
            <Field label="الوصف"><Textarea value={editing.desc || ''} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} /></Field>
            <Field label="المواد (سطر لكل واحدة)"><Textarea value={(editing.subjects || []).join('\n')} onChange={(e) => setEditing({ ...editing, subjects: e.target.value.split('\n').filter(Boolean) })} /></Field>
            <Field label="ملاحظات"><Textarea value={editing.notes || ''} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></Field>
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
