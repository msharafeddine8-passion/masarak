// src/app/pricing/page.tsx
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "الأسعار — Pricing",
  description: "أسعار مسارك للطلاب والمدارس والجامعات. الأدوات الأساسية مجانية للأبد.",
  path: "/pricing",
});

const TIERS = [
  {
    name: "الطالب",
    price: "مجاني",
    period: "للأبد",
    desc: "للطلاب الأفراد",
    features: [
      "كل الأدوات (Cost Calculator، CV Builder، إلخ)",
      "اختبار Career DNA و Skill Strengths",
      "Application Tracker شخصي",
      "تنبيهات منح أساسية",
      "AI Career Advisor (محدود)",
      "Profile و dashboard",
    ],
    cta: "ابدأ الآن",
    href: "/auth/register?role=student",
    popular: false,
  },
  {
    name: "Premium",
    price: "$4.99",
    period: "/شهر",
    desc: "للطلاب الجادّين بمستقبلهم",
    features: [
      "كل ما في المجاني +",
      "AI Career Advisor غير محدود",
      "Mentor Matching (قريباً)",
      "تنبيهات منح متقدّمة",
      "CV review من خبير",
      "Mock Interviews غير محدودة",
      "Application autofill",
    ],
    cta: "Premium قريباً",
    href: "#",
    popular: true,
  },
  {
    name: "المدرسة",
    price: "$1,500-5,000",
    period: "/سنة",
    desc: "للمدارس اللبنانية",
    features: [
      "Dashboard للمدرسة",
      "تقارير عن طلاب المدرسة",
      "اختبارات Career DNA لكل الطلاب",
      "Branding مشترك",
      "Webinars وورش عمل",
      "Account manager مخصّص",
    ],
    cta: "تواصل معنا",
    href: "/contact",
    popular: false,
  },
];

const FAQS = [
  { q: "هل سأحتاج بطاقة ائتمان للتسجيل؟", a: "لا. التسجيل مجاني تماماً والأدوات الأساسية مجانية للأبد." },
  { q: "متى تطلق ميزات Premium؟", a: "نخطّط لإطلاقها بأواخر 2026. الـ early subscribers سيحصلون على خصم دائم." },
  { q: "هل في خصومات للمدارس الصغيرة؟", a: "نعم. تواصل معنا، عندنا باقات مخصّصة للمدارس النامية." },
  { q: "ماذا لو ما رضيت؟", a: "سنعيد المبلغ خلال 30 يوم بدون أي أسئلة." },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
            💎 الأسعار
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            بسيطة، شفّافة، بدون مفاجآت. الأدوات الأساسية مجانية للأبد.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-16">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className={`bg-white rounded-2xl border-2 p-6 ${
                t.popular ? "border-primary ring-4 ring-primary/10 relative" : "border-gray-200"
              }`}
            >
              {t.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">
                  ⭐ الأكثر طلباً
                </div>
              )}
              <h3 className="text-xl font-extrabold mb-1">{t.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{t.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-primary">{t.price}</span>
                <span className="text-gray-500 text-sm"> {t.period}</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm">
                {t.features.map((f, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-emerald-600 font-bold flex-shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={t.href}
                className={`block text-center py-2.5 rounded-xl font-bold transition-colors ${
                  t.popular
                    ? "bg-primary text-white hover:opacity-90"
                    : "border-2 border-primary text-primary hover:bg-primary/5"
                }`}
              >
                {t.cta}
              </Link>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-center mb-6">أسئلة شائعة عن الأسعار</h2>
        <div className="space-y-3 max-w-3xl mx-auto">
          {FAQS.map((f, idx) => (
            <details key={idx} className="bg-white rounded-2xl border border-gray-200 p-5">
              <summary className="font-bold cursor-pointer">{f.q}</summary>
              <p className="text-gray-700 mt-3 text-sm">{f.a}</p>
            </details>
          ))}
        </div>

        <div className="bg-primary/5 rounded-2xl p-8 mt-12 text-center">
          <h2 className="text-2xl font-extrabold text-primary mb-2">عندك سؤال غير موجود؟</h2>
          <Link href="/contact" className="inline-block mt-3 bg-primary text-white px-6 py-2.5 rounded-xl font-bold">
            تواصل معنا ←
          </Link>
        </div>
      </div>
    </main>
  );
}
