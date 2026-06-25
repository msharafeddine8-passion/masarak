// src/app/pricing-school/page.tsx
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "باقات المدارس — قريباً",
  description: "خطط مسارك للمدارس — قيد الإطلاق قريباً. تواصل معنا للحصول على عرض مخصّص لمدرستك.",
  path: "/pricing-school",
});

const FEATURES = [
  "Dashboard مخصّص للمدرسة",
  "تقارير شاملة عن طلاب المدرسة",
  "اختبارات Career DNA لكل الطلاب",
  "Branding مشترك على المنصّة",
  "Webinars وورش عمل دورية",
  "Account manager مخصّص للمدرسة",
  "تكامل مع أنظمة المدرسة الحالية",
  "تدريب الكادر التعليمي",
];

export default function PricingSchoolPage() {
  return (
    <main className="min-h-screen bg-bg-soft py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[#5cc4b8]/15 text-[#1b3a6b] px-4 py-2 rounded-full text-sm font-bold mb-6">
            <span>🏫</span>
            <span>للمدارس</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1b3a6b] mb-4">
            باقات المدارس قريباً
          </h1>
          <p className="text-lg text-ink-muted max-w-2xl mx-auto">
            نعمل على تجهيز حلول مخصّصة للمدارس لمساعدة طلابكم في رحلتهم
            الأكاديمية والمهنية. تواصلوا معنا اليوم لمناقشة احتياجات مدرستكم.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/contact"
              className="px-8 py-3 bg-[#1b3a6b] text-white rounded-xl font-bold hover:bg-[#142d54] transition"
            >
              احجز اجتماعاً
            </Link>
            <Link
              href="/for-schools"
              className="px-8 py-3 border-2 border-[#1b3a6b] text-[#1b3a6b] rounded-xl font-bold hover:bg-[#1b3a6b]/5 transition"
            >
              تعرّف على الميزات
            </Link>
          </div>
        </div>

        {/* الميزات (بدون أسعار) */}
        <div className="bg-surface rounded-2xl border-2 border-line p-8 mb-12">
          <div className="text-center mb-8">
            <span className="text-3xl font-extrabold text-[#5cc4b8]">قريباً</span>
            <p className="text-ink-subtle text-sm mt-2">
              الباقة كاملة الميزات للمدارس
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {FEATURES.map((f, idx) => (
              <div key={idx} className="flex gap-3 items-start">
                <span className="text-emerald-600 font-bold flex-shrink-0 text-lg">✓</span>
                <span className="text-sm text-ink-muted">{f}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-[#1b3a6b]/5 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold text-[#1b3a6b] mb-2">
            هل تمثّل مدرسة؟
          </h2>
          <p className="text-ink-muted mb-4">
            تواصلوا معنا للحصول على عرض مخصّص يناسب احتياجات مدرستكم وعدد طلابكم.
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
