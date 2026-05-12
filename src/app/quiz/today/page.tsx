'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function QuizTodayPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [gam, setGam] = useState<any>(null);
  const [todaySession, setTodaySession] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login?next=/quiz/today'); return; }
      setUser(user);

      const [{ data: g }, { data: s }] = await Promise.all([
        supabase.from('quiz_gamification').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('quiz_daily_sessions').select('*')
          .eq('user_id', user.id)
          .eq('quiz_date', new Date().toISOString().slice(0, 10))
          .maybeSingle(),
      ]);
      setGam(g);
      setTodaySession(s);
      setLoading(false);
    })();
  }, [router]);

  const startQuiz = async () => {
    setLoading(true);
    const res = await fetch('/api/quiz/today');
    const data = await res.json();
    if (data.session) {
      router.push(`/quiz/play?session=${data.session.id}`);
    } else {
      alert('لا توجد أسئلة متاحة حالياً، عاود المحاولة لاحقاً.');
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-gray-500">جاري التحميل...</div></div>;

  const completed = todaySession?.completed_at;
  const xp = gam?.xp_total ?? 0;
  const level = gam?.level ?? 1;
  const streak = gam?.streak_days ?? 0;
  const longestStreak = gam?.longest_streak ?? 0;

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-10 px-4" dir="rtl">
      <div className="max-w-2xl mx-auto">

        {/* Stats Bar */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6 flex items-center justify-between flex-wrap gap-3">
          <Stat icon="🔥" value={streak} label="يوم متتالي" color="text-orange-500" />
          <Stat icon="⭐" value={xp.toLocaleString()} label="XP" color="text-yellow-500" />
          <Stat icon="🏆" value={`L${level}`} label="المستوى" color="text-purple-600" />
          <Stat icon="💎" value={longestStreak} label="أطول سلسلة" color="text-blue-500" />
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 rounded-3xl p-8 md:p-10 text-white shadow-2xl mb-6">
          <div className="text-6xl mb-3 text-center">🎯</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-2">اختبار اليوم</h1>
          <p className="text-white/90 text-center mb-6">10 أسئلة من مختلف المواد. اختبر معلوماتك واكسب نقاط XP!</p>

          {completed ? (
            <div className="bg-white/15 backdrop-blur rounded-2xl p-5 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-bold text-lg mb-1">أنجزت اختبار اليوم!</p>
              <p className="text-white/90 text-sm mb-4">النتيجة: {todaySession.score}/{todaySession.total} · +{todaySession.xp_earned} XP</p>
              <Link href="/quiz/today" className="inline-block bg-white text-purple-600 font-bold px-6 py-2.5 rounded-xl">
                تصفّح الإجابات
              </Link>
              <p className="text-xs text-white/70 mt-3">عُد غداً للحفاظ على سلسلتك! 🔥</p>
            </div>
          ) : (
            <button onClick={startQuiz}
              className="w-full bg-white text-purple-600 font-extrabold text-lg py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-lg">
              ابدأ الاختبار ←
            </button>
          )}
        </div>

        {/* Daily Goal Card */}
        <div className="bg-white rounded-2xl shadow-md p-5 mb-6">
          <h3 className="font-bold text-gray-800 mb-3">🎁 مكافآت اليوم</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>إتمام اختبار اليوم</span>
              <span className="font-bold text-green-600">+25 XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span>كل إجابة صحيحة</span>
              <span className="font-bold text-green-600">+10 XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span>بدون تلميح</span>
              <span className="font-bold text-green-600">+5 XP</span>
            </div>
            <div className="flex items-center justify-between">
              <span>إجابة سريعة</span>
              <span className="font-bold text-green-600">+5 XP</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-900">
          💡 <strong>نصيحة:</strong> الأسئلة بتعتمد على مستواك وبتتطور معك. كل ما تجاوب صح، الأسئلة بتصير أصعب.
        </div>
      </div>
    </main>
  );
}

function Stat({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <div className="text-center">
      <div className="text-2xl">{icon}</div>
      <div className={`font-extrabold text-xl ${color}`}>{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
