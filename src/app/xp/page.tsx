import Link from "next/link";

const EARN = [
  { emoji: "🧬", title: "Career DNA", xp: 200, desc: "أكمل اختبار اكتشاف المسار المهني — مرّة واحدة." },
  { emoji: "📝", title: "بناء السيرة الذاتية", xp: 150, desc: "أكمل سيرتك الذاتية على المنصة." },
  { emoji: "🏛️", title: "احفظ ٣ جامعات", xp: 150, desc: "اختر ٣ جامعات تهمّك من قائمة 35 جامعة لبنانية." },
  { emoji: "🏆", title: "احفظ منحة", xp: 100, desc: "تابع منحة دراسية وبنذكّرك قبل ما تسكّر." },
  { emoji: "🎯", title: "اختبار اليوم", xp: 50, desc: "كل سؤال يومي صحيح. تابع كل يوم لـ streak." },
  { emoji: "🔥", title: "Streak يومي", xp: 25, desc: "متابعة يوم بعد يوم. ٧ أيام = شارة." },
  { emoji: "🎤", title: "تدريب على المقابلة", xp: 100, desc: "كل جلسة تدريب مع المستشار AI." },
];

const UNLOCK = [
  { emoji: "📋", title: "قوالب CV حصرية", xp: 500, desc: "٣ قوالب احترافية إضافية للتنزيل بـ PDF." },
  { emoji: "🎖️", title: "شارة Verified Student", xp: 1000, desc: "شارة معتمدة بحسابك بعد التأكد من الهوية الطلابية." },
  { emoji: "🤖", title: "Career AI بدون حدود", xp: 750, desc: "أسئلة لا محدودة للمستشار الذكي." },
  { emoji: "🏷️", title: "لقب بالملف", xp: 300, desc: "لقب يظهر جنب اسمك مثل 'مبتكر' أو 'باحث'." },
  { emoji: "📊", title: "تقارير DNA المتقدمة", xp: 1500, desc: "تحليل أعمق لشخصيتك المهنية + مقارنة مع خريجين." },
];

export default function XPPage() {
  return (
    <main className="min-h-screen bg-bg" dir="rtl">
      <section className="bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-700 text-white py-14 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="text-6xl mb-3">⚡</div>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-3">نظام XP بمسارك</h1>
          <p className="text-lg text-white/90 max-w-2xl mx-auto">
            كل خطوة بتعملها على المنصة بتكسبك نقاط XP. اجمعها وافتح ميزات حصرية، شارات، وقوالب CV احترافية.
          </p>
        </div>
      </section>

      <section className="container mx-auto max-w-4xl px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1b3a6b] mb-6">كيف تكسب XP؟</h2>
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          {EARN.map((e) => (
            <div key={e.title} className="bg-surface rounded-2xl border border-white/10 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{e.emoji}</span>
                <span className="text-purple-700 font-extrabold bg-purple-50 px-3 py-1 rounded-full text-sm">
                  +{e.xp} XP
                </span>
              </div>
              <h3 className="font-extrabold text-[#1b3a6b] mb-1">{e.title}</h3>
              <p className="text-sm text-ink-muted leading-relaxed">{e.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-[#1b3a6b] mb-6">شو بتفتح؟</h2>
        <div className="space-y-3 mb-12">
          {UNLOCK.map((u) => (
            <div key={u.title} className="bg-surface rounded-2xl border-2 border-purple-100 p-5 flex items-start gap-4">
              <div className="text-4xl flex-shrink-0">{u.emoji}</div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-extrabold text-[#1b3a6b]">{u.title}</h3>
                  <span className="text-purple-700 font-extrabold bg-purple-100 px-3 py-1 rounded-full text-sm whitespace-nowrap">
                    🔒 {u.xp} XP
                  </span>
                </div>
                <p className="text-sm text-ink-muted leading-relaxed">{u.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-[#012730] to-[#1b3a6b] text-white rounded-3xl p-8 text-center">
          <div className="text-5xl mb-3">🚀</div>
          <h2 className="text-2xl font-extrabold mb-3">ابدأ تكسب من اليوم</h2>
          <p className="text-white/85 mb-6">سجّل مجاناً، أكمل اختبار Career DNA، وكسب ٢٠٠ XP أوّل خطوة.</p>
          <Link
            href="/auth/register?role=student&from=xp"
            className="inline-flex items-center gap-2 bg-surface text-[#012730] font-extrabold px-7 py-3 rounded-2xl hover:bg-purple-50 transition-colors"
          >
            ابدأ مجاناً ←
          </Link>
        </div>
      </section>
    </main>
  );
}
