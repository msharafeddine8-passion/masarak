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
    <main className="min-h-screen bg-bg py-8 px-4 relative overflow-hidden" dir="rtl">
      {/* Decorative bg */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 -right-20 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-20" />
        <div className="absolute top-1/3 left-10 text-5xl animate-float opacity-40">⭐</div>
        <div className="absolute top-1/2 right-10 text-4xl animate-float opacity-40" style={{ animationDelay: '1s' }}>🏆</div>
        <div className="absolute bottom-20 right-1/4 text-5xl animate-float opacity-30" style={{ animationDelay: '1.5s' }}>🎯</div>
      </div>

      <div className="relative max-w-2xl mx-auto">

        {/* Stats Bar */}
        <div className="card shadow-card mb-6 grid grid-cols-2 md:grid-cols-4 gap-3 stagger">
          <Stat icon="🔥" value={streak} label="يوم متتالي" color="text-accent" />
          <Stat icon="⭐" value={xp.toLocaleString()} label="XP" color="text-warning" />
          <Stat icon="🏆" value={`L${level}`} label="المستوى" color="text-primary" />
          <Stat icon="💎" value={longestStreak} label="أطول سلسلة" color="text-info" />
        </div>

        {/* Hero Card */}
        <div className="bg-gradient-hero rounded-4xl p-8 md:p-12 text-white shadow-floaty mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/30 rounded-full blur-3xl" />

          <div className="relative">
            <div className="text-7xl mb-3 text-center animate-bounce-soft">🎯</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-2">اختبار اليوم</h1>
            <p className="text-white/90 text-center mb-6">10 أسئلة من مختلف المواد · اكسب XP يومياً!</p>

          {completed ? (
            <div className="bg-white/15 backdrop-blur rounded-2xl p-5 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-bold text-lg mb-1">أنجزت اختبار اليوم!</p>
              <p className="text-white/90 text-sm mb-4">النتيجة: {todaySession.score}/{todaySession.total} · +{todaySession.xp_earned} XP</p>
              <Link href="/quiz/today" className="inline-block bg-white text-primary font-bold px-6 py-2.5 rounded-xl">
                تصفّح الإجابات
              </Link>
              <p className="text-xs text-white/70 mt-3">عُد غداً للحفاظ على سلسلتك! 🔥</p>
            </div>
          ) : (
            <button onClick={startQuiz}
              className="w-full bg-white text-primary font-extrabold text-lg py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-floaty">
              ابدأ الاختبار ←
            </button>
          )}
          </div>
        </div>

        {/* Daily Goal Card */}
        <div className="card shadow-card mb-6">
          <h3 className="font-bold text-ink text-lg mb-3 flex items-center gap-2">
            <span className="text-2xl">🎁</span> مكافآت اليوم
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-mint-pale transition-colors">
              <span className="flex items-center gap-2"><span>🎯</span> إتمام اختبار اليوم</span>
              <span className="badge-success">+25 XP</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-mint-pale transition-colors">
              <span className="flex items-center gap-2"><span>✅</span> كل إجابة صحيحة</span>
              <span className="badge-success">+10 XP</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-mint-pale transition-colors">
              <span className="flex items-center gap-2"><span>🧠</span> بدون تلميح</span>
              <span className="badge-success">+5 XP</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-mint-pale transition-colors">
              <span className="flex items-center gap-2"><span>⚡</span> إجابة سريعة</span>
              <span className="badge-success">+5 XP</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="card-mint flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <strong className="text-primary-dark">نصيحة:</strong>
            <span className="text-ink"> الأسئلة بتعتمد على مستواك وبتتطور معك. كل ما تجاوب صح، الأسئلة بتصير أصعب وبتاخد XP أكتر.</span>
          </div>
        </div>
      </div>
    </main>
  );
}

function Stat({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <div className="text-center hover:scale-105 transition-transform">
      <div className="text-3xl mb-1">{icon}</div>
      <div className={`font-extrabold text-2xl ${color}`}>{value}</div>
      <div className="text-xs text-ink-muted font-medium mt-0.5">{label}</div>
    </div>
  );
}
