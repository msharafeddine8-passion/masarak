"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type User = { email: string; user_metadata: { full_name?: string; role?: string } };

const quickActions = [
  { emoji: "📋", title: "أكمل بروفايلك",   desc: "أضف مدرستك وشهاداتك",   href: "/profile/edit",   color: "border-primary bg-light"          },
  { emoji: "🎯", title: "Career DNA Test", desc: "اكتشف مسارك المهني",     href: "/career-dna",     color: "border-accent bg-light-gold"      },
  { emoji: "🏆", title: "ابحث عن منحة",    desc: "200+ منحة دراسية",       href: "/scholarships",   color: "border-success bg-light-green"    },
  { emoji: "🏛️", title: "استكشف الجامعات", desc: "35+ جامعة لبنانية",     href: "/universities",   color: "border-[#6C3483] bg-[#f5eefb]"   },
  { emoji: "🏅", title: "نقاطي وشاراتي",   desc: "تابع تقدمك وإنجازاتك",  href: "/gamification",   color: "border-[#0E7C7B] bg-[#f0fafa]"   },
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
    <div className="min-h-screen flex items-center justify-center bg-light">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-text-sub">جارٍ تحميل مسارك...</p>
      </div>
    </div>
  );

  const name = user?.user_metadata?.full_name?.split(" ")[0] || "مرحباً";

  return (
    <div className="min-h-screen bg-light">
      {/* Top Nav */}
      <header className="bg-white border-b border-gray-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">مسارك</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-text-sub hidden sm:block">{user?.email}</span>
            <button onClick={handleLogout}
              className="text-sm text-text-sub hover:text-danger transition-colors border border-gray-200 px-3 py-1.5 rounded-lg">
              خروج
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="bg-gradient-to-br from-primary to-[#1e4080] rounded-2xl p-6 md:p-8 mb-6 text-white">
          <p className="text-white/70 text-sm mb-1">مرحباً بك في مسارك 👋</p>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">{name}، ابنِ مستقبلك اليوم</h1>
          <p className="text-white/80 text-sm mb-6">أكمل ملفك الشخصي لتظهر لك الفرص المناسبة</p>
          {/* Progress bar */}
          <div className="bg-white/10 rounded-full h-3 mb-2">
            <div className="bg-accent rounded-full h-3 w-[15%] transition-all duration-500"></div>
          </div>
          <div className="flex justify-between text-xs text-white/60">
            <span>اكتمال الملف: 15%</span>
            <span>أضف 3 عناصر لتصل لـ 50%</span>
          </div>
        </div>

        {/* Quick Actions */}
        <h2 className="font-bold text-primary text-lg mb-4">من أين تبدأ؟</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {quickActions.map(a => (
            <Link key={a.title} href={a.href}
              className={`border-2 ${a.color} rounded-2xl p-4 hover:shadow-md transition-all hover:-translate-y-0.5`}>
              <div className="text-3xl mb-2">{a.emoji}</div>
              <div className="font-bold text-primary text-sm mb-0.5">{a.title}</div>
              <div className="text-text-sub text-xs">{a.desc}</div>
            </Link>
          ))}
        </div>

        {/* Profile Preview */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-primary">ملفك الشخصي</h3>
              <Link href="/profile/edit" className="text-accent text-sm font-semibold hover:underline">تعديل</Link>
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-primary rounded-full flex items-center justify-center text-white font-extrabold text-xl">
                {name[0]}
              </div>
              <div>
                <div className="font-bold text-primary">{user?.user_metadata?.full_name || name}</div>
                <div className="text-text-sub text-sm">{user?.email}</div>
                <span className="badge bg-light text-primary text-xs mt-1">
                  {user?.user_metadata?.role === "student" ? "🎓 طالب" : user?.user_metadata?.role === "parent" ? "👨‍👩‍👧 ولي أمر" : "مستخدم"}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              {[["المدرسة","لم تُضف بعد"],["التخصص المفضل","لم تُضف بعد"],["المنطقة","لبنان"]].map(([k,v]) => (
                <div key={k} className="flex justify-between text-sm py-1.5 border-b border-gray-50">
                  <span className="text-text-sub">{k}</span>
                  <span className="text-text-main font-medium">{v}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="font-bold text-primary mb-4">الإنجازات والـ Badges</h3>
            <div className="text-center py-8 text-text-sub">
              <div className="text-5xl mb-3">🏅</div>
              <p className="text-sm">أكمل ملفك لتكسب أول Badge!</p>
              <p className="text-xs mt-1 text-text-sub/60">أضف مدرستك واحصل على Badge "بداية الرحلة"</p>
              <Link href="/profile/edit" c