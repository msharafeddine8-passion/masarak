'use client';

import { useEffect, useState, type ChangeEvent } from 'react';
import { supabase } from '@/lib/supabase';

interface TeamMember {
  id: string;
  name_ar: string;
  name: string;
  role_ar: string;
  role: string;
  bio_ar: string;
  bio: string;
  avatar_url: string;
  avatar_emoji: string;
  email: string;
  linkedin_url: string;
  display_order: number;
  is_visible: boolean;
  created_at: string;
}

const EMPTY: Omit<TeamMember, 'id' | 'created_at'> = {
  name_ar: '',
  name: '',
  role_ar: '',
  role: '',
  bio_ar: '',
  bio: '',
  avatar_url: '',
  avatar_emoji: '👤',
  email: '',
  linkedin_url: '',
  display_order: 0,
  is_visible: true,
};

export default function TeamTab({ flash }: { flash: (m: string) => void }) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState<Omit<TeamMember, 'id' | 'created_at'>>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const fetchMembers = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('team_members')
      .select('*')
      .order('display_order', { ascending: true });
    setMembers(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchMembers(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY);
    setShowForm(true);
  };

  const openEdit = (m: TeamMember) => {
    setEditing(m);
    setForm({
      name_ar: m.name_ar,
      name: m.name || '',
      role_ar: m.role_ar,
      role: m.role || '',
      bio_ar: m.bio_ar || '',
      bio: m.bio || '',
      avatar_url: m.avatar_url || '',
      avatar_emoji: m.avatar_emoji || '👤',
      email: m.email || '',
      linkedin_url: m.linkedin_url || '',
      display_order: m.display_order,
      is_visible: m.is_visible,
    });
    setShowForm(true);
  };

  async function uploadPhoto(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]; if (!file) return;
    if (file.size > 3 * 1024 * 1024) { flash('⚠️ الصورة أكبر من 3MB'); return; }
    setUploadingPhoto(true);
    try {
      const path = `team/${Date.now()}.${file.name.split('.').pop() || 'jpg'}`;
      const { error } = await supabase.storage.from('images').upload(path, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      const { data: pub } = supabase.storage.from('images').getPublicUrl(path);
      setForm(f => ({ ...f, avatar_url: pub.publicUrl }));
      flash('✅ تم رفع الصورة');
    } catch { flash('❌ فشل رفع الصورة'); }
    finally { setUploadingPhoto(false); if (e.target) e.target.value = ''; }
  }

  const handleSave = async () => {
    if (!form.name_ar.trim() || !form.role_ar.trim()) {
      flash('⚠️ الاسم بالعربي والدور مطلوبان');
      return;
    }
    setSaving(true);
    if (editing) {
      const { error } = await supabase
        .from('team_members')
        .update(form)
        .eq('id', editing.id);
      if (error) { flash('❌ خطأ في الحفظ'); setSaving(false); return; }
      flash('✅ تم تحديث العضو');
    } else {
      const { error } = await supabase
        .from('team_members')
        .insert(form);
      if (error) { flash('❌ خطأ في الإضافة'); setSaving(false); return; }
      flash('✅ تمت إضافة العضو');
    }
    setSaving(false);
    setEditing(null);
    setForm(EMPTY);
    setShowForm(false);
    fetchMembers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('تأكيد حذف هذا العضو؟')) return;
    setDeleting(id);
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) { flash('❌ خطأ في الحذف'); setDeleting(null); return; }
    flash('🗑️ تم الحذف');
    setDeleting(null);
    fetchMembers();
  };

  const toggleVisible = async (m: TeamMember) => {
    await supabase.from('team_members').update({ is_visible: !m.is_visible }).eq('id', m.id);
    setMembers(prev => prev.map(p => p.id === m.id ? { ...p, is_visible: !m.is_visible } : p));
  };

  const isFormOpen = editing !== null || (form !== EMPTY && form.name_ar !== '');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-[#1b3a6b]">👥 إدارة الفريق</h2>
          <p className="text-ink-subtle text-sm mt-1">
            المصدر: جدول <code className="bg-bg-soft px-1 rounded text-xs">team_members</code> — Supabase
          </p>
        </div>
        <button
          onClick={openNew}
          className="bg-[#1b3a6b] text-white px-4 py-2 rounded-xl font-semibold hover:bg-[#142d54] transition flex items-center gap-2"
        >
          + إضافة عضو
        </button>
      </div>

      {/* Form Drawer */}
      {showForm && (
        <div className="bg-surface border-2 border-[#1b3a6b]/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-[#1b3a6b] mb-5">
            {editing ? '✏️ تعديل العضو' : '➕ عضو جديد'}
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="الاسم بالعربي *" value={form.name_ar} onChange={v => setForm(f => ({ ...f, name_ar: v }))} />
            <Field label="الاسم بالإنجليزي" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
            <Field label="المنصب بالعربي *" value={form.role_ar} onChange={v => setForm(f => ({ ...f, role_ar: v }))} />
            <Field label="المنصب بالإنجليزي" value={form.role} onChange={v => setForm(f => ({ ...f, role: v }))} />
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-ink-muted mb-1">السيرة الذاتية بالعربي</label>
              <textarea
                value={form.bio_ar}
                onChange={e => setForm(f => ({ ...f, bio_ar: e.target.value }))}
                rows={3}
                className="w-full border border-line rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3a6b]/30 resize-none"
                placeholder="نبذة مختصرة..."
              />
            </div>
            <Field label="البريد الإلكتروني" value={form.email} onChange={v => setForm(f => ({ ...f, email: v }))} type="email" />
            <Field label="رابط LinkedIn" value={form.linkedin_url} onChange={v => setForm(f => ({ ...f, linkedin_url: v }))} />
            <div>
              <label className="block text-sm font-semibold text-ink-muted mb-1">صورة العضو</label>
              <div className="flex items-center gap-3">
                {form.avatar_url ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={form.avatar_url} alt="" className="w-12 h-12 rounded-full object-cover border border-line" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-bg-soft flex items-center justify-center text-xl">{form.avatar_emoji || '👤'}</div>
                )}
                <label className="px-3 py-2 rounded-xl bg-bg-soft border border-line text-sm font-bold cursor-pointer hover:border-[#1b3a6b]">
                  {uploadingPhoto ? 'جارٍ الرفع...' : '📤 رفع صورة'}
                  <input type="file" accept="image/*" onChange={uploadPhoto} className="hidden" disabled={uploadingPhoto} />
                </label>
              </div>
              <input value={form.avatar_url} onChange={e => setForm(f => ({ ...f, avatar_url: e.target.value }))} placeholder="أو الصق رابط صورة" dir="ltr" className="mt-2 w-full border border-line rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3a6b]/30" />
            </div>
            <Field label="إيموجي الأفاتار" value={form.avatar_emoji} onChange={v => setForm(f => ({ ...f, avatar_emoji: v }))} />
            <div>
              <label className="block text-sm font-semibold text-ink-muted mb-1">ترتيب العرض</label>
              <input
                type="number"
                value={form.display_order}
                onChange={e => setForm(f => ({ ...f, display_order: parseInt(e.target.value) || 0 }))}
                className="w-full border border-line rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3a6b]/30"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input
                id="is_visible"
                type="checkbox"
                checked={form.is_visible}
                onChange={e => setForm(f => ({ ...f, is_visible: e.target.checked }))}
                className="w-4 h-4 accent-[#1b3a6b]"
              />
              <label htmlFor="is_visible" className="text-sm font-semibold text-ink-muted">مرئي للزوار</label>
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1b3a6b] text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-[#142d54] disabled:opacity-50 transition"
            >
              {saving ? 'جارٍ الحفظ...' : '💾 حفظ'}
            </button>
            <button
              onClick={() => { setEditing(null); setForm(EMPTY); setShowForm(false); }}
              className="px-6 py-2.5 rounded-xl border border-line text-ink-muted hover:bg-bg-soft font-semibold transition"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Members Table */}
      {loading ? (
        <div className="text-center py-12 text-slate-400">جارٍ التحميل...</div>
      ) : members.length === 0 ? (
        <div className="text-center py-12 bg-surface rounded-2xl border border-slate-100">
          <div className="text-5xl mb-3">👤</div>
          <p className="text-slate-400">لا يوجد أعضاء فريق بعد. ابدأ بإضافة عضو.</p>
        </div>
      ) : (
        <div className="bg-surface rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-bg-soft border-b border-slate-100">
                <tr>
                  <th className="px-4 py-3 text-right font-semibold text-ink-muted">العضو</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink-muted">المنصب</th>
                  <th className="px-4 py-3 text-right font-semibold text-ink-muted">البريد</th>
                  <th className="px-4 py-3 text-center font-semibold text-ink-muted">الترتيب</th>
                  <th className="px-4 py-3 text-center font-semibold text-ink-muted">مرئي</th>
                  <th className="px-4 py-3 text-center font-semibold text-ink-muted">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {members.map(m => (
                  <tr key={m.id} className="border-t border-slate-100 hover:bg-bg-soft transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {m.avatar_url ? (
                          <img src={m.avatar_url} alt={m.name_ar} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[#1b3a6b]/10 flex items-center justify-center text-xl">
                            {m.avatar_emoji || '👤'}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-[#1b3a6b]">{m.name_ar}</div>
                          {m.name && <div className="text-xs text-slate-400">{m.name}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-ink-muted">{m.role_ar}</div>
                      {m.role && <div className="text-xs text-slate-400">{m.role}</div>}
                    </td>
                    <td className="px-4 py-3 text-ink-subtle">{m.email || '—'}</td>
                    <td className="px-4 py-3 text-center text-ink-subtle">{m.display_order}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => toggleVisible(m)}
                        className={`px-2 py-1 rounded-full text-xs font-bold transition ${
                          m.is_visible
                            ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                            : 'bg-bg-soft text-ink-subtle hover:bg-bg-soft'
                        }`}
                      >
                        {m.is_visible ? '✓ مرئي' : '○ مخفي'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEdit(m)}
                          className="px-3 py-1.5 bg-[#1b3a6b]/10 text-[#1b3a6b] rounded-lg text-xs font-semibold hover:bg-[#1b3a6b]/20 transition"
                        >
                          ✏️ تعديل
                        </button>
                        <button
                          onClick={() => handleDelete(m.id)}
                          disabled={deleting === m.id}
                          className="px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-semibold hover:bg-red-100 disabled:opacity-50 transition"
                        >
                          {deleting === m.id ? '...' : '🗑️'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-4 py-3 border-t border-slate-100 bg-bg-soft text-xs text-slate-400">
            المصدر: <strong>team_members</strong> · Supabase · {members.length} عضو
          </div>
        </div>
      )}
    </div>
  );
}

function Field({
  label, value, onChange, type = 'text', placeholder = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-ink-muted mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-line rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b3a6b]/30"
      />
    </div>
  );
}
