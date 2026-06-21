"use client";
import { useState } from "react";
import Link from "next/link";

type Question = { id: number; text: string; theme: string };
type Theme = { name: string; emoji: string; desc: string; careers: string[]; color: string };

const THEMES: Record<string, Theme> = {
  leadership:    { name: "القيادة",       emoji: "👑", desc: "موهبة طبيعية في توجيه الآخرين وإلهامهم لتحقيق الأهداف.", careers: ["مدير مشاريع", "رائد أعمال", "مدير تنفيذي", "محاضر"], color: "#D35400" },
  analytical:    { name: "التحليل",       emoji: "🧠", desc: "قدرة استثنائية على معالجة البيانات والتفكير المنطقي.", careers: ["محلل بيانات", "مبرمج", "باحث", "مهندس"], color: "#1a4a9f" },
  creativity:    { name: "الإبداع",       emoji: "🎨", desc: "عقل يولّد أفكاراً جديدة وينظر للعالم بمنظور مختلف.", careers: ["مصمم جرافيك", "كاتب", "مبتكر منتج", "مخرج"], color: "#8E44AD" },
  empathy:       { name: "التعاطف",       emoji: "🤝", desc: "قدرة فائقة على فهم مشاعر الآخرين وبناء علاقات قوية.", careers: ["معلم", "طبيب", "مستشار", "أخصائي اجتماعي"], color: "#0E7C7B" },
  execution:     { name: "الإنجاز",       emoji: "⚡", desc: "قدرة غير عادية على التطبيق والإنجاز والعمل بفاعلية.", careers: ["مدير عمليات", "محاسب", "مسؤول جودة", "مهندس"], color: "#27AE60" },
  communication: { name: "التواصل",       emoji: "🎯", desc: "موهبة في الإقناع والتأثير وإيصال الأفكار بوضوح.", careers: ["مسوّق", "محامٍ", "إعلامي", "مدرّب"], color: "#E74C3C" },
};

const QUESTIONS: Question[] = [
  { id: 1,  theme: "leadership",    text: "أجد نفسي أتولى القيادة في المجموعة بشكل تلقائي دون أن يطلب أحد ذلك" },
  { id: 2,  theme: "analytical",   text: "أستمتع بحل المسائل المنطقية والألغاز المعقدة" },
  { id: 3,  theme: "creativity",   text: "أفكر دائماً في طرق جديدة وغير تقليدية لحل المشكلات" },
  { id: 4,  theme: "empathy",      text: "أشعر بمشاعر الآخرين بسهولة وأفهم ما يمرون به دون أن يشرحوا" },
  { id: 5,  theme: "execution",    text: "أُنجز ما أبدأه دائماً ولا أتركه ناقصاً حتى في الظروف الصعبة" },
  { id: 6,  theme: "communication",text: "أستطيع إقناع الآخرين وتغيير آرائهم بسهولة" },
  { id: 7,  theme: "leadership",   text: "يلجأ الناس إليّ طلباً للنصيحة والتوجيه في المواقف الصعبة" },
  { id: 8,  theme: "analytical",   text: "أحب البحث والاستقصاء وجمع المعلومات قبل اتخاذ أي قرار" },
  { id: 9,  theme: "creativity",   text: "أرسم أو أكتب أو أصمم أو أعزف — أي شكل من أشكال التعبير الإبداعي يجذبني" },
  { id: 10, theme: "empathy",      text: "أستمتع بمساعدة الآخرين ويسعدني رؤيتهم ينجحون ويتطورون" },
  { id: 11, theme: "execution",    text: "أنظم وقتي ومهامي بدقة وأهتم بالتفاصيل الصغيرة" },
  { id: 12, theme: "communication",text: "أحب التحدث أمام الجمهور وأشعر بالنشاط لا بالتوتر" },
  { id: 13, theme: "leadership",   text: "أرى الصورة الكبيرة وأضع خططاً بعيدة المدى بشكل طبيعي" },
  { id: 14, theme: "analytical",   text: "أتعمق في الأرقام والإحصاءات لاستخلاص معاني لا يلاحظها غيري" },
  { id: 15, theme: "creativity",   text: "أملّ من الروتين وأسعى دائماً لتجربة أشياء جديدة ومختلفة" },
  { id: 16, theme: "empathy",      text: "بناء علاقات إنسانية صادقة وعميقة أهم لي من تحقيق النتائج السريعة" },
  { id: 17, theme: "execution",    text: "أُقدّر الانضباط والالتزام بالمواعيد وأنزعج من عدم الدقة" },
  { id: 18, theme: "communication",text: "أجيد الكتابة والتعبير عن أفكاري بأسلوب يجذب القراء" },
  { id: 19, theme: "leadership",   text: "أتحمل المسؤولية بثقة حتى في المواقف الغامضة وعدم اليقين" },
  { id: 20, theme: "analytical",   text: "أسعى دائماً لفهم السبب والمنطق خلف كل شيء يحدث حولي" },
  { id: 21, theme: "creativity",   text: "الأفكار الجديدة تتدفق عليّ باستمرار وأحتاج لتدوينها حتى لا تضيع" },
  { id: 22, theme: "empathy",      text: "أفضل العمل مع الناس مباشرةً بدلاً من العمل بمفردي أمام الشاشة" },
  { id: 23, theme: "execution",    text: "أشعر برضا حقيقي حين أضع خططاً وأتابع تنفيذها حتى النهاية" },
  { id: 24, theme: "communication",text: "أستمتع بالتفاوض والنقاشات وإيجاد أرضية مشتركة مع الآخرين" },
  { id: 25, theme: "leadership",   text: "أتعلم من الأخطاء بسرعة وأحوّل الفشل إلى درس ومحفّز" },
  { id: 26, theme: "analytical",   text: "أفكر بطريقة منهجية خطوة بخطوة وأكره التسرع في القرارات" },
  { id: 27, theme: "creativity",   text: "أرى الجمال في الأشياء العادية وأبحث عن الجانب الفني في كل مكان" },
  { id: 28, theme: "empathy",      text: "أتذكر تفاصيل شخصية عن الناس وهذا يجعلهم يثقون بي" },
  { id: 29, theme: "execution",    text: "القوائم والخطط والجداول تجعلني أشعر بالأمان والسيطرة" },
  { id: 30, theme: "communication",text: "الناس يصفونني بأنني مقنع وواضح وسهل الفهم في طرح أفكاري" },
];

const OPTIONS = [
  { value: 5, label: "تماماً أنا", color: "bg-green-500" },
  { value: 4, label: "في الغالب", color: "bg-emerald-400" },
  { value: 3, label: "أحياناً",    color: "bg-yellow-400" },
  { value: 2, label: "نادراً",     color: "bg-orange-400" },
  { value: 1, label: "لا أبداً",   color: "bg-red-400" },
];

export default function StrengthsPage() {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [step, setStep] = useState<"intro" | "quiz" | "results">("intro");
  const [currentPage, setCurrentPage] = useState(0);

  const PAGE_SIZE = 6;
  const totalPages = Math.ceil(QUESTIONS.length / PAGE_SIZE);
  const pageQuestions = QUESTIONS.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / QUESTIONS.length) * 100;

  function calcResults() {
    const scores: Record<string, number> = {};
    Object.keys(THEMES).forEach(t => { scores[t] = 0; });
    QUESTIONS.forEach(q => {
      if (answers[q.id]) scores[q.theme] += answers[q.id];
    });
    return Object.entries(scores).sort((a, b) => b[1] - a[1]);
  }

  const results = step === "results" ? calcResults() : [];
  const top3 = results.slice(0, 3);
  const maxScore = 5 * (QUESTIONS.length / Object.keys(THEMES).length);

  const allAnswered = answeredCount === QUESTIONS.length;

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-white/10 sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-extrabold">م</span>
              </div>
              <span className="text-primary font-extrabold text-lg">مسارك</span>
            </Link>
            <span className="text-gray-300">›</span>
            <Link href="/tools" className="text-text-sub text-sm hover:text-primary">الأدوات</Link>
            <span className="text-gray-300">›</span>
            <span className="text-primary text-sm font-semibold">اكتشف نقاط قوتك</span>
          </div>
          <Link href="/dashboard" className="text-text-sub text-sm hover:text-primary">← الداشبورد</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* INTRO */}
        {step === "intro" && (
          <>
            <div className="bg-gradient-to-r from-[#D35400] to-[#A04000] rounded-2xl p-8 mb-6 text-white text-center">
              <div className="text-5xl mb-3">💪</div>
              <h1 className="text-2xl md:text-3xl font-extrabold mb-2">اكتشف نقاط قوتك</h1>
              <p className="text-white/80">30 سؤالاً تكشف مواهبك الطبيعية وتوجهك نحو المهنة الصحيحة</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {Object.values(THEMES).map(t => (
                <div key={t.name} className="bg-surface rounded-xl border border-white/10 shadow-sm p-4 text-center">
                  <div className="text-3xl mb-2">{t.emoji}</div>
                  <div className="font-bold text-sm text-primary">{t.name}</div>
                  <div className="text-xs text-text-sub mt-1">{t.desc.slice(0, 60)}...</div>
                </div>
              ))}
            </div>

            <div className="bg-surface rounded-xl border border-white/10 shadow-sm p-5 mb-6">
              <h2 className="font-bold text-primary mb-3">📋 كيف يعمل الاختبار؟</h2>
              <div className="space-y-2 text-sm text-text-sub">
                {[
                  ["30 سؤالاً", "تُغطي 6 نقاط قوة أساسية"],
                  ["5-7 دقائق", "فقط لإكمال الاختبار"],
                  ["لا إجابة صح أو غلط", "أجب بصدق كما تشعر"],
                  ["تقرير مفصل", "مع توصيات مهنية مخصصة لك"],
                ].map(([bold, text]) => (
                  <div key={bold} className="flex items-center gap-2">
                    <span className="w-5 h-5 bg-[#D35400]/10 text-[#D35400] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">✓</span>
                    <span><strong>{bold}</strong> {text}</span>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => setStep("quiz")}
              className="w-full bg-gradient-to-r from-[#D35400] to-[#A04000] text-white font-extrabold py-4 rounded-xl text-lg hover:opacity-90 transition-all shadow-lg">
              💪 ابدأ الاختبار الآن ←
            </button>
          </>
        )}

        {/* QUIZ */}
        {step === "quiz" && (
          <>
            {/* Progress */}
            <div className="bg-surface rounded-xl border border-white/10 shadow-sm p-4 mb-5">
              <div className="flex justify-between items-center mb-2 text-sm">
                <span className="font-bold text-primary">أجبت على {answeredCount} من 30 سؤال</span>
                <span className="text-text-sub text-xs">صفحة {currentPage + 1} من {totalPages}</span>
              </div>
              <div className="bg-bg-soft rounded-full h-3">
                <div className="bg-gradient-to-r from-[#D35400] to-[#A04000] rounded-full h-3 transition-all duration-500"
                  style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="space-y-4 mb-6">
              {pageQuestions.map(q => (
                <div key={q.id} className={`bg-surface rounded-xl border-2 shadow-sm p-4 transition-all ${
                  answers[q.id] ? "border-[#D35400]/30" : "border-white/10"
                }`}>
                  <div className="flex items-start gap-3 mb-3">
                    <span className="w-7 h-7 bg-[#D35400]/10 text-[#D35400] rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">{q.id}</span>
                    <p className="text-sm font-semibold text-primary leading-relaxed">{q.text}</p>
                  </div>
                  <div className="grid grid-cols-5 gap-1.5">
                    {OPTIONS.map(opt => (
                      <button key={opt.value} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: opt.value }))}
                        className={`py-2 rounded-lg text-xs font-bold transition-all border-2 ${
                          answers[q.id] === opt.value
                            ? `${opt.color} text-white border-transparent shadow-md`
                            : "border-white/10 text-text-sub hover:border-[#D35400] bg-surface"
                        }`}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              {currentPage > 0 && (
                <button onClick={() => setCurrentPage(p => p - 1)}
                  className="px-5 py-3 border-2 border-white/10 rounded-xl text-sm font-bold text-text-sub hover:border-[#D35400] hover:text-[#D35400] transition-all">
                  → السابق
                </button>
              )}
              {currentPage < totalPages - 1 ? (
                <button onClick={() => setCurrentPage(p => p + 1)}
                  className="flex-1 bg-gradient-to-r from-[#D35400] to-[#A04000] text-white py-3 rounded-xl text-sm font-bold hover:opacity-90 transition-all">
                  التالي ←
                </button>
              ) : (
                <button onClick={() => setStep("results")} disabled={!allAnswered}
                  className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                    allAnswered
                      ? "bg-gradient-to-r from-[#D35400] to-[#A04000] text-white hover:opacity-90 shadow-lg"
                      : "bg-white/10 text-ink-subtle cursor-not-allowed"
                  }`}>
                  {allAnswered ? "🎯 عرض نتائجي ←" : `أكمل الإجابة على جميع الأسئلة (${30 - answeredCount} متبقية)`}
                </button>
              )}
            </div>
          </>
        )}

        {/* RESULTS */}
        {step === "results" && (
          <>
            <div className="bg-gradient-to-r from-[#D35400] to-[#A04000] rounded-2xl p-6 mb-6 text-white text-center">
              <div className="text-5xl mb-2">🏆</div>
              <h1 className="text-2xl font-extrabold mb-1">نتائجك جاهزة!</h1>
              <p className="text-white/80 text-sm">إليك نقاط قوتك الحقيقية مرتبةً من الأعلى للأدنى</p>
            </div>

            {/* Top 3 Strengths */}
            <div className="mb-6">
              <h2 className="font-bold text-primary text-lg mb-4">🥇 نقاط قوتك الثلاث الأبرز</h2>
              <div className="grid gap-4">
                {top3.map(([themeKey, score], idx) => {
                  const t = THEMES[themeKey];
                  const pct = Math.round((score / maxScore) * 100);
                  return (
                    <div key={themeKey} className="bg-surface rounded-xl border border-white/10 shadow-sm p-5">
                      <div className="flex items-center gap-4 mb-3">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                          style={{ background: t.color + "15" }}>
                          {["🥇", "🥈", "🥉"][idx]} {t.emoji}
                        </div>
                        <div className="flex-1">
                          <div className="font-extrabold text-primary">{t.name}</div>
                          <div className="text-xs text-text-sub">{t.desc}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-extrabold text-xl" style={{ color: t.color }}>{pct}%</div>
                        </div>
                      </div>
                      <div className="bg-bg-soft rounded-full h-3 mb-3">
                        <div className="h-3 rounded-full transition-all"
                          style={{ width: `${pct}%`, background: t.color }} />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-text-sub mb-2">🎯 المهن المناسبة لك:</div>
                        <div className="flex flex-wrap gap-2">
                          {t.careers.map(c => (
                            <span key={c} className="text-xs px-3 py-1 rounded-full font-semibold"
                              style={{ background: t.color + "15", color: t.color }}>{c}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* All scores chart */}
            <div className="bg-surface rounded-xl border border-white/10 shadow-sm p-5 mb-6">
              <h2 className="font-bold text-primary mb-4">📊 جميع نقاط القوة</h2>
              <div className="space-y-3">
                {results.map(([themeKey, score]) => {
                  const t = THEMES[themeKey];
                  const pct = Math.round((score / maxScore) * 100);
                  return (
                    <div key={themeKey} className="flex items-center gap-3">
                      <span className="text-xl w-8">{t.emoji}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-semibold text-primary">{t.name}</span>
                          <span style={{ color: t.color }} className="font-bold">{pct}%</span>
                        </div>
                        <div className="bg-bg-soft rounded-full h-2">
                          <div className="h-2 rounded-full transition-all"
                            style={{ width: `${pct}%`, background: t.color }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Next steps */}
            <div className="bg-gradient-to-r from-[#D35400]/10 to-[#A04000]/10 border border-[#D35400]/20 rounded-2xl p-5 mb-6">
              <h3 className="font-bold text-[#D35400] mb-3">🚀 خطواتك القادمة</h3>
              <div className="space-y-2 text-sm text-text-sub">
                <div className="flex items-start gap-2">
                  <span className="text-[#D35400] mt-0.5">▸</span>
                  <span>اعمل سيرة ذاتية تبرز نقطة قوتك الأولى <Link href="/tools/cv-builder" className="text-[#D35400] font-semibold hover:underline">← ابنِ سيرتك</Link></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#D35400] mt-0.5">▸</span>
                  <span>اختبر Career DNA لمعرفة التخصص المثالي <Link href="/career-dna" className="text-[#D35400] font-semibold hover:underline">← ابدأ الآن</Link></span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[#D35400] mt-0.5">▸</span>
                  <span>استكشف تخصصات تناسب نقاط قوتك <Link href="/majors" className="text-[#D35400] font-semibold hover:underline">← التخصصات</Link></span>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => { setAnswers({}); setStep("intro"); setCurrentPage(0); }}
                className="flex-1 border-2 border-[#D35400] text-[#D35400] py-3 rounded-xl font-bold text-sm hover:bg-[#D35400] hover:text-white transition-all">
                🔄 أعد الاختبار
              </button>
              <Link href="/tools/cv-builder"
                className="flex-1 bg-gradient-to-r from-[#D35400] to-[#A04000] text-white py-3 rounded-xl font-bold text-sm text-center hover:opacity-90 transition-all">
                📄 ابنِ سيرتك الآن ←
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
