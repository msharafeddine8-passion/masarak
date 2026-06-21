// src/app/guides/page.tsx
"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const GUIDES = [
  { slug: "how-to-choose-university-lebanon", title: "كيف تختار الجامعة المناسبة في لبنان", desc: "دليل شامل بـ 7 معايير لاختيار الجامعة الأنسب لك", emoji: "🏛️", time: "10 دقائق", category: "جامعة" },
  { slug: "best-majors-gulf-market", title: "أفضل التخصصات المطلوبة في سوق الخليج 2026", desc: "10 تخصصات عالية الراتب في الإمارات والسعودية وقطر", emoji: "🌍", time: "8 دقائق", category: "تخصص" },
  { slug: "from-bac-to-university", title: "من البكالوريا للجامعة: دليل شامل للأهل والطلاب", desc: "كل خطوات الانتقال من الثانوية للجامعة في لبنان", emoji: "🎓", time: "12 دقائق", category: "إرشاد" },
  { slug: "cover-letter-tips", title: "كيف تكتب رسالة دوافع قوية", desc: "10 نصائح من خبراء + قوالب جاهزة", emoji: "✉️", time: "7 دقائق", category: "مهارات" },
  { slug: "interview-success", title: "نصائح للتفوّق بمقابلة العمل", desc: "أكثر 20 سؤال شيوعاً وكيف تجاوب عنها", emoji: "🎤", time: "9 دقائق", category: "مهارات" },
  { slug: "vocational-education-guide-lebanon", title: "دليل التعليم المهني والتقني في لبنان", desc: "كل ما تحتاج معرفته عن المسارات التقنية: LT، BT، TS — فرص العمل والرواتب", emoji: "⚙️", time: "11 دقائق", category: "مهني" },
  { slug: "how-to-get-scholarship-lebanon", title: "كيف تحصل على منحة دراسية في لبنان والخارج", desc: "دليل خطوة بخطوة للتقدم للمنح — من الوثائق حتى المقابلة", emoji: "🏆", time: "10 دقائق", category: "منح" },
  { slug: "top-tech-skills-2026", title: "أكثر المهارات التقنية طلباً في 2026", desc: "15 مهارة يبحث عنها أصحاب العمل في لبنان والخليج — وكيف تتعلمها مجاناً", emoji: "💡", time: "8 دقائق", category: "مهارات" },
  { slug: "study-abroad-guide-lebanese-students", title: "الدراسة في الخارج: دليل الطلاب اللبنانيين", desc: "أفضل الدول لإتمام الدراسة الجامعية أو الماستر — التكلفة والمتطلبات والمنح", emoji: "✈️", time: "13 دقائق", category: "دراسة خارج" },
  { slug: "build-your-cv-from-scratch", title: "كيف تبني سيرتك الذاتية من الصفر", desc: "نموذج CV جاهز + أشهر الأخطاء التي ترفض طلبك فوراً", emoji: "📄", time: "8 دقائق", category: "مهارات" },
  { slug: "university-vs-vocational-which-is-right", title: "جامعة أم تقني؟ أيهما الأنسب لك", desc: "مقارنة موضوعية بين التعليم الجامعي والمسار التقني — التكلفة والوقت وفرص العمل", emoji: "🤔", time: "9 دقائق", category: "إرشاد" },
  { slug: "prepare-for-job-market-before-graduation", title: "كيف تستعد لسوق العمل قبل التخرج", desc: "7 خطوات عملية تبدأها من السنة الثالثة لضمان وظيفة بعد التخرج مباشرة", emoji: "🚀", time: "10 دقائق", category: "مهارات" },
];

export default function GuidesPage() {
  const { t, dir } = useI18n();
  return (
    <main className="min-h-screen bg-bg-soft py-12 px-4" dir={dir}>
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
            {t('gd.title')}
          </h1>
          <p className="text-xl text-ink-muted max-w-2xl mx-auto">
            {t('gd.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {GUIDES.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="bg-surface rounded-2xl border-2 border-line p-6 hover:border-primary hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{g.emoji}</div>
                <span className="text-xs bg-primary/10 text-primary font-bold px-2 py-1 rounded">
                  {g.category}
                </span>
              </div>
              <h2 className="text-xl font-extrabold text-primary mb-2 group-hover:underline">
                {g.title}
              </h2>
              <p className="text-sm text-ink-muted mb-3">{g.desc}</p>
              <div className="text-xs text-ink-subtle">📖 {g.time}</div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
