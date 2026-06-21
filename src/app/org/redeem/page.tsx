'use client';

import { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type InviteInfo = {
  email: string;
  org_type: string;
  org_hint?: string | null;
  role: string;
  message?: string | null;
  has_existing_org: boolean;
};

type Phase =
  | 'loading' | 'invalid' | 'show_invite'
  | 'creating_account' | 'signing_in' | 'redeeming'
  | 'success' | 'error';

const ROLE_LABELS: Record<string, string> = {
  owner: 'مالك (Owner)', editor: 'محرّر (Editor)', viewer: 'مشاهد',
};
const TYPE_LABELS: Record<string, string> = {
  university: 'جامعة 🏛️', school: 'مدرسة 🏫', sponsor: 'راعي 🤝', institute: 'معهد 🏭',
};

function RedeemInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token') || '';

  const [phase, setPhase] = useState<Phase>('loading');
  const [error, setError] = useState('');
  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [mode, setMode] = useState<'signup' | 'signin'>('signup');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    (async () => {
      if (!token) { setPhase('invalid'); setError('رابط دعوة غير صحيح.'); return; }

      const { data, error: rpcErr } = await supabase.rpc('lookup_org_invite', { p_token: token });
      if (rpcErr) {
        if (rpcErr.code === 'PGRST202' || rpcErr.code === '42883') {
          setPhase('error');
          setError('نظام الدعوات مش مفعّل بعد. تواصلوا مع الإدارة.');
          return;
        }
        setPhase('error'); setError(rpcErr.message); return;
      }
      const inv = data as InviteInfo & { ok: boolean; error?: string };
      if (!inv?.ok) {
        setPhase('invalid');
        const reasons: Record<string, string> = {
          not_found: 'هاد الرابط مش صحيح. تواصل مع الإدمن للحصول على دعوة جديدة.',
          already_redeemed: 'هاد الرابط استُخدم مسبقاً. سجّل دخول من /org/login.',
          expired: 'انتهت صلاحية الدعوة. اطلب من الإدمن إرسال دعوة جديدة.',
        };
        setError(reasons[inv?.error || ''] || 'الدعوة غير صالحة.');
        return;
      }
      setInvite(inv);

      // Already signed in with the correct email? Auto-redeem
      const { data: { user } } = await supabase.auth.getUser();
      if (user && (user.email || '').toLowerCase() === inv.email.toLowerCase()) {
        await autoRedeem(token);
        return;
      }
      setPhase('show_invite');
    })();
  }, [token]);

  async function autoRedeem(t: string) {
    setPhase('redeeming');
    const { data, error: err } = await supabase.rpc('redeem_org_invite', { p_token: t });
    if (err) { setPhase('error'); setError(err.message); return; }
    const r = data as { ok: boolean; error?: string };
    if (!r?.ok) {
      setPhase('error'); setError(errorMsg(r?.error || 'unknown')); return;
    }
    setPhase('success');
    setTimeout(() => router.push('/org/dashboard'), 1500);
  }

  function errorMsg(code: string): string {
    const m: Record<string, string> = {
      not_signed_in: 'سجّل دخول أولاً.',
      not_found: 'الدعوة غير موجودة.',
      already_redeemed: 'الدعوة استُخدمت مسبقاً.',
      expired: 'انتهت صلاحية الدعوة.',
      email_mismatch: 'إيميل الحساب مش متطابق مع إيميل الدعوة.',
    };
    return m[code] || 'فشل: ' + code;
  }

  async function submit() {
    if (!invite || !token) return;
    setError('');

    if (mode === 'signup') {
      if (!name.trim()) { setError('الاسم مطلوب.'); return; }
      if (password.length < 8) { setError('كلمة السرّ لازم 8 أحرف على الأقل.'); return; }

      setPhase('creating_account');

      // STRATEGY: try client-side signUp first. If email confirmation is OFF
      // in Supabase (recommended setup), we get a session immediately and proceed.
      // If confirmation is required AND server has SERVICE_ROLE_KEY, fall back to server.
      const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
        email: invite.email,
        password,
        options: {
          data: { full_name: name.trim(), role: 'org_owner', org_type: invite.org_type, invite_token: token },
        },
      });

      if (signUpErr) {
        const msg = (signUpErr.message || '').toLowerCase();
        if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
          setMode('signin'); setPhase('show_invite');
          setError('عندك حساب موجود بهذا الإيميل. حطّ كلمة السرّ وسجّل دخول.');
          return;
        }
        setPhase('show_invite'); setError(signUpErr.message); return;
      }

      const hasSession = !!signUpData?.session;
      if (hasSession) {
        // Path A — email confirmation is OFF. We're signed in immediately.
        await autoRedeem(token);
        return;
      }

      // Path B — email confirmation is still ON. Try server-side admin path.
      try {
        const resp = await fetch('/api/org/redeem-signup', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ token, name: name.trim(), password }),
        });
        const body = await resp.json();
        if (body.ok) {
          // Server created user with email_confirm:true. Sign in to get a session.
          const { error: si } = await supabase.auth.signInWithPassword({ email: invite.email, password });
          if (si) { setPhase('error'); setError('فشل تسجيل الدخول التلقائي: ' + si.message); return; }
          await autoRedeem(token);
          return;
        }
        if (body.error === 'service_role_not_configured') {
          // Both paths failed. Email confirmation is ON and no service key.
          // Tell user exactly what to do (one of two simple fixes).
          setPhase('error');
          setError(
            'لازم تطفّي email confirmation من Supabase Auth settings. ' +
            'افتح Supabase Dashboard → Authentication → Providers → Email → Confirm email = OFF. ' +
            'بعدها افتح الرابط مرة تانية.'
          );
          return;
        }
        if (body.error === 'user_exists') {
          setMode('signin'); setPhase('show_invite');
          setError('عندك حساب موجود. سجّل دخول.');
          return;
        }
        setPhase('error'); setError(body.error + (body.detail ? ' — ' + body.detail : ''));
      } catch (e) {
        setPhase('error'); setError((e as Error).message);
      }
    } else {
      // Sign-in mode (existing account)
      if (!password) { setError('كلمة السرّ مطلوبة.'); return; }
      setPhase('signing_in');
      const { error: si } = await supabase.auth.signInWithPassword({ email: invite.email, password });
      if (si) { setPhase('show_invite'); setError(si.message); return; }
      await autoRedeem(token);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-mint-pale to-bg-mint p-4" dir="rtl">
      <div className="bg-surface rounded-3xl shadow-floaty max-w-md w-full p-8 md:p-10">

        {phase === 'loading' && (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-ink-muted">جاري التحقق من الدعوة...</p>
          </div>
        )}

        {phase === 'invalid' && (
          <div className="text-center">
            <div className="text-6xl mb-4">⛔</div>
            <h1 className="text-2xl font-extrabold text-rose-700 mb-3">الدعوة غير صالحة</h1>
            <p className="text-ink-muted mb-6">{error}</p>
            <Link href="/contact" className="block w-full bg-primary text-white font-bold py-3 rounded-xl">راسل الفريق</Link>
          </div>
        )}

        {phase === 'show_invite' && invite && (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">📨</div>
              <h1 className="text-2xl font-extrabold text-primary mb-2">مرحباً بك على مسارك</h1>
              <p className="text-ink-muted text-sm">دعوة لإدارة {TYPE_LABELS[invite.org_type] || invite.org_type}</p>
            </div>

            <div className="bg-mint-pale border-2 border-mint/40 rounded-2xl p-4 mb-5 space-y-2 text-sm">
              {invite.org_hint && (
                <div className="flex justify-between">
                  <span className="text-ink-muted font-bold">المؤسسة:</span>
                  <span className="font-extrabold">{invite.org_hint}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-ink-muted font-bold">الدور:</span>
                <span className="font-extrabold">{ROLE_LABELS[invite.role] || invite.role}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-muted font-bold">إيميلك:</span>
                <span className="font-extrabold text-xs break-all">{invite.email}</span>
              </div>
              {invite.message && (
                <div className="pt-2 border-t border-mint/30">
                  <div className="text-ink-muted font-bold mb-1">رسالة من فريق مسارك:</div>
                  <div className="italic">{invite.message}</div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex gap-2 mb-4">
                <button onClick={() => { setMode('signup'); setError(''); }}
                  className={'flex-1 py-2 rounded-xl text-sm font-bold transition ' +
                    (mode === 'signup' ? 'bg-primary text-white' : 'bg-bg-soft text-ink-muted')}>
                  حساب جديد
                </button>
                <button onClick={() => { setMode('signin'); setError(''); }}
                  className={'flex-1 py-2 rounded-xl text-sm font-bold transition ' +
                    (mode === 'signin' ? 'bg-primary text-white' : 'bg-bg-soft text-ink-muted')}>
                  عندي حساب
                </button>
              </div>

              {mode === 'signup' && (
                <input value={name} onChange={e => setName(e.target.value)} placeholder="اسمك الكامل"
                  className="w-full px-4 py-3 rounded-xl border-2 border-line focus:border-primary outline-none" />
              )}

              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'signup' ? 'كلمة سرّ (8 أحرف على الأقل)' : 'كلمة السرّ'}
                  className="w-full px-4 py-3 rounded-xl border-2 border-line focus:border-primary outline-none pl-12" />
                <button type="button" onClick={() => setShowPwd(s => !s)} className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
                  {showPwd ? '🙈' : '👁️'}
                </button>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

              <button onClick={submit}
                className="w-full bg-primary hover:bg-primary-dark text-white font-extrabold py-3 rounded-xl transition">
                {mode === 'signup' ? '✨ إنشاء الحساب وقبول الدعوة' : '🔓 تسجيل دخول وقبول الدعوة'}
              </button>

              <p className="text-xs text-ink-muted text-center pt-2">
                * إيميلك مقفول من الدعوة.
              </p>
            </div>
          </>
        )}

        {phase === 'creating_account' && (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-bold mb-1">جاري إنشاء الحساب...</p>
            <p className="text-xs text-ink-muted">لحظة واحدة</p>
          </div>
        )}

        {phase === 'signing_in' && (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-ink-muted">جاري تسجيل الدخول...</p>
          </div>
        )}

        {phase === 'redeeming' && (
          <div className="text-center">
            <div className="w-12 h-12 mx-auto border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
            <p className="font-bold mb-1">جاري ربط حسابك بالمؤسسة...</p>
          </div>
        )}

        {phase === 'success' && (
          <div className="text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h1 className="text-2xl font-extrabold text-primary mb-3">تم بنجاح!</h1>
            <p className="text-ink-muted mb-2">جاري تحويلك لداشبور مؤسستك...</p>
            <Link href="/org/dashboard" className="text-primary font-bold hover:underline">انتقل الآن ←</Link>
          </div>
        )}

        {phase === 'error' && (
          <div className="text-center">
            <div className="text-6xl mb-4">😔</div>
            <h1 className="text-2xl font-extrabold text-rose-700 mb-3">في مشكلة</h1>
            <p className="text-ink-muted mb-6 break-words text-right whitespace-pre-wrap">{error}</p>
            <div className="space-y-2">
              <button onClick={() => location.reload()} className="block w-full bg-primary text-white font-bold py-3 rounded-xl">🔄 إعادة المحاولة</button>
              <Link href="/contact" className="block w-full bg-bg-soft text-ink font-bold py-3 rounded-xl">راسل الفريق</Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function RedeemPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-ink-muted">جاري التحميل...</div></div>}>
      <RedeemInner />
    </Suspense>
  );
}
