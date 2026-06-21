import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "أدوات الطالب — CV، DNA المهني، حاسبة كلفة | مسارك",
  description: "كل أدوات قرارك الجامعي والمهني بمكان واحد: بناء سيرة ذاتية، اختبار شخصية مهنية، حاسبة كلفة الدراسة، تدريب على المقابلات.",
  path: "/tools",
  keywords: ["أدوات طالب", "CV builder", "Career DNA", "حاسبة كلفة الدراسة", "تدريب مقابلات"],
});

type Tool = {
  href: string;
  emoji: string;
  title: string;
  desc: string;
  duration: string;
  highlight?: string;
};

const TOOLS: Tool[] = [
  { href: "/career-dna",                 emoji: "🧬", title: "Career DNA",            desc: "اختبار شخصية مهنية مبني على نموذج Holland RIASEC. ٢٠ سؤال يكشف أنسب المسارات والتخصصات لك.", duration: "٥-٧ دقائق", highlight: "الأكثر استخداماً" },
  { href: "/tools/cv-builder",           emoji: "📄", title: "بناء السيرة الذاتية",    desc: "صمّم CV احترافي بقوالب مدروسة. تصدير PDF بالعربي والإنجليزي + AI Improve لاقتراحات نصّية ذكية.", duration: "١٠-١٥ دقيقة" },
  { href: "/tools/cost-calculator",      emoji: "💰", title: "حاسبة كلفة الدراسة",    desc: "احسب التكلفة الكاملة لـ٤ سنوات دراسة بأي جامعة: رسوم + سكن + كتب + معيشة. مع اقتراحات منح تخفّض الفاتورة.", duration: "٢ دقائق" },
  { href: "/tools/interview-prep",       emoji: "🎤", title: "تدريب على المقابلات",    desc: "تدرّب على أسئلة مقابلات جامعية وعملية. تقييم STAR + ملاحظات على إجاباتك.", duration: "١٥-٢٠ دقيقة" },
  { href: "/tools/skill-strengths",      emoji: "💪", title: "اختبار نقاط القوّة",     desc: "اكتشف مهاراتك الأقوى ومجالات تحسينها — منهجية CliftonStrengths مُعرّبة.", duration: "٥ دقائق" },
  { href: "/tools/career-ai",            emoji: "🤖", title: "المستشار الذكي",         desc: "اسأل عن أي شي يخص قرارك الجامعي أو المهني — مدعوم بـClaude.", duration: "محادثة مفتوحة" },
  { href: "/quiz/today",                 emoji: "🎯", title: "اختبار اليوم",            desc: "٥ أسئلة يومياً من المنهج اللبناني (الرياضيات، العلوم، اللغة). اجمع XP وحافظ على سلسلتك.", duration: "٣ دقائق" },
];

export default function ToolsIndexPage() {
  return (
    <main className="min-h-screen bg-bg py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-5xl">
        <header className="text-center mb-12">
          <div className="text-6xl mb-3">🛠️</div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-[#012730] mb-3">
            أدوات الطالب
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            كل ما تحتاجه لاتخاذ قرارك الجامعي وبناء مسارك المهني — مجاناً تماماً.
          </p>
        </header>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TOOLS.map(t => (
            <Link
              key={t.href}
              href={t.href}
              className="group bg-surface rounded-3xl border-2 border-white/10 p-6 hover:border-[#012730] hover:shadow-lg transition-all relative"
            >
              {t.highlight && (
                <span className="absolute top-4 left-4 bg-[#97DED0] text-[#012730] text-xs font-extrabold px-2 py-1 rounded-full">
                  ⭐ {t.highlight}
                </span>
              )}
              <div className="text-5xl mb-4">{t.emoji}</div>
              <h2 className="text-xl font-extrabold text-[#012730] mb-2 group-hover:underline">
                {t.title}
              </h2>
              <p className="text-sm text-ink-muted leading-relaxed mb-4 min-h-[60px]">{t.desc}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-subtle">⏱️ {t.duration}</span>
                <span className="text-[#012730] font-bold group-hover:translate-x-1 transition">جرّب الآن ←</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-12 bg-[#012730] text-white rounded-3xl p-8 md:p-10 text-center">
          <div className="text-3xl mb-3">🆓</div>
          <h2 className="text-2xl md:text-3xl font-extrabold mb-2">كل الأدوات مجانية تماماً</h2>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">لا اشتراكات، لا إعلانات، لا بيانات تُباع. سجّل حساب مجاني (٣٠ ثانية) واحفظ تقدّمك عبر كل الأدوات.</p>
          <Link href="/auth/register" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#97DED0] text-[#012730] font-extrabold hover:bg-surface transition">
            <span>سجّل مجاناً</span><span>←</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
