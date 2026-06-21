'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Toolbar, EmptyState } from './_shared';

export default function UsersTab({ flash }: { flash: (m: string) => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);
  const load = async () => {
    const { data } = await supabase.from('student_profiles').select('*').order('created_at', { ascending: false });
    setItems(data || []); setLoading(false);
  };

  const filtered = items.filter(u => !search || (u.full_name || '').toLowerCase().includes(search.toLowerCase()) || (u.school_name || '').toLowerCase().includes(search.toLowerCase()));

  const exportCSV = () => {
    const csv = ['الاسم,المدرسة,المرحلة,الفرع,المعدل,اكتمال'].concat(
      filtered.map(u => `"${u.full_name || ''}","${u.school_name || ''}","${u.grade_level || ''}","${u.bac_section || ''}","${u.bac_grade || ''}","${u.profile_completion || 0}%"`)
    ).join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'users.csv'; a.click();
  };

  return (
    <div>
      <Toolbar search={search} setSearch={setSearch}
        onAdd={() => flash('ℹ️ المستخدمون يسجّلون بأنفسهم')} addLabel="ℹ️"
        count={filtered.length} total={items.length}
        extra={<button onClick={exportCSV} className="px-3 py-2 bg-bg-soft hover:bg-bg-soft rounded-lg font-bold text-sm">📊 CSV</button>}
      />
      {loading ? <div className="text-center py-12">⏳</div> : filtered.length === 0 ? (
        <EmptyState icon="👥" text="لا مستخدمون مسجّلون بعد" />
      ) : (
        <div className="bg-surface rounded-2xl border border-slate-100 overflow-hidden shadow-sm overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-bg-soft"><tr>
              <th className="px-3 py-3 text-right">صورة</th>
              <th className="px-3 py-3 text-right">الاسم</th>
              <th className="px-3 py-3 text-right">المدرسة</th>
              <th className="px-3 py-3 text-right">المرحلة</th>
              <th className="px-3 py-3 text-right">الفرع</th>
              <th className="px-3 py-3 text-right">المعدل</th>
              <th className="px-3 py-3 text-right">آخر نشاط</th>
              <th className="px-3 py-3 text-right">XP</th>
            </tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.user_id} className="border-t hover:bg-bg-soft">
                  <td className="px-3 py-2">
                    <div className="w-9 h-9 rounded-full bg-bg-soft overflow-hidden flex items-center justify-center font-bold text-sm">
                      {u.avatar_url ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={u.avatar_url} className="w-full h-full object-cover" alt="" /> : (u.full_name || '?').charAt(0)}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-semibold">{u.full_name || '—'}</td>
                  <td className="px-3 py-3 text-xs text-ink-muted">{u.school_name || '—'}</td>
                  <td className="px-3 py-3 text-xs">{u.grade_level || '—'}</td>
                  <td className="px-3 py-3 text-xs">{u.bac_section || '—'}</td>
                  <td className="px-3 py-3 text-xs">{u.bac_grade || '—'}</td>
                  <td className="px-3 py-3 text-xs text-ink-subtle">{u.last_active ? new Date(u.last_active).toLocaleDateString('ar') : '—'}</td>
                  <td className="px-3 py-3 text-xs font-bold text-amber-600">{u.xp || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
