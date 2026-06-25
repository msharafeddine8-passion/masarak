'use client';
import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';

type Action = {
  id: number;
  admin_email: string;
  action: string;
  target_type?: string | null;
  target_id?: string | null;
  reason?: string | null;
  details?: Record<string, unknown>;
  created_at: string;
};

const ACTION_LABELS: Record<string, string> = {
  user_suspend: 'إيقاف مستخدم', user_unsuspend: 'إلغاء الإيقاف', user_verify: 'توثيق مستخدم', user_tag: 'تصنيف',
  university_update: 'تعديل جامعة', university_feature: 'تثبيت جامعة', university_verify: 'توثيق جامعة',
  school_update: 'تعديل مدرسة', school_feature: 'تثبيت مدرسة', school_verify: 'توثيق مدرسة',
  invite_create: 'إنشاء دعوة',
  subscription_grant: 'منح اشتراك', subscription_revoke: 'إلغاء اشتراك',
  notification_send: 'إرسال إشعار',
};

export default function AuditCenterTab() {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  async function load() {
    setLoading(true);
    const { data } = await supabase.from('admin_actions')
      .select('*').order('created_at', { ascending: false }).limit(500);
    setActions((data || []) as Action[]); setLoading(false);
  }
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => filter === 'all' ? actions : actions.filter(a => a.target_type === filter), [actions, filter]);

  const stats = useMemo(() => ({
    total: actions.length,
    last24h: actions.filter(a => new Date(a.created_at).getTime() > Date.now() - 24*3600*1000).length,
    last7d: actions.filter(a => new Date(a.created_at).getTime() > Date.now() - 7*24*3600*1000).length,
    uniqueAdmins: new Set(actions.map(a => a.admin_email)).size,
  }), [actions]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <K label="إجمالي العمليات" value={stats.total} icon="📜" tone="primary" />
        <K label="آخر 24 ساعة" value={stats.last24h} icon="⏰" tone="info" />
        <K label="آخر 7 أيام" value={stats.last7d} icon="📅" tone="success" />
        <K label="مستخدمين إدارة" value={stats.uniqueAdmins} icon="👥" tone="warn" />
      </div>

      <div className="bg-surface rounded-2xl border-2 border-line p-3 lg:p-4">
        <div className="flex justify-between mb-3">
          <select value={filter} onChange={e=>setFilter(e.target.value)} className="px-3 py-2 rounded-xl border-2 border-line text-sm font-bold">
            <option value="all">كل العمليات</option>
            <option value="user">على مستخدمين</option>
            <option value="university">على جامعات</option>
            <option value="school">على مدارس</option>
            <option value="subscription">اشتراكات</option>
            <option value="org_invite">دعوات</option>
          </select>
          <button onClick={load} className="px-3 py-2 rounded-xl bg-surface border-2 border-line text-sm font-bold">🔄</button>
        </div>

        {loading ? (
          <div className="space-y-2">{[...Array(5)].map((_,i) => <div key={i} className="h-12 bg-bg-soft animate-pulse rounded-xl" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-ink-muted">لا يوجد عمليات بعد. كل ما تعمل أي شي بالـ admin، رح يتسجّل هون.</div>
        ) : (
          <div className="space-y-1">
            {filtered.slice(0, 200).map(a => (
              <div key={a.id} className="border-b border-gray-50 py-2 text-sm flex items-center gap-3">
                <div className="text-xs text-ink-muted w-32 shrink-0">{new Date(a.created_at).toLocaleString('ar')}</div>
                <div className="flex-1 min-w-0">
                  <span className="font-bold">{ACTION_LABELS[a.action] || a.action}</span>
                  {a.target_type && a.target_id && (
                    <span className="text-xs text-ink-muted"> · {a.target_type} #{a.target_id.slice(0,8)}</span>
                  )}
                  {a.reason && <div className="text-xs text-ink-muted mt-0.5">{a.reason}</div>}
                </div>
                <div className="text-xs text-ink-muted truncate max-w-[200px]">{a.admin_email}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function K({ label, value, icon, tone }: { label: string; value: number; icon: string; tone: 'primary'|'success'|'warn'|'info' }) {
  const c = { primary:'from-blue-50 to-indigo-50', success:'from-emerald-50 to-teal-50', warn:'from-amber-50 to-yellow-50', info:'from-purple-50 to-pink-50' };
  return (
    <div className={'bg-gradient-to-br ' + c[tone] + ' rounded-2xl border border-white/40 p-4'}>
      <div className="text-2xl mb-1">{icon}</div>
      <div className="text-3xl font-extrabold text-ink">{value}</div>
      <div className="text-xs text-ink-muted mt-1 font-bold">{label}</div>
    </div>
  );
}
