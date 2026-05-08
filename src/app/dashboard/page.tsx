"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useStudentContext } from "@/context/StudentContext";

type User = { email: string; user_metadata: { full_name?: string; role?: string } };

// ─── Urgent deadlines ─────────────────────────────────────────────────────────
const URGENT = [
  { title: "منحة AUB – آخر موعد للتقديم", days: 12, href: "/scholarships", color: "text-red-600 bg-red-50 border-red-200" },
  { title: "منحة مؤسسة الحريري للخارج",  days: 21, href: "/scholarships", color: "text-orange-600 bg-orange-50 border-orange-200" },
  { title: "تدريب صيفي – شركة الباقر",    days: 8,  href: "/internships/hub", color: "text-red-600 bg-red-50 border-red-200" },
];

// ─── Quick Actions ────────────────────────────────────────────────────────────
const QUICK = [
  { emoji: "🎯", title: "Career DNA",         desc: "اكتشف مسارك",          href: "/career-dna",       color: "border-yellow-400 bg-yellow-50" },
  { emoji: "🏛️", title: "الجامعات",           desc: "قارن بين الجامعات",    href: "/universities",     color: "border-blue-400 bg-blue-50"   },
  { emoji: "🏆", title: "المنح",              desc: "200+ منحة دراسية",     href: "/scholarships",     color: "border-green-400 bg-green-50"  },
  { emoji: "📊", title: "محلل المهارات",      desc: "اكتشف فجواتك",         href: "/tools/skill-gap",  color: "border-purple-400 bg-purple-50"},
  { emoji: "💼", title: "التدريب",            desc: "فرص في لبنان",         href: "/internships/hub",  color: "border-indigo-400 bg-indigo-50"},
  { emoji: "📄", title: "CV Builder",         desc: "سيرة ذاتية احترافية",  href: "/tools/cv-builder", color: "border-pink-400 bg-pink-50"    },
  { emoji: "🤖", title: "مستشار الذكاء",     desc: "نصائح مخصصة لك",       href: "/tools/career-ai",  color: "border-cyan-400 bg-cyan-50"    },
  { emoji: "🗺️", title: "المسارات المهنية",   desc: "خريطة كل مهنة",        href: "/careers",          color: "border-teal-400 bg-teal-50"    },
];

// ─── Progress Ring ─────────────────────────────────────────────────────────────
function ProgressRing({ pct, size = 80, color = "#2563eb" }: { pct: number; size?: number; color?: string }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} stroke="#e5e7eb" strokeWidth={10} fill="none" />
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={10} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round" style={{ transition: "stroke-dashoffset 1s ease" }} />
      <text x={size/2} y={size/2} fill={color} fontSize={size * 0.2} fontWeight="bold"
        textAnchor="middle" dominantBaseline="middle" style={{ transform: "rotate(90deg)", transformOrigin: "center" }}>
        {pct}%
      </text>
    </svg>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const { profile, careerDNA, skillGap, savedUniversities, savedScholarships } = useStudentContext();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      setUser(data.user as unknown as User);
      setPageLoading(false);
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    try { localStorage.removeItem("masarak_ctx"); } catch {}
    router.push("/");
  }

  if (pageLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">جارٍ تحميل مسارك...</p>
      </div>
    </div>
  );

  const name = user?.user_metadata?.full_name?.split(" ")[0] || profile?.fullName?.split(" ")[0] || "مرحباً";

  // Calculate profile completion
  let completion = 10; // base for being logged in
  if (profile?.grade) completion += 15;
  if (profile?.school) completion += 10;
  if (profile?.region) completion += 10;
  if (profile?.interests?.length) completion += 10;
  if (careerDNA?.primaryPath) completion += 20;
  if (skillGap?.role) completion += 15;
  if (savedUniversities.length > 0) completion += 5;
  if (savedScholarships.length > 0) completion += 5;
  completion = Math.min(completion, 100);

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 pb-24">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-blue-600 font-extrabold text-lg">مسارك</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden sm:block">{user?.email}</span>
            <Link href="/profile/edit" className="text-sm text-blue-600 hover:text-blue-700 border border-blue-200 px-3 py-1.5 rounded-lg font-semibold">
              تعديل الملف
            </Link>
            <button onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors border border-gray-200 px-3 py-1.5 rounded-lg">
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-6">

        {/* ── Welcome + Progress ── */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-500 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1">
              <p className="text-blue-100 text-sm mb-1">مرحباً بك في مسارك 👋</p>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{name}، ابنِ مستقبلك اليوم</h1>
              {careerDNA?.primaryPath ? (
                <div className="bg-white/15 rounded-xl p-3 mt-3 inline-block">
                  <p className="text-sm text-blue-100">🧬 مسارك المقترح من Career DNA:</p>
                  <p className="font-extrabold text-lg">{careerDNA.primaryPath}</p>
                  {careerDNA.secondaryPath && <p className="text-blue-200 text-sm">وأيضاً: {careerDNA.secondaryPath}</p>}
                </div>
              ) : (
                <Link href="/career-dna"
                  className="mt-2 inline-block bg-yellow-400 text-gray-900 font-bold px-4 py-2 rounded-xl text-sm hover:bg-yellow-300">
                  ابدأ Career DNA الآن 🎯
                </Link>
              )}
            </div>
            <div className="flex flex-col items-center gap-1">
              <ProgressRing pct={completion} size={90} color="#fbbf24" />
              <span className="text-blue-100 text-xs">اكتمال الملف</span>
            </div>
          </div>
        </div>

        {/* ── Top Row: DNA Card + Skill Gap Card + Saved ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Career DNA */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">🧬</span>
              <h3 className="font-bold text-gray-800">Career DNA</h3>
            </div>
            {careerDNA?.primaryPath ? (
              <>
                <p className="text-sm text-gray-500 mb-2">آخر تحليل: {new Date(careerDNA.takenAt).toLocaleDateString("ar")}</p>
                <div className="bg-blue-50 rounded-xl p-3">
                  <p className="font-extrabold text-blue-700 text-lg">{careerDNA.primaryPath}</p>
                  {careerDNA.secondaryPath && <p className="text-sm text-gray-500">ثانوي: {careerDNA.secondaryPath}</p>}
                </div>
                <Link href="/career-dna" className="mt-3 block text-center text-sm text-blue-600 hover:underline font-semibold">
                  أعِد الاختبار
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-3">لم تُكمل الاختبار بعد</p>
                <Link href="/career-dna"
                  className="block text-center bg-yellow-400 text-gray-900 font-bold py-2 rounded-xl text-sm hover:bg-yellow-300">
                  ابدأ الاختبار →
                </Link>
              </>
            )}
          </div>

          {/* Skill Gap */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📊</span>
              <h3 className="font-bold text-gray-800">تحليل المهارات</h3>
            </div>
            {skillGap?.role ? (
              <>
                <p className="text-sm text-gray-500 mb-2">للمسار: <strong>{skillGap.role}</strong></p>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${skillGap.scorePercent}%` }} />
                    </div>
                    <span className="text-sm font-bold text-green-600">{skillGap.scorePercent}%</span>
                  </div>
                  {skillGap.gapSkills.length > 0 && (
                    <p className="text-xs text-orange-600 mt-1">تحتاج تطوير: {skillGap.gapSkills.slice(0, 2).join(" • ")}</p>
                  )}
                </div>
                <Link href="/tools/skill-gap" className="mt-3 block text-center text-sm text-blue-600 hover:underline font-semibold">
                  أعِد التحليل
                </Link>
              </>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-3">اكتشف الفجوات في مهاراتك</p>
                <Link href="/tools/skill-gap"
                  className="block text-center bg-purple-600 text-white font-bold py-2 rounded-xl text-sm hover:bg-purple-700">
                  ابدأ التحليل →
                </Link>
              </>
            )}
          </div>

          {/* Saved */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">❤️</span>
              <h3 className="font-bold text-gray-800">المحفوظات</h3>
            </div>
            <div className="space-y-2">
              <Link href="/universities"
                className="flex items-center justify-between p-2.5 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                <span className="text-sm font-semibold text-gray-700">🏛️ جامعات محفوظة</span>
                <span className="bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{savedUniversities.length}</span>
              </Link>
              <Link href="/scholarships"
                className="flex items-center justify-between p-2.5 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                <span className="text-sm font-semibold text-gray-700">🏆 منح محفوظة</span>
                <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">{savedScholarships.length}</span>
              </Link>
            </div>
            {savedUniversities.length === 0 && savedScholarships.length === 0 && (
              <p className="text-xs text-gray-400 mt-2 text-center">اضغط ❤️ على أي فرصة لحفظها هنا</p>
            )}
          </div>
        </div>

        {/* ── Urgent Deadlines ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span>⏰</span> مواعيد عاجلة
          </h3>
          <div className="space-y-3">
            {URGENT.map((item, i) => (
              <Link key={i} href={item.href}
                className={`flex items-center justify-between p-3 rounded-xl border ${item.color} hover:opacity-80 transition-opacity`}>
                <span className="text-sm font-semibold">{item.title}</span>
                <span className="text-sm font-extrabold">{item.days} يوم</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Quick Actions Grid ── */}
        <div>
          <h3 className="font-bold text-gray-800 mb-4">🚀 أدوات مسارك</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {QUICK.map((a, i) => (
              <Link key={i} href={a.href}
                className={`flex flex-col gap-2 p-4 rounded-2xl border-2 ${a.color} hover:shadow-md transition-all group`}>
                <span className="text-2xl">{a.emoji}</span>
                <span className="font-bold text-gray-800 text-sm group-hover:text-blue-700">{a.title}</span>
                <span className="text-xs text-gray-500">{a.desc}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Recommendations ── */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-5">
          <h3 className="font-bold text-gray-800 mb-4">🎯 موصى به لك</h3>
          {careerDNA?.primaryPath ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link href="/universities" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs text-gray-400 mb-1">جامعة مقترحة</p>
                <p className="font-bold text-gray-800">🏛️ AUB أو LAU</p>
                <p className="text-xs text-gray-500 mt-1">مناسبة لمسار {careerDNA.primaryPath}</p>
              </Link>
              <Link href="/scholarships" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs text-gray-400 mb-1">منحة مقترحة</p>
                <p className="font-bold text-gray-800">🏆 منحة AUB الكاملة</p>
                <p className="text-xs text-gray-500 mt-1">تنتهي خلال 12 يوم</p>
              </Link>
              <Link href="/tools/career-ai" className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
                <p className="text-xs text-gray-400 mb-1">تحدث مع المساعد</p>
                <p className="font-bold text-gray-800">🤖 مستشارك الذكي</p>
                <p className="text-xs text-gray-500 mt-1">اسأل عن {careerDNA.primaryPath}</p>
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm mb-3">أكمل اختبار Career DNA لتظهر توصيات مخصصة لك</p>
              <Link href="/career-dna"
                className="inline-block bg-blue-600 text-white font-bold px-5 py-2 rounded-xl text-sm hover:bg-blue-700">
                ابدأ الآن →
              </Link>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
