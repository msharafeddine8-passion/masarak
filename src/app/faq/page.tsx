// src/app/faq/page.tsx
// Server component — preserves SEO metadata and FAQ schema markup in Arabic
// (the canonical language for search). UI rendering happens in FAQClient.

import { buildMetadata } from "@/lib/seo";
import { FAQSchema } from "@/components/StructuredData";
import FAQClient from "./FAQClient";

export const metadata = buildMetadata({
  title: "الأسئلة الشائعة — FAQ",
  description: "أجوبة على أكثر الأسئلة شيوعاً عن مسارك: التسجيل، الميزات، المنح، والتدريب.",
  path: "/faq",
});

// Arabic FAQs are used for the JSON-LD schema (Arabic is the canonical SEO
// language). The displayed UI fetches translated strings from i18n.
const FAQS_FOR_SCHEMA = [
  { question: "هل مسارك مجاني؟", answer: "نعم، مسارك مجاني حالياً للطلاب. ميزات Premium رح تكون متاحة لاحقاً مع الحفاظ على الميزات الأساسية مجانية." },
  { question: "لمن مسارك؟", answer: "مسارك مخصّص للطلاب اللبنانيين من المرحلة المتوسطة (12 سنة) حتى ما بعد التخرج. أيضاً لأولياء الأمور والمدارس والجامعات." },
  { question: "كيف أعرف أيّ تخصص يناسبني؟", answer: "ابدأ باختبار Career DNA و Skill Strengths Quiz لاكتشاف نقاط قوّتك. بعدها تصفّح صفحة التخصصات." },
  { question: "هل البيانات تبعي محمية؟", answer: "نعم. نستخدم تشفير TLS، Row Level Security على قاعدة البيانات، ولا نبيع بياناتك. اقرأ سياسة الخصوصية للتفاصيل." },
  { question: "كيف بقدر أحفظ بياناتي؟", answer: "بعد التسجيل، كل البيانات بتنحفظ تلقائياً على حسابك. الأدوات بدون تسجيل بتحفظ على متصفّحك (localStorage)." },
  { question: "هل أنتم منصة معتمدة من الجامعات؟", answer: "نحن منصة مستقلّة نجمع المعلومات من المصادر الرسمية. للحصول على معلومات معتمدة 100%، تواصل مع الجامعة مباشرة." },
  { question: "هل بقدر أستعمل مسارك إذا أنا خارج لبنان؟", answer: "نعم! المنصة متاحة عالمياً وخصوصاً للمغتربين اللبنانيين. كل المحتوى بالعربية والإنجليزية." },
  { question: "ليش بعض المنح تظهر 'انتهت'؟", answer: "المنح بتفتح بفترات محددة سنوياً. اشترك بحسابك لتصلك تنبيهات لما تفتح المنح اللي تناسبك." },
  { question: "هل عندكم تطبيق موبايل؟", answer: "موقع مسارك يعمل بشكل ممتاز على الموبايل ويمكنك إضافته للشاشة الرئيسية كـ PWA. تطبيق مستقل قيد التطوير." },
  { question: "كيف بقدر أتواصل معكم؟", answer: "راسلنا على support@masaraklb.com أو زر صفحة التواصل. نرد خلال 48 ساعة عادةً." },
];

export default function FAQPage() {
  return (
    <>
      <FAQSchema items={FAQS_FOR_SCHEMA} />
      <FAQClient />
    </>
  );
}
