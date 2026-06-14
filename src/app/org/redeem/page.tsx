'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function RedeemInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';

  const [status, setStatus] = useState<'checking' | 'needs_auth' | 'ready' | 'redeeming' | 'success' | 'error'>('checking');
  const [error, setError] = useState('');
  const [orgId, setOrgId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!token) { setStatus('error'); setError('رابط دعوة غير صحيح.'); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setStatus('needs_auth'); return; }
      setStatus('ready');
    })();
  }, [token]);

  async function redeem() {
    setStatus('redeeming');
    setError('');
    const { data, error: err } = await supabase.rpc('redeem_org_invite', { p_token: token });
    if (err) {
      setStatus('error');
      setError(err.message || 'تعذّر استرداد الدعوة.');
      return;
    }
    const result = data as { ok: boolean; error?: string; org_id?: string; role?: string };
    if (!result?.ok) {
      setStatus('error');
      const reason: Record<string, string> = {
        not_signed_in: 'يجب تسجيل الدخول أولاً.',
        not_found:     'الدعوة غير موجودة.',
        already_redeemed: 'هالدعوة استُخدمت مسبقاً.',
        expired:       'انتهت صلاحية الدعوة.',
      };
      setError(reason[result?.error || ''] || 'فشلت العملية.');
      return;
    }
    setOrgId(result.org_id || null);
    setStatus('success');
    setTimeout(() => router.push('/org/dashboard'), 1500);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-pale to-bg-mint p-4" dir="rtl">
      <div className="bg-white rounded-3xl shadow-floaty max-w-md w-full p-8 md:p-10 text-center">

        {status === 'checking' && (
          <>
            <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-ink-muted">جاري التحقق من الدعوة...</p>
          </>
        )}

        {status === 'needs_auth' && (
          <>
            <div className="text-6xl mb-4">🔑</div>
            <h1 className="text-2xl font-extrabold text-primary mb-3">قبل ما تكمل</h1>
            <p className="text-ink-muted mb-6">
              لازم تسجّلي دخول أو تنشئي حساب لتستلمي الدعوة وتديري مؤسستك.
            </p>
            <div className="space-y-3">
              <Link
                href={`/auth/register?role=university&next=${encodeURIComponent(`/org/redeem?token=${token}`)}`}
                className="block w-full btn-primary py-3 rounded-xl"
              >
                إنشاء حساب جديد
              </Link>
              <Link
                href={`/auth/login?redirect=${encodeURIComponent(`/org/redeem?token=${token}`)}`}
                className="block w-full bg-white border-2 border-gray-200 hover:border-primary text-ink font-bold py-3 rounded-xl"
              >
                تسجيل الدخول
              </Link>
            </div>
          </>
        )}

        {status === 'ready' && (
          <>
            <div className="text-6xl mb-4">📨</div>
            <h1 className="text-2xl font-extrabold text-primary mb-3">دعوة لإدارة مؤسسة</h1>
            <p className="text-ink-muted mb-6">
              تمت دعوتك من قِبل فريق مسارك لإدارة صفحة مؤسستك على المنصة.
              اضغطي قبول لإتمام الربط.
            </p>
            <button onClick={redeem} className="w-full btn-primary py-3 rounded-xl">
              ✅ قبول الدعوة
            </button>
          </>
        )}

        {status === 'redeeming' && (
          <>
            <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-ink-muted">جاري ربط حسابك بالمؤسسة...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-extrabold text-primary mb-3">تم بنجاح!</h1>
            <p className="text-ink-muted mb-2">رح يتم تحويلك لداشبور مؤسستك...</p>
            <Link href="/org/dashboard" className="text-primary font-bold hover:underline">انتقل الآن ←</Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-extrabold text-red-700 mb-3">في مشكلة</h1>
            <p className="text-ink-muted mb-6">{error}</p>
            <Link href="/contact" className="block w-full btn-primary py-3 rounded-xl">
              راسل الفريق
            </Link>
          </>
        )}
      </div>
    </main>
  );
}

export default function RedeemPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-ink-muted">جاري التحميل...</div></div>}>
      <RedeemInner />
    </Suspense>
  );
}
