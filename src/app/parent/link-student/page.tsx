'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';

export default function LinkStudentPage() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login?next=/parent/link-student'); return; }
      setUser(data.user);
    });
  }, [router]);

  async function linkByCode(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.rpc('link_parent_by_code', {
      p_code: code.trim(),
    });

    setLoading(false);

    if (error) { setMessage({ type: 'error', text: error.message }); return; }

    const result = String(data || '');
    if (result.startsWith('OK:')) {
      setMessage({ type: 'success', text: `✅ تم الربط مع ${result.slice(3)} — تقدر تشوف تقدّمه الآن.` });
      setCode('');
      setTimeout(() => router.push('/parent/dashboard'), 1500);
    } else if (result === 'NOT_FOUND') {
      setMessage({ type: 'error', text: 'ما في طالب بهذا الكود. تأكّد من الكود مع ابنك/ابنتك.' });
    } else if (result === 'SELF') {
      setMessage({ type: 'error', text: 'ما تقدر تربط حسابك بنفسك.' });
    } else if (result === 'BAD_CODE') {
      setMessage({ type: 'error', text: 'الكود غير صحيح.' });
    } else {
      setMessage({ type: 'error', text: 'صار خطأ. حاول مرة ثانية.' });
    }
  }

  return (
    <main className="min-h-screen bg-bg pb-20 relative overflow-hidden" dir={dir}>
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />

      <div className="relative max-w-md mx-auto px-4 py-8">
        <Link href="/parent/dashboard" className="text-sm text-ink-muted hover:text-primary inline-flex items-center gap-1 mb-4">
          → العودة للوحة المتابعة
        </Link>

        <div className="bg-gradient-hero rounded-4xl p-8 text-white text-center shadow-floaty relative overflow-hidden mb-6">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="relative">
            <div className="text-7xl mb-3 animate-bounce-soft">🔗</div>
            <h1 className="text-3xl font-extrabold mb-2">اربط حساب ابنك</h1>
            <p className="text-white/90">أدخل الكود اللي ظهر عند ابنك/ابنتك</p>
          </div>
        </div>

        <div className="card shadow-card">
          <ol className="space-y-3 mb-6 text-sm text-ink">
            <li className="flex gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
              <span>اطلب من ابنك/ابنتك يفتح حسابه على مسارك</span>
            </li>
            <li className="flex gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
              <span>من ملفه الشخصي → &quot;ربط الأهل&quot; رح يطلعله كود</span>
            </li>
            <li className="flex gap-2">
              <span className="bg-success text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0">✓</span>
              <span>أدخل الكود تحت — وبتشوف تقدّمه مباشرة</span>
            </li>
          </ol>

          {message && (
            <div className={`p-3 rounded-xl text-sm mb-4 ${
              message.type === 'success'
                ? 'bg-success-light text-emerald-700 border border-success/30'
                : 'bg-danger-light text-red-700 border border-danger/30'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={linkByCode} className="space-y-4">
            <div>
              <label className="input-label">🔑 كود الربط</label>
              <input
                type="text"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                required
                maxLength={10}
                className="input text-center text-2xl font-extrabold tracking-[0.3em]"
                placeholder="ABC123"
                dir="ltr"
              />
            </div>
            <button type="submit" disabled={loading || code.trim().length < 4} className="btn-primary w-full py-3.5 disabled:opacity-50">
              {loading ? 'جاري الربط...' : 'اربط الحساب'}
            </button>
          </form>

          <div className="mt-6 p-4 bg-bg-mint rounded-2xl text-sm">
            <strong className="text-primary-dark">🔐 الخصوصية:</strong>
            <p className="text-ink mt-1">الكود يعطيك ابنك بنفسه — يعني هو وافق على الربط. تقدر تشوف تقدّمه، بس ما تشوف كلمة المرور أو رسائله الخاصة.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
