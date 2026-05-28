'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';

// CSS-only confetti — 40 colored squares fall + spin once, then unmount.
function Confetti() {
  const pieces = Array.from({ length: 40 });
  const colors = ['#fbbf24', '#f97316', '#ec4899', '#a855f7', '#3b82f6', '#10b981'];
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.6;
        const dur = 1.6 + Math.random() * 1.2;
        const size = 6 + Math.random() * 8;
        const rot = Math.random() * 360;
        const color = colors[i % colors.length];
        return (
          <span key={i}
            style={{
              left: `${left}%`,
              top: '-12px',
              width: `${size}px`,
              height: `${size * 1.3}px`,
              background: color,
              transform: `rotate(${rot}deg)`,
              animation: `confetti-fall ${dur}s ${delay}s linear forwards`,
            }}
            className="absolute rounded-sm"
          />
        );
      })}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(0) rotate(0deg);    opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.6; }
        }
      `}</style>
    </div>
  );
}

// Toast that pops in from the top when the user hits a streak milestone.
function MilestoneToast({ days, onDone }: { days: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 5000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-toast-in">
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-sm">
        <span className="text-3xl">🔥</span>
        <div className="text-sm">
          <div className="font-extrabold">سلسلة {days} {days >= 11 ? 'يوم' : 'أيام'}!</div>
          <div className="text-white/90 text-xs">استمر — صرت من أبطال مسارك</div>
        </div>
      </div>
      <style>{`
        @keyframes toast-in {
          0% { opacity: 0; transform: translate(-50%, -20px) scale(0.9); }
          15% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          85% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          100% { opacity: 0; transform: translate(-50%, -8px) scale(0.95); }
        }
        .animate-toast-in { animation: toast-in 5s ease-out forwards; }
      `}</style>
    </div>
  );
}

function ResultInner() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('session');
  const { t, dir } = useI18n();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [gam, setGam] = useState<any>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [milestone, setMilestone] = useState<number | null>(null);

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

      // Celebration triggers: confetti for high-scoring sessions, toast for streak milestones.
      const sessTotal = Number(s?.total || 0);
      const sessScore = Number(s?.score || 0);
      const sessPct = sessTotal > 0 ? (sessScore / sessTotal) * 100 : 0;
      if (sessPct >= 80) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 3500);
      }
      const streakDays = Number(g?.streak_days || 0);
      if ([3, 7, 14, 30, 60, 100].includes(streakDays)) {
        setMilestone(streakDays);
      }
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

  let title = t('qr.t.attempt');
  let emoji = '👍';
  let color = 'from-blue-500 to-cyan-500';
  if (pct === 100) { title = t('qr.t.perfect'); emoji = '🏆'; color = 'from-yellow-400 to-orange-500'; }
  else if (pct >= 80) { title = t('qr.t.excellent'); emoji = '🌟'; color = 'from-green-500 to-emerald-500'; }
  else if (pct >= 60) { title = t('qr.t.very_good'); emoji = '👏'; color = 'from-blue-500 to-cyan-500'; }
  else if (pct >= 40) { title = t('qr.t.attempt'); emoji = '💪'; color = 'from-purple-500 to-pink-500'; }
  else { title = t('qr.t.keep_learning'); emoji = '📚'; color = 'from-gray-500 to-slate-600'; }

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-10 px-4" dir={dir}>
      {showConfetti && <Confetti />}
      {milestone !== null && <MilestoneToast days={milestone} onDone={() => setMilestone(null)} />}
      <div className="max-w-2xl mx-auto">

        {/* Hero result card */}
        <div className={`bg-gradient-to-br ${color} text-white rounded-3xl p-8 md:p-10 shadow-2xl mb-6 text-center`}>
          <div className="text-7xl mb-4">{emoji}</div>
          <h1 className="text-4xl font-extrabold mb-2">{title}</h1>
          <p className="text-white/90 mb-6">{t('qr.subtitle')}</p>

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
            <span className="font-bold text-gray-800">{t('qr.rewards')}</span>
          </div>
          <div className="space-y-2 text-sm">
            <Row label={t('qr.row.xp')} value={`+${xpEarned} XP`} color="text-yellow-600" />
            <Row label={t('qr.row.correct')} value={`${score}/${total}`} color="text-green-600" />
            <Row label={t('qr.row.level')} value={`L${gam?.level ?? 1}`} color="text-purple-600" />
            <Row label={t('qr.row.streak')} value={`${gam?.streak_days ?? 0} ${t('qr.day_suffix')}`} color="text-orange-600" />
          </div>
          {isPerfect && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-900">
              🏆 <strong>{t('qr.perfect_badge.title')}</strong> {t('qr.perfect_badge.body')}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/quiz/today" className="bg-white border-2 border-purple-200 text-purple-700 font-bold py-3 rounded-xl text-center hover:bg-purple-50">
            {t('qr.cta.home')}
          </Link>
          <Link href="/dashboard" className="bg-purple-600 text-white font-bold py-3 rounded-xl text-center hover:bg-purple-700">
            {t('qr.cta.dashboard')}
          </Link>
        </div>

        {/* Come back tomorrow */}
        <div className="mt-6 text-center text-sm text-gray-500">
          {t('qr.come_back')}
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
