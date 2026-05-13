'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

interface Invite {
  id: number;
  parent_user_id: string;
  status: 'pending' | 'active' | 'rejected';
  invited_at: string;
  parent_name?: string;
  parent_email?: string;
}

export default function ParentInvitesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<number | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/auth/login'); return; }
    setUser(user);

    const { data } = await supabase
      .from('parent_student_links')
      .select('*')
      .eq('student_user_id', user.id)
      .order('invited_at', { ascending: false });

    if (data && data.length > 0) {
      const parentIds = data.map((d: any) => d.parent_user_id);
      const { data: parents } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .in('id', parentIds);

      const merged = data.map((d: any) => {
        const p = parents?.find((x: any) => x.id === d.parent_user_id);
        return { ...d, parent_name: p?.full_name, parent_email: p?.email };
      });
      setInvites(merged);
    } else setInvites([]);

    setLoading(false);
  }

  async function approve(inviteId: number) {
    setActioning(inviteId);
    await supabase.from('parent_student_links')
      .update({ status: 'active', approved_at: new Date().toISOString() })
      .eq('id', inviteId);
    await load();
    setActioning(null);
  }

  async function reject(inviteId: number) {
    setActioning(inviteId);
    await supabase.from('parent_student_links')
      .update({ status: 'rejected' })
      .eq('id', inviteId);
    await load();
    setActioning(null);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-mint flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-6xl animate-bounce-soft mb-3">📨</div>
          <div className="text-ink-muted">جاري التحميل...</div>
        </div>
      </main>
    );
  }

  const pending = invites.filter(i => i.status === 'pending');
  const active = invites.filter(i => i.status === 'active');

  return (
    <main className="min-h-screen bg-bg pb-20 relative overflow-hidden" dir="rtl">
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto px-4 py-8">
        <Link href="/profile" className="text-sm text-ink-muted hover:text-primary inline-flex items-center gap-1 mb-4">
          → العودة للملف الشخصي
        </Link>

        {/* Hero */}
        <div className="bg-gradient-hero rounded-4xl p-8 text-white shadow-floaty relative overflow-hidden mb-6">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="relative">
            <div className="text-6xl mb-3 animate-bounce-soft">📨</div>
            <h1 className="text-3xl font-extrabold mb-1">دعوات الأهل</h1>
            <p className="text-white/90">إدارة طلبات الربط من أهلك</p>
          </div>
        </div>

        {/* Pending Invites */}
        {pending.length > 0 ? (
          <div className="card shadow-card mb-6">
            <h2 className="font-extrabold text-warning text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl">⏳</span> طلبات معلّقة ({pending.length})
            </h2>

            <div className="space-y-3">
              {pending.map(inv => (
                <div key={inv.id} className="bg-warning-light/50 border border-warning/30 rounded-2xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-warm text-white rounded-2xl flex items-center justify-center font-extrabold text-lg shadow-soft">
                      {(inv.parent_name || 'و')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-ink truncate">{inv.parent_name || 'ولي أمر'}</div>
                      <div className="text-xs text-ink-muted truncate">{inv.parent_email}</div>
                      <div className="text-[10px] text-ink-subtle">دُعي بـ {new Date(inv.invited_at).toLocaleDateString('ar')}</div>
                    </div>
                  </div>
                  <div className="bg-surface rounded-xl p-3 mb-3 text-sm text-ink">
                    🔍 إذا وافقت، رح يقدر يشوف:
                    <ul className="mt-2 space-y-1 text-xs text-ink-muted mr-4">
                      <li>• معلوماتك الأكاديمية (مدرسة، مرحلة، معدل)</li>
                      <li>• الجامعات والمنح اللي حفظتها</li>
                      <li>• تقدّمك بـ Career DNA و Quiz</li>
                      <li>• ❌ لن يرى كلمة المرور أو رسائلك الخاصة</li>
                    </ul>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => approve(inv.id)}
                      disabled={actioning === inv.id}
                      className="flex-1 btn-primary text-sm py-2.5 disabled:opacity-60">
                      {actioning === inv.id ? '...' : '✅ موافقة'}
                    </button>
                    <button
                      onClick={() => reject(inv.id)}
                      disabled={actioning === inv.id}
                      className="flex-1 py-2.5 rounded-2xl border-2 border-danger/30 text-danger font-bold text-sm hover:bg-danger-light disabled:opacity-60">
                      ❌ رفض
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="card text-center py-8">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-ink-muted">ما عندك دعوات معلّقة</p>
          </div>
        )}

        {/* Active Links */}
        {active.length > 0 && (
          <div className="card shadow-card">
            <h2 className="font-extrabold text-primary text-lg mb-4 flex items-center gap-2">
              <span className="text-2xl">🔗</span> الأهل المرتبطين ({active.length})
            </h2>

            <div className="space-y-3">
              {active.map(inv => (
                <div key={inv.id} className="bg-mint-pale rounded-2xl p-3 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-mint-deep text-white rounded-2xl flex items-center justify-center font-extrabold shadow-soft">
                    {(inv.parent_name || 'و')[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-ink truncate">{inv.parent_name || 'ولي أمر'}</div>
                    <div className="text-xs text-ink-muted truncate">{inv.parent_email}</div>
                  </div>
                  <button
                    onClick={() => reject(inv.id)}
                    disabled={actioning === inv.id}
                    className="text-xs text-danger hover:bg-danger-light px-3 py-2 rounded-lg font-semibold disabled:opacity-60">
                    إلغاء الربط
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
