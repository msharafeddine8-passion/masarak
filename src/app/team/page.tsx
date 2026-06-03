// Per Jun-3 audit: 'no institutional face — no team, no founders'.
// First step: a public team page with the founder's story. Future additions:
// board, advisors, partner logos (when signed).
import { buildMetadata } from "@/lib/seo";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "فريق مسارك — من نحن",
  description:
    "مسارك أُسس عام 2026 على يد محمد شرف الدين، طالب لبناني آمن بأن قرار الجامعة ما لازم يكون مبني على معلومات مبعثرة. الرسالة، الفريق، والقصة.",
  path: "/team",
  keywords: ["فريق مسارك", "مؤسس مسارك", "من نحن", "Mohamad Sharaf"],
});

export default function TeamPage() {
  return (
    <main className="min-h-screen bg-bg py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-3xl">

        <Link href="/about" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
          ← عن مسارك
        </Link>

        <header className="text-center mb-12 mt-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#1b3a6b] mb-3">
            من نحن
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto">
            مسارك مش شركة ضخمة. مسارك بدا بشخص واحد — وآلاف الطلاب اللبنانيين اللي عانوا
            من نفس المشكلة.
          </p>
        </header>

        {/* Founder card */}
        <section className="bg-white rounded-3xl border border-gray-200 p-8 md:p-10 mb-8 shadow-sm">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            <div
              className="w-28 h-28 rounded-2xl bg-gradient-to-br from-[#012730] to-[#143b43] flex items-center justify-center text-5xl text-[#97DED0] flex-shrink-0 shadow-lg"
              aria-hidden="true"
            >
              م
            </div>
            <div className="flex-1 text-center md:text-right">
              <div className="text-sm font-bold text-[#16C7D9] uppercase tracking-wider mb-1">
                المؤسس
              </div>
              <h2 className="text-2xl font-extrabold text-[#1b3a6b] mb-1">
                محمد شرف الدين
              </h2>
              <p className="text-gray-600 mb-4">طالب وريادي لبناني · بيروت</p>
              <p className="text-gray-700 leading-relaxed">
                «عشت تجربة اختيار الجامعة بمعلومات مبعثرة بين Facebook، WhatsApp،
                ومرشدي مدارس مش مطّلعين على آخر المستجدات. عرفت إنو في طلاب أحسن مني
                ما عرفوا خياراتهم لأنه ما حدا قلّن. مسارك هي الإجابة اللي تمنّيتها لمّا
                كنت بمكانهم.»
              </p>
            </div>
          </div>
        </section>

        {/* Mission strip */}
        <section className="grid sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <div className="text-3xl mb-2" aria-hidden>🎯</div>
            <div className="font-extrabold text-[#1b3a6b] mb-1">رسالتنا</div>
            <p className="text-sm text-gray-600">
              نخلّي قرار الجامعة قرار مبنيّ على معلومات دقيقة، مش على إشاعات.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <div className="text-3xl mb-2" aria-hidden>🇱🇧</div>
            <div className="font-extrabold text-[#1b3a6b] mb-1">جذورنا</div>
            <p className="text-sm text-gray-600">
              صُنع بحب في لبنان — لكل طالب عربي يستحق فرصة عادلة.
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-center">
            <div className="text-3xl mb-2" aria-hidden>🆓</div>
            <div className="font-extrabold text-[#1b3a6b] mb-1">مجاناً للطالب</div>
            <p className="text-sm text-gray-600">
              المجانية ليست تكتيكاً تسويقياً — هي قيمة جوهرية.
            </p>
          </div>
        </section>

        {/* Open positions / community CTA */}
        <section className="bg-gradient-to-br from-[#012730] to-[#143b43] text-white rounded-3xl p-8 md:p-10 text-center">
          <div className="text-3xl mb-3" aria-hidden>🚀</div>
          <h3 className="text-2xl font-extrabold mb-2">بدّك تكون جزء من القصة؟</h3>
          <p className="text-white/80 mb-6 max-w-xl mx-auto">
            عم نبني الفريق. مطوّرين، مصمّمين، كتّاب محتوى، مرشدين — كل اللي عندو شغف
            بالتعليم وبدّو يصير جزء من تغيير حقيقي بلبنان والمنطقة.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#97DED0] text-[#012730] font-extrabold hover:bg-white transition"
          >
            <span>تواصل معنا</span>
            <span>←</span>
          </Link>
        </section>

      </div>
    </main>
  );
}
