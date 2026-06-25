"use client";
import { useState } from "react";
import { track } from '@/lib/analytics';
import { emit } from '@/lib/events/emit';
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useI18n, type TranslationKey } from "@/lib/i18n";

type RoleDef = {
  value: string;
  labelKey: TranslationKey;
  emoji: string;
  descKey: TranslationKey;
  restricted?: boolean;
};

const ROLES: RoleDef[] = [
  { value: "student",    labelKey: "register.role.student",    emoji: "🎓",       descKey: "register.role.student.desc" },
  { value: "parent",     labelKey: "register.role.parent",     emoji: "👨‍👩‍👧",   descKey: "register.role.parent.desc" },
  { value: "counselor",  labelKey: "register.role.counselor",  emoji: "🧑‍💼",     descKey: "register.role.counselor.desc" },
  { value: "school",     labelKey: "register.role.school",     emoji: "🏫",       descKey: "register.role.school.desc",     restricted: true },
  { value: "university", labelKey: "register.role.university", emoji: "🏛️",       descKey: "register.role.university.desc", restricted: true },
];

export default function RegisterPage() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signedUp, setSignedUp] = useState(false);

  async function handleGoogle() {
    if (role === "school" || role === "university") {
      router.push(role === "school" ? "/for-schools?partnership=1" : "/for-universities?partnership=1");
      return;
    }
    if (role === "parent") { router.push("/auth/parent-signup"); return; }
    const googleNext = role === "counselor" ? "/counselor/dashboard?new=1" : "/onboarding/wizard";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(googleNext)}` },
    });
  }

  const isRestricted = role === "school" || role === "university";

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (isRestricted) {
      router.push(role === "school" ? "/for-schools?partnership=1" : "/for-universities?partnership=1");
      return;
    }
    if (role === "parent") { router.push("/auth/parent-signup"); return; }
    setLoading(true);
    track('register_start', { role }); setError("");
    const next = role === "parent"
      ? "/parent/dashboard?new=1"
      : role === "counselor"
        ? "/counselor/dashboard?new=1"
        : "/onboarding/wizard";
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: {
        data: { full_name: fullName, role },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      }
    });
    if (error) {
      // M-17: map common Supabase auth errors to Arabic (was raw English).
      const m = (error.message || "").toLowerCase();
      setError(
        m.includes("already registered") || m.includes("already exists")
          ? "هذا الإيميل مسجّل مسبقاً — جرّب تسجيل الدخول."
        : m.includes("password") || m.includes("at least")
          ? "كلمة السر قصيرة — لازم تكون 6 أحرف على الأقل."
        : m.includes("email") && (m.includes("valid") || m.includes("invalid"))
          ? "صيغة الإيميل غير صحيحة."
        : m.includes("rate") || m.includes("too many")
          ? "محاولات كتيرة — جرّب بعد شوي."
        : "صار خطأ بالتسجيل. جرّب مرّة تانية."
      );
      setLoading(false);
      return;
    }
    setLoading(false);
    // M-1: emit the conversion event the admin dashboards/AI briefing read (was never fired).
    track('register_complete', { role });
    // If session is returned immediately (email confirmation disabled), go straight in.
    if (data?.session) {
      void emit('student.registered', { role });
      // Sprint 3.1: attach anonymous DNA result to the new account, if any.
      try {
        const raw = localStorage.getItem('masarak_dna_anonymous');
        if (raw) {
          const dna = JSON.parse(raw);
          await supabase.auth.updateUser({ data: { careerDNA: { ...dna, attachedFromAnonymous: true } } });
          localStorage.removeItem('masarak_dna_anonymous');
        }
      } catch {}
      router.push(next);
      return;
    }
    // Otherwise show the "check your email" screen.
    setSignedUp(true);
  }

  return (
    <div className="min-h-screen flex" dir={dir}>

      {/* VISUAL PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero text-white relative overflow-hidden items-center justify-center p-12">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-20" />
        <div className="absolute inset-0 bg-pattern-dots opacity-10" style={{ backgroundSize: '32px 32px' }} />

        <div className="absolute top-16 left-16 text-5xl animate-float">🚀</div>
        <div className="absolute bottom-24 right-20 text-4xl animate-float" style={{ animationDelay: '1s' }}>✨</div>

        <div className="relative text-center max-w-md">
          <div className="text-9xl mb-6 animate-float drop-shadow-2xl">🎉</div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            {t('register.visual.greet.1')}
            <br />
            <span className="text-mint">{t('register.visual.greet.2')}</span>
          </h2>
          <p className="text-white/90 text-lg leading-relaxed mb-8">
            {t('register.visual.subtitle')}
          </p>

          <div className={`bg-surface/15 backdrop-blur rounded-3xl p-6 border border-white/20 ${dir === 'rtl' ? 'text-right' : 'text-left'} space-y-3`}>
            {([
              { icon: '✅', key: 'register.visual.benefit.1' as TranslationKey },
              { icon: '🧬', key: 'register.visual.benefit.2' as TranslationKey },
              { icon: '🏆', key: 'register.visual.benefit.3' as TranslationKey },
              { icon: '📄', key: 'register.visual.benefit.4' as TranslationKey },
            ]).map(b => (
              <div key={b.key} className="flex items-center gap-2">
                <span className="text-xl">{b.icon}</span>
                <span className="text-sm">{t(b.key)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FORM PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 bg-bg relative overflow-hidden">
        <div className={`absolute top-0 ${dir === 'rtl' ? 'right-0' : 'left-0'} w-72 h-72 bg-mint rounded-full blur-3xl opacity-30 lg:hidden`} />

        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <Logo size={56} showSubtitle={false} />
            </Link>
            <h1 className="h2 mb-2">{t('register.title')}</h1>
            <p className="text-ink-muted">{t('register.subtitle')}</p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-6 max-w-xs mx-auto">
            {[1,2].map(s => (
              <div key={s} className={`flex-1 h-2 rounded-full transition-all duration-500 ${s <= step ? "bg-gradient-mint-deep" : "bg-bg-soft"}`} />
            ))}
          </div>

          <div className="card shadow-floaty">
            {signedUp && (
              <div className="text-center py-4">
                <div className="text-6xl mb-4">📬</div>
                <h2 className="h3 mb-3 text-primary">افحص بريدك الإلكتروني</h2>
                <p className="text-ink-muted text-sm mb-2 leading-relaxed">
                  بعتنا رابط تأكيد عـ <strong dir="ltr">{email}</strong>
                </p>
                <p className="text-ink-subtle text-xs mb-6">
                  افتح الإيميل واضغط الرابط لتفعّل حسابك. إذا ما لقيته، شوف بمجلد الـ Spam.
                </p>
                <div className="space-y-2">
                  <Link href="/auth/login" className="btn-primary w-full py-3 inline-block text-center">
                    رجوع لتسجيل الدخول
                  </Link>
                  <button
                    onClick={() => { setSignedUp(false); setStep(2); }}
                    type="button"
                    className="w-full text-sm text-ink-muted hover:text-primary"
                  >
                    استعمل إيميل تاني
                  </button>
                </div>
              </div>
            )}
            {!signedUp && step === 1 && (
              <>
                <h2 className="h4 mb-4 text-center">{t('register.who_are_you')}</h2>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {ROLES.map(r => (
                    <button key={r.value}
                      onClick={() => {
                        if (r.restricted) {
                          router.push(r.value === "school" ? "/for-schools?partnership=1" : "/for-universities?partnership=1");
                          return;
                        }
                        setRole(r.value);
                      }}
                      type="button"
                      className={`relative border-2 rounded-2xl p-4 text-center transition-all hover:-translate-y-0.5 ${
                        role === r.value
                          ? "border-primary bg-mint-pale shadow-soft"
                          : "border-border hover:border-mint"
                      } ${r.restricted ? "bg-accent-light/30" : ""}`}>
                      {r.restricted && (
                        <span className={`absolute top-2 ${dir === 'rtl' ? 'left-2' : 'right-2'} badge-accent text-[9px] !px-1.5`}>{t('register.role.partnership')}</span>
                      )}
                      <div className="text-4xl mb-1">{r.emoji}</div>
                      <div className={`font-extrabold text-sm ${role === r.value ? "text-primary" : "text-ink"}`}>{t(r.labelKey)}</div>
                      <div className="text-[10px] text-ink-muted mt-0.5">{t(r.descKey)}</div>
                    </button>
                  ))}
                </div>

                <p className="text-[11px] text-ink-subtle text-center mb-4">
                  {t('register.partnership_note')}
                </p>

                <button onClick={handleGoogle} type="button"
                  className="w-full flex items-center justify-center gap-3 border-2 border-border rounded-2xl py-3 font-semibold hover:bg-bg-soft hover:border-primary transition-all mb-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  {t('register.continue_google')}
                </button>

                <button onClick={() => setStep(2)} className="btn-primary w-full py-3.5" type="button">
                  {t('register.continue_email')}
                </button>
              </>
            )}

            {!signedUp && step === 2 && (
              <>
                <button onClick={() => setStep(1)} type="button"
                  className="text-ink-muted text-sm mb-4 hover:text-primary flex items-center gap-1">
                  {t('register.back')}
                </button>

                {error && (
                  <div className="bg-danger-light text-danger border border-danger/30 rounded-xl p-3 text-sm mb-4 flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="input-label">{t('register.name_label')}</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                      className="input" placeholder={t('register.name_placeholder')} />
                  </div>
                  <div>
                    <label className="input-label">{t('register.email_label')}</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="input" placeholder={t('register.email_placeholder')} dir="ltr" />
                  </div>
                  <div>
                    <label className="input-label">{t('register.password_label')}</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                      className="input" placeholder={t('register.password_placeholder')} dir="ltr" />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
                    {loading ? t('register.submitting') : t('register.submit')}
                  </button>
                </form>

                <p className="text-[11px] text-ink-subtle text-center mt-4">
                  {t('register.terms.1')}
                  <Link href="/terms" className="text-primary hover:underline mx-1">{t('register.terms.link')}</Link>
                  {t('register.terms.and')}
                  <Link href="/privacy" className="text-primary hover:underline mx-1">{t('register.privacy.link')}</Link>
                </p>
              </>
            )}
          </div>

          <p className="text-center text-sm text-ink-muted mt-6">
            {t('register.have_account')}{" "}
            <Link href="/auth/login" className="text-primary font-bold hover:text-accent">
              {t('register.sign_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
