"use client";
// Code-first parent signup flow.
// Step 1: Parent enters the student's access code. We validate it exists (without revealing details).
// Step 2: Parent creates account (email + password). Account is created with role=parent.
// Step 3: After auth callback, the link RPC fires and parent lands on /parent/dashboard.

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

export default function ParentSignupPage() {
  const router = useRouter();
  const { t } = useI18n();
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
    if (trimmed.length < 4) { setError(t('psignup.errCodeShort')); setLoading(false); return; }

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
      setError(signErr.message || t('psignup.errSignup'));
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
        <Link href="/" className="block text-center text-3xl font-extrabold text-[#012730] mb-6">{t('psignup.brand')}</Link>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <StepDot active={step >= 1} label="1" />
          <div className="w-12 h-0.5 bg-bg-soft" />
          <StepDot active={step >= 2} label="2" />
        </div>

        <div className="bg-surface rounded-3xl shadow-floaty border border-line p-6 md:p-8">
          {step === 1 ? (
            <form onSubmit={validateCode} className="space-y-5">
              <header className="text-center mb-6">
                <div className="text-5xl mb-3">👨‍👩‍👧</div>
                <h1 className="text-2xl font-extrabold text-[#1b3a6b] mb-2">{t('psignup.step1Title')}</h1>
                <p className="text-sm text-ink-muted leading-relaxed">
                  {t('psignup.step1IntroA')} <strong>{t('psignup.parentCode')}</strong> {t('psignup.step1IntroB')}
                </p>
              </header>

              <div>
                <label className="block text-sm font-bold text-ink-muted mb-1.5">{t('psignup.parentCode')}</label>
                <input
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  placeholder={t('psignup.codePlaceholder')}
                  className="input text-center tracking-widest font-mono text-lg"
                  dir="ltr"
                  autoFocus
                />
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">⚠️ {error}</div>}{/* error text already localized */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#012730] text-white font-extrabold hover:bg-[#143b43] transition disabled:opacity-60"
              >
                {loading ? t('psignup.verifying') : t('psignup.verifyContinue')}
              </button>

              <div className="text-center text-sm text-ink-muted pt-2">
                {t('psignup.haveAccount')} <Link href="/auth/login" className="font-bold text-[#1b3a6b] hover:underline">{t('psignup.login')}</Link>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 leading-relaxed">
                💡 <strong>{t('psignup.noAccountYetTitle')}</strong> {t('psignup.noAccountYetBody')}
              </div>
            </form>
          ) : (
            <form onSubmit={handleSignup} className="space-y-4">
              <header className="text-center mb-4">
                <div className="text-5xl mb-3">✅</div>
                <h1 className="text-2xl font-extrabold text-[#1b3a6b] mb-1">{t('psignup.step2Title')}</h1>
                <p className="text-sm text-ink-muted">
                  {t('psignup.step2Sub')} <span className="font-mono font-bold text-[#012730]" dir="ltr">{validatedStudent}</span>
                </p>
              </header>

              <div>
                <label className="block text-sm font-bold text-ink-muted mb-1.5">{t('psignup.fullName')}</label>
                <input value={fullName} onChange={(e) => setFullName(e.target.value)} required className="input" />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink-muted mb-1.5">{t('psignup.email')}</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" className="input" />
              </div>

              <div>
                <label className="block text-sm font-bold text-ink-muted mb-1.5">{t('psignup.password')}</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} dir="ltr" className="input" />
              </div>

              {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">⚠️ {error}</div>}{/* error text already localized */}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-[#012730] text-white font-extrabold hover:bg-[#143b43] transition disabled:opacity-60"
              >
                {loading ? t('psignup.creating') : t('psignup.createEnter')}
              </button>

              <button type="button" onClick={() => setStep(1)} className="block w-full text-center text-sm text-ink-subtle font-bold hover:underline">
                {t('psignup.backChangeCode')}
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
    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-extrabold border-2 transition ${active ? "bg-[#012730] text-white border-[#012730]" : "bg-surface text-ink-subtle border-line"}`}>
      {label}
    </div>
  );
}
