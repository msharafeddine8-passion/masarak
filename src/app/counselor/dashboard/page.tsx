"use client";
/**
 * /counselor/dashboard — لوحة تحكم المرشد الأكاديمي / معلم الإرشاد
 * يُرى بواسطة المستخدمين ذوي الـ role = 'counselor'
 */
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SkeletonPage } from "@/components/ui/Skeleton";
import ErrorState from "@/components/ErrorState";
import { ADMIN_EMAIL } from "@/lib/permissions/capabilities";

interface StudentRow {
  id: string;
  full_name: string | null;
  email: string | null;
  school: string | null;
  career_dna_result: string | null;
  xp?: number;
  profile_completeness?: number;
}

const TOOLS = [
  { href: "/tools/cost-calculator",   emoji: "💰", label: "حاسبة التكاليف",      desc: "ساعد الطلاب على تقدير تكاليف الدراسة" },
  { href: "/universities",            emoji: "🏛️", label: "دليل الجامعات",       desc: "استعرض الجامعات مع طلابك" },
  { href: "/scholarships",            emoji: "🏆", label: "المنح الدراسية",       desc: "ابحث عن منح مناسبة لطلابك" },
  { href: "/career-dna",              emoji: "🧬", label: "Career DNA",          desc: "شجّع الطلاب على اكتشاف مساراتهم" },
  { href: "/tools/skill-gap",         emoji: "📊", label: "تحليل الفجوة المهارية", desc: "اعرف ما ينقص الطالب لتحقيق هدفه" },
  { href: "/tools/cv-builder",        emoji: "📄", label: "بناء السيرة الذاتية",  desc: "ساعد الطلاب على إعداد CVs احترافية" },
  { href: "/guides",                  emoji: "📚", label: "مرشد الجامعات",        desc: "أدلة وموارد التوجيه الجامعي" },
  { href: "/schools",                 emoji: "🏫", label: "دليل المدارس",         desc: "استعرض قوائم المدارس المتاحة" },
];

const DNA_COLORS: Record<string, string> = {
  "هندسة الحاسوب":    "bg-blue-100 text-blue-700",
  "الطب":             "bg-red-100 text-red-700",
  "إدارة الأعمال":    "bg-yellow-100 text-yellow-700",
  "الحقوق":           "bg-purple-100 text-purple-700",
  "العمارة":          "bg-orange-100 text-orange-700",
  "الهندسة":          "bg-cyan-100 text-cyan-700",
  "التصميم":          "bg-pink-100 text-pink-700",
};

export default function CounselorDashboardPage() {
  const router = useRouter();
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(false);
  const [user, setUser]         = useState<{ id: string; email?: string; user_metadata?: Record<string, unknown> } | null>(null);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [search, setSearch]     = useState("");
  const [dnaFilter, setDnaFilter] = useState("الكل");
  const [schoolFilter, setSchoolFilter] = useState("الكل");
  const [notCounselor, setNotCounselor] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!u) { router.push("/auth/login?next=/counselor/dashboard"); return; }
      setUser(u as typeof user);

      // Fetch counselor's school to filter students
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, school")
        .eq("id", u.id)
        .maybeSingle();

      if (profile?.role !== "counselor" && profile?.role !== "school_admin" && u.email !== ADMIN_EMAIL) {
        setNotCounselor(true);
        return;
      }

      const school = profile?.school;

      // Fetch students from the same school
      let query = supabase
        .from("profiles")
        .select("id, full_name, email, school")
        .eq("role", "student")
        .order("full_name");

      if (school) query = query.eq("school", school);

      const { data: studentsData } = await query.limit(200);
      const base = (studentsData || []) as StudentRow[];

      // Career DNA type lives on student_profiles.personality_type (NOT profiles —
      // selecting a non-existent profiles.career_dna_result used to 400 and error
      // the whole counselor dashboard).
      const ids = base.map((s) => s.id);
      const dnaMap: Record<string, string | null> = {};
      if (ids.length > 0) {
        const { data: sps } = await supabase
          .from("student_profiles")
          .select("user_id, personality_type")
          .in("user_id", ids);
        if (sps) for (const r of sps as { user_id: string; personality_type: string | null }[]) {
          dnaMap[r.user_id] = r.personality_type;
        }
      }
      setStudents(base.map((s) => ({ ...s, career_dna_result: dnaMap[s.id] ?? null })));
    } catch (e) {
      console.error("[CounselorDashboard] load failed", e);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => { loadData(); }, [loadData]);

  function retry() {
    setError(false);
    setNotCounselor(false);
    setLoading(true);
    loadData();
  }

  if (loading) return <SkeletonPage />;

  if (error) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <ErrorState onRetry={retry} context="counselor_dashboard" />
        </div>
      </main>
    );
  }

  if (notCounselor) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-xl font-extrabold text-[#1b3a6b] mb-2">هذه الصفحة للمرشدين الأكاديميين فقط</h1>
          <p className="text-ink-subtle text-sm mb-6">
            إذا كنت مرشداً أكاديمياً، تواصل مع فريق مسارك لتفعيل حسابك.
          </p>
          <Link href="/contact" className="px-5 py-2.5 bg-[#0F4A52] text-white rounded-xl font-bold text-sm">
            تواصل معنا
          </Link>
        </div>
      </main>
    );
  }

  const dnaOptions = ["الكل", ...Array.from(new Set(students.map((s) => s.career_dna_result).filter(Boolean) as string[]))];
  const schoolOptions = ["الكل", ...Array.from(new Set(students.map((s) => s.school).filter(Boolean) as string[]))];

  const filtered = students.filter((s) => {
    const matchSearch = !search ||
      s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.email?.toLowerCase().includes(search.toLowerCase());
    const matchDna = dnaFilter === "الكل" || s.career_dna_result === dnaFilter;
    const matchSchool = schoolFilter === "الكل" || s.school === schoolFilter;
    return matchSearch && matchDna && matchSchool;
  });

  const dnaComplete = students.filter((s) => s.career_dna_result).length;
  const dnaPct = students.length ? Math.round((dnaComplete / students.length) * 100) : 0;
  const fullName = (user?.user_metadata?.full_name as string) || user?.email?.split("@")[0] || "المرشد";

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] pb-16">
      <div className="max-w-5xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#0F4A52] to-[#1A6F7C] rounded-2xl p-7 text-white mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-64 h-64 rounded-full bg-surface/5 -translate-x-1/2 -translate-y-1/2" />
          <div className="relative">
            <span className="inline-block bg-surface/15 px-3 py-1 rounded-full text-xs font-bold mb-2">
              لوحة تحكم المرشد الأكاديمي
            </span>
            <h1 className="text-2xl font-extrabold mb-1">مرحباً، {fullName} 👋</h1>
            <p className="text-white/80 text-sm">
              يمكنك متابعة تقدم طلابك وإرشادهم نحو مستقبل أفضل من هنا.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon="👨‍🎓" value={students.length} label="إجمالي الطلاب" color="text-[#0F4A52]" />
          <StatCard icon="🧬" value={`${dnaPct}%`} label="أكملوا Career DNA" color="text-blue-600" />
          <StatCard icon="🎯" value={dnaComplete} label="تحديد المسار" color="text-purple-600" />
          <StatCard icon="📊" value={filtered.length} label="نتائج الفلتر" color="text-amber-600" />
        </div>

        {/* Students table */}
        <div className="bg-surface rounded-2xl border border-line shadow-sm mb-8">
          <div className="p-5 border-b border-line">
            <h2 className="font-extrabold text-[#1b3a6b] text-lg mb-4">👨‍🎓 طلابك</h2>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="🔍 ابحث بالاسم أو الإيميل..."
                className="flex-1 min-w-[180px] px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:border-[#0F4A52]"
              />
              {dnaOptions.length > 2 && (
                <select value={dnaFilter} onChange={(e) => setDnaFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:border-[#0F4A52]">
                  {dnaOptions.map((d) => <option key={d}>{d}</option>)}
                </select>
              )}
              {schoolOptions.length > 2 && (
                <select value={schoolFilter} onChange={(e) => setSchoolFilter(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-line text-sm focus:outline-none focus:border-[#0F4A52]">
                  {schoolOptions.map((s) => <option key={s}>{s}</option>)}
                </select>
              )}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center text-ink-subtle">
              {students.length === 0
                ? "لا يوجد طلاب مسجلون من مدرستك بعد"
                : "لا توجد نتائج مطابقة للبحث"}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-bg-soft border-b border-line">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-bold text-ink-subtle">الطالب</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-ink-subtle">المدرسة</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-ink-subtle">Career DNA</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id} className="border-b border-gray-50 last:border-0 hover:bg-bg-soft/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#0F4A52]/10 flex items-center justify-center text-sm font-bold text-[#0F4A52]">
                            {(s.full_name || "?")[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-ink">{s.full_name || "—"}</div>
                            <div className="text-xs text-ink-subtle" dir="ltr">{s.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{s.school || "—"}</td>
                      <td className="px-4 py-3">
                        {s.career_dna_result ? (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${DNA_COLORS[s.career_dna_result] || "bg-bg-soft text-ink-muted"}`}>
                            {s.career_dna_result}
                          </span>
                        ) : (
                          <span className="text-xs text-ink-subtle italic">لم يُكمل</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-left">
                        <Link href={`/profile/${s.id}`}
                          className="text-xs font-bold text-[#0F4A52] border border-[#0F4A52]/30 px-2.5 py-1 rounded-lg hover:bg-[#0F4A52]/5 transition-colors">
                          عرض
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* DNA Distribution */}
        {dnaComplete > 0 && (
          <div className="bg-surface rounded-2xl border border-line shadow-sm p-5 mb-6">
            <h2 className="font-extrabold text-[#1b3a6b] text-lg mb-4">🧬 توزيع المسارات المهنية</h2>
            <div className="space-y-2">
              {(() => {
                const counts: Record<string, number> = {};
                students.forEach((s) => { if (s.career_dna_result) counts[s.career_dna_result] = (counts[s.career_dna_result] || 0) + 1; });
                return Object.entries(counts).sort(([, a], [, b]) => b - a).slice(0, 8).map(([dna, count]) => {
                  const pct = Math.round((count / dnaComplete) * 100);
                  return (
                    <div key={dna} className="flex items-center gap-3">
                      <span className="text-sm text-ink-muted w-36 truncate text-right">{dna}</span>
                      <div className="flex-1 h-2 bg-bg-soft rounded-full overflow-hidden">
                        <div className="h-full bg-[#0F4A52] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-bold text-ink-subtle w-10 text-left">{count}</span>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        )}

        {/* Counselor Tools */}
        <h2 className="font-extrabold text-[#1b3a6b] text-lg mb-3">🛠️ أدوات الإرشاد</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {TOOLS.map((t) => (
            <Link key={t.href} href={t.href}
              className="bg-surface rounded-xl border border-line p-4 hover:border-[#0F4A52]/40 hover:shadow-sm transition-all group">
              <span className="text-2xl mb-2 block">{t.emoji}</span>
              <div className="font-bold text-ink text-sm group-hover:text-[#0F4A52] transition-colors">{t.label}</div>
              <div className="text-xs text-ink-subtle mt-0.5 leading-relaxed">{t.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

function StatCard({ icon, value, label, color }: { icon: string; value: number | string; label: string; color: string }) {
  return (
    <div className="bg-surface rounded-xl border border-line p-4 text-center">
      <div className="text-3xl mb-1">{icon}</div>
      <div className={`text-2xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-ink-subtle mt-0.5">{label}</div>
    </div>
  );
}
