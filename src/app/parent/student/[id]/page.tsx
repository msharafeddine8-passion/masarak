'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function StudentProgressPage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [student, setStudent] = useState<any>(null);
  const [studentProfile, setStudentProfile] = useState<any>(null);
  const [gamification, setGamification] = useState<any>(null);
  const [savedUnis, setSavedUnis] = useState<number>(0);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    (async () => {
      const { data: { user: parent } } = await supabase.auth.getUser();
      if (!parent) { router.push('/auth/login'); return; }

      // تحقق إنّو الـ link active
      const { data: link } = await supabase
        .from('parent_student_links')
        .select('*')
        .eq('parent_user_id', parent.id)
        .eq('student_user_id', studentId)
        .eq('status', 'active')
        .maybeSingle();

      if (!link) {
        setAuthorized(false);
        setLoading(false);
        return;
      }

      setAuthorized(true);

      // اجلب بيانات الطالب
      const [{ data: profile }, { data: sp }, { data: gam }, { data: an }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', studentId).maybeSingle(),
        supabase.from('student_profiles').select('*').eq('user_id', studentId).maybeSingle(),
        supabase.from('quiz_gamification').select('*').eq('user_id', studentId).maybeSingle(),
        supabase.rpc('quiz_user_analytics', { p_student: studentId }),
      ]);
      setStudent(profile);
      setStudentProfile(sp);
      setGamification(gam);
      setAnalytics(an && !(an as any).error ? an : null);

      // عدد الجامعات المحفوظة
      const { count } = await supabase.from('saved_universities')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', studentId);
      setSavedUnis(count || 0);

      setLoading(false);
    })();
  }, [studentId, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-bg-mint flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-6xl animate-bounce-soft mb-3">📊</div>
          <div className="text-ink-muted">جاري تحميل تقدّم الطالب...</div>
        </div>
      </main>
    );
  }

  if (!authorized) {
    return (
      <main className="min-h-screen bg-bg flex items-center justify-center p-4" dir="rtl">
        <div className="card max-w-md text-center">
          <div className="text-6xl mb-3">🔒</div>
          <h1 className="text-2xl font-extrabold text-danger mb-2">غير مصرّح</h1>
          <p className="text-ink-muted mb-4">
            لا يمكنك مشاهدة هذه البيانات. تأكّد إنّو ابنك وافق على دعوة الربط.
          </p>
          <Link href="/parent/dashboard" className="btn-primary">العودة للوحة المتابعة ←</Link>
        </div>
      </main>
    );
  }

  const completion = studentProfile?.profile_completion ?? 0;
  const xp = gamification?.xp_total ?? 0;
  const level = gamification?.level ?? 1;
  const streak = gamification?.streak_days ?? 0;

  return (
    <main className="min-h-screen bg-bg pb-20 relative overflow-hidden" dir="rtl">
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        <Link href="/parent/dashboard" className="text-sm text-ink-muted hover:text-primary inline-flex items-center gap-1 mb-4">
          → العودة للوحة المتابعة
        </Link>

        {/* Hero */}
        <div className="bg-gradient-hero rounded-4xl p-8 md:p-10 mb-6 text-white shadow-floaty relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/30 rounded-full blur-3xl" />

          <div className="relative flex items-center gap-5 flex-wrap">
            <div className="w-24 h-24 bg-mint/30 backdrop-blur rounded-3xl flex items-center justify-center text-5xl font-extrabold border-4 border-white/20">
              {(student?.full_name || 'ط')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-block bg-surface/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-2">تقدّم ابنك/ابنتك</span>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{student?.full_name || 'الطالب'}</h1>
              <p className="text-white/90">{student?.email}</p>
              {studentProfile?.school_name && (
                <p className="text-white/80 text-sm mt-1">🏫 {studentProfile.school_name}{studentProfile.grade_level && ` · ${studentProfile.grade_level}`}</p>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 stagger">
          <StatCard icon="📊" value={`${completion}%`} label="اكتمال الملف" color="text-primary" />
          <StatCard icon="⭐" value={xp.toLocaleString()} label="XP" color="text-warning" />
          <StatCard icon="🏆" value={`L${level}`} label="المستوى" color="text-success" />
          <StatCard icon="🔥" value={streak} label="يوم متتالي" color="text-accent" />
        </div>

        {/* Academic Info */}
        <div className="card shadow-card mb-6">
          <h2 className="text-xl font-extrabold text-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">🎓</span> المعلومات الأكاديمية
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <InfoRow icon="🏫" label="المدرسة" value={studentProfile?.school_name} />
            <InfoRow icon="📚" label="المرحلة" value={studentProfile?.grade_level} />
            <InfoRow icon="📊" label="المعدّل (GPA)" value={studentProfile?.gpa ? `${studentProfile.gpa}/4` : null} />
            <InfoRow icon="📜" label="فرع البكالوريا" value={studentProfile?.bac_section} />
            <InfoRow icon="🎯" label="التخصص المطلوب" value={studentProfile?.major} />
            <InfoRow icon="🏛️" label="الجامعة المستهدفة" value={studentProfile?.target_university} />
          </div>
        </div>

        {/* Progress */}
        <div className="card shadow-card mb-6">
          <h2 className="text-xl font-extrabold text-primary mb-4 flex items-center gap-2">
            <span className="text-2xl">📈</span> التقدّم
          </h2>
          <div className="space-y-3">
            <ProgressItem label="اكتمال الملف الشخصي" value={completion} />
            <ProgressItem label="نشاط الاختبارات اليومية" value={Math.min(100, streak * 3)} />
          </div>
        </div>

        {/* Learning analytics (strengths & areas for improvement) */}
        {analytics && analytics.by_category?.length > 0 && (
          <div className="card shadow-card mb-6">
            <h2 className="text-xl font-extrabold text-primary mb-4 flex items-center gap-2">
              <span className="text-2xl">🧠</span> الأداء التعليمي
            </h2>
            <div className="grid grid-cols-3 gap-3 mb-5">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-ink">{analytics.overall.answered}</div>
                <div className="text-xs text-ink-muted">سؤال</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-primary">{analytics.overall.accuracy}%</div>
                <div className="text-xs text-ink-muted">دقّة الإجابات</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-extrabold text-ink">{(analytics.overall.avg_time_ms / 1000).toFixed(1)}<span className="text-sm">ث</span></div>
                <div className="text-xs text-ink-muted">متوسط الزمن</div>
              </div>
            </div>
            <div className="space-y-2.5 mb-5">
              {analytics.by_category.slice(0, 6).map((c: any) => (
                <div key={c.category}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-ink">{c.icon} {c.name_ar}</span>
                    <span className="text-ink-muted">{c.answered} سؤال · {c.accuracy}%</span>
                  </div>
                  <div className="h-2 bg-bg-soft rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${c.accuracy >= 80 ? 'bg-emerald-500' : c.accuracy >= 60 ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${c.accuracy}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-bg-soft">
                <h4 className="font-bold text-ink mb-2 text-sm">🎯 مواضيع تحتاج تقوية</h4>
                {analytics.weak_skills.length ? analytics.weak_skills.map((s: any) => (
                  <div key={s.skill} className="flex justify-between text-xs py-0.5">
                    <span className="text-ink-muted">{s.skill}</span><span className="text-rose-600 font-semibold">{s.mastery}%</span>
                  </div>
                )) : <p className="text-xs text-ink-subtle">لا شيء بعد</p>}
              </div>
              <div className="p-3 rounded-xl bg-bg-soft">
                <h4 className="font-bold text-ink mb-2 text-sm">💪 نقاط القوّة</h4>
                {analytics.strong_skills.length ? analytics.strong_skills.map((s: any) => (
                  <div key={s.skill} className="flex justify-between text-xs py-0.5">
                    <span className="text-ink-muted">{s.skill}</span><span className="text-emerald-600 font-semibold">{s.mastery}%</span>
                  </div>
                )) : <p className="text-xs text-ink-subtle">لسا قيد التكوين</p>}
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="card-mint">
            <h3 className="font-bold text-primary-dark mb-2">🏛️ الجامعات المحفوظة</h3>
            <div className="text-4xl font-extrabold text-primary">{savedUnis}</div>
            <p className="text-xs text-ink-muted mt-1">جامعة بالقائمة</p>
          </div>
          <div className="card-mint">
            <h3 className="font-bold text-primary-dark mb-2">🏆 إجمالي الإجابات الصحيحة</h3>
            <div className="text-4xl font-extrabold text-primary">{gamification?.total_correct ?? 0}</div>
            <p className="text-xs text-ink-muted mt-1">إجابة صحيحة بالاختبارات</p>
          </div>
        </div>

        {/* Privacy reminder */}
        <div className="card-mint mt-6">
          <div className="flex items-start gap-2">
            <span className="text-2xl">🔐</span>
            <div>
              <strong className="text-primary-dark">للعلم:</strong>
              <p className="text-ink text-sm mt-1">
                هاي بيانات عامّة فقط. ما بتقدر تشوف رسائل ابنك الخاصة، أو كلمة المرور، أو محادثاته الشخصية.
                أنت بس بتشوف تقدّمه الأكاديمي والنشاط على المنصة.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: string }) {
  return (
    <div className="card text-center">
      <div className="text-3xl mb-1">{icon}</div>
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-ink-muted">{label}</div>
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-xl bg-bg-soft">
      <span className="text-xl">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-ink-muted">{label}</div>
        <div className="font-bold text-ink truncate">{value || <span className="text-ink-subtle font-normal">— لم يُحدّث بعد</span>}</div>
      </div>
    </div>
  );
}

function ProgressItem({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-ink">{label}</span>
        <span className="font-bold text-primary">{value}%</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
