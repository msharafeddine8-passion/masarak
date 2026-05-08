"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ─── Animated counter ──────────────────────────────────────────────────────
function useCountUp(target: number, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    let rafId: number;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * target));
      if (progress < 1) { rafId = requestAnimationFrame(step); }
      else { setCount(target); }
    };
    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [start, target, duration]);
  return count;
}

function AnimatedStat({ n, suffix = "", label }: { n: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [started, setStarted] = useState(false);
  const count = useCountUp(n, 2000, started);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const display = started ? count.toLocaleString("ar-EG") : "٠";
  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-extrabold text-accent mb-1">
        {display}{suffix}
      </div>
      <div className="text-white/70 text-sm">{label}</div>
    </div>
  );
}

// ─── Navbar ────────────────────────────────────────────────────────────────
function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <span className="text-white font-extrabold text-lg">م</span>
          </div>
          <span className="text-primary font-extrabold text-xl">مسارك</span>
        </Link>

        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-text-sub">
          <Link href="/universities" className="hover:text-primary transition-colors">الجامعات</Link>
          <Link href="/majors" className="hover:text-primary transition-colors">التخصصات</Link>
          <Link href="/scholarships" className="hover:text-primary transition-colors">المنح</Link>
          <Link href="/tools" className="hover:text-primary transition-colors">أدوات مهنية</Link>
          <Link href="/internships/hub" className="hover:text-primary transition-colors">التدريب</Link>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link href="/auth/login" className="text-sm font-semibold text-primary hover:text-accent transition-colors">
            تسجيل الدخول
          </Link>
          <Link href="/auth/register" className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-xl hover:bg-[#1e4080] transition-colors">
            ابدأ مجاناً
          </Link>
        </div>

        <button className="md:hidden p-2" onClick={() => setMenuOpen(!menuOpen)}>
          <div className={`w-6 h-0.5 bg-primary mb-1.5 transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <div className={`w-6 h-0.5 bg-primary mb-1.5 ${menuOpen ? "opacity-0" : ""}`} />
          <div className={`w-6 h-0.5 bg-primary transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3 text-sm font-medium">
          <Link href="/universities" onClick={() => setMenuOpen(false)} className="text-text-sub hover:text-primary">الجامعات</Link>
          <Link href="/majors" onClick={() => setMenuOpen(false)} className="text-text-sub hover:text-primary">التخصصات</Link>
          <Link href="/scholarships" onClick={() => setMenuOpen(false)} className="text-text-sub hover:text-primary">المنح</Link>
          <Link href="/tools" onClick={() => setMenuOpen(false)} className="text-text-sub hover:text-primary">أدوات مهنية</Link>
          <Link href="/internships/hub" onClick={() => setMenuOpen(false)} className="text-text-sub hover:text-primary">التدريب والتطوع</Link>
          <div className="flex gap-3 pt-2 border-t border-gray-100">
            <Link href="/auth/login" className="flex-1 text-center border border-primary text-primary font-bold py-2 rounded-xl">دخول</Link>
            <Link href="/auth/register" className="flex-1 text-center bg-primary text-white font-bold py-2 rounded-xl">تسجيل</Link>
          </div>
        </div>
      )}
    </nav>
  );
}

// ─── Live ticker ───────────────────────────────────────────────────────────
const TICKER_ITEMS = [
  "🎓 كريم من بيروت حصل على منحة AUB",
  "💼 رنا من طرابلس بدأت تدريب في UNICEF",
  "📊 علي من صيدا أكمل Career DNA Test",
  "🏆 ميشال من زحلة حصل على منحة LAU",
  "🎯 سارة من بعلبك أنشأت CV احترافي",
  "🌟 عمر من النبطية بدأ تدريب في Murex",
];

function LiveTicker() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const id = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIdx(i => (i + 1) % TICKER_ITEMS.length); setFade(true); }, 300);
    }, 3000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 text-sm text-accent font-medium flex items-center gap-2 max-w-sm mx-auto">
      <span className="w-2 h-2 bg-accent rounded-full animate-pulse flex-shrink-0" />
      <span className={`transition-opacity duration-300 ${fade ? "opacity-100" : "opacity-0"}`}>
        {TICKER_ITEMS[idx]}
      </span>
    </div>
  );
}

// ─── Hero ──────────────────────────────────────────────────────────────────
function Hero() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-primary via-[#1e4080] to-[#0f2448] flex items-center pt-16">
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="mb-6">
          <LiveTicker />
        </div>

        <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
          اكتشف مسارك
          <span className="block text-accent mt-2">بنِ مستقبلك من اليوم</span>
        </h1>

        <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">
          البوابة الأولى للطلاب اللبنانيين: بروفايل احترافي، إرشاد أكاديمي،
          منح دراسية، وفرص حقيقية — كل شيء في مكان واحد، مجاناً للأبد.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link href="/auth/register" className="bg-accent text-white font-extrabold text-lg px-8 py-4 rounded-2xl hover:bg-[#c8920a] transition-all shadow-lg">
            ابدأ مجاناً — لا يحتاج بطاقة ائتمان
          </Link>
          <Link href="#tools" className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
            استكشف الأدوات ←
          </Link>
        </div>

        {/* Social proof avatars */}
        <div className="flex items-center justify-center gap-3 text-white/70 text-sm mb-8">
          <div className="flex -space-x-2 rtl:space-x-reverse">
            {["E8A020","1A7A4A","C0392B","6C3483","0E7C7B"].map((c, i) => (
              <div key={i} className="w-9 h-9 rounded-full border-2 border-white/30 flex items-center justify-center text-xs font-bold text-white" style={{backgroundColor:`#${c}`}}>
                {["ك","س","ر","ن","م"][i]}
              </div>
            ))}
          </div>
          <span>انضم لـ <strong className="text-accent">+5,200</strong> طالب لبناني</span>
        </div>

        {/* Trust badges */}
        <div className="flex flex-wrap justify-center gap-6">
          {[
            { icon: "🔒", label: "آمن 100%" },
            { icon: "🆓", label: "مجاني للأبد" },
            { icon: "🇱🇧", label: "منصة لبنانية" },
            { icon: "⚡", label: "جاهز في 30 ثانية" },
          ].map(b => (
            <div key={b.label} className="flex items-center gap-1.5 text-white/60 text-sm">
              <span>{b.icon}</span> {b.label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Quick Tools ───────────────────────────────────────────────────────────
const QUICK_TOOLS = [
  { href: "/tools/cv-builder",   emoji: "📄", label: "بناء CV",        color: "bg-blue-50 border-blue-200 hover:border-primary" },
  { href: "/tools/skill-gap",    emoji: "🎯", label: "محلل المهارات", color: "bg-teal-50 border-teal-200 hover:border-[#0E7C7B]" },
  { href: "/tools/career-ai",    emoji: "🤖", label: "مساعد AI",       color: "bg-purple-50 border-purple-200 hover:border-purple-600" },
  { href: "/internships/hub",    emoji: "💼", label: "فرص تدريب",      color: "bg-orange-50 border-orange-200 hover:border-orange-500" },
  { href: "/scholarships",       emoji: "🏆", label: "منح دراسية",     color: "bg-yellow-50 border-yellow-200 hover:border-accent" },
  { href: "/career-dna",         emoji: "🧬", label: "Career DNA",     color: "bg-red-50 border-red-200 hover:border-red-500" },
  { href: "/tools/cover-letter", emoji: "✉️", label: "خطاب تقديم",     color: "bg-green-50 border-green-200 hover:border-green-600" },
  { href: "/universities",       emoji: "🏛️", label: "الجامعات",       color: "bg-indigo-50 border-indigo-200 hover:border-indigo-600" },
];

function QuickTools() {
  return (
    <section id="tools" className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-accent bg-light-gold px-3 py-1 rounded-full">أدوات مجانية</span>
          <h2 className="text-3xl font-extrabold text-primary mt-3 mb-2">ابدأ من هنا</h2>
          <p className="text-text-sub">كل الأدوات التي تحتاجها لبناء مسيرتك المهنية</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {QUICK_TOOLS.map(t => (
            <Link key={t.href} href={t.href} className={`border-2 ${t.color} rounded-xl p-4 text-center transition-all hover:shadow-md hover:-translate-y-0.5`}>
              <div className="text-3xl mb-2">{t.emoji}</div>
              <div className="text-sm font-bold text-text-main">{t.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Featured Opportunities ────────────────────────────────────────────────
const FEATURED_INTERNSHIPS = [
  { company: "Murex", role: "Software Engineering Intern", type: "مدفوع", city: "بيروت", skills: ["C++", "Java"], emoji: "💹" },
  { company: "UNICEF Lebanon", role: "Communication & Media Intern", type: "بدل تنقل", city: "بيروت", skills: ["Social Media", "Writing"], emoji: "🌍" },
  { company: "Anghami", role: "Product Design Intern", type: "مدفوع", city: "بيروت", skills: ["Figma", "UX"], emoji: "🎵" },
  { company: "WHO Lebanon", role: "Public Health Intern", type: "بدل تنقل", city: "بيروت", skills: ["Research", "Excel"], emoji: "🏥" },
];

const FEATURED_SCHOLARSHIPS = [
  { name: "منحة AUB الكاملة", org: "الجامعة الأمريكية", coverage: "رسوم كاملة + معيشة", deadline: "30 يونيو 2026", emoji: "🎓" },
  { name: "منحة USJ التفوق", org: "جامعة القديس يوسف", coverage: "50% من الرسوم", deadline: "15 يوليو 2026", emoji: "📚" },
  { name: "DAAD — ألمانيا", org: "الحكومة الألمانية", coverage: "كاملة للدراسة في ألمانيا", deadline: "31 أكتوبر 2026", emoji: "🇩🇪" },
  { name: "Chevening — بريطانيا", org: "الحكومة البريطانية", coverage: "ماجستير كامل في UK", deadline: "4 نوفمبر 2026", emoji: "🇬🇧" },
];

function FeaturedOpportunities() {
  const [tab, setTab] = useState<"internships" | "scholarships">("internships");
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4">
        <div className="text-center mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-light px-3 py-1 rounded-full">أبرز الفرص</span>
          <h2 className="text-3xl font-extrabold text-primary mt-3 mb-2">فرص منتقاة لك</h2>
          <p className="text-text-sub">محدّثة أسبوعياً من أفضل الشركات والمنظمات</p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-2 mb-6">
          {[
            { key: "internships", label: "💼 تدريب وتطوع" },
            { key: "scholarships", label: "🏆 منح دراسية" },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as typeof tab)}
              className={`px-5 py-2 rounded-full font-bold text-sm transition-all ${
                tab === t.key
                  ? "bg-primary text-white shadow-md"
                  : "bg-white text-text-sub border border-gray-200 hover:border-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Internships */}
        {tab === "internships" && (
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURED_INTERNSHIPS.map(i => (
              <Link key={i.company + i.role} href="/internships/hub" className="bg-white rounded-xl p-5 border border-gray-100 hover:border-primary hover:shadow-md transition-all group">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{i.emoji}</span>
                    <div>
                      <div className="font-bold text-primary text-sm">{i.company}</div>
                      <div className="text-text-sub text-xs">{i.role}</div>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${i.type === "مدفوع" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}`}>
                    {i.type}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {i.skills.map(s => (
                    <span key={s} className="text-xs bg-light text-text-sub px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-sub">📍 {i.city}</span>
                  <span className="text-xs text-primary font-bold group-hover:text-accent">تقدّم الآن →</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Scholarships */}
        {tab === "scholarships" && (
          <div className="grid sm:grid-cols-2 gap-4">
            {FEATURED_SCHOLARSHIPS.map(s => (
              <Link key={s.name} href="/scholarships" className="bg-white rounded-xl p-5 border border-gray-100 hover:border-accent hover:shadow-md transition-all group">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{s.emoji}</span>
                  <div>
                    <div className="font-bold text-primary text-sm">{s.name}</div>
                    <div className="text-text-sub text-xs">{s.org}</div>
                  </div>
                </div>
                <div className="bg-light-gold text-accent text-xs font-semibold px-2 py-1 rounded-lg inline-block mb-3">
                  💰 {s.coverage}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-red-500 font-semibold">⏰ آخر موعد: {s.deadline}</span>
                  <span className="text-xs text-accent font-bold group-hover:underline">اقرأ أكثر →</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="text-center mt-6">
          <Link
            href={tab === "internships" ? "/internships/hub" : "/scholarships"}
            className="inline-block border-2 border-primary text-primary font-bold px-6 py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all text-sm"
          >
            عرض كل الفرص ←
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Role selector ─────────────────────────────────────────────────────────
function RoleSelector() {
  const roles = [
    { emoji: "🎓", title: "أنا طالب", sub: "في المدرسة أو الجامعة", href: "/auth/register?role=student", color: "border-primary hover:bg-blue-50" },
    { emoji: "👨‍👩‍👧", title: "أنا ولي أمر", sub: "أريد متابعة مسيرة ابني/ابنتي", href: "/auth/register?role=parent", color: "border-[#2E4A7A] hover:bg-blue-50" },
    { emoji: "🏫", title: "أنا مدرسة", sub: "رسمية، خاصة، أو معهد مهني", href: "/auth/register?role=school", color: "border-[#0E7C7B] hover:bg-teal-50" },
    { emoji: "🏛️", title: "أنا جامعة", sub: "مؤسسة تعليمية عليا", href: "/auth/register?role=university", color: "border-accent hover:bg-yellow-50" },
  ];
  return (
    <section className="py-16 bg-white">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-text-sub bg-light px-3 py-1 rounded-full">للجميع</span>
        <h2 className="text-3xl font-extrabold text-primary mt-3 mb-2">من أنت؟</h2>
        <p className="text-text-sub mb-10">اختر دورك لنخصّص تجربتك على مسارك</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {roles.map(r => (
            <Link key={r.title} href={r.href}
              className={`border-2 ${r.color} rounded-2xl p-6 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1 bg-white`}>
              <div className="text-4xl mb-3">{r.emoji}</div>
              <div className="font-bold text-primary text-lg mb-1">{r.title}</div>
              <div className="text-text-sub text-sm">{r.sub}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────────────────────────
const FEATURES = [
  { emoji: "📋", title: "بروفايل طلابي احترافي", desc: "سيرة ذاتية رقمية شاملة: مدرستك، جامعتك، تطوعك، شهاداتك، وإنجازاتك — قابل للمشاركة في ثانية.", tag: "مجاني", tagColor: "bg-green-100 text-green-700" },
  { emoji: "🎯", title: "اختبار Career DNA", desc: "اكتشف شخصيتك المهنية عبر نظام RIASEC — 20 سؤالاً تكشف أفضل المسارات المناسبة لك.", tag: "مجاني", tagColor: "bg-green-100 text-green-700" },
  { emoji: "📊", title: "محلل الفجوة المهارية", desc: "قيّم مهاراتك مقارنةً بما يحتاجه سوق العمل واحصل على خطة تعلم مخصصة لمسارك.", tag: "جديد", tagColor: "bg-teal-100 text-teal-700" },
  { emoji: "💼", title: "مركز التدريب والتطوع", desc: "20+ فرصة تدريب وتطوع في لبنان — Murex، UNICEF، IFC، Anghami والمزيد.", tag: "جديد", tagColor: "bg-orange-100 text-orange-700" },
  { emoji: "🏆", title: "Scholarship Finder", desc: "محرك بحث ذكي للمنح الدراسية اللبنانية والدولية مع تتبع الطلبات ولوحة تحكم شخصية.", tag: "مجاني", tagColor: "bg-green-100 text-green-700" },
  { emoji: "🤖", title: "مساعد AI للمسيرة المهنية", desc: "اسأل مساعدنا الذكي عن أي شيء — التخصص، الجامعة، التوظيف، والمنح. ردود فورية بالعربي.", tag: "AI", tagColor: "bg-purple-100 text-purple-700" },
  { emoji: "🏛️", title: "دليل الجامعات اللبنانية", desc: "معلومات كاملة عن 25+ جامعة: التخصصات، الرسوم، شروط القبول، ومقارنة ذكية.", tag: "مجاني", tagColor: "bg-green-100 text-green-700" },
  { emoji: "🔥", title: "Gamification & Leaderboard", desc: "XP Points، Badges، Streaks يومية — اجعل بناء مستقبلك تجربة ممتعة ومحفّزة.", tag: "مجاني", tagColor: "bg-green-100 text-green-700" },
  { emoji: "📄", title: "أدوات مهنية متكاملة", desc: "CV Builder، Cover Letter، تحضير المقابلة، واكتشاف نقاط القوة — كل شيء في مكان واحد.", tag: "مجاني", tagColor: "bg-green-100 text-green-700" },
];

function Features() {
  return (
    <section id="features" className="py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-accent bg-light-gold px-3 py-1 rounded-full">المزايا</span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-primary mt-4 mb-3">كل ما تحتاجه في مكان واحد</h2>
          <p className="text-text-sub text-lg max-w-xl mx-auto">
            من اكتشاف موهبتك حتى الالتحاق بأفضل الجامعات — مسارك معك في كل خطوة
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(f => (
            <div key={f.title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-200">
              <div className="flex items-start justify-between mb-4">
                <span className="text-4xl">{f.emoji}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${f.tagColor}`}>{f.tag}</span>
              </div>
              <h3 className="font-bold text-primary text-lg mb-2">{f.title}</h3>
              <p className="text-text-sub text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How it works ──────────────────────────────────────────────────────────
function HowItWorks() {
  const steps = [
    { n: "01", title: "سجّل مجاناً", desc: "بـ Google أو بريدك الإلكتروني — أقل من 30 ثانية، لا معلومات بطاقة ائتمان." },
    { n: "02", title: "أنشئ ملفك", desc: "أضف مدرستك، شهاداتك، تطوعك، وإنجازاتك — وشاهد ملفك يكتمل خطوة بخطوة." },
    { n: "03", title: "اكتشف فرصك", desc: "منح دراسية، تدريب مهني، وجامعات — كلها مخصصة لملفك الشخصي تلقائياً." },
  ];
  return (
    <section className="py-20 bg-white">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-text-sub bg-light px-3 py-1 rounded-full">كيف يعمل</span>
        <h2 className="text-3xl font-extrabold text-primary mt-4 mb-3">ثلاث خطوات بسيطة</h2>
        <p className="text-text-sub mb-14">تبدأ رحلتك نحو المستقبل الآن</p>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 left-0 w-full h-0.5 bg-gradient-to-l from-accent/20 to-accent/20" />
              )}
              <div className="relative bg-gray-50 rounded-2xl p-8 border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-accent font-extrabold text-xl">{s.n}</span>
                </div>
                <h3 className="font-bold text-primary text-xl mb-2">{s.title}</h3>
                <p className="text-text-sub text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Stats ─────────────────────────────────────────────────────────────────
function Stats() {
  return (
    <section className="py-16 bg-gradient-to-r from-primary to-[#1e4080]">
      <div className="max-w-5xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <AnimatedStat n={5200} suffix="+" label="طالب مسجّل" />
          <AnimatedStat n={120}  suffix="+" label="مدرسة شريكة" />
          <AnimatedStat n={25}   suffix="+"  label="جامعة لبنانية" />
          <AnimatedStat n={200}  suffix="+"  label="منحة دراسية" />
        </div>
      </div>
    </section>
  );
}

// ─── Testimonials ──────────────────────────────────────────────────────────
const TESTIMONIALS = [
  { name: "كريم ناصر", school: "مدرسة الإيمان — بيروت", text: "بفضل مسارك عرفت إني مناسب لتخصص هندسة الحاسوب، وحصلت على منحة في LAU. كل شيء كان واضح ومرتب!", stars: 5 },
  { name: "ريم خوري", school: "ثانوية المقاصد — صيدا", text: "الـ Career DNA Test كشف لي مواهب ما كنت أعرفها. هلأ عم دراسة تصميم جرافيك وأنا سعيدة تماماً.", stars: 5 },
  { name: "أحمد فواز", school: "USEK — جونية", text: "البروفايل ساعدني أحصل على تدريب في شركة محترمة. الـ CV الرقمي كان أقوى من أي ورقة.", stars: 5 },
];

function Testimonials() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 text-center">
        <span className="text-xs font-bold uppercase tracking-wider text-text-sub bg-light px-3 py-1 rounded-full">قصص نجاح</span>
        <h2 className="text-3xl font-extrabold text-primary mt-4 mb-3">طلاب نجحوا مع مسارك</h2>
        <p className="text-text-sub mb-12">قصص حقيقية من طلاب لبنانيين بنوا مستقبلهم</p>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(t => (
            <div key={t.name} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm text-right">
              <div className="flex gap-0.5 mb-4">
                {Array.from({length: t.stars}).map((_, i) => (
                  <span key={i} className="text-accent text-lg">★</span>
                ))}
              </div>
              <p className="text-text-sub text-sm leading-relaxed mb-4">"{t.text}"</p>
              <div className="border-t border-gray-100 pt-4">
                <div className="font-bold text-primary">{t.name}</div>
                <div className="text-text-sub text-xs mt-0.5">{t.school}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Final CTA ─────────────────────────────────────────────────────────────
function FinalCTA() {
  return (
    <section className="py-20 bg-gradient-to-br from-primary to-[#0f2448]">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="text-5xl mb-4">🚀</div>
        <h2 className="text-4xl font-extrabold text-white mb-4">ابدأ رحلتك اليوم</h2>
        <p className="text-white/80 text-lg mb-8">
          مجاني للأبد · لا بطاقة ائتمان · انضم لـ +5,200 طالب لبناني
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register" className="bg-accent text-white font-extrabold text-lg px-10 py-4 rounded-2xl hover:bg-[#c8920a] transition-all shadow-lg">
            أنشئ ملفك المجاني الآن →
          </Link>
          <Link href="/tools" className="border-2 border-white/40 text-white font-bold px-8 py-4 rounded-2xl hover:bg-white/10 transition-all">
            استكشف الأدوات
          </Link>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer className="bg-[#0f1f3d] text-white/60 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                <span className="text-white font-extrabold">م</span>
              </div>
              <span className="text-white font-extrabold text-lg">مسارك</span>
            </div>
            <p className="text-sm leading-relaxed">البوابة الأولى للطلاب اللبنانيين نحو مستقبل أفضل.</p>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">المنصة</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "الجامعات", href: "/explore" },
                { label: "التخصصات", href: "/majors" },
                { label: "المنح الدراسية", href: "/scholarships" },
                { label: "فرص التدريب", href: "/internships/hub" },
              ].map(l => (
                <li key={l.label}><Link href={l.href} className="hover:text-accent transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">الأدوات</h4>
            <ul className="space-y-2 text-sm">
              {[
                { label: "بناء السيرة الذاتية", href: "/tools/cv-builder" },
                { label: "محلل المهارات", href: "/tools/skill-gap" },
                { label: "مساعد AI", href: "/tools/career-ai" },
                { label: "Career DNA", href: "/career-dna" },
              ].map(l => (
                <li key={l.label}><Link href={l.href} className="hover:text-accent transition-colors">{l.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-3">تواصل معنا</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="mailto:hello@masaraklb.com" className="hover:text-accent transition-colors">hello@masaraklb.com</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Instagram</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <span>© 2026 مسارك. جميع الحقوق محفوظة. 🇱🇧</span>
          <div className="flex gap-6">
            <a href="#" className="hover:text-accent transition-colors">سياسة الخصوصية</a>
            <a href="#" className="hover:text-accent transition-colors">شروط الاستخدام</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────
export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <QuickTools />
        <FeaturedOpportunities />
        <RoleSelector />
        <Features />
        <HowItWorks />
        <Stats />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
