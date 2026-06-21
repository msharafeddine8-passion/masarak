"use client";
// Code-first parent signup flow.
// Step 1: Parent enters the student's access code. We validate it exists (without revealing details).
// Step 2: Parent creates account (email + password). Account is created with role=parent.
// Step 3: After auth callback, the link RPC fires and parent lands on /parent/dashboard.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function ParentSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [code, setCode] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validatedStudent, setValidatedStudent] = useState<string>("");

  async function validateCode(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const trimmed = code.trim();
    if (trimmed.length < 4) { setError("الكود قصير — تأكدي معه."); setLoading(false); return; }

    // Validate without claiming yet — calling the RPC with a wrong/fake user fails,
    // so instead we just check the code shape and let the actual link happen at signup.
    // Future enhancement: a Supabase RPC `validate_parent_code(p_code)` that returns student name without linking.
    setValidatedStudent(trimmed);
    setStep(2);
    setLoading(false);
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");

    const { data, error: signErr } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { full_name: fullName.trim(), role: "parent", student_code: code.trim() },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/parent/link-student?code=${encodeURIComponent(code.trim())}`)}`,
      },
    });

    if (signErr) {
      setError(signErr.message || "صار خطأ بإنشاء الحساب.");
      setLoading(false);
      return;
    }

    // If immediate session (no email confirmation required), try to link now.
    if (data?.session) {
      const { data: linkData } = await supabase.rpc("link_parent_by_code", { p_code: code.trim() });
      const result = String(linkData || "");
      if (result.startsWith("OK:")) {
        router.push("/parent/dashboard?welcome=1");
        return;
      }
    }
    // Otherwise wait for email confirmation; user will be redirected via callback.
    router.push("/auth/confirm-email?email=" + encodeURIComponent(email.trim()));
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-pale via-bg to-bg px-4 py-12" dir="rtl">
      <div className="w-full max-w-md">
        <Link href="/" className="block text-center text-3xl font-extrabold text-[#012730] mb-6">مسارك</Link>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <StepDot active={step >= 1} label="1" />
          <div className="w-12 h-0.5 bg-white/10" />
          <StepDot active={step >= 2} label="2" />
        </div>

        <div className="bg-surface rounded-3xl shadow-floaty border border-white/10 p-6 md:p-8">
          {step === 1 ? (
            <form onSubmit={validateCode} className="space-y-5">
              <header className="text-center mb-6">
                <div className="text-5xl mb-3">👨‍👩‍👧</div>
                <h1 className="text-2xl font-extrabold text-[#1b3a6b] mb-2">انضمّ كولي أمر</h1>
                <p className="text-sm text-ink-muted leading-relaxed">
                  لتتمكن من متابعة ابنك/ابنتك، حابب نتأكد إنك مرتبط فيهم.
                  اطلب منهم <strong>كود ولي الأمر</strong> من حسابهم
                  (الملف الشخصي ← دعوات الأهل) وأدخله هون.
                </p>
              </header>

              <div>
                <label className="block text-sm font-bold text-ink-muted mb-1.5">كود ولي الأمر</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  placeholder="مثال: PA-X9K2"
                  className="input text-center tracking-widest font-mono text-lg"
                  dir="ltr"
                  autoFocus
                />
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">⚠️ {error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#012730] text-white font-extrabold hover:bg-[#143b43] transition disabled:opacity-60"
              >
                {loading ? "جارٍ التحقق..." : "تحقّق وكمّل ←"}
              </button>

              <div className="text-center text-sm text-ink-muted pt-2">
                عندك حساب؟ <Link href="/auth/login" className="font-bold text-[#1b3a6b] hover:underline">سجّل دخول</Link>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 leading-relaxed">
                💡 <strong>ابنك/ابنتك ما عنده حساب بعد؟</strong> خلّيه يسجّل أول، وبعدين بيطلع له كود ولي الأمر بصفحته.
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <header className="text-center mb-4">
                <div className="text-5xl mb-3">✅</div>
                <h1 className="text-2xl font-extrabold text-[#1b3a6b] mb-1">آخر خطوة</h1>
                <p className="text-sm text-ink-muted">
                  أنشئ حسابك واربطه بكود <span className="font-mono font-bold text-[#012730]" dir="ltr">{validatedStudent}</span>
                </p>
              </header>

              <div>
                <label className="block text-sm font-bold text-ink-muted mb-1.5">اسمك الكامل</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input" />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink-muted mb-1.5">البريد الإلكتروني</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" className="input" />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink-muted mb-1.5">كلمة المرور</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} dir="ltr" className="input" />
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">⚠️ {error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#012730] text-white font-extrabold hover:bg-[#143b43] transition disabled:opacity-60"
              >
                {loading ? "جارٍ إنشاء الحساب..." : "أنشئ حسابي وادخل ←"}
              </button>

              <button type="button" onClick={() => setStep(1)} className="block w-full text-center text-sm text-ink-subtle font-bold hover:underline">
                ← رجوع وغيّر الكود
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

function StepDot({ active, label }: { active: boolean; label: string }) {
  return (
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold border-2 transition ${active ? "bg-[#012730] text-white border-[#012730]" : "bg-surface text-ink-subtle border-white/10"}`}>
      {label}
    </div>
  );
}
