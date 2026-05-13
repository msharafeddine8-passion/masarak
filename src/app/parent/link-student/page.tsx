'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function LinkStudentPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [studentEmail, setStudentEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push('/auth/login?next=/parent/link-student'); return; }
      setUser(data.user);
    });
  }, [router]);

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage(null);

    try {
      // ابحث عن المستخدم في profiles
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .ilike('email', studentEmail.trim())
        .maybeSingle();

      if (!studentProfile) {
        setMessage({ type: 'error', text: 'هاد الإيميل ما عنده حساب على مسارك. اطلب من ابنك يفتح حساب أولاً.' });
        setLoading(false);
        return;
      }

      // أضف الـ link
      const { error } = await supabase.from('parent_student_links').insert({
        parent_user_id: user.id,
        student_user_id: studentProfile.id,
        status: 'pending',
      });

      if (error) {
        if (error.code === '23505') {
          setMessage({ type: 'info', text: 'حسابك مرتبط أو طلبت ربط قبل.' });
        } else {
          setMessage({ type: 'error', text: error.message });
        }
      } else {
        setMessage({ type: 'success', text: `✅ تم إرسال دعوة لـ ${studentProfile.full_name}. لازم يقبلها من حسابه.` });
        setStudentEmail('');
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
    setLoading(false);
  }

  return (
    <main className="min-h-screen bg-bg pb-20 relative overflow-hidden" dir="rtl">
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto px-4 py-8">
        <Link href="/parent/dashboard" className="text-sm text-ink-muted hover:text-primary inline-flex items-center gap-1 mb-4">
          → العودة للوحة المتابعة
        </Link>

        <div className="bg-gradient-hero rounded-4xl p-8 text-white text-center shadow-floaty relative overflow-hidden mb-6">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="relative">
            <div className="text-7xl mb-3 animate-bounce-soft">🔗</div>
            <h1 className="text-3xl font-extrabold mb-2">اربط حساب طالب</h1>
            <p className="text-white/90">أدخل إيميل ابنك/ابنتك لإرسال دعوة ربط</p>
          </div>
        </div>

        <div className="card shadow-card">
          <ol className="space-y-3 mb-6 text-sm text-ink">
            <li className="flex gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0">1</span>
              <span>اطلب من ابنك/ابنتك يفتح حساب على مسارك (إذا ما عنده)</span>
            </li>
            <li className="flex gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0">2</span>
              <span>أدخل إيميله بالخانة تحت واضغط "إرسال دعوة"</span>
            </li>
            <li className="flex gap-2">
              <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0">3</span>
              <span>سيتلقى ابنك إشعار بحسابه ويقبل الدعوة</span>
            </li>
            <li className="flex gap-2">
              <span className="bg-success text-white w-6 h-6 rounded-full flex items-center justify-center font-bold flex-shrink-0">✓</span>
              <span>بعدها رح تشوف تقدّمه ومعلوماته بحسابك</span>
            </li>
          </ol>

          {message && (
            <div className={`p-3 rounded-xl text-sm mb-4 ${
              message.type === 'success' ? 'bg-success-light text-emerald-700 border border-success/30' :
              message.type === 'error'   ? 'bg-danger-light text-red-700 border border-danger/30' :
              'bg-info-light text-cyan-800 border border-info/30'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={sendInvite} className="space-y-4">
            <div>
              <label className="input-label">📧 إيميل ابنك/ابنتك</label>
              <input
                type="email"
                value={studentEmail}
                onChange={e => setStudentEmail(e.target.value)}
                required
                className="input"
                placeholder="student@example.com"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5">
              {loading ? "جاري الإرسال..." : "📤 إرسال دعوة"}
            </button>
          </form>

          <div className="mt-6 p-4 bg-bg-mint rounded-2xl text-sm">
            <strong className="text-primary-dark">🔐 الخصوصية:</strong>
            <p className="text-ink mt-1">ابنك بيشوف وبيوافق على الربط قبل ما يقدر يطلع على أي شي. ما رح تشوف بياناته إلا بعد موافقته.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
