'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ADMIN_EMAIL } from '@/lib/permissions/capabilities';

type Invite = {
  id: string;
  token: string;
  email: string;
  org_hint: string | null;
  org_id: string | null;
  role: string;
  expires_at: string;
  redeemed_at: string | null;
  created_at: string;
};

export default function AdminInvitePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [invites, setInvites] = useState<Invite[]>([]);

  // Form fields
  const [email, setEmail] = useState('');
  const [orgHint, setOrgHint] = useState('');
  const [orgType, setOrgType] = useState('university');
  const [role, setRole] = useState('owner');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [lastLink, setLastLink] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user || data.user.email !== ADMIN_EMAIL) {
        router.push('/');
        return;
      }
      const { data: list } = await supabase
        .from('org_invites')
        .select('id, token, email, org_hint, org_id, role, expires_at, redeemed_at, created_at')
        .order('created_at', { ascending: false })
        .limit(50);
      setInvites((list as Invite[]) || []);
      setLoading(false);
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setError('');
    setLastLink('');

    const { data: inserted, error: insErr } = await supabase
      .from('org_invites')
      .insert({
        email: email.trim().toLowerCase(),
        org_hint: orgHint.trim() || null,
        org_type: orgType,
        role,
        message: message.trim() || null,
      })
      .select('token')
      .single();

    setSubmitting(false);
    if (insErr) {
      setError(insErr.message || 'تعذّر إنشاء الدعوة');
      return;
    }

    const link = `${window.location.origin}/org/redeem?token=${inserted!.token}`;
    setLastLink(link);
    setEmail(''); setOrgHint(''); setMessage('');

    // Refresh list
    const { data: list } = await supabase
      .from('org_invites')
      .select('id, token, email, org_hint, org_id, role, expires_at, redeemed_at, created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    setInvites((list as Invite[]) || []);
  }

  async function copyToClipboard(text: string) {
    try { await navigator.clipboard.writeText(text); } catch {}
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-bg py-8 px-4" dir="rtl">
      <div className="container mx-auto max-w-4xl">
        <Link href="/admin/orgs" className="text-sm text-ink-muted hover:text-primary inline-block mb-4">
          ← لوحة المؤسسات
        </Link>

        <h1 className="text-3xl font-extrabold text-primary mb-2">📨 دعوة مؤسسة</h1>
        <p className="text-ink-muted mb-8">
          أرسل دعوة لمدير جامعة أو مدرسة ليُسجّل ويُدير صفحة مؤسسته على مسارك.
        </p>

        {/* Create form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border-2 border-gray-100 p-6 shadow-sm mb-8">
          <h2 className="text-lg font-extrabold text-primary mb-4">دعوة جديدة</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-ink mb-1">إيميل المدعوّ <span className="text-red-500">*</span></label>
              <input
                type="email" required dir="ltr"
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="admin@aub.edu.lb"
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-1">اسم/كود المؤسسة</label>
              <input
                type="text"
                value={orgHint} onChange={e => setOrgHint(e.target.value)}
                placeholder="AUB / مدرسة الفصول الأربعة..."
                className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-1">نوع المؤسسة</label>
              <select value={orgType} onChange={e => setOrgType(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none">
                <option value="university">جامعة</option>
                <option value="school">مدرسة</option>
                <option value="vocational">معهد مهني</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-ink mb-1">الصلاحية</label>
              <select value={role} onChange={e => setRole(e.target.value)}
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none">
                <option value="owner">مالك (Owner)</option>
                <option value="editor">محرّر (Editor)</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-bold text-ink mb-1">رسالة شخصية (اختيارية)</label>
            <textarea
              value={message} onChange={e => setMessage(e.target.value)}
              placeholder="مرحبا، اعتمدنا مسارك كمنصة للتوجيه الأكاديمي ونحب نشوف ملف جامعتكم محدّث..."
              rows={3}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-primary outline-none"
            />
          </div>

          <button type="submit" disabled={submitting}
                  className="mt-5 btn-primary px-6 py-3 rounded-xl disabled:opacity-50">
            {submitting ? 'جاري الإنشاء...' : '✉️ أنشئ رابط الدعوة'}
          </button>

          {error && <p className="mt-3 text-red-600 text-sm">{error}</p>}

          {lastLink && (
            <div className="mt-5 p-4 rounded-xl bg-green-50 border-2 border-green-200">
              <p className="text-sm font-bold text-green-800 mb-2">✅ الدعوة جاهزة — أرسل الرابط:</p>
              <div className="flex gap-2 items-center">
                <input value={lastLink} readOnly dir="ltr"
                       className="flex-1 px-3 py-2 bg-white border border-green-300 rounded-lg text-xs font-mono" />
                <button type="button" onClick={() => copyToClipboard(lastLink)}
                        className="px-3 py-2 bg-green-600 text-white text-sm font-bold rounded-lg hover:bg-green-700">
                  نسخ
                </button>
              </div>
              <p className="mt-2 text-xs text-green-700">صالح ١٤ يوم. ابعت هالرابط بالإيميل أو واتساب.</p>
            </div>
          )}
        </form>

        {/* List */}
        <section>
          <h2 className="text-lg font-extrabold text-primary mb-4">آخر الدعوات ({invites.length})</h2>
          {invites.length === 0 ? (
            <p className="text-ink-muted">لا توجد دعوات بعد.</p>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-ink-muted">
                  <tr>
                    <th className="text-right p-3">المدعوّ</th>
                    <th className="text-right p-3">المؤسسة</th>
                    <th className="text-right p-3">الحالة</th>
                    <th className="text-right p-3">انتهاء</th>
                    <th className="p-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {invites.map(inv => {
                    const expired = new Date(inv.expires_at) < new Date();
                    const redeemed = Boolean(inv.redeemed_at);
                    const status = redeemed ? '✅ مُفعّلة' : expired ? '⏰ منتهية' : '⏳ معلّقة';
                    const statusCls = redeemed ? 'bg-green-100 text-green-700' : expired ? 'bg-gray-100 text-gray-600' : 'bg-amber-100 text-amber-700';
                    return (
                      <tr key={inv.id} className="border-t border-gray-100">
                        <td className="p-3 font-mono text-xs" dir="ltr">{inv.email}</td>
                        <td className="p-3">{inv.org_hint || '—'}</td>
                        <td className="p-3"><span className={`text-xs font-bold px-2 py-0.5 rounded-full ${statusCls}`}>{status}</span></td>
                        <td className="p-3 text-xs text-ink-muted">{new Date(inv.expires_at).toLocaleDateString('ar')}</td>
                        <td className="p-3">
                          {!redeemed && !expired && (
                            <button onClick={() => copyToClipboard(`${window.location.origin}/org/redeem?token=${inv.token}`)}
                                    className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">
                              نسخ الرابط
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
