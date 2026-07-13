'use client';
// Daily Growth — Phase 4 UI: learner analytics ("تقدّمي").
// Renders category performance, areas to improve / strengths, and a 30-day growth
// curve from the secure quiz_user_analytics() RPC. Works for the signed-in student;
// a linked parent can pass ?student=<uuid> (the RPC authorizes the relationship).
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import LevelHero from './LevelHero';

type Cat = { category: string; name_ar: string; icon: string | null; answered: number; accuracy: number };
type Skill = { skill: string; subject: string; mastery: number; attempts: number };
type Day = { day: string; answered: number; accuracy: number };
type Analytics = {
  overall: { answered: number; correct: number; accuracy: number; avg_time_ms: number };
  by_category: Cat[];
  strong_skills: Skill[];
  weak_skills: Skill[];
  growth_30d: Day[];
  error?: string;
};

const accColor = (a: number) => (a >= 80 ? 'bg-emerald-500' : a >= 60 ? 'bg-amber-500' : 'bg-rose-500');
const accText = (a: number) => (a >= 80 ? 'text-emerald-600' : a >= 60 ? 'text-amber-600' : 'text-rose-600');

export default function QuizProgressPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-gray-400" dir="rtl">جارٍ التحميل…</div>}>
      <ProgressInner />
    </Suspense>
  );
}

function ProgressInner() {
  const router = useRouter();
  const params = useSearchParams();
  const studentId = params.get('student');
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<Analytics | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login?next=/quiz/progress'); return; }
      const { data: a } = await supabase.rpc('quiz_user_analytics',
        studentId ? { p_student: studentId } : {});
      setData(a as Analytics);
      setLoading(false);
    })();
  }, [router, studentId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400" dir="rtl">جارٍ تحميل تقدّمك…</div>;
  }
  if (!data || data.error) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-3 p-6" dir="rtl">
        <p className="text-gray-600">تعذّر عرض التحليلات{data?.error === 'forbidden' ? ' — لا تملك صلاحية الوصول' : ''}.</p>
        <Link href="/quiz/today" className="text-emerald-600 underline">العودة للتحدّي اليومي</Link>
      </main>
    );
  }

  const o = data.overall;
  const maxAnswered = Math.max(1, ...data.by_category.map((c) => c.answered));

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">📈 تقدّمي</h1>
          <Link href="/quiz/today" className="text-sm text-emerald-600 hover:underline">التحدّي اليومي ←</Link>
        </header>

        {/* Level & progression (own data; only for the signed-in student, not the parent view) */}
        {!studentId && <LevelHero />}

        {/* Overall KPIs */}
        <section className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl font-extrabold text-gray-900">{o.answered}</div>
            <div className="text-xs text-gray-500 mt-1">سؤال أجبت عليه</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className={`text-3xl font-extrabold ${accText(o.accuracy)}`}>{o.accuracy}%</div>
            <div className="text-xs text-gray-500 mt-1">نسبة الإجابات الصحيحة</div>
          </div>
          <div className="bg-white rounded-2xl p-4 text-center shadow-sm">
            <div className="text-3xl font-extrabold text-gray-900">{(o.avg_time_ms / 1000).toFixed(1)}<span className="text-base">ث</span></div>
            <div className="text-xs text-gray-500 mt-1">متوسط زمن الإجابة</div>
          </div>
        </section>

        {/* Areas to improve / strengths */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">🎯 مواضيع تحتاج تقوية</h2>
            {data.weak_skills.length === 0 ? (
              <p className="text-sm text-gray-400">لا شيء بعد — تابع التدرّب لنكتشف نقاط التحسين.</p>
            ) : (
              <ul className="space-y-2">
                {data.weak_skills.map((s) => (
                  <li key={s.skill} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{s.skill}</span>
                    <span className="text-rose-600 font-semibold">{s.mastery}%</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h2 className="font-bold text-gray-900 mb-3">💪 نقاط قوّتك</h2>
            {data.strong_skills.length === 0 ? (
              <p className="text-sm text-gray-400">أكمل المزيد من الأسئلة لتظهر نقاط قوّتك.</p>
            ) : (
              <ul className="space-y-2">
                {data.strong_skills.map((s) => (
                  <li key={s.skill} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{s.skill}</span>
                    <span className="text-emerald-600 font-semibold">{s.mastery}%</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* Category performance */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">الأداء حسب المجال</h2>
          {data.by_category.length === 0 ? (
            <p className="text-sm text-gray-400">ابدأ التحدّي اليومي لرؤية أدائك في كل مجال.</p>
          ) : (
            <div className="space-y-3">
              {data.by_category.map((c) => (
                <div key={c.category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700">{c.icon} {c.name_ar}</span>
                    <span className="text-gray-400">{c.answered} سؤال · <span className={accText(c.accuracy)}>{c.accuracy}%</span></span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full ${accColor(c.accuracy)} rounded-full`} style={{ width: `${c.accuracy}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* 30-day growth */}
        <section className="bg-white rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-900 mb-4">منحنى التقدّم (آخر 30 يوماً)</h2>
          {data.growth_30d.length === 0 ? (
            <p className="text-sm text-gray-400">لا يوجد نشاط بعد خلال آخر 30 يوماً.</p>
          ) : (
            <div className="flex items-end gap-1.5 h-32">
              {data.growth_30d.map((d) => (
                <div key={d.day} className="flex-1 flex flex-col items-center justify-end group" title={`${d.day}: ${d.answered} سؤال · ${d.accuracy}%`}>
                  <div className={`w-full ${accColor(d.accuracy)} rounded-t`} style={{ height: `${Math.max(6, d.accuracy)}%` }} />
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">ارتفاع العمود = نسبة الإجابات الصحيحة في ذلك اليوم.</p>
        </section>
      </div>
    </main>
  );
}
