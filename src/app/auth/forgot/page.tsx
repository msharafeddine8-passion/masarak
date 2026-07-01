"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    setLoading(false);
    if (resetErr) { setError(resetErr.message || t('authforgot.genericError')); return; }
    setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-pale via-bg to-bg px-4 py-12" dir="rtl">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center text-3xl font-extrabold text-[#012730] mb-6">{t('authforgot.brand')}</Link>
        <div className="bg-surface rounded-3xl shadow-floaty border border-line p-6 md:p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-6xl mb-4">📬</div>
              <h1 className="text-2xl font-extrabold text-emerald-800 mb-2">{t('authforgot.sentHeading')}</h1>
              <p className="text-ink-muted leading-relaxed mb-5">
                {t('authforgot.sentBody')}
              </p>
              <Link href="/auth/login" className="inline-block text-[#012730] font-bold hover:underline">{t('authforgot.backToLogin')}</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <header className="text-center mb-4">
                <div className="text-5xl mb-3">🔑</div>
                <h1 className="text-2xl font-extrabold text-[#1b3a6b] mb-1">{t('authforgot.heading')}</h1>
                <p className="text-sm text-ink-muted">{t('authforgot.subtitle')}</p>
              </header>
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-bold text-ink-muted mb-1.5">{t('authforgot.emailLabel')}</label>
                <input id="forgot-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" className="input" autoFocus />
              </div>
              {error && <div role="alert" aria-live="assertive" className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">⚠️ {error}</div>}
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl bg-[#012730] text-white font-extrabold hover:bg-[#143b43] transition disabled:opacity-60">
                {loading ? t('authforgot.sending') : t('authforgot.submit')}
              </button>
              <div className="text-center text-sm text-ink-muted pt-2">
                <Link href="/auth/login" className="font-bold text-[#1b3a6b] hover:underline">{t('authforgot.backToLogin')}</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
