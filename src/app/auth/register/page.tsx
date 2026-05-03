"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ROLES = [
  { value: "student",    label: "طالب",     emoji: "🎓" },
  { value: "parent",     label: "ولي أمر",   emoji: "👨‍👩‍👧" },
  { value: "school",     label: "مدرسة",     emoji: "🏫" },
  { value: "university", label: "جامعة",     emoji: "🏛️" },
];

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/dashboard` } });
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } }
    });
    if (error) { setError(error.message); setLoading(false); }
    else router.push("/dashboard?new=1");
  }

  return (
    <div className="min-h-screen bg-light flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-extrabold text-xl">م</span>
            </div>
            <span className="text-primary font-extrabold text-2xl">مسارك</span>
          </Link>
          <h1 className="text-2xl font-extrabold text-primary">أنشئ حسابك المجاني</h1>
          <p className="text-text-sub mt-1">انضم لآلاف الطلاب اللبنانيين</p>
        </div>

        {/* Progress */}
        <div className="flex gap-2 mb-6">
          {[1,2].map(s => (
            <div key={s} className={`flex-1 h-1.5 rounded-full transition-colors ${s <= step ? "bg-accent" : "bg-gray-200"}`}></div>
          ))}
        </div>

        <div className="card">
          {step === 1 && (
            <>
              <h2 className="font-bold text-primary text-lg mb-4">من أنت؟</h2>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {ROLES.map(r => (
                  <button key={r.value} onClick={() => setRole(r.value)}
                    className={`border-2 rounded-xl p-4 text-center transition-all ${role === r.value ? "border-primary bg-light" : "border-gray-200 hover:border-gray-300"}`}>
                    <div className="text-3xl mb-1">{r.emoji}</div>
                    <div className={`font-semibold text-sm ${role === r.value ? "text-primary" : "text-text-main"}`}>{r.label}</div>
                  </button>
                ))}
              </div>
              <button onClick={handleGoogle}
                className="w-full flex items-center justify-center gap-3 border-2 border-gray-200 rounded-xl py-3 font-semibold hover:bg-gray-50 transition-colors mb-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                متابعة بـ Google
              </button>
              <button onClick={() => setStep(2)} className="w-full btn-primary py-3 rounded-xl">
                متابعة بالبريد الإلكتروني →
              </button>
            </>
          )}

          {step === 2 && (
            <>
              <button onClick={() => setStep(1)} className="text-text-sub text-sm mb-4 hover:text-primary flex items-center gap-1">
                ← رجوع
              </button>
              {error && <div className="bg-red-50 text-danger border border-red-200 rounded-xl p-3 text-sm mb-4">{error}</div>}
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1.5">الاسم الكامل</label>
                  <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    placeholder="محمد أحمد" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1.5">البريد الإلكتروني</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    placeholder="example@email.com" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-text-main mb-1.5">كلمة المرور</label>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                    className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    placeholder="8 أحرف على الأقل" />
                </div>
                <button type="submit" disabled={loading} className="w-full btn-primary py-3 rounded-xl disabled:opacity-60">
                  {loading ? "جارٍ إنشاء الحساب..." : "إنشاء الحساب المجاني"}
                </button>
              </form>
            </>
          )}

          <p className="text-center text-sm text-text-sub mt-4">
            عندك حساب؟{" "}
            <Link href="/auth/login" className="text-primary font-bold hover:text-accent">سجّل دخول</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
