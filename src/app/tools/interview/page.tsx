"use client";
import { useState } from "react";
import Link from "next/link";

type Question = {
  id: number;
  category: string;
  question: string;
  tip: string;
  starExample?: { situation: string; task: string; action: string; result: string };
};

const QUESTIONS: Question[] = [
  {
    id: 1, category: "التعريف بالنفس",
    question: "حدثني عن نفسك",
    tip: "ابدأ بالحاضر، ثم اذكر الماضي المهم، وانتهِ بالمستقبل. أبقِ الجواب دقيقتين كحد أقصى.",
    starExample: { situation: "جاءني سؤال في مقابلة مع شركة تقنية", task: "تقديم نفسي بشكل مؤثر ومختصر", action: "ذكرت مهاراتي الأساسية وأبرز إنجازاتي وسبب اهتمامي بالشركة", result: "حصلت على إعجاب المحاور وانتقلنا بسلاسة لبقية الأسئلة" }
  },
  {
    id: 2, category: "التعريف بالنفس",
    question: "لماذا تركت وظيفتك السابقة؟",
    tip: "كن صادقاً وإيجابياً. تحدث عن النمو والتطور، ولا تنتقد صاحب العمل السابق أبداً.",
  },
  {
    id: 3, category: "نقاط القوة",
    question: "ما هي أبرز نقاط قوتك؟",
    tip: "اذكر 3 نقاط قوة مع مثال عملي لكل منها. اختر نقاطاً مرتبطة بمتطلبات الوظيفة.",
    starExample: { situation: "في مشروع برمجي لتطوير تطبيق", task: "إنجاز الميزة الأساسية في وقت محدود", action: "استخدمت مهاراتي التنظيمية وقسمت العمل على مراحل واضحة", result: "أنهيت الميزة قبل الموعد بثلاثة أيام" }
  },
  {
    id: 4, category: "نقاط القوة",
    question: "ما الذي يميزك عن المتقدمين الآخرين؟",
    tip: "ابحث عن الوصف الوظيفي مسبقاً وركز على المهارات المطلوبة. أضف قيمة فريدة تحملها.",
  },
  {
    id: 5, category: "نقاط الضعف",
    question: "ما هي نقاط ضعفك؟",
    tip: "اختر نقطة ضعف حقيقية ولكن غير جوهرية للوظيفة، وأظهر كيف تعمل على تطويرها.",
    starExample: { situation: "لاحظت أنني أقضي وقتاً طويلاً في مراجعة العمل", task: "تحسين كفاءتي في التسليم", action: "تعلمت تقنيات إدارة الوقت ووضعت حدوداً زمنية لكل مرحلة", result: "خفضت وقت المراجعة بنسبة 40% دون التنازل عن الجودة" }
  },
  {
    id: 6, category: "سيناريوهات عملية",
    question: "صِف موقفاً واجهت فيه تحدياً صعباً في العمل وكيف تعاملت معه؟",
    tip: "استخدم تقنية STAR: الموقف ← المهمة ← الإجراء ← النتيجة. أذكر نتيجة قابلة للقياس.",
    starExample: { situation: "كنا نعمل على إطلاق منتج بموعد نهائي ضيق وانسحب أحد الأعضاء المهمين", task: "إكمال المشروع في الوقت المحدد رغم نقص الكادر", action: "أعدت توزيع المهام وتواصلت مع الإدارة لطلب دعم إضافي وعملت ساعات إضافية", result: "أطلقنا المنتج في الموعد وحصل على تقييم إيجابي من العملاء" }
  },
  {
    id: 7, category: "سيناريوهات عملية",
    question: "كيف تتعامل مع ضغط العمل والمواعيد النهائية؟",
    tip: "أذكر تقنيات محددة: الأولويات، قوائم المهام، التواصل الاستباقي مع الفريق.",
  },
  {
    id: 8, category: "سيناريوهات عملية",
    question: "أخبرني عن وقت اختلفت فيه مع مديرك، كيف تصرفت؟",
    tip: "أظهر احترافيتك: استمع أولاً، قدّم حججك بهدوء واحترام، وقبل القرار النهائي بمرونة.",
  },
  {
    id: 9, category: "الشركة والوظيفة",
    question: "لماذا تريد العمل في شركتنا تحديداً؟",
    tip: "ابحث عن الشركة قبل المقابلة: قيمها، مشاريعها، ثقافتها. أربط ذلك بأهدافك الشخصية.",
  },
  {
    id: 10, category: "الشركة والوظيفة",
    question: "أين ترى نفسك بعد 5 سنوات؟",
    tip: "اذكر طموحات واقعية مرتبطة بنمو الشركة. أظهر ولاءك وطموحك في آنٍ واحد.",
  },
  {
    id: 11, category: "الراتب والتفاوض",
    question: "ما هي توقعاتك الراتبية؟",
    tip: "ابحث عن رواتب السوق مسبقاً. أعطِ نطاقاً وليس رقماً واحداً، وأبدِ مرونتك.",
  },
  {
    id: 12, category: "الراتب والتفاوض",
    question: "هل لديك أسئلة تريد طرحها علينا؟",
    tip: "دائماً حضّر 3 أسئلة ذكية: عن الفريق، عن التطور المهني، عن المشاريع المستقبلية.",
  },
];

const CATEGORIES = ["الكل", ...Array.from(new Set(QUESTIONS.map(q => q.category)))];

export default function InterviewPage() {
  const [activeQ, setActiveQ] = useState<number | null>(null);
  const [cat, setCat] = useState("الكل");
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showStar, setShowStar] = useState<Record<number, boolean>>({});
  const [mode, setMode] = useState<"learn" | "practice">("learn");
  const [practiceIdx, setPracticeIdx] = useState(0);
  const [practiceAnswer, setPracticeAnswer] = useState("");
  const [practiceScore, setPracticeScore] = useState<null | number>(null);

  const filtered = QUESTIONS.filter(q => cat === "الكل" || q.category === cat);
  const practiceQuestions = QUESTIONS.filter(q => cat === "الكل" || q.category === cat);

  function toggleQ(id: number) {
    setActiveQ(prev => prev === id ? null : id);
  }

  function nextPractice() {
    if (practiceIdx < practiceQuestions.length - 1) {
      setPracticeIdx(i => i + 1);
      setPracticeAnswer("");
      setPracticeScore(null);
    }
  }
  function prevPractice() {
    if (practiceIdx > 0) {
      setPracticeIdx(i => i - 1);
      setPracticeAnswer("");
      setPracticeScore(null);
    }
  }

  function evaluateAnswer() {
    const ans = practiceAnswer.trim();
    if (!ans) { setPracticeScore(0); return; }
    let score = 0;
    if (ans.length > 50) score += 20;
    if (ans.length > 150) score += 20;
    const starWords = ["موقف", "مهمة", "قمت", "نتيجة", "أنجزت", "حققت", "situation", "task", "action", "result"];
    starWords.forEach(w => { if (ans.toLowerCase().includes(w)) score += 6; });
    if (score > 100) score = 100;
    setPracticeScore(Math.max(score, 10));
  }

  const currentPQ = practiceQuestions[practiceIdx];

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-surface border-b border-line sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
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
            <span className="text-primary text-sm font-semibold">التحضير للمقابلة</span>
          </div>
          <Link href="/dashboard" className="text-text-sub text-sm hover:text-primary">← الداشبورد</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-[#6C3483] to-[#512E5F] rounded-2xl p-6 md:p-8 mb-8 text-white">
          <div className="text-4xl mb-2">🎤</div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">التحضير للمقابلة</h1>
          <p className="text-white/80 text-sm mb-4">تدرّب على أكثر الأسئلة شيوعاً وتعلم تقنية STAR للإجابة باحتراف</p>
          <div className="grid grid-cols-3 gap-4 text-center mt-4">
            {[["12", "سؤال شائع"], ["4", "فئات"], ["STAR", "تقنية الإجابة"]].map(([n, l]) => (
              <div key={l} className="bg-surface/10 rounded-xl py-3">
                <div className="font-extrabold text-xl">{n}</div>
                <div className="text-white/70 text-xs">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mode Switcher */}
        <div className="flex gap-2 mb-6 bg-surface rounded-xl p-1 border border-line shadow-sm max-w-xs">
          <button onClick={() => setMode("learn")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              mode === "learn" ? "bg-[#6C3483] text-white shadow-sm" : "text-text-sub hover:text-primary"
            }`}>📚 تعلم</button>
          <button onClick={() => setMode("practice")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
              mode === "practice" ? "bg-[#6C3483] text-white shadow-sm" : "text-text-sub hover:text-primary"
            }`}>🎯 تدرّب</button>
        </div>

        {/* STAR Technique Box */}
        <div className="bg-gradient-to-r from-[#6C3483]/10 to-[#512E5F]/10 border border-[#6C3483]/20 rounded-2xl p-5 mb-6">
          <h2 className="font-extrabold text-[#6C3483] mb-3">✨ تقنية STAR للإجابة المثالية</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { letter: "S", title: "Situation", sub: "الموقف", desc: "صِف السياق والموقف الذي واجهته" },
              { letter: "T", title: "Task", sub: "المهمة", desc: "ما كانت مهمتك أو مسؤوليتك؟" },
              { letter: "A", title: "Action", sub: "الإجراء", desc: "ما الخطوات التي اتخذتها؟" },
              { letter: "R", title: "Result", sub: "النتيجة", desc: "ما النتيجة؟ أذكرها بالأرقام." },
            ].map(s => (
              <div key={s.letter} className="bg-surface rounded-xl p-3 text-center border border-[#6C3483]/10">
                <div className="w-9 h-9 bg-[#6C3483] text-white rounded-lg flex items-center justify-center font-extrabold text-lg mx-auto mb-2">{s.letter}</div>
                <div className="font-bold text-xs text-[#6C3483]">{s.title}</div>
                <div className="text-xs text-text-sub">{s.sub}</div>
                <div className="text-xs text-ink-subtle mt-1 leading-snug">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {mode === "learn" ? (
          <>
            {/* Category filter */}
            <div className="flex gap-2 mb-4 overflow-x-auto">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCat(c)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 whitespace-nowrap transition-all ${
                    cat === c ? "bg-[#6C3483] text-white border-[#6C3483]" : "bg-surface border-line text-text-sub hover:border-[#6C3483]"
                  }`}>{c}</button>
              ))}
            </div>

            {/* Questions */}
            <div className="space-y-3">
              {filtered.map(q => (
                <div key={q.id} className="bg-surface rounded-xl border border-line shadow-sm overflow-hidden">
                  <button onClick={() => toggleQ(q.id)}
                    className="w-full text-right p-4 flex items-center justify-between hover:bg-bg-soft transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-[#6C3483]/10 text-[#6C3483] rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0">{q.id}</span>
                      <div>
                        <div className="font-bold text-primary text-sm">{q.question}</div>
                        <span className="badge bg-purple-50 text-purple-700 text-xs">{q.category}</span>
                      </div>
                    </div>
                    <span className={`text-[#6C3483] transition-transform ${activeQ === q.id ? "rotate-180" : ""}`}>▼</span>
                  </button>

                  {activeQ === q.id && (
                    <div className="px-4 pb-4 border-t border-gray-50">
                      {/* Tip */}
                      <div className="bg-[#6C3483]/5 rounded-xl p-3 mt-3 mb-3">
                        <div className="text-xs font-bold text-[#6C3483] mb-1">💡 نصيحة الخبراء</div>
                        <p className="text-xs text-ink-muted leading-relaxed">{q.tip}</p>
                      </div>

                      {/* STAR Example */}
                      {q.starExample && (
                        <div>
                          <button onClick={() => setShowStar(prev => ({ ...prev, [q.id]: !prev[q.id] }))}
                            className="text-xs text-[#6C3483] font-semibold hover:underline mb-2">
                            {showStar[q.id] ? "▲ إخفاء" : "▼ شوف مثال بتقنية STAR"}
                          </button>
                          {showStar[q.id] && (
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {Object.entries(q.starExample).map(([key, val]) => (
                                <div key={key} className="bg-surface border border-[#6C3483]/20 rounded-lg p-2">
                                  <span className="font-bold text-[#6C3483] uppercase">{key}: </span>
                                  <span className="text-ink-muted">{val}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Practice area */}
                      <div className="mt-3">
                        <label className="text-xs font-semibold text-text-sub mb-1 block">✍️ اكتب إجابتك هنا للتدريب</label>
                        <textarea
                          className="w-full border border-line rounded-lg px-3 py-2 text-xs resize-none h-20 focus:outline-none focus:border-[#6C3483]"
                          value={answers[q.id] || ""}
                          onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                          placeholder="اكتب إجابتك هنا للتدرب..." />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          /* PRACTICE MODE */
          <div className="bg-surface rounded-2xl border border-line shadow-sm p-6">
            {currentPQ ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm text-text-sub">سؤال {practiceIdx + 1} من {practiceQuestions.length}</span>
                  <span className="badge bg-purple-50 text-purple-700 text-xs">{currentPQ.category}</span>
                </div>

                {/* Progress */}
                <div className="bg-bg-soft rounded-full h-2 mb-6">
                  <div className="bg-[#6C3483] rounded-full h-2 transition-all"
                    style={{ width: `${((practiceIdx + 1) / practiceQuestions.length) * 100}%` }} />
                </div>

                <div className="bg-gradient-to-r from-[#6C3483]/5 to-[#512E5F]/5 rounded-2xl p-5 mb-5">
                  <div className="text-lg font-extrabold text-primary mb-2">🎤 {currentPQ.question}</div>
                  <p className="text-xs text-text-sub">{currentPQ.tip}</p>
                </div>

                <div>
                  <label className="text-sm font-bold text-primary mb-2 block">إجابتك:</label>
                  <textarea
                    className="w-full border-2 border-line rounded-xl px-4 py-3 text-sm resize-none h-36 focus:outline-none focus:border-[#6C3483] transition-all"
                    value={practiceAnswer}
                    onChange={e => { setPracticeAnswer(e.target.value); setPracticeScore(null); }}
                    placeholder="اكتب إجابتك كاملة هنا. حاول استخدام تقنية STAR..." />
                </div>

                {practiceScore !== null && (
                  <div className={`mt-4 rounded-xl p-4 ${
                    practiceScore >= 70 ? "bg-green-50 border border-green-200" :
                    practiceScore >= 40 ? "bg-yellow-50 border border-yellow-200" :
                    "bg-red-50 border border-red-200"
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">
                        {practiceScore >= 70 ? "🏆" : practiceScore >= 40 ? "💪" : "📝"}
                      </span>
                      <div>
                        <div className="font-bold text-sm">
                          {practiceScore >= 70 ? "إجابة ممتازة!" : practiceScore >= 40 ? "إجابة جيدة — حسّنها أكثر" : "تحتاج لمزيد من التفصيل"}
                        </div>
                        <div className="text-xs text-text-sub">النتيجة: {practiceScore}/100</div>
                      </div>
                    </div>
                    <div className="bg-surface/60 rounded-lg h-3">
                      <div className={`h-3 rounded-lg transition-all ${
                        practiceScore >= 70 ? "bg-green-500" : practiceScore >= 40 ? "bg-yellow-500" : "bg-red-500"
                      }`} style={{ width: `${practiceScore}%` }} />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 mt-5">
                  <button onClick={prevPractice} disabled={practiceIdx === 0}
                    className="px-4 py-2.5 border-2 border-line rounded-xl text-sm font-bold text-text-sub hover:border-[#6C3483] hover:text-[#6C3483] transition-all disabled:opacity-30">
                    → السابق
                  </button>
                  {!practiceScore ? (
                    <button onClick={evaluateAnswer}
                      className="flex-1 bg-[#6C3483] text-white py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all">
                      تقييم إجابتي ✨
                    </button>
                  ) : (
                    <button onClick={nextPractice} disabled={practiceIdx === practiceQuestions.length - 1}
                      className="flex-1 bg-[#6C3483] text-white py-2.5 rounded-xl text-sm font-bold hover:opacity-90 transition-all disabled:opacity-30">
                      السؤال التالي ←
                    </button>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-extrabold text-primary text-xl mb-2">أنهيت جميع الأسئلة!</h3>
                <p className="text-text-sub text-sm">أنت الآن مستعد للمقابلة. حظاً موفقاً!</p>
                <button onClick={() => { setPracticeIdx(0); setPracticeAnswer(""); setPracticeScore(null); }}
                  className="mt-4 bg-[#6C3483] text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:opacity-90">
                  🔄 ابدأ من جديد
                </button>
              </div>
            )}
          </div>
        )}

        {/* Bottom tip */}
        <div className="mt-6 bg-gradient-to-r from-[#6C3483]/10 to-[#512E5F]/10 rounded-2xl p-5">
          <h3 className="font-bold text-[#6C3483] mb-2">🚀 نصائح ذهبية ليوم المقابلة</h3>
          <div className="grid md:grid-cols-2 gap-2 text-xs text-text-sub">
            {[
              "ابحث عن الشركة قبل المقابلة بيوم على الأقل",
              "النم جيداً ليلة المقابلة وتناول وجبة خفيفة",
              "احضر 15 دقيقة مبكراً ولا تصل متأخراً",
              "أحضر نسخاً من سيرتك الذاتية وقائمة مراجع",
              "أسأل أسئلة ذكية عن الشركة والفريق",
              "أرسل بريد شكر للمحاور بعد المقابلة بساعات",
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="text-[#6C3483] mt-0.5">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
