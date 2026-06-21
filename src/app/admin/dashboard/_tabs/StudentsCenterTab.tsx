'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { logAdminAction } from '@/lib/adminLog';

type Student = {
  id: string;
  email?: string | null;
  full_name?: string | null;
  role?: string | null;
  grade?: string | null;
  city?: string | null;
  created_at: string;
  last_sign_in_at?: string | null;
  banned_until?: string | null;
  saved_count?: number;
  events_30d?: number;
  dna_completed?: boolean;
};

type Props = { flash: (m: string) => void };

export default function StudentsCenterTab({ flash }: Props) {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'suspended' | 'verified' | 'dna_done' | 'never_logged_in'>('all');
  const [selected, setSelected] = useState<Student | null>(null);

  async function load() {
    setLoading(true);
    // Fetch from student_profiles (and optionally join auth.users via RPC).
    // student_profiles is the source of truth for student data.
    const { data, error } = await supabase
      .from('student_profiles')
      .select('id, email, full_name, role, grade, city, created_at, last_sign_in_at, banned_until')
      .order('created_at', { ascending: false })
      .limit(500);

    if (error) {
      console.error('[students]', error);
      setLoading(false);
      return;
    }

    // Enrich with saved_items count + analytics events count (best-effort)
    const ids = (data || []).map((s: { id: string }) => s.id);
    const enriched: Student[] = (data || []).map((s) => s as Student);

    if (ids.length > 0) {
      // saved_items count per user (best-effort)
      const { data: saves } = await supabase
        .from('saved_items')
        .select('user_id')
        .in('user_id', ids);
      if (saves) {
        const counts: Record<string, number> = {};
        for (const r of saves as { user_id: string }[]) {
          counts[r.user_id] = (counts[r.user_id] || 0) + 1;
        }
        for (const s of enriched) s.saved_count = counts[s.id] || 0;
      }

      // analytics_events past 30 days (best-effort)
      const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
      const { data: ev } = await supabase
        .from('analytics_events')
        .select('user_id')
        .gte('created_at', since)
        .in('user_id', ids);
      if (ev) {
        const counts: Record<string, number> = {};
        for (const r of ev as { user_id: string }[]) {
          counts[r.user_id] = (counts[r.user_id] || 0) + 1;
        }
        for (const s of enriched) s.events_30d = counts[s.id] || 0;
      }

      // dna_results best-effort
      const { data: dna } = await supabase
        .from('dna_results')
        .select('user_id')
        .in('user_id', ids);
      if (dna) {
        const done = new Set((dna as { user_id: string }[]).map(r => r.user_id));
        for (const s of enriched) s.dna_completed = done.has(s.id);
      }
    }

    setStudents(enriched);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = students;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(s =>
        (s.email || '').toLowerCase().includes(q) ||
        (s.full_name || '').toLowerCase().includes(q) ||
        (s.id || '').toLowerCase().includes(q)
      );
    }
    switch (filter) {
      case 'active':
        list = list.filter(s => (s.events_30d || 0) > 0);
        break;
      case 'suspended':
        list = list.filter(s => s.banned_until && new Date(s.banned_until) > new Date());
        break;
      case 'verified':
        list = list.filter(s => s.role === 'verified_student');
        break;
      case 'dna_done':
        list = list.filter(s => s.dna_completed);
        break;
      case 'never_logged_in':
        list = list.filter(s => !s.last_sign_in_at);
        break;
    }
    return list;
  }, [students, search, filter]);

  const stats = useMemo(() => ({
    total: students.length,
    active30d: students.filter(s => (s.events_30d || 0) > 0).length,
    dnaCompleted: students.filter(s => s.dna_completed).length,
    neverLoggedIn: students.filter(s => !s.last_sign_in_at).length,
    suspended: students.filter(s => s.banned_until && new Date(s.banned_until) > new Date()).length,
  }), [students]);

  function engagementScore(s: Student): number {
    let score = 0;
    if (s.dna_completed) score += 30;
    if ((s.saved_count || 0) > 0) score += Math.min(20, (s.saved_count || 0) * 4);
    if ((s.events_30d || 0) > 5) score += 30;
    else if ((s.events_30d || 0) > 0) score += 15;
    if (s.last_sign_in_at && new Date(s.last_sign_in_at) > new Date(Date.now() - 7*24*3600*1000)) score += 20;
    return Math.min(100, score);
  }

  async function exportCsv() {
    const rows = filtered.map(s => [
      s.id, s.email || '', s.full_name || '', s.role || '', s.grade || '', s.city || '',
      s.created_at, s.last_sign_in_at || '', s.saved_count || 0, s.events_30d || 0, s.dna_completed ? 'yes' : 'no'
    ]);
    const header = ['id','email','name','role','grade','city','created','last_login','saved','events_30d','dna'];
    const csv = [header, ...rows].map(r => r.map(c => `"${String(c).replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `masarak_students_${new Date().toISOString().slice(0,10)}.csv`; a.click();
    URL.revokeObjectURL(url);
    await logAdminAction({ action: 'user_tag', target_type: 'export', details: { count: rows.length, filter } });
    flash(`تصدير ${rows.length} صف`);
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Stat label="إجمالي الطلاب" value={stats.total} icon="👥" tone="primary" />
        <Stat label="نشطين 30 يوم" value={stats.active30d} icon="🟢" tone="success" />
        <Stat label="أكملوا DNA" value={stats.dnaCompleted} icon="🧬" tone="info" />
        <Stat label="ما فاتوا أبداً" value={stats.neverLoggedIn} icon="🚪" tone="warn" />
        <Stat label="موقوفين" value={stats.suspended} icon="🛑" tone="danger" />
      </div>

      <div className="bg-surface rounded-2xl border-2 border-white/10 p-3 lg:p-4">
        <div className="flex flex-wrap gap-2 items-center justify-between mb-3">
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="ابحث بالإيميل، الاسم، أو الـ ID..."
            className="flex-1 min-w-[200px] px-3 py-2 rounded-xl border-2 border-white/10 focus:border-primary outline-none text-sm"
          />
          <select value={filter} onChange={e => setFilter(e.target.value as typeof filter)}
            className="px-3 py-2 rounded-xl border-2 border-white/10 text-sm font-bold">
            <option value="all">الكل</option>
            <option value="active">نشطين 30 يوم</option>
            <option value="suspended">موقوفين</option>
            <option value="verified">موثّقين</option>
            <option value="dna_done">أكملوا DNA</option>
            <option value="never_logged_in">ما فاتوا أبداً</option>
          </select>
          <button onClick={load} className="px-3 py-2 rounded-xl bg-surface border-2 border-white/10 text-sm font-bold hover:border-primary">🔄</button>
          <button onClick={exportCsv} className="px-3 py-2 rounded-xl bg-primary text-white text-sm font-bold hover:bg-primary-dark">📥 تصدير CSV</button>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-bg-soft animate-pulse rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-ink-muted">لا توجد نتائج بهذا الفلتر.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-right border-b border-white/10">
                  <th className="py-2 px-2 font-bold text-ink-muted">الطالب</th>
                  <th className="py-2 px-2 font-bold text-ink-muted">صف</th>
                  <th className="py-2 px-2 font-bold text-ink-muted">المدينة</th>
                  <th className="py-2 px-2 font-bold text-ink-muted">Engagement</th>
                  <th className="py-2 px-2 font-bold text-ink-muted">DNA</th>
                  <th className="py-2 px-2 font-bold text-ink-muted">حفظ</th>
                  <th className="py-2 px-2 font-bold text-ink-muted">آخر دخول</th>
                  <th className="py-2 px-2 font-bold text-ink-muted"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 100).map(s => {
                  const score = engagementScore(s);
                  const tone = score >= 70 ? 'bg-emerald-100 text-emerald-700' :
                               score >= 40 ? 'bg-amber-100 text-amber-700' :
                                            'bg-bg-soft text-ink-subtle';
                  return (
                    <tr key={s.id} className="border-b border-gray-50 hover:bg-mint-pale/30">
                      <td className="py-2 px-2">
                        <div className="font-bold">{s.full_name || s.email || s.id.slice(0,8)}</div>
                        <div className="text-xs text-ink-muted">{s.email}</div>
                      </td>
                      <td className="py-2 px-2">{s.grade || '—'}</td>
                      <td className="py-2 px-2">{s.city || '—'}</td>
                      <td className="py-2 px-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${tone}`}>{score}</span>
                      </td>
                      <td className="py-2 px-2">{s.dna_completed ? '🧬' : '—'}</td>
                      <td className="py-2 px-2">{s.saved_count || 0}</td>
                      <td className="py-2 px-2 text-xs text-ink-muted">
                        {s.last_sign_in_at ? new Date(s.last_sign_in_at).toLocaleDateString('ar') : 'لم يدخل'}
                      </td>
                      <td className="py-2 px-2">
                        <button onClick={() => setSelected(s)} className="text-xs font-bold text-primary hover:underline">عرض</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length > 100 && (
              <div className="text-xs text-ink-muted mt-3 text-center">
                عرض 100 من {filtered.length} — استعمل البحث للتصفية
              </div>
            )}
          </div>
        )}
      </div>

      {selected && <StudentDrawer s={selected} onClose={() => setSelected(null)} flash={flash} reload={load} />}
    </div>
  );
}

function Stat({ label, value, icon, tone }: { label: string; value: number; icon: string; tone: 'primary' | 'success' | 'warn' | 'info' | 'danger' }) {
  const colors = {
    primary: 'from-blue-50 to-indigo-50',
    success: 'from-emerald-50 to-teal-50',
    warn:    'from-amber-50 to-yellow-50',
    info:    'from-purple-50 to-pink-50',
    danger:  'from-rose-50 to-red-50',
  };
  return (
    <div className={`bg-gradient-to-br ${colors[tone]} rounded-2xl border border-white/40 p-4`}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1 font-bold">{label}</div>
    </div>
  );
}

function StudentDrawer({ s, onClose, flash, reload }: { s: Student; onClose: () => void; flash: (m: string) => void; reload: () => void }) {
  const [busy, setBusy] = useState(false);

  async function suspend() {
    if (!confirm('وقف هذا الطالب لـ 30 يوم؟')) return;
    setBusy(true);
    // We can't ban from client-side; instead set a banned_until in student_profiles (custom column we'll need)
    // For now: write an admin action and let backend job/policy do the actual ban.
    await logAdminAction({ action: 'user_suspend', target_type: 'user', target_id: s.id, reason: 'Manual admin suspend (30d)' });
    flash('تم تسجيل طلب الإيقاف — سيتفعّل عند تشغيل ban backend job');
    setBusy(false);
    onClose();
    reload();
  }

  async function verify() {
    setBusy(true);
    const { error } = await supabase.from('student_profiles').update({ role: 'verified_student' }).eq('id', s.id);
    if (error) {
      flash('فشل التوثيق: ' + error.message);
    } else {
      await logAdminAction({ action: 'user_verify', target_type: 'user', target_id: s.id });
      flash('تم توثيق الطالب');
      reload();
      onClose();
    }
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end lg:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-surface border-b border-white/10 p-4 flex items-center justify-between">
          <h3 className="font-extrabold text-lg">{s.full_name || s.email || s.id.slice(0,8)}</h3>
          <button onClick={onClose} className="text-2xl text-ink-muted">×</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <Field label="إيميل" value={s.email || '—'} />
            <Field label="ID" value={s.id} />
            <Field label="الصف" value={s.grade || '—'} />
            <Field label="المدينة" value={s.city || '—'} />
            <Field label="الدور" value={s.role || 'student'} />
            <Field label="تاريخ التسجيل" value={new Date(s.created_at).toLocaleDateString('ar')} />
            <Field label="آخر دخول" value={s.last_sign_in_at ? new Date(s.last_sign_in_at).toLocaleDateString('ar') : 'لم يدخل'} />
            <Field label="عناصر محفوظة" value={String(s.saved_count || 0)} />
            <Field label="أحداث 30 يوم" value={String(s.events_30d || 0)} />
            <Field label="أكمل DNA" value={s.dna_completed ? '✓ نعم' : '✗ لا'} />
          </div>

          <div className="flex flex-wrap gap-2 pt-3 border-t border-white/10">
            {s.role !== 'verified_student' && (
              <button disabled={busy} onClick={verify} className="px-3 py-2 rounded-xl bg-emerald-100 text-emerald-700 text-sm font-bold hover:bg-emerald-200">
                ✓ توثيق الطالب
              </button>
            )}
            <button disabled={busy} onClick={suspend} className="px-3 py-2 rounded-xl bg-rose-100 text-rose-700 text-sm font-bold hover:bg-rose-200">
              🛑 إيقاف 30 يوم
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-soft rounded-xl p-3">
      <div className="text-xs text-ink-muted font-bold mb-1">{label}</div>
      <div className="font-semibold break-all">{value}</div>
    </div>
  );
}
