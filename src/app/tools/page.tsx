"use client";
import Link from "next/link";

const TOOLS = [
  {
    href: "/tools/cv-builder",
    emoji: "📄",
    title: "بناء السيرة الذاتية",
    desc: "أنشئ سيرة ذاتية احترافية بالـ Live Preview وحمّلها PDF بضغطة واحدة",
    badge: "الأكثر استخداماً",
    badgeColor: "bg-accent text-white",
    color: "from-primary to-[#1e4080]",
    features: ["قوالب احترافية", "Live Preview", "تصدير PDF", "مجاني 100%"],
  },
  {
    href: "/tools/cover-letter",
    emoji: "✉️",
    title: "كتابة خطاب التقديم",
    desc: "احصل على خطاب تقديم مخصص لكل وظيفة يجعلك تبرز من بين المتقدمين",
    badge: "جديد",
    badgeColor: "bg-green-500 text-white",
    color: "from-[#0E7C7B] to-[#065a59]",
    features: ["مخصص لكل وظيفة", "أسلوب احترافي", "عربي وإنجليزي", "قابل للتعديل"],
  },
  {
    href: "/tools/interview",
    emoji: "🎤",
    title: "التحضير للمقابلة",
    desc: "تدرّب على أسئلة المقابلة الشائعة وتعلم تقنية STAR للإجابة بثقة",
    badge: null,
    badgeColor: "",
    color: "from-[#6C3483] to-[#512E5F]",
    features: ["أسئلة شائعة", "تقنية STAR", "نصائح خبراء", "محاكاة مقابلة"],
  },
  {
    href: "/tools/strengths",
    emoji: "💪",
    title: "اكتشف نقاط قوتك",
    desc: "اعرف مواهبك الطبيعية ونقاط قوتك لتبني عليها مسيرتك المهنية",
    badge: null,
    badgeColor: "",
    color: "from-[#D35400] to-[#A04000]",
    features: ["تقييم شخصي", "30 سؤال", "تقرير مفصل", "توصيات مهنية"],
  },
  {
    href: "/tools/daily-challenge",
    emoji: "⚡",
    title: "التحدي اليومي",
    desc: "سؤال يومي في التطوير المهني — اكسب XP وتتبع streak وتنافس مع الآخرين",
    badge: "جديد",
    badgeColor: "bg-purple-600 text-white",
    color: "from-[#667eea] to-[#764ba2]",
    features: ["سؤال يومي", "نظام XP", "Streak", "Leaderboard"],
  },
  {
    href: "/tools/career-ai",
    emoji: "🤖",
    title: "مساعد AI للمسيرة المهنية",
    desc: "اسأل مساعدنا الذكي عن التخصص والجامعة والتوظيف والمنح — ردود فورية بالعربي",
    badge: "AI",
    badgeColor: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white",
    color: "from-[#667eea] to-[#4338ca]",
    features: ["دردشة فورية", "توجيه مهني", "Claude Haiku", "عربي وإنجليزي"],
  },
];

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-light">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">مسارك</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href="/majors" className="text-text-sub hover:text-primary">التخصصات</Link>
            <Link href="/universities" className="text-text-sub hover:text-primary">الجامعات</Link>
            <Link href="/scholarships" className="text-text-sub hover:text-primary">المنح</Link>
            <Link href="/blog" className="text-text-sub hover:text-primary">مقالات</Link>
            <Link href="/tools" className="text-primary border-b-2 border-primary pb-0.5">أدوات مهنية</Link>
          </nav>
          <Link href="/dashboard" className="text-text-sub text-sm hover:text-primary">← الداشبورد</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-[#1e4080] rounded-2xl p-8 md:p-12 mb-8 text-white text-center">
          <div className="text-5xl mb-4">🛠️</div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">الأدوات المهنية</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            أدوات مجانية وعملية تساعدك على بناء مسيرتك المهنية بثقة واحترافية
          </p>
        </div>

        {/* Tools Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-10">
          {TOOLS.map(t => (
            <Link key={t.href} href={t.href}
              className="group card hover:shadow-2xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-primary/20 overflow-hidden">

              {/* Header */}
              <div className={`bg-gradient-to-r ${t.color} -mx-5 -mt-5 px-6 py-5 mb-5 relative`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{t.emoji}</span>
                    <h3 className="text-white font-extrabold text-xl">{t.title}</h3>
                  </div>
                  {t.badge && (
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${t.badgeColor}`}>{t.badge}</span>
                  )}
                </div>
              </div>

              <p className="text-text-sub text-sm leading-relaxed mb-5">{t.desc}</p>

              {/* Features */}
              <div className="grid grid-cols-2 gap-2 mb-5">
                {t.features.map(f => (
                  <div key={f} className="flex items-center gap-2 text-xs text-text-sub">
                    <span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold flex-shrink-0">✓</span>
                    {f}
                  </div>
           