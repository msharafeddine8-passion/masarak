import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "من نحن — قصة مسارك وفريقها",
  description: "مسارك منصة لبنانية بدت من ملاحظة بسيطة: الطالب اللبناني بيختار جامعته بمعلومات مبعثرة. تعرف على المؤسس ورسالة المنصة.",
  path: "/team",
});

const VALUES = [
  { emoji: "🎯", title: "الدقة قبل كل شي", desc: "كل معلومة عن جامعة أو منحة أو مدرسة لازم تكون مأكدة من المصدر الرسمي." },
  { emoji: "🆓", title: "مجاني للطلاب — للأبد", desc: "الأهل اللبنانيين عم يدفعو كفاية. التوجيه الجامعي حق، مش خدمة فاخرة." },
  { emoji: "🇱🇧", title: "لبنانية بالكامل", desc: "بُنيت بلبنان، للبنان. عارفين السوق، الجامعات، الأهل، والتحديات." },
  { emoji: "🤝", title: "شفافية مطلقة", desc: "ما عنا تسويق مدفوع. الجامعات والمنح بتظهر حسب جودتها، مش حسب اللي بيدفع." },
];

const TIMELINE = [
  { year: "2024", title: "الفكرة", desc: "صديق سأل: 'وين بدي أدرس؟' الجواب احتاج 3 أيام بحث. السؤال كان لازم ياخد 3 دقايق." },
  { year: "2025", title: "بناء المنصة", desc: "تصميم وتطوير من الصفر — مع ٣٥ جامعة لبنانية، ٣٠ مدرسة، ٨٠+ منحة، وأدوات توجيه مهني." },
  { year: "2026", title: "الإطلاق العام", desc: "مسارك متاحة مجاناً لكل طالب لبناني. الهدف: ١٠،٠٠٠ طالب بالسنة الأولى." },
];

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-bg py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-3xl">

        <Link href="/" className="text-sm text-gray-500 hover:text-[#1b3a6b] mb-6 inline-block">← الصفحة الرئيسية</Link>

        {/* Hero */}
        <div className="text-center mb-12">
          <div className="text-7xl mb-4">👋</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1b3a6b] mb-4">قصة مسارك</h1>
          <p className="text-lg text-gray-600 leading-relaxed">
            مسارك بدت من ملاحظة بسيطة: الطالب اللبناني بياخد قراراً بيغيّر مساره كله — بمعلومات مبعثرة، مع ضغط من الأهل والمدرسة، وبدون أي أداة مجانية بتساعدو.
          </p>
        </div>

        {/* Founder */}
        <div className="bg-white rounded-3xl border-2 border-gray-100 p-8 mb-10 shadow-sm">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="flex-shrink-0">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1b3a6b] to-[#012730] flex items-center justify-center text-white text-4xl font-extrabold">م</div>
            </div>
            <div className="flex-1">
              <div className="text-xs font-bold uppercase text-[#1b3a6b]/60 mb-1">المؤسس</div>
              <h2 className="text-2xl font-extrabold text-[#1b3a6b] mb-2">محمد شرف الدين</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                خريج لبناني، شغل ٥+ سنين بالتكنولوجيا والتسويق الرقمي. بنى مسارك بعد ما شاف صديقتو الصغيرة عم تختار جامعتها بناءً على إعلانات Instagram بدل بيانات حقيقية.
              </p>
              <p className="text-gray-700 leading-relaxed text-sm">
                <strong>الهدف:</strong> منصة عربية بـ ٣ نقرات بترجع للطالب جواب واضح — أي جامعة، أي تخصص، أي منحة، بأي ميزانية.
              </p>
              <div className="mt-4 flex gap-3 text-sm">
                <a href="mailto:mohamad@masaraklb.com" className="text-[#1b3a6b] hover:underline font-semibold">mohamad@masaraklb.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* Values */}
        <h2 className="text-2xl font-extrabold text-[#1b3a6b] mb-6">قيمنا</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {VALUES.map(v => (
            <div key={v.title} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="text-3xl mb-2">{v.emoji}</div>
              <h3 className="font-extrabold text-[#1b3a6b] mb-1">{v.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
            </div>
          ))}
        </div>

        {/* Timeline */}
        <h2 className="text-2xl font-extrabold text-[#1b3a6b] mb-6">المراحل</h2>
        <div className="space-y-4 mb-12">
          {TIMELINE.map(t => (
            <div key={t.year} className="bg-white rounded-2xl border border-gray-200 p-5 flex gap-5">
              <div className="flex-shrink-0 w-16 text-center">
                <div className="text-2xl font-extrabold text-[#1b3a6b]">{t.year}</div>
              </div>
              <div>
                <h3 className="font-extrabold text-gray-900 mb-1">{t.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{t.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#012730] to-[#1b3a6b] rounded-3xl p-8 text-center text-white">
          <h2 className="text-2xl font-extrabold mb-3">عندك سؤال؟ أو فكرة؟</h2>
          <p className="text-white/80 mb-6">نحنا منردّ على كل ايميل بـ ٢٤ ساعة.</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-[#012730] font-bold hover:bg-mint transition-colors">
            تواصل معنا ←
          </Link>
        </div>

      </div>
    </main>
  );
}
