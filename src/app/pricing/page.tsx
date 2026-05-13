// src/app/pricing/page.tsx
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "الباقات — قريباً",
  description: "خطط مسارك للطلاب — قيد الإطلاق قريباً. تواصل معنا للحصول على آخر التحديثات.",
  path: "/pricing",
});

const TIERS = [
  {
    name: "الطالب",
    desc: "للطلاب الأفراد",
    features: [
      "كل الأدوات (Cost Calculator، CV Builder، إلخ)",
      "اختبار Career DNA و Skill Strengths",
      "Application Tracker شخصي",
      "تنبيهات منح",
      "AI Career Advisor",
      "Profile و Dashboard",
    ],
  },
  {
    name: "Premium",
    desc: "للطلاب الجادّين بمستقبلهم",
    features: [
      "كل ميزات الباقة الأساسية +",
      "AI Career Advisor غير محدود",
      "Mentor Matching",
      "تنبيهات منح متقدّمة",
      "CV review من خبير",
      "Mock Interviews غير محدودة",
      "Application autofill",
    ],
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-bg py-12 px-4 relative overflow-hidden" dir="rtl">
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none" />

      <div className="relative container mx-auto max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <span className="badge-accent mb-4">⏳ قريباً</span>
          <div className="text-7xl my-6 animate-bounce-soft">💎</div>
          <h1 className="h1 mb-4">
            الباقات
            <br />
            <span className="text-gradient">قريباً</span>
          </h1>
          <p className="lead max-w-2xl mx-auto">
            نعمل حالياً على تجهيز خطط مرنة للطلاب. اطلع على Premium اللي رح نطلقها قريباً.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/premium" className="btn-primary text-lg px-8 py-4">
              💎 شوف ميزات Premium ←
            </Link>
            <Link href="/auth/register" className="btn-outline text-lg px-8 py-4">
              ابدأ مجاناً
            </Link>
          </div>
        </div>

        {/* Preview الباقات (بدون أسعار) */}
        <div className="grid md:grid-cols-2 gap-5 mb-12">
          {TIERS.map((t) => (
            <div
              key={t.name}
              className="bg-white rounded-2xl border-2 border-gray-200 p-6"
            >
              <h3 className="text-xl font-extrabold text-[#1b3a6b] mb-1">{t.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{t.desc}</p>
              <div className="mb-6">
                <span className="text-2xl font-extrabold text-[#5cc4b8]">قريباً</span>
              </div>
              <ul className="space-y-2 text-sm">
                {t.features.map((f, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-emerald-600 font-bold flex-shrink-0">✓</span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-[#1b3a6b]/5 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold text-[#1b3a6b] mb-2">
            عندك سؤال أو اقتراح؟
          </h2>
          <p className="text-gray-600 mb-4">
            رأيك يهمّنا — تواصل معنا وكن جزءاً من تطوير المنصّة.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#1b3a6b] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#142d54] transition"
          >
            تواصل معنا ←
          </Link>
        </div>
      </div>
    </main>
  );
}
