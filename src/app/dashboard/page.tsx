"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type User = { email: string; user_metadata: { full_name?: string; role?: string } };

const quickActions = [
  { emoji: "📋", title: "أكمل بروفايلك",   desc: "أضف مدرستك وشهاداتك",  href: "/profile/edit",  color: "border-blue-500 bg-blue-50"  },
  { emoji: "🎯", title: "Career DNA Test", desc: "اكتشف مسارك المهني",    href: "/career-dna",    color: "border-yellow-500 bg-yellow-50" },
  { emoji: "🏆", title: "ابحث عن منحة",   desc: "200+ منحة دراسية",      href: "/scholarships",  color: "border-green-500 bg-green-50"  },
  { emoji: "🏛️", title: "الجامعات",       desc: "35+ جامعة لبنانية",     href: "/universities",  color: "border-purple-500 bg-purple-50" },
  { emoji: "🛠️", title: "أدوات مسارك",    desc: "CV ومقابلات وأكثر",    href: "/tools",         color: "border-indigo-500 bg-indigo-50" },
];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login"); return; }
      setUser(data.user as unknown as User);
      setLoading(false);
    });
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">جارٍ تحميل مسارك...</p>
      </div>
    </div>
  );

  const name = user?.user_metadata?.full_name?.split(" ")[0] || "مرحباً";

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
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
            <button onClick={handleLogout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors border border-gray-200 px-3 py-1.5 rounded-lg">
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-br from-blue-700 to-blue-500 rounded-2xl p-6 md:p-8 mb-6 text-white">
          <p className="text-blue-100 text-sm mb-1">مرحباً بك في مسارك 👋</p>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{name}، ابنِ مستقبلك اليوم</h1>
          <p className="text-blue-100 text-sm mb-6">أكمل ملفك الشخصي لتظهر لك الفرص المناسبة</p>
          <div className="bg-white/10 rounded-full h-3 mb-2">
            <div className="bg-yellow-400 rounded-full h-3 w-[15%] transition-all duration-500"></div>
          </div>
          <div className="flex justify-between text-xs text-blue-100">
            <span>اكتمال الملف: 15%</span>
            <span>أضف 3 عناصر لتصل لـ 50%</span>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="font-bold text-gray-800 text-lg mb-4">من أين تبدأ؟</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {quickActions.map((a) => (
            <Link key={a.title} href={a.href}
              className={`border-2 ${a.color} rounded-2xl p-4 hover:shadow-md transition-all hover:-translate-y-0.5`}>
              <div className="text-3xl mb-2">{a.emoji}</div>
              <div className="font-bold text-gray-800 text-sm mb-0.5">{a.title}</div>
              <div className="text-gray-500 text-xs">{a.desc}</div>
            </Link>
          ))}
        </div>

        {/* Profile + Badges */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800">ملفك الشخصي</h3>
              <Link href="/profile/edit" className="text-blue-600 text-sm font-semibold hover:underline">تعديل</Link>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-blue-600 rounded-full flex items-center justify-center text-white font-extrabold text-xl">
                {name[0]}
              </div>
              <div>
                <div className="font-bold text-gray-800">{user?.user_metadata?.full_name || name}</div>
                <div className="text-gray-500 text-sm">{user?.email}</div>
                <span className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full mt-1">
                  {user?.user_metadata?.role === "student" ? "🎓 طالب" : user?.user_metadata?.role === "parent" ? "👨‍👩‍👧 ولي أمر" : "مستخدم"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {[["المدرسة", "لم تُضف بعد"], ["التخصص المفضل", "لم تُضف بعد"], ["المنطقة", "لبنان"]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-1.5 border-b border-gray-50">
                  <span className="text-gray-500">{k}</span>
                  <span className="text-gray-700 font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Badges Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
            <h3 className="font-bold text-gray-800 mb-4">الإنجازات والـ Badges</h3>
            <div className="text-center py-8 text-gray-400">
              <div className="text-5xl mb-3">🏅</div>
              <p className="text-sm text-gray-500">أكمل ملفك لتكسب أول Badge!</p>
              <p className="text-xs mt-1 text-gray-400">أضف مدرستك واحصل على Badge &quot;بداية الرحلة&quot;</p>
              <Link href="/profile/edit"
                className="mt-4 inline-block bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                أكمل ملفك الآن
              </Link>
            </div>
          </div>
        </div>

        {/* Tools Section */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-5">
          <h3 className="font-bold text-gray-800 mb-4">🛠️ أدوات مسارك</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { emoji: "📄", title: "بناء السيرة الذاتية", href: "/tools/cv-builder" },
              { emoji: "✉️", title: "رسالة التغطية",        href: "/tools/cover-letter" },
              { emoji: "🎤", title: "التحضير للمقابلة",    href: "/tools/interview" },
              { emoji: "💡", title: "اكتشف نقاط قوتك",    href: "/tools/strengths" },
            ].map((t) => (
              <Link key={t.title} href={t.href}
                className="flex flex-col items-center justify-center gap-2 p-4 border border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all text-center">
                <span className="text-2xl">{t.emoji}</span>
                <span className="text-xs font-medium text-gray-700">{t.title}</span>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
