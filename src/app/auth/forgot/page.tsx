"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ForgotPasswordPage() {
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
    if (resetErr) { setError(resetErr.message || "صار خطأ. حاول مرة ثانية."); return; }
    setSent(true);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-pale via-bg to-bg px-4 py-12" dir="rtl">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center text-3xl font-extrabold text-[#012730] mb-6">مسارك</Link>
        <div className="bg-white rounded-3xl shadow-floaty border border-gray-200 p-6 md:p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-6xl mb-4">📬</div>
              <h1 className="text-2xl font-extrabold text-emerald-800 mb-2">تفقّد بريدك</h1>
              <p className="text-gray-700 leading-relaxed mb-5">
                إذا كان هذا البريد مسجّلاً عندنا، رح يوصلك رابط لإعادة تعيين كلمة المرور خلال دقيقة.
              </p>
              <Link href="/auth/login" className="inline-block text-[#012730] font-bold hover:underline">← العودة لتسجيل الدخول</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <header className="text-center mb-4">
                <div className="text-5xl mb-3">🔑</div>
                <h1 className="text-2xl font-extrabold text-[#1b3a6b] mb-1">نسيت كلمة المرور؟</h1>
                <p className="text-sm text-gray-600">أدخل بريدك وبنرسلك رابط لإعادة التعيين.</p>
              </header>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">البريد الإلكتروني</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" className="input" autoFocus />
              </div>
              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">⚠️ {error}</div>}
              <button type="submit" disabled={loading} className="w-full py-3.5 rounded-2xl bg-[#012730] text-white font-extrabold hover:bg-[#143b43] transition disabled:opacity-60">
                {loading ? "جارٍ الإرسال..." : "أرسل رابط الإعادة"}
              </button>
              <div className="text-center text-sm text-gray-600 pt-2">
                <Link href="/auth/login" className="font-bold text-[#1b3a6b] hover:underline">← العودة لتسجيل الدخول</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
