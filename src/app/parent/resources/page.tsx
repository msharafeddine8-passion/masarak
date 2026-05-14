"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

const RESOURCES = [
  {
    emoji: "💬",
    title: "كيف تحكي مع ابنك عن مستقبله؟",
    desc: "أساليب فعّالة للحوار حول الجامعة والتخصص بدون ضغط",
    tags: ["تواصل", "أساسي"],
    color: "from-mint to-primary-300",
  },
  {
    emoji: "💸",
    title: "تخطيط مالي للجامعة",
    desc: "كيف توفّر لتعليم ابنك من سن مبكّر، والخيارات المتاحة لو ما توفّر",
    tags: ["مال", "تخطيط"],
    color: "from-accent to-coral",
  },
  {
    emoji: "🌍",
    title: "دراسة بالخارج: الإيجابيات والسلبيات",
    desc: "متى يكون قرار دراسة الخارج صحيح، ومتى يكون لبنان أحسن خيار",
    tags: ["دراسة بالخارج"],
    color: "from-info to-primary",
  },
  {
    emoji: "🧬",
    title: "اختبارات الشخصية المهنية",
    desc: "كيف تساعد ابنك يكتشف نفسه قبل ما يقرّر التخصص",
    tags: ["نفسي", "تخصص"],
    color: "from-violet to-primary-700",
  },
  {
    emoji: "⚠️",
    title: "علامات الضغط النفسي الأكاديمي",
    desc: "كيف تتعرّف على تعب ابنك وكيف تساعده يتجاوزه",
    tags: ["صحة نفسية"],
    color: "from-danger to-coral",
  },
  {
    emoji: "🎓",
    title: "ما الفرق بين الجامعات الخاصة والحكومية؟",
    desc: "إيجابيات وسلبيات كل خيار من منظور الأهل",
    tags: ["مقارنة"],
    color: "from-success to-mint",
  },
  {
    emoji: "📋",
    title: "checklist التقديم للجامعة",
    desc: "كل الوثائق والمواعيد اللي لازم تنتبه إلها",
    tags: ["تقديم"],
    color: "from-warning to-accent",
  },
  {
    emoji: "🤝",
    title: "متى تتدخّل ومتى تتركه يقرّر؟",
    desc: "حدود توجيه الأهل للأبناء في القرارات التعليمية",
    tags: ["حدود", "تربية"],
    color: "from-primary to-info",
  },
];

const FAQ = [
  {
    q: "ابني ما عارف شو بدّو يدرس، شو أعمل؟",
    a: "أول خطوة: شجّعه يعمل اختبار Career DNA على المنصة. هاد بيكشف نوع شخصيته والمسارات اللي بتناسبه. بعدها ادرسوا معاً النتائج بدون ضغط لاتخاذ قرار."
  },
  {
    q: "كيف بقدر أتأكد إنّو الجامعة مناسبة لإمكانياتنا المادية؟",
    a: "استخدم 'حاسبة كلفة الدراسة' على مسارك. بتعطيك تقدير شامل: رسوم سنوية، كتب، نقل، إقامة (لو خارج المدينة). كمان شوف المنح اللي تناسب معدّل ابنك."
  },
  {
    q: "ابني بدّو يدرس بالخارج، شو لازم أعرف؟",
    a: "الدراسة بالخارج بتكلّف 3-10 أضعاف الجامعات المحلية. تأكّد إنّو التخصص ما متوفر بنفس الجودة بلبنان. وفكّر بالمنح الدولية اللي مسارك بيعرضها."
  },
  {
    q: "كيف بقدر أتابع تقدّم ابني على المنصة؟",
    a: "بعد ما تربط حسابك بحسابه، رح تشوف لوحة بكل تقدّمه: اختبارات Career DNA، الجامعات اللي حفظها، المنح اللي بيتابعها، CV، إلخ."
  },
];

export default function ParentResourcesPage() {
  const { t, dir } = useI18n();
  return (
    <main className="min-h-screen bg-bg pb-20 relative overflow-hidden" dir={dir}>
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 py-8">
        <Link href="/parent/dashboard" className="text-sm text-ink-muted hover:text-primary inline-flex items-center gap-1 mb-4">
          {t('pr.back')}
        </Link>

        {/* Hero */}
        <div className="bg-gradient-hero rounded-4xl p-8 md:p-10 mb-8 text-white shadow-floaty relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/30 rounded-full blur-3xl" />
          <div className="absolute top-6 left-1/4 text-3xl animate-float opacity-50">📚</div>
          <div className="absolute bottom-8 right-1/4 text-3xl animate-float opacity-50" style={{ animationDelay: '1s' }}>💡</div>

          <div className="relative flex items-center gap-5 flex-wrap">
            <div className="text-7xl animate-bounce-soft drop-shadow-2xl">📚</div>
            <div>
              <span className="inline-block bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-2">{t('pr.chip')}</span>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{t('pr.title')}</h1>
              <p className="text-white/90">{t('pr.subtitle')}</p>
            </div>
          </div>
        </div>

        {/* Resources Grid */}
        <h2 className="text-2xl font-extrabold text-primary mb-4">{t('pr.resources')}</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-12 stagger">
          {RESOURCES.map(r => (
            <div key={r.title} className="card group hover:shadow-floaty hover:-translate-y-1 transition-all relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${r.color} opacity-0 group-hover:opacity-5 transition-opacity`} />
              <div className="relative flex items-start gap-4">
                <div className={`icon-circle-lg bg-gradient-to-br ${r.color} text-white flex-shrink-0`}>
                  <span className="text-3xl">{r.emoji}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-primary mb-1.5">{r.title}</h3>
                  <p className="text-sm text-ink-muted leading-relaxed mb-2">{r.desc}</p>
                  <div className="flex flex-wrap gap-1">
                    {r.tags.map(t => (
                      <span key={t} className="badge-primary text-[10px]">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border-soft text-center">
                <span className="text-xs text-ink-subtle">{t('pr.coming_soon')}</span>
              </div>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <h2 className="text-2xl font-extrabold text-primary mb-4">{t('pr.faq')}</h2>
        <div className="space-y-3 mb-8">
          {FAQ.map((f, i) => (
            <details key={i} className="card group cursor-pointer">
              <summary className="font-bold text-ink flex items-center justify-between gap-3">
                <span className="flex-1">{f.q}</span>
                <span className="text-primary text-xl group-open:rotate-180 transition-transform">▼</span>
              </summary>
              <p className="mt-3 pt-3 border-t border-border-soft text-ink leading-relaxed text-sm">{f.a}</p>
            </details>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-mint rounded-4xl p-8 text-center text-primary-dark">
          <div className="text-5xl mb-3">💬</div>
          <h3 className="text-2xl font-extrabold mb-2">{t('pr.cta.title')}</h3>
          <p className="text-ink mb-4">{t('pr.cta.subtitle')}</p>
          <Link href="/contact" className="btn-primary inline-flex">
            {t('pr.cta.contact')}
          </Link>
        </div>
      </div>
    </main>
  );
}
