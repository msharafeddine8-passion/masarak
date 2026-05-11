'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Toolbar, EmptyState } from './_shared';

export default function ReviewsTab({ flash }: { flash: (m: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await supabase.from('entity_reviews').select('*').order('created_at', { ascending: false });
    setItems(data || []); setLoading(false);
  };

  const toggleVisible = async (r: any) => {
    await supabase.from('entity_reviews').update({ is_visible: !r.is_visible }).eq('id', r.id);
    await load(); flash(r.is_visible ? '✓ مخفي' : '✓ ظاهر');
  };
  const remove = async (id: number) => {
    if (!confirm('حذف؟')) return;
    await supabase.from('entity_reviews').delete().eq('id', id); flash('✓'); await load();
  };

  const filtered = items.filter(r => !search || r.text.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <Toolbar search={search} setSearch={setSearch} onAdd={() => {}} addLabel="" count={filtered.length} total={items.length} />
      {loading ? <div className="text-center py-12">⏳</div> : filtered.length === 0 ? (
        <EmptyState icon="⭐" text="لا تقييمات بعد" />
      ) : (
        <div className="grid lg:grid-cols-2 gap-4">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <span className="text-yellow-400 text-lg">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
                  <div className="text-xs text-slate-500 mt-1">
                    {r.entity_type} #{r.entity_id} • {r.status_year} • {new Date(r.created_at).toLocaleDateString('ar')}
                  </div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full font-bold ${r.is_visible ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {r.is_visible ? '✓ ظاهر' : '🚫 مخفي'}
                </span>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed mb-3">{r.text}</p>
              <div className="flex gap-2">
                <button onClick={() => toggleVisible(r)} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg">
                  {r.is_visible ? '🚫 إخفاء' : '✓ إظهار'}
                </button>
                <button onClick={() => remove(r.id)} className="text-xs font-bold text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg">🗑️ حذف</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
