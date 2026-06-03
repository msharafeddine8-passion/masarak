"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

const BANNERS = [
  {
    id: 1,
    badge: "🔥 حصري 2026",
    title: "المنح الدراسية بانتظارك",
    subtitle: "عشرات المنح اللبنانية والدولية — فلتر حسب تخصصك ومعدلك الآن",
    cta: "ابحث عن منحتك",
    href: "/scholarships",
    emoji: "🏆",
    bg: "from-[#B7860B] via-[#D4A017] to-[#E8C040]",
    btnClass: "bg-white text-[#8B6000] hover:bg-white/90",
    badgeClass: "bg-white/20 text-white",
  },
  {
    id: 2,
    badge: "⭐ الأكثر شعبية",
    title: "اكتشف شخصيتك المهنية",
    subtitle: "اختبار Career DNA — 20 سؤالاً تكشف أفضل التخصصات والمسارات المناسبة لك",
    cta: "ابدأ الاختبار مجاناً",
    href: "/tools/career-dna",
    emoji: "🎯",
    bg: "from-[#1A3A6B] via-[#1e4080] to-[#2E5FA3]",
    btnClass: "bg-accent text-white hover:bg-accent/90",
    badgeClass: "bg-white/20 text-white",
  },
  {
    id: 3,
    badge: "🏛️ دليل كامل",
    title: "دليل الجامعات اللبنانية",
    subtitle: "تفاصيل 35 جامعة لبنانية: رسوم، تخصصات، قبول، ومقارنة ذكية بينها",
    cta: "استكشف الجامعات",
    href: "/universities",
    emoji: "🏛️",
    bg: "from-[#0C5C3A] via-[#0E7040] to-[#1A9050]",
    btnClass: "bg-white text-[#0C5C3A] hover:bg-white/90",
    badgeClass: "bg-white/20 text-white",
  },
  {
    id: 4,
    badge: "🔥 يومي",
    title: "تحدى نفسك كل يوم",
    subtitle: "5 أسئلة من المنهج اللبناني — اجمع XP واصعد في الترتيب بين طلاب مدرستك",
    cta: "ابدأ التحدي اليومي",
    href: "/tools/daily-challenge",
    emoji: "⚡",
    bg: "from-[#C0392B] via-[#E74C3C] to-[#F15A4A]",
    btnClass: "bg-white text-[#C0392B] hover:bg-white/90",
    badgeClass: "bg-white/20 text-white",
  },
  {
    id: 5,
    badge: "💼 فرص حقيقية",
    title: "فرص تدريب صيفي 2026",
    subtitle: "تدريبات في أفضل الشركات والمنظمات اللبنانية — قدّم ملفك الآن",
    cta: "اكتشف الفرص",
    href: "/internships/hub",
    emoji: "💼",
    bg: "from-[#5B2D8E] via-[#6C3483] to-[#8A45A3]",
    btnClass: "bg-white text-[#5B2D8E] hover:bg-white/90",
    badgeClass: "bg-white/20 text-white",
  },
];

export default function HomeBanners() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused]   = useState(false);

  const next = useCallback(() => setCurrent(c => (c + 1) % BANNERS.length), []);
  const prev = useCallback(() => setCurrent(c => (c - 1 + BANNERS.length) % BANNERS.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, 4500);
    return () => clearInterval(t);
  }, [paused, next]);

  const b = BANNERS[current];

  return (
    <section
      className="relative overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      dir="rtl"
    >
      <div
        className={`bg-gradient-to-r ${b.bg} transition-colors duration-700`}
        style={{ animation: "bannerFade 0.5s ease" }}
      >
        <div className="max-w-6xl mx-auto px-4 py-7 md:py-9">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full mb-3 ${b.badgeClass}`}>
                {b.badge}
              </span>
              <h3 className="text-xl md:text-2xl font-extrabold text-white mb-1.5">
                {b.title}
              </h3>
              <p className="text-white/80 text-sm leading-relaxed mb-4 max-w-xl hidden sm:block">
                {b.subtitle}
              </p>
              <Link
                href={b.href}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:-translate-y-0.5 shadow-md ${b.btnClass}`}
              >
                {b.cta} ←
              </Link>
            </div>

            <div className="hidden md:flex w-20 h-20 flex-shrink-0 items-center justify-center text-6xl opacity-90 select-none">
              {b.emoji}
            </div>

            <div className="flex flex-col gap-2 flex-shrink-0">
              <button
                onClick={prev}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-colors"
                aria-label="السابق"
              >▲</button>
              <button
                onClick={next}
                className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/35 text-white flex items-center justify-center transition-colors"
                aria-label="التالي"
              >▼</button>
            </div>
          </div>
        </div>
      </div>

      <div className={`flex justify-center gap-1.5 py-2.5 bg-gradient-to-r ${b.bg} border-t border-white/10`}>
        {BANNERS.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/40 hover:bg-white/70"
            }`}
            aria-label={`بانر ${i + 1}`}
          />
        ))}
      </div>

      <style>{`
        @keyframes bannerFade {
          from { opacity: 0.6; transform: translateY(4px); }
          to   { opacity: 1;   transform: translateY(0); }
        }
      `}</style>
    </section>
  );
    }
