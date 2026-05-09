// src/app/for-students/page.tsx
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "للطلاب — مسارك يساعدك تختار وتنجح",
  description:
    "كل ما يحتاجه الطالب اللبناني: اختيار التخصص، المنح، التدريب، CV احترافي. مجاناً وبالعربية.",
  path: "/for-students",
  keywords: ["مسارك للطلاب", "أدوات الطلاب اللبنانيين", "مساعدة طلاب لبنان"],
});

const FEATURES = [
  { emoji: "🧬", title: "اكتشف شخصيتك المهنية", desc: "اختبار Career DNA يكشف نقاط قوّتك ويقترح المسار المناسب", href: "/career-dna" },
  { emoji: "🎓", title: "اختر تخصصك بثقة", desc: "20 تخصص مع رواتب ومهارات وخارطة طريق", href: "/majors" },
  { emoji: "🏛️", title: "قارن الجامعات", desc: "22 جامعة لبنانية مع رسوم وقبول وتوظيف", href: "/universities" },
  { emoji: "🏆", title: "احصل على منحة", desc: "منح لبنانية ودولية حسب معدّلك ومجالك", href: "/scholarships" },
  { emoji: "💼", title: "ابدأ التدريب الصيفي", desc: "فرص تدريب حقيقية بأفضل الشركات", href: "/internships/hub" },
  { emoji: "📋", title: "اصنع CV احترافي", desc: "4 قوالب جاهزة + AI Improve + Export PDF", href: "/tools/cv-builder" },
  { emoji: "🤖", title: "مستشار مهني ذكي", desc: "اسأل أي سؤال عن مستقبلك المهني", href: "/tools/career-ai" },
  { emoji: "🎤", title: "تدرّب على المقابلات", desc: "بنك أسئلة بـ 4 فئات + توقيت + نصائح", href: "/tools/interview-prep" },
];

export default function ForStudentsPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-primary/10 text-primary text-sm font-bold rounded-full mb-4">
            🎓 للطلاب
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
            من المتوسطة لسوق العمل — معك بكل خطوة
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            مهما كنت بأي مرحلة، مسارك يعطيك الأدوات والمعلومات لتأخذ قراراتك بثقة
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/auth/register?role=student" className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90">
              ابدأ مجاناً ←
            </Link>
            <Link href="/tools" className="border-2 border-primary text-primary px-8 py-3 rounded-xl font-bold">
              تصفّح الأدوات
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {FEATURES.map((f) => (
            <Link key={f.href} href={f.href} className="bg-white rounded-2xl border-2 border-gray-200 p-5 hover:border-primary hover:shadow-lg transition-all group">
              <div className="text-3xl mb-3">{f.emoji}</div>
              <h3 className="font-extrabold text-primary mb-2 group-hover:underline">{f.title}</h3>
              <p className="text-sm text-gray-600">{f.desc}</p>
            </Link>
          ))}
        </div>

        <div className="bg-gradient-to-br from-primary to-[#1A8456] text-white rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl font-extrabold mb-3">جاهز تبدأ مسارك؟</h2>
          <p className="text-lg opacity-90 mb-6">انضم لآلاف الطلاب اللبنانيين على المنصة</p>
          <Link href="/auth/register?role=student" className="inline-block bg-white text-primary px-8 py-3 rounded-xl font-bold">
            سجّل مجاناً (30 ثانية) ←
          </Link>
        </div>
      </div>
    </main>
  );
}
