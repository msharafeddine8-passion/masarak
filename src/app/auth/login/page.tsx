"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError("البريد الإلكتروني أو كلمة المرور غير صحيحة"); setLoading(false); }
    else router.push("/dashboard");
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` }
    });
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    await supabase.auth.resetPasswordForEmail(resetEmail, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });
    setResetSent(true);
  }

  const FEATURES = [
    { emoji: "📄", text: "سيرة ذاتية احترافية مجاناً" },
    { emoji: "🎯", text: "محلل الفجوة المهارية" },
    { emoji: "🏆", text: "200+ منحة دراسية" },
    { emoji: "💼", text: "فرص تدريب في لبنان والمنطقة" },
    { emoji: "🤖", text: "مساعد AI للتوجيه المهني" },
    { emoji: "🧬", text: "اختبار Career DNA" },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-[#1a3c6e] to-[#0f2448] flex-col justify-between p-12 relative overflow-hidden">
        {/* bg decoration */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-accent/10 rounded-full translate-x-1/3 translate-y-1/3" />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 relative z-10">
          <div className="w-11 h-11 bg-accent rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-white font-extrabold text-xl">م</span>
          </div>
          <span className="text-white font-extrabold text-2xl">مسارك</span>
        </Link>

        {/* Main copy */}
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            مرحباً بعودتك<br />
            <span className="text-accent">إلى مسارك</span>
          </h2>
          <p className="text-white/70 text-lg mb-10 leading-relaxed">
            منصتك الشخصية لبناء مستقبلك المهني<br />
            والأكاديمي — مجاناً للأبد 🇱🇧
          </p>

          <div className="space-y-3">
            {FEATURES.map(f => (
              <div key={f.text} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                  {f.emoji}
                </div>
                <span className="text-white/80 text-sm">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom social proof */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {["E8A020","1A7A4A","C0392B","6C3483"].map((c, i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-white/30 flex items-center justify-center text-xs font-bold text-white" style={{backgroundColor:`#${c}`}}>
                {["ك","س","ر","ن"][i]}
              </div>
            ))}
          </div>
          <span className="text-white/60 text-sm">+5,200 طالب لبناني معنا</span>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-white">
        {/* Mobile logo */}
        <Link href="/" className="flex items-center gap-2 mb-8 lg:hidden">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-extrabold text-lg">م</span>
          </div>
          <span className="text-primary font-extrabold text-xl">مسارك</span>
        </Link>

        <div className="w-full max-w-md">
          {!showReset ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-primary mb-2">تسجيل الدخول</h1>
                <p className="text-text-sub">أهلاً بك مجدداً في مسارك</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm flex items-center gap-2">
                  <span>⚠️</span> {error}
                </div>
              )}

              {/* Google */}
              <button
                onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 hover:border-primary rounded-xl px-4 py-3 font-semibold text-text-main hover:text-primary transition-all mb-5"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                تسجيل الدخول بـ Google
              </button>

              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-text-sub text-sm">أو بالبريد الإلكتروني</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1.5">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@email.com"
                    required
                    className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-sm font-semibold text-text-main">كلمة المرور</label>
                    <button
                      type="button"
                      onClick={() => { setShowReset(true); setResetEmail(email); }}
                      className="text-xs text-primary hover:text-accent transition-colors"
                    >
                      نسيت كلمة المرور؟
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-white font-extrabold py-3.5 rounded-xl hover:bg-[#1e4080] transition-colors disabled:opacity-60 disabled:cursor-not-allowed text-base mt-2"
                >
                  {loading ? "جاري الدخول..." : "تسجيل الدخول →"}
                </button>
              </form>

              <p className="text-center text-sm text-text-sub mt-6">
                ما عندك حساب؟{" "}
                <Link href="/auth/register" className="text-primary font-bold hover:text-accent transition-colors">
                  سجّل مجاناً
                </Link>
              </p>
            </>
          ) : (
            /* Forgot Password */
            <>
              <button onClick={() => setShowReset(false)} className="text-text-sub hover:text-primary text-sm mb-6 flex items-center gap-1">
                ← رجوع لتسجيل الدخول
              </button>
              <div className="mb-8">
                <div className="text-4xl mb-3">🔑</div>
                <h1 className="text-2xl font-extrabold text-primary mb-2">استعادة كلمة المرور</h1>
                <p className="text-text-sub text-sm">أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة</p>
              </div>

              {resetSent ? (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-5 text-center">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="font-bold mb-1">تم إرسال رابط الاستعادة!</p>
                  <p className="text-sm">تحقق من بريدك الإلكتروني وافتح الرابط المرسل.</p>
                  <button onClick={() => { setShowReset(false); setResetSent(false); }} className="mt-4 text-primary text-sm font-bold hover:underline">
                    عد لتسجيل الدخول
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-text-main mb-1.5">البريد الإلكتروني</label>
                    <input
                      type="email"
                      value={resetEmail}
                      onChange={e => setResetEmail(e.target.value)}
                      placeholder="example@email.com"
                      required
                      className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-sm outline-none transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-primary text-white font-extrabold py-3.5 rounded-xl hover:bg-[#1e4080] transition-colors"
                  >
                    أرسل رابط الاستعادة
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
