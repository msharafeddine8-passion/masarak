"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

const ROLES = [
  { value: "student",    label: "طالب",     emoji: "🎓", desc: "أبحث عن جامعة/تخصص" },
  { value: "parent",     label: "ولي أمر",   emoji: "👨‍👩‍👧", desc: "أتابع رحلة ابني" },
  { value: "school",     label: "مدرسة",     emoji: "🏫", desc: "بشراكة فقط",   restricted: true },
  { value: "university", label: "جامعة",     emoji: "🏛️", desc: "بشراكة فقط",   restricted: true },
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
    if (role === "school" || role === "university") {
      router.push(role === "school" ? "/for-schools?partnership=1" : "/for-universities?partnership=1");
      return;
    }
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
  }

  // إذا اختار مدرسة أو جامعة، نوّجهه على صفحة الشراكة
  const isRestricted = role === "school" || role === "university";

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (isRestricted) {
      // ما نسمحلهم يفتحوا حساب — نوّجههم لصفحة الشراكة
      router.push(role === "school" ? "/for-schools?partnership=1" : "/for-universities?partnership=1");
      return;
    }
    setLoading(true); setError("");
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } }
    });
    if (error) { setError(error.message); setLoading(false); }
    else {
      // توجيه حسب الدور
      if (role === "parent") router.push("/parent/dashboard?new=1");
      else router.push("/dashboard?new=1");
    }
  }

  return (
    <div className="min-h-screen flex" dir="rtl">

      {/* RIGHT VISUAL PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero text-white relative overflow-hidden items-center justify-center p-12">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-20" />
        <div className="absolute inset-0 bg-pattern-dots opacity-10" style={{ backgroundSize: '32px 32px' }} />

        <div className="absolute top-16 left-16 text-5xl animate-float">🚀</div>
        <div className="absolute bottom-24 right-20 text-4xl animate-float" style={{ animationDelay: '1s' }}>✨</div>

        <div className="relative text-center max-w-md">
          <div className="text-9xl mb-6 animate-float drop-shadow-2xl">🎉</div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            ابدأ رحلتك
            <br />
            <span className="text-mint">معنا!</span>
          </h2>
          <p className="text-white/90 text-lg leading-relaxed mb-8">
            انضم لآلاف الطلاب اللي بيستخدموا مسارك يومياً لاتخاذ قراراتهم
          </p>

          <div className="bg-white/15 backdrop-blur rounded-3xl p-6 border border-white/20 text-right space-y-3">
            {[
              { icon: '✅', text: 'وصول مجاني لكل الأدوات' },
              { icon: '🧬', text: 'اختبار Career DNA كامل' },
              { icon: '🏆', text: 'دليل لـ 35 جامعة و 150+ منحة' },
              { icon: '📄', text: 'بناء سيرة ذاتية احترافية' },
            ].map(b => (
              <div key={b.text} className="flex items-center gap-2">
                <span className="text-xl">{b.icon}</span>
                <span className="text-sm">{b.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LEFT FORM PANEL */}
      <div className="flex-1 flex items-center justify-center p-6 bg-bg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-mint rounded-full blur-3xl opacity-30 lg:hidden" />

        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block mb-6">
              <Logo size={56} showSubtitle={false} />
            </Link>
            <h1 className="h2 mb-2">أنشئ حسابك المجاني 🚀</h1>
            <p className="text-ink-muted">انضم لآلاف الطلاب اللي على المنصة</p>
          </div>

          {/* Progress */}
          <div className="flex gap-2 mb-6 max-w-xs mx-auto">
            {[1,2].map(s => (
              <div key={s} className={`flex-1 h-2 rounded-full transition-all duration-500 ${s <= step ? "bg-gradient-mint-deep" : "bg-bg-soft"}`} />
            ))}
          </div>

          <div className="card shadow-floaty">
            {step === 1 && (
              <>
                <h2 className="h4 mb-4 text-center">من أنت؟</h2>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {ROLES.map(r => (
                    <button key={r.value} onClick={() => setRole(r.value)} type="button"
                      className={`relative border-2 rounded-2xl p-4 text-center transition-all hover:-translate-y-0.5 ${
                        role === r.value
                          ? "border-primary bg-mint-pale shadow-soft"
                          : "border-border hover:border-mint"
                      }`}>
                      {r.restricted && (
                        <span className="absolute top-2 left-2 badge-accent text-[9px] !px-1.5">🤝 شراكة</span>
                      )}
                      <div className="text-4xl mb-1">{r.emoji}</div>
                      <div className={`font-extrabold text-sm ${role === r.value ? "text-primary" : "text-ink"}`}>{r.label}</div>
                      <div className="text-[10px] text-ink-muted mt-0.5">{r.desc}</div>
                    </button>
                  ))}
                </div>

                {/* Restricted notice */}
                {isRestricted && (
                  <div className="bg-accent-light border border-accent/30 rounded-2xl p-4 mb-4 text-sm">
                    <div className="flex items-start gap-2">
                      <span className="text-xl">🔒</span>
                      <div>
                        <strong className="text-accent-dark">للمدارس والجامعات:</strong>
                        <p className="text-ink mt-1 leading-relaxed">
                          حسابات المدارس والجامعات بتنفتح بشراكة فقط (مش متاحة للجمهور).
                          اضغط "متابعة" لتشوف الميزات وتتواصل معنا.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <button onClick={handleGoogle} type="button"
                  className="w-full flex items-center justify-center gap-3 border-2 border-border rounded-2xl py-3 font-semibold hover:bg-bg-soft hover:border-primary transition-all mb-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                  متابعة بـ Google
                </button>

                {isRestricted ? (
                  <button
                    onClick={() => router.push(role === "school" ? "/for-schools?partnership=1" : "/for-universities?partnership=1")}
                    className="btn-primary w-full py-3.5" type="button">
                    🤝 شوف ميزات الشراكة + تواصل معنا ←
                  </button>
                ) : (
                  <button onClick={() => setStep(2)} className="btn-primary w-full py-3.5" type="button">
                    متابعة بالبريد الإلكتروني ←
                  </button>
                )}
              </>
            )}

            {step === 2 && (
              <>
                <button onClick={() => setStep(1)} type="button"
                  className="text-ink-muted text-sm mb-4 hover:text-primary flex items-center gap-1">
                  → رجوع
                </button>

                {error && (
                  <div className="bg-danger-light text-danger border border-danger/30 rounded-xl p-3 text-sm mb-4 flex items-center gap-2">
                    <span>⚠️</span> {error}
                  </div>
                )}

                <form onSubmit={handleRegister} className="space-y-4">
                  <div>
                    <label className="input-label">👤 الاسم الكامل</label>
                    <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} required
                      className="input" placeholder="محمد أحمد" />
                  </div>
                  <div>
                    <label className="input-label">📧 البريد الإلكتروني</label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                      className="input" placeholder="example@email.com" />
                  </div>
                  <div>
                    <label className="input-label">🔒 كلمة المرور</label>
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
                      className="input" placeholder="8 أحرف على الأقل" />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
                    {loading ? "جارٍ الإنشاء..." : "أنشئ الحساب المجاني 🚀"}
                  </button>
                </form>

                <p className="text-[11px] text-ink-subtle text-center mt-4">
                  بإنشائك حساباً، فأنت توافق على
                  <Link href="/terms" className="text-primary hover:underline mx-1">الشروط</Link>
                  و
                  <Link href="/privacy" className="text-primary hover:underline mx-1">سياسة الخصوصية</Link>
                </p>
              </>
            )}
          </div>

          <p className="text-center text-sm text-ink-muted mt-6">
            عندك حساب؟{" "}
            <Link href="/auth/login" className="text-primary font-bold hover:text-accent">
              سجّل دخول
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
