// src/app/contact/page.tsx
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "تواصل معنا — Contact",
  description: "تواصل مع فريق مسارك. أسئلة، اقتراحات، شراكات، وتعاون.",
  path: "/contact",
});

const CHANNELS = [
  {
    title: "بريد إلكتروني عام",
    description: "للأسئلة والاستفسارات العامة",
    contact: "hello@masaraklb.com",
    href: "mailto:hello@masaraklb.com",
    emoji: "✉️",
  },
  {
    title: "الشراكات والتعاون",
    description: "للمدارس، الجامعات، والشركات",
    contact: "partnerships@masaraklb.com",
    href: "mailto:partnerships@masaraklb.com",
    emoji: "🤝",
  },
  {
    title: "الدعم التقني",
    description: "إذا في مشكلة بالموقع أو الحساب",
    contact: "support@masaraklb.com",
    href: "mailto:support@masaraklb.com",
    emoji: "🛠️",
  },
  {
    title: "الإعلام والصحافة",
    description: "للمقابلات وطلبات التعليق",
    contact: "press@masaraklb.com",
    href: "mailto:press@masaraklb.com",
    emoji: "📰",
  },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
            ← العودة
          </Link>
          <h1 className="text-4xl font-extrabold text-primary">📞 تواصل معنا</h1>
          <p className="text-gray-600 mt-3 text-lg">
            بنحب نسمع منك! اختر الطريقة المناسبة للتواصل
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {CHANNELS.map((c) => (
            <a
              key={c.contact}
              href={c.href}
              className="group bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-3">{c.emoji}</div>
              <h3 className="font-extrabold text-primary text-lg mb-1 group-hover:underline">
                {c.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{c.description}</p>
              <div className="text-sm font-bold text-gray-800 break-all">{c.contact}</div>
            </a>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-extrabold text-primary mb-4">📍 معلومات إضافية</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="font-bold w-32 text-gray-600">الموقع:</span>
              <span>بيروت، لبنان 🇱🇧</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold w-32 text-gray-600">وقت الاستجابة:</span>
              <span>خلال 48 ساعة (أيام العمل)</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold w-32 text-gray-600">اللغات:</span>
              <span>العربية والإنجليزية</span>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
          <div className="font-bold text-amber-900 mb-1">⚡ شو ممكن نساعدك فيه؟</div>
          <ul className="text-sm text-amber-900 space-y-1.5 list-disc pr-5 mt-2">
            <li>إضافة منحة أو تدريب أو فرصة للموقع</li>
            <li>اقتراح ميزات جديدة</li>
            <li>الإبلاغ عن خطأ أو معلومة غير دقيقة</li>
            <li>الانضمام كمدرسة أو جامعة شريكة</li>
            <li>طلبات الإعلام والمقابلات</li>
          </ul>
        </div>

        <div className="mt-8 text-center">
          <Link href="/faq" className="text-primary font-bold underline">
            أو شوف الأسئلة الشائعة أولاً ←
          </Link>
        </div>
      </div>
    </main>
  );
}
