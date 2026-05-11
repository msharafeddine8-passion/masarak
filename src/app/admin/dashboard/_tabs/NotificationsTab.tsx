'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Field, Input, Textarea, Select, Modal, Toolbar, EmptyState } from './_shared';

export default function NotificationsTab({ flash }: { flash: (m: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [composing, setComposing] = useState(false);
  const [n, setN] = useState({ title: '', body: '', type: 'info', link: '', target_audience: 'all', scheduled_for: '' });

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await supabase.from('notifications').select('*').order('created_at', { ascending: false });
    setItems(data || []); setLoading(false);
  };

  const send = async () => {
    if (!n.title) { flash('❌ العنوان مطلوب'); return; }
    const { error } = await supabase.from('notifications').insert({
      title: n.title, body: n.body, type: n.type, link: n.link || null,
      target_audience: n.target_audience,
      scheduled_for: n.scheduled_for || new Date().toISOString(),
      user_id: null,
    });
    if (error) flash('❌ ' + error.message); else { flash('✓ تم الإرسال'); setComposing(false); setN({ title: '', body: '', type: 'info', link: '', target_audience: 'all', scheduled_for: '' }); await load(); }
  };

  const remove = async (id: number) => {
    if (!confirm('حذف؟')) return;
    await supabase.from('notifications').delete().eq('id', id); flash('✓'); await load();
  };

  return (
    <div>
      <Toolbar search="" setSearch={() => {}} onAdd={() => setComposing(true)} addLabel="+ إشعار جديد" count={items.length} total={items.length} />

      {loading ? <div className="text-center py-12">⏳</div> : items.length === 0 ? (
        <EmptyState icon="🔔" text="لا إشعارات مُرسلة بعد" />
      ) : (
        <div className="space-y-3">
          {items.map(n => (
            <div key={n.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${n.type === 'urgent' ? 'bg-red-100' : n.type === 'success' ? 'bg-emerald-100' : 'bg-blue-100'}`}>
                {n.type === 'urgent' ? '⚠️' : n.type === 'success' ? '✅' : '🔔'}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[#1b3a6b]">{n.title}</h3>
                {n.body && <p className="text-sm text-slate-600 mt-1">{n.body}</p>}
                <div className="text-xs text-slate-400 mt-2">
                  {new Date(n.created_at).toLocaleDateString('ar')} • {n.target_audience === 'all' ? 'جميع المستخدمين' : n.target_audience}
                </div>
              </div>
              <button onClick={() => remove(n.id)} className="text-red-600 hover:bg-red-50 px-3 py-1 rounded text-xs font-bold">🗑️</button>
            </div>
          ))}
        </div>
      )}

      {composing && (
        <Modal onClose={() => setComposing(false)} title="إشعار جديد">
          <div className="space-y-3">
            <Field label="العنوان"><Input value={n.title} onChange={(e) => setN({ ...n, title: e.target.value })} placeholder="مثلاً: منحة AUB متاحة الآن" /></Field>
            <Field label="المحتوى"><Textarea value={n.body} onChange={(e) => setN({ ...n, body: e.target.value })} /></Field>
            <div className="grid md:grid-cols-2 gap-3">
              <Field label="النوع"><Select value={n.type} onChange={(e) => setN({ ...n, type: e.target.value })}>
                <option value="info">📢 معلومة</option><option value="success">✅ نجاح</option><option value="urgent">⚠️ عاجل</option>
              </Select></Field>
              <Field label="الجمهور"><Select value={n.target_audience} onChange={(e) => setN({ ...n, target_audience: e.target.value })}>
                <option value="all">جميع المستخدمين</option><option value="grade_12">طلاب صف 12</option><option value="university">طلاب جامعيين</option><option value="graduate">خرّيجين</option>
              </Select></Field>
            </div>
            <Field label="رابط (اختياري)"><Input value={n.link} onChange={(e) => setN({ ...n, link: e.target.value })} dir="ltr" placeholder="/scholarships" /></Field>
            <Field label="موعد الإرسال (اختياري - فارغ = الآن)"><Input type="datetime-local" value={n.scheduled_for} onChange={(e) => setN({ ...n, scheduled_for: e.target.value })} /></Field>
            <div className="flex gap-2 pt-3">
              <button onClick={send} className="flex-1 px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold">📨 إرسال</button>
              <button onClick={() => setComposing(false)} className="px-5 py-2.5 bg-slate-100 rounded-lg font-bold">إلغاء</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
