// src/app/faq/page.tsx
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { FAQSchema } from "@/components/StructuredData";

export const metadata = buildMetadata({
  title: "الأسئلة الشائعة — FAQ",
  description: "أجوبة على أكثر الأسئلة شيوعاً عن مسارك: التسجيل، الميزات، المنح، والتدريب.",
  path: "/faq",
});

const FAQS = [
  { question: "هل مسارك مجاني؟", answer: "نعم، مسارك مجاني حالياً للطلاب. ميزات Premium رح تكون متاحة لاحقاً مع الحفاظ على الميزات الأساسية مجانية." },
  { question: "لمن مسارك؟", answer: "مسارك مخصّص للطلاب اللبنانيين من المرحلة المتوسطة (12 سنة) حتى ما بعد التخرج. أيضاً لأولياء الأمور والمدارس والجامعات." },
  { question: "كيف أعرف أيّ تخصص يناسبني؟", answer: "ابدأ باختبار Career DNA و Skill Strengths Quiz لاكتشاف نقاط قوّتك. بعدها تصفّح صفحة التخصصات." },
  { question: "هل البيانات تبعي محمية؟", answer: "نعم. نستخدم تشفير TLS، Row Level Security على قاعدة البيانات، ولا نبيع بياناتك. اقرأ سياسة الخصوصية للتفاصيل." },
  { question: "كيف بقدر أحفظ بياناتي؟", answer: "بعد التسجيل، كل البيانات بتنحفظ تلقائياً على حسابك. الأدوات بدون تسجيل بتحفظ على متصفّحك (localStorage)." },
  { question: "هل أنتم منصة معتمدة من الجامعات؟", answer: "نحن منصة مستقلّة نجمع المعلومات من المصادر الرسمية. للحصول على معلومات معتمدة 100%، تواصل مع الجامعة مباشرة." },
  { question: "هل بقدر أستعمل مسارك إذا أنا خارج لبنان؟", answer: "نعم! المنصة متاحة عالمياً وخصوصاً للمغتربين اللبنانيين. كل المحتوى بالعربية والإنجليزية." },
  { question: "ليش بعض المنح تظهر 'انتهت'؟", answer: "المنح بتفتح بفترات محددة سنوياً. اشترك بحسابك لتصلك تنبيهات لما تفتح المنح اللي تناسبك." },
  { question: "هل عندكم تطبيق موبايل؟", answer: "موقع مسارك يعمل بشكل ممتاز على الموبايل ويمكنك إضافته للشاشة الرئيسية كـ PWA. تطبيق مستقل قيد التطوير." },
  { question: "كيف بقدر أتواصل معكم؟", answer: "راسلنا على hello@masaraklb.com أو زر صفحة التواصل. نرد خلال 48 ساعة عادةً." },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <FAQSchema items={FAQS} />
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
            ← العودة
          </Link>
          <h1 className="text-4xl font-extrabold text-primary">❓ الأسئلة الشائعة</h1>
          <p className="text-gray-600 mt-3 text-lg">أجوبة سريعة على أكثر الأسئلة شيوعاً</p>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <details
              key={idx}
              className="group bg-white rounded-2xl border-2 border-gray-200 hover:border-primary/40 transition-colors"
            >
              <summary className="cursor-pointer p-5 flex items-center justify-between font-bold text-lg list-none">
                <span>{faq.question}</span>
                <span className="text-primary text-2xl group-open:rotate-45 transition-transform">+</span>
              </summary>
              <div className="px-5 pb-5 text-gray-700 leading-relaxed">{faq.answer}</div>
            </details>
          ))}
        </div>

        <div className="mt-10 bg-primary/5 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-extrabold text-primary mb-2">سؤالك مش هون؟</h2>
          <p className="text-gray-700 mb-4">راسلنا مباشرة وبنرد خلال 48 ساعة</p>
          <Link
            href="/contact"
            className="inline-block bg-primary text-white px-6 py-3 rounded-xl font-bold"
          >
            تواصل معنا ←
          </Link>
        </div>
      </div>
    </main>
  );
}
