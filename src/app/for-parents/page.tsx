// src/app/for-parents/page.tsx
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "للأهل — تابع مسيرة ابنك/ابنتك بثقة",
  description: "أدوات لمساعدة أبنائك في اختيار التخصص، الجامعة، والمنح. معلومات موثوقة بالعربية.",
  path: "/for-parents",
  keywords: ["نصائح للأهل", "كيف أساعد ابني بالجامعة", "تخصص الابن", "منح للأبناء"],
});

const CONCERNS = [
  { emoji: "🎯", title: "كيف أساعد ابني يختار تخصصه؟", desc: "اختبار Career DNA يكشف نقاط قوّة الابن ويقترح المسار العلمي بناءً على شخصيّته، مش بناءً على ضغوط المجتمع.", href: "/career-dna" },
  { emoji: "💰", title: "كيف أحسب تكلفة الجامعة؟", desc: "حاسبة تكلفة شاملة: الرسوم، السكن، الكتب، المواصلات. مع presets لكل الجامعات اللبنانية.", href: "/tools/cost-calculator" },
  { emoji: "🏆", title: "كيف نحصل على منح؟", desc: "200+ منحة لبنانية ودولية مفلترة حسب معدّل الابن وحاجته المالية. بنبّهك بالمواعيد.", href: "/scholarships" },
  { emoji: "🏛️", title: "أيّ جامعة الأنسب لابني؟", desc: "قارن 22 جامعة لبنانية بالرسوم والقبول والتوظيف. قرارات مدروسة.", href: "/universities" },
  { emoji: "📚", title: "ما الفرق بين IB و French Bac و Lebanese BAC؟", desc: "دليل المدارس بكل المناهج المتاحة في لبنان مع شرح مفصّل.", href: "/schools" },
  { emoji: "🔧", title: "هل التعليم المهني خيار مناسب؟", desc: "كل ما تحتاج تعرفه عن LT و BT و TS — رواتب لبنانية وخليجية.", href: "/vocational" },
];

export default function ForParentsPage() {
  return (
    <main className="min-h-screen bg-bg py-12 px-4 relative overflow-hidden" dir="rtl">
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none" />

      <div className="relative container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <span className="badge-accent mb-4">👨‍👩‍👧 للأهل</span>
          <div className="text-7xl my-6 animate-bounce-soft">👨‍👩‍👧</div>
          <h1 className="h1 mb-4">
            مستقبل ابنك/ابنتك
            <br />
            <span className="text-gradient">يستحق قرارات مدروسة</span>
          </h1>
          <p className="lead max-w-2xl mx-auto">
            مسارك يعطيك ولأبنائك المعلومات والأدوات لاختيارات صحيحة — بدون ضغط ولا تخمين
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/auth/register?role=parent" className="bg-primary text-white px-8 py-3 rounded-xl font-bold">
              سجّل كولي أمر ←
            </Link>
            <Link href="/tools/cost-calculator" className="border-2 border-primary text-primary px-8 py-3 rounded-xl font-bold">
              احسب تكلفة الجامعة
            </Link>
          </div>
        </div>

        <h2 className="text-2xl font-bold text-center mb-8">أكثر ما يهمّ الأهل</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-12">
          {CONCERNS.map((c) => (
            <Link key={c.href} href={c.href} className="bg-white rounded-2xl border-2 border-gray-200 p-6 hover:border-primary hover:shadow-lg transition-all group">
              <div className="text-4xl mb-3">{c.emoji}</div>
              <h3 className="font-extrabold text-primary text-lg mb-2 group-hover:underline">{c.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{c.desc}</p>
            </Link>
          ))}
        </div>

        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-amber-900 mb-3">💡 نصيحة من الخبراء</h2>
          <p className="text-amber-900 leading-relaxed">
            <strong>الابن يختار، الأهل يدعمون.</strong> دراسات تثبت أن الطلاب اللي اختاروا تخصصهم بنفسهم بناءً على شخصيّتهم، يحقّقون نجاحاً أعلى من اللي تأثّروا بضغوط الأهل أو المجتمع. مسارك يساعد على اتخاذ قرار مدروس <em>سويّاً</em>.
          </p>
        </div>
      </div>
    </main>
  );
}
