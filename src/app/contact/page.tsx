// src/app/contact/page.tsx
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "تواصل معنا — Contact",
  description: "تواصل مع فريق مسارك. أسئلة، اقتراحات، شراكات، وتعاون.",
  path: "/contact",
});

const SUPPORT_EMAIL = 'support@masaraklb.com';

const CHANNELS = [
  { title: "بريد إلكتروني عام", description: "للأسئلة والاستفسارات العامة", emoji: "✉️" },
  { title: "الشراكات والتعاون", description: "للمدارس، الجامعات، والشركات", emoji: "🤝" },
  { title: "الدعم التقني", description: "إذا في مشكلة بالموقع أو الحساب", emoji: "🛠️" },
  { title: "الإعلام والصحافة", description: "للمقابلات وطلبات التعليق", emoji: "📰" },
];

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-bg py-12 px-4 relative overflow-hidden" dir="rtl">
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none" />

      <div className="relative container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm text-ink-muted hover:text-primary mb-2 inline-block">
            ← العودة
          </Link>
          <div className="text-7xl my-6 animate-bounce-soft">💬</div>
          <h1 className="h1 mb-3">📞 تواصل معنا</h1>
          <p className="lead">
            بنحب نسمع منك! اختر الطريقة المناسبة للتواصل
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          {CHANNELS.map((c) => (
            <a
              key={c.title}
              href={`mailto:${SUPPORT_EMAIL}`}
              className="group bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-[#1b3a6b] hover:shadow-lg transition-all"
            >
              <div className="text-4xl mb-3">{c.emoji}</div>
              <h3 className="font-extrabold text-[#1b3a6b] text-lg mb-1 group-hover:underline">
                {c.title}
              </h3>
              <p className="text-sm text-gray-600 mb-3">{c.description}</p>
              <div className="text-sm font-bold text-gray-800 break-all">{SUPPORT_EMAIL}</div>
            </a>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-extrabold text-[#1b3a6b] mb-4">📍 معلومات إضافية</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="font-bold w-32 text-gray-600">الموقع:</span>
              <span>لبنان 🇱🇧</span>
            </div>
            <div className="flex items-start gap-3">
              <span className="font-bold w-32 text-gray-600">الإيميل:</span>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#1b3a6b] font-semibold hover:underline" dir="ltr">{SUPPORT_EMAIL}</a>
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
      </div>
    </main>
  );
}
