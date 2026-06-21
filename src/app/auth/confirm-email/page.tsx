'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

function ConfirmInner() {
  const router = useRouter();
  const params = useSearchParams();
  const email = params.get('email') || '';
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [error, setError] = useState('');

  async function resendEmail() {
    if (!email || resending) return;
    setResending(true);
    setError('');
    const { error: err } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    setResending(false);
    if (err) {
      setError(err.message || 'تعذّر إعادة إرسال البريد. حاولي بعد قليل.');
      return;
    }
    setResent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-pale to-bg-mint p-4" dir="rtl">
      <div className="bg-surface rounded-3xl shadow-floaty max-w-md w-full p-8 md:p-10 text-center">
        <div className="text-6xl mb-4">📧</div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary mb-3">
          أكّدي إيميلك
        </h1>

        <p className="text-ink-muted mb-2 leading-relaxed">
          بعتنالك رابط تأكيد على
        </p>
        {email && (
          <p className="text-ink font-bold mb-6 break-all" dir="ltr">{email}</p>
        )}
        <p className="text-ink-muted mb-8 text-sm leading-relaxed">
          افتحي بريدك واضغطي على الرابط بالرسالة لتفعيل حسابك.
          الرسالة بتوصل خلال دقيقة عادةً. تأكدي من <strong>Spam / Junk</strong> اذا ما لقيتيها.
        </p>

        {resent && (
          <div className="bg-green-50 border-2 border-green-200 text-green-700 rounded-xl p-3 text-sm mb-4">
            ✅ بعتنا رسالة جديدة. اطّلعي على بريدك.
          </div>
        )}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 text-red-700 rounded-xl p-3 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {email && !resent && (
            <button
              onClick={resendEmail}
              disabled={resending}
              className="w-full btn-primary py-3 rounded-xl disabled:opacity-50"
            >
              {resending ? 'جاري الإرسال...' : '🔄 إعادة إرسال الرسالة'}
            </button>
          )}
          <Link
            href="/auth/login"
            className="block w-full bg-surface border-2 border-line hover:border-primary text-ink font-bold py-3 rounded-xl transition-colors"
          >
            رجوع لتسجيل الدخول
          </Link>
          <button
            onClick={() => router.push('/')}
            className="block w-full text-sm text-ink-muted hover:text-primary py-2"
          >
            ← الصفحة الرئيسية
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-line text-xs text-ink-muted">
          ما وصلتك الرسالة؟ راسلينا على <a href="mailto:support@masaraklb.com" className="text-primary font-bold hover:underline" dir="ltr">support@masaraklb.com</a>
        </div>
      </div>
    </main>
  );
}

export default function ConfirmEmailPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-ink-muted">جاري التحميل...</div></div>}>
      <ConfirmInner />
    </Suspense>
  );
}
