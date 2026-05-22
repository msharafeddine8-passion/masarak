"use client";
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useI18n } from "@/lib/i18n";
import { fetchMyOrgs } from "@/lib/org";

export default function LoginPage() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(t('login.error.invalid'));
      setLoading(false);
      return;
    }
    // Institution accounts (own/manage an org) land on the org dashboard,
    // never the student view.
    const uid = data?.user?.id;
    if (uid) {
      const orgs = await fetchMyOrgs(uid);
      if (orgs.length > 0) { router.push("/org/dashboard"); return; }
    }
    const role = data?.user?.user_metadata?.role;
    if (role === 'parent') router.push("/parent/dashboard");
    else router.push("/dashboard");
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/auth/callback` } });
  }

  return (
    <div className="min-h-screen flex" dir={dir}>

      {/* VISUAL PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-hero text-white relative overflow-hidden items-center justify-center p-12">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-20" />
        <div className="absolute inset-0 bg-pattern-dots opacity-10" style={{ backgroundSize: '32px 32px' }} />

        <div className="absolute top-16 right-16 text-5xl animate-float">🎓</div>
        <div className="absolute bottom-24 left-20 text-4xl animate-float" style={{ animationDelay: '1s' }}>📚</div>
        <div className="absolute top-1/3 left-12 text-3xl animate-float" style={{ animationDelay: '1.5s' }}>✨</div>

        <div className="relative text-center max-w-md">
          <div className="text-9xl mb-6 animate-float drop-shadow-2xl">👋</div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">
            {t('login.visual.greet.1')}
            <br />
            {t('login.visual.greet.2')}
          </h2>
          <p className="text-white/90 text-lg leading-relaxed mb-8">
            {t('login.visual.subtitle')}
          </p>

          <div className="bg-white/15 backdrop-blur rounded-3xl p-5 border border-white/20 shadow-floaty">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-extrabold">35</div>
                <div className="text-xs text-white/80">{t('login.visual.stat.unis')}</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold">200+</div>
                <div className="text-xs text-white/80">{t('login.visual.stat.majors')}</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold">12</div>
                <div className="text-xs text-white/80">{t('login.visual.stat.tools')}</div>
              </div>
            </div>
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
            <h1 className="h2 mb-2">{t('login.title')}</h1>
            <p className="text-ink-muted">{t('login.subtitle')}</p>
          </div>

          <div className="card shadow-floaty">
            <button onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 border-2 border-border rounded-2xl py-3 font-semibold text-ink hover:bg-bg-soft hover:border-primary transition-all mb-5">
              <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              {t('login.google')}
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-border"></div>
              <span className="text-ink-subtle text-xs font-semibold uppercase">{t('login.or_email')}</span>
              <div className="flex-1 h-px bg-border"></div>
            </div>

            {error && (
              <div className="bg-danger-light text-danger border border-danger/30 rounded-xl p-3 text-sm mb-4 flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="input-label">{t('login.email_label')}</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="input"
                  placeholder={t('login.email_placeholder')} dir="ltr" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="input-label !mb-0">{t('login.password_label')}</label>
                  <Link href="/auth/forgot" className="text-xs text-primary hover:underline font-semibold">
                    {t('login.forgot')}
                  </Link>
                </div>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                  className="input"
                  placeholder={t('login.password_placeholder')} dir="ltr" />
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3.5 disabled:opacity-60">
                {loading ? t('login.submitting') : t('login.submit')}
              </button>
            </form>
          </div>

          <p className="text-center text-sm text-ink-muted mt-6">
            {t('login.no_account')}{" "}
            <Link href="/auth/register" className="text-primary font-bold hover:text-accent">
              {t('login.create_account')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
