'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';

export default function QuizTodayPage() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [gam, setGam] = useState<any>(null);
  const [todaySession, setTodaySession] = useState<any>(null);
  const [missions, setMissions] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login?next=/quiz/today'); return; }
      setUser(user);

      const [{ data: g }, { data: s }, { data: m }] = await Promise.all([
        supabase.from('quiz_gamification').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('quiz_daily_sessions').select('*')
          .eq('user_id', user.id)
          .eq('quiz_date', new Date().toISOString().slice(0, 10))
          .maybeSingle(),
        supabase.rpc('quiz_daily_missions'),
      ]);
      setGam(g);
      setTodaySession(s);
      setMissions(Array.isArray(m) ? m : []);
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
      alert(t('quiz.today.no_questions'));
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-ink-subtle">{t('quiz.today.loading')}</div></div>;

  const completed = todaySession?.completed_at;
  const xp = gam?.xp_total ?? 0;
  const level = gam?.level ?? 1;
  const streak = gam?.streak_days ?? 0;
  const longestStreak = gam?.longest_streak ?? 0;

  return (
    <main className="min-h-screen bg-bg py-8 px-4 relative overflow-hidden" dir={dir}>
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
          <Stat icon="🔥" value={streak} label={t('quiz.today.stat.streak')} color="text-accent" />
          <Stat icon="⭐" value={xp.toLocaleString()} label={t('quiz.today.stat.xp')} color="text-warning" />
          <Stat icon="🏆" value={`L${level}`} label={t('quiz.today.stat.level')} color="text-primary" />
          <Stat icon="💎" value={longestStreak} label={t('quiz.today.stat.longest')} color="text-info" />
        </div>

        {/* Progress / analytics link */}
        <div className="text-center mb-6">
          <Link href="/quiz/progress" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline">
            📈 شوف تقدّمك ونقاط قوّتك
          </Link>
        </div>

        {/* Daily missions */}
        {missions.length > 0 && (
          <div className="card shadow-card mb-6">
            <h3 className="font-bold text-ink text-lg mb-3 flex items-center gap-2">
              <span className="text-2xl">📋</span> مهام اليوم
            </h3>
            <div className="space-y-3">
              {missions.map((m) => (
                <div key={m.key} className="flex items-center gap-3">
                  <div className="text-2xl">{m.done ? '✅' : m.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between text-sm">
                      <span className={`font-semibold ${m.done ? 'line-through text-ink-muted' : 'text-ink'}`}>{m.title}</span>
                      <span className="text-xs text-ink-muted">{m.progress}/{m.target} · +{m.xp} XP</span>
                    </div>
                    <div className="h-1.5 bg-bg-soft rounded-full overflow-hidden mt-1.5">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.round((100 * m.progress) / m.target)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hero Card */}
        <div className="bg-gradient-hero rounded-4xl p-8 md:p-12 text-white shadow-floaty mb-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/30 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-accent/30 rounded-full blur-3xl" />

          <div className="relative">
            <div className="text-7xl mb-3 text-center animate-bounce-soft">🎯</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-center mb-2">{t('quiz.today.hero.title')}</h1>
            <p className="text-white/90 text-center mb-6">{t('quiz.today.hero.subtitle')}</p>

          {completed ? (
            <div className="bg-surface/15 backdrop-blur rounded-2xl p-5 text-center">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-bold text-lg mb-1">{t('quiz.today.done.title')}</p>
              <p className="text-white/90 text-sm mb-4">{t('quiz.today.done.score')} {todaySession.score}/{todaySession.total} · +{todaySession.xp_earned} XP</p>
              <Link href="/quiz/today" className="inline-block bg-surface text-primary font-bold px-6 py-2.5 rounded-xl">
                {t('quiz.today.done.review')}
              </Link>
              <p className="text-xs text-white/70 mt-3">{t('quiz.today.done.return')}</p>
            </div>
          ) : (
            <button onClick={startQuiz}
              className="w-full bg-surface text-primary font-extrabold text-lg py-4 rounded-2xl hover:scale-[1.02] transition-transform shadow-floaty">
              {t('quiz.today.start')}
            </button>
          )}
          </div>
        </div>

        {/* Daily Goal Card */}
        <div className="card shadow-card mb-6">
          <h3 className="font-bold text-ink text-lg mb-3 flex items-center gap-2">
            <span className="text-2xl">🎁</span> {t('quiz.today.rewards.title')}
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-mint-pale transition-colors">
              <span>{t('quiz.today.reward.1')}</span>
              <span className="badge-success">+25 XP</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-mint-pale transition-colors">
              <span>{t('quiz.today.reward.2')}</span>
              <span className="badge-success">+10 XP</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-mint-pale transition-colors">
              <span>{t('quiz.today.reward.3')}</span>
              <span className="badge-success">+5 XP</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl hover:bg-mint-pale transition-colors">
              <span>{t('quiz.today.reward.4')}</span>
              <span className="badge-success">+5 XP</span>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="card-mint flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <strong className="text-primary-dark">{t('quiz.today.tip.label')}</strong>
            <span className="text-ink"> {t('quiz.today.tip.body')}</span>
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
