'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

function ResultInner() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('session');
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [gam, setGam] = useState<any>(null);

  useEffect(() => {
    if (!sessionId) { router.push('/quiz/today'); return; }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const [{ data: s }, { data: g }] = await Promise.all([
        supabase.from('quiz_daily_sessions').select('*').eq('id', sessionId).single(),
        supabase.from('quiz_gamification').select('*').eq('user_id', user.id).single(),
      ]);
      setSession(s);
      setGam(g);
      setLoading(false);
    })();
  }, [sessionId, router]);

  if (loading || !session) {
    return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-pulse">🎯</div></div>;
  }

  const score = session.score ?? 0;
  const total = session.total ?? 0;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const isPerfect = score === total;
  const xpEarned = session.xp_earned ?? 0;

  let title = 'جيد!';
  let emoji = '👍';
  let color = 'from-blue-500 to-cyan-500';
  if (pct === 100) { title = 'إتقان كامل!'; emoji = '🏆'; color = 'from-yellow-400 to-orange-500'; }
  else if (pct >= 80) { title = 'ممتاز!'; emoji = '🌟'; color = 'from-green-500 to-emerald-500'; }
  else if (pct >= 60) { title = 'جيد جداً!'; emoji = '👏'; color = 'from-blue-500 to-cyan-500'; }
  else if (pct >= 40) { title = 'محاولة جيدة'; emoji = '💪'; color = 'from-purple-500 to-pink-500'; }
  else { title = 'تابع التعلّم!'; emoji = '📚'; color = 'from-gray-500 to-slate-600'; }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">

        {/* Hero result card */}
        <div className={`bg-gradient-to-br ${color} text-white rounded-3xl p-8 md:p-10 shadow-2xl mb-6 text-center`}>
          <div className="text-7xl mb-4">{emoji}</div>
          <h1 className="text-4xl font-extrabold mb-2">{title}</h1>
          <p className="text-white/90 mb-6">أنهيت اختبار اليوم بنجاح</p>

          {/* Score Ring */}
          <div className="inline-flex items-center justify-center relative">
            <svg viewBox="0 0 100 100" className="w-32 h-32 -rotate-90">
              <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.2)" strokeWidth="8" fill="none" />
              <circle cx="50" cy="50" r="42" stroke="white" strokeWidth="8" fill="none"
                strokeDasharray={264} strokeDashoffset={264 - (264 * pct / 100)} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-extrabold">{score}/{total}</div>
              <div className="text-xs opacity-80">{pct}%</div>
            </div>
          </div>
        </div>

        {/* XP earned */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-gray-800">📈 مكافآتك</span>
          </div>
          <div className="space-y-2 text-sm">
            <Row label="إجمالي XP" value={`+${xpEarned} XP`} color="text-yellow-600" />
            <Row label="إجابات صحيحة" value={`${score}/${total}`} color="text-green-600" />
            <Row label="مستواك الحالي" value={`L${gam?.level ?? 1}`} color="text-purple-600" />
            <Row label="سلسلتك" value={`${gam?.streak_days ?? 0} يوم 🔥`} color="text-orange-600" />
          </div>
          {isPerfect && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-900">
              🏆 <strong>إنجاز "إتقان"!</strong> أكملت اختباراً كاملاً بدون أخطاء.
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/quiz/today" className="bg-white border-2 border-purple-200 text-purple-700 font-bold py-3 rounded-xl text-center hover:bg-purple-50">
            🏠 الرئيسية
          </Link>
          <Link href="/dashboard" className="bg-purple-600 text-white font-bold py-3 rounded-xl text-center hover:bg-purple-700">
            لوحة التحكم ←
          </Link>
        </div>

        {/* Come back tomorrow */}
        <div className="mt-6 text-center text-sm text-gray-500">
          ⏰ عُد غداً للحفاظ على سلسلتك ومتابعة التعلّم!
        </div>
      </div>
    </main>
  );
}

function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-gray-600">{label}</span>
      <span className={`font-extrabold ${color}`}>{value}</span>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-pulse">🎯</div></div>}>
      <ResultInner />
    </Suspense>
  );
}
