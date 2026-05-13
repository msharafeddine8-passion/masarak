"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

type Category = "behavioral" | "technical" | "personal" | "lebanese";

const QUESTIONS: Record<Category, { q: string; tip: string }[]> = {
  behavioral: [
    { q: "احكِ عن موقف واجهت فيه تحدّياً صعباً وكيف تجاوزته.", tip: "استخدم تقنية STAR: Situation, Task, Action, Result." },
    { q: "كيف بتتعامل مع زميل صعب بالعمل؟", tip: "ركّز على الحل، مش على الشكوى. اظهر النضج." },
    { q: "احكِ عن مشروع جماعي قدت فيه فريق.", tip: "اذكر دورك بدقة، وأبرز نتائج ملموسة." },
    { q: "كيف بتدير وقتك بين أمور كثيرة؟", tip: "اذكر أدوات (Notion, Trello) وتقنيات (Pomodoro)." },
    { q: "احكِ عن فشل واجهته وشو تعلّمت منه.", tip: "اختر فشل حقيقي بس صغير، وركّز على التعلّم." },
    { q: "كيف بتتلقّى الانتقاد؟", tip: "اظهر التواضع وقابلية التحسّن." },
  ],
  technical: [
    { q: "شو أكتر مهارة تقنية بتحقّق فيها؟ احكِ عنها.", tip: "اعطِ مثال محدّد ومشروع تطبيقي." },
    { q: "كيف بتتعلّم تقنية جديدة؟", tip: "اذكر مصادر (Coursera, YouTube, Documentation)." },
    { q: "شو أصعب مشكلة تقنية حلّيتها؟", tip: "وضّح المشكلة، النهج، والحل." },
    { q: "احكِ عن أحدث مشروع شخصي/جامعي قمت فيه.", tip: "ركّز على التحديات والتقنيات المستخدمة." },
    { q: "إذا الكود تبعك ما اشتغل، شو خطواتك؟", tip: "Debug systematically: read error → check logic → test." },
  ],
  personal: [
    { q: "احكِ عن نفسك بـ 60 ثانية.", tip: "خلفية + تخصص + ما يميّزك + هدفك. اوقف بـ60 ثانية فعلاً." },
    { q: "ليش بدّك تعمل بهالشركة/تدرس بهالجامعة تحديداً؟", tip: "ابحث عنها مسبقاً، اذكر شي معيّن يميّزها." },
    { q: "وين بتشوف نفسك بعد 5 سنين؟", tip: "كن طموحاً بس واقعياً. اربط طموحك بالشركة/الجامعة." },
    { q: "شو نقاط ضعفك؟", tip: "اختر نقطة حقيقية وأظهر كيف بتشتغل عليها." },
    { q: "ليش بدّنا نختارك من بين كل المتقدّمين؟", tip: "ركّز على القيمة المضافة، مش على نفسك فقط." },
    { q: "شو إنجاز تفتخر فيه؟", tip: "اختر إنجاز يربط بالدور المطلوب." },
  ],
  lebanese: [
    { q: "كيف بتشوف الوضع الاقتصادي بلبنان وتأثيره على مستقبلك؟", tip: "كن متفائل ولكن واقعي. اظهر مرونة." },
    { q: "هل بتفكّر تهاجر بعد التخرّج؟", tip: "إجابة دبلوماسية: مفتوح للفرص بس ملتزم بلبنان." },
    { q: "ليش اخترت تدرس بلبنان مش بالخارج؟", tip: "اذكر جودة التعليم اللبناني، الجذور العائلية، التكلفة." },
    { q: "كيف بتتعامل مع الكهرباء/الإنترنت بلبنان؟", tip: "اظهر التكيّف: backup plans، UPS، إلخ." },
  ],
};

const TIME_PER_QUESTION = 120; // 2 minutes

export default function InterviewPrepPage() {
  const [category, setCategory] = useState<Category>("personal");
  const [currentIdx, setCurrentIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [running, setRunning] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    if (!running || timeLeft <= 0) return;
    const t = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(t);
  }, [running, timeLeft]);

  function startTimer() {
    setTimeLeft(TIME_PER_QUESTION);
    setRunning(true);
    setShowTip(false);
  }

  function nextQuestion() {
    setRunning(false);
    setShowTip(false);
    setCompletedCount((c) => c + 1);
    const list = QUESTIONS[category];
    setCurrentIdx((idx) => (idx + 1) % list.length);
    setTimeLeft(TIME_PER_QUESTION);
  }

  function changeCategory(c: Category) {
    setCategory(c);
    setCurrentIdx(0);
    setRunning(false);
    setShowTip(false);
    setTimeLeft(TIME_PER_QUESTION);
  }

  const current = QUESTIONS[category][currentIdx];
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerColor = timeLeft > 60 ? "text-emerald-600" : timeLeft > 30 ? "text-amber-600" : "text-red-600";

  return (
    <main className="min-h-screen bg-bg py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
            ← العودة
          </Link>
          <h1 className="text-4xl font-extrabold text-primary">🎤 تدريب المقابلات</h1>
          <p className="text-gray-600 mt-2">تدرّب على أسئلة المقابلات الشائعة بسهولة</p>
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl border border-gray-200 p-4 mb-6 flex justify-between items-center">
          <div>
            <div className="text-xs text-gray-500">الأسئلة المُجابة</div>
            <div className="text-2xl font-extrabold text-primary">{completedCount}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">الفئة الحالية</div>
            <div className="text-sm font-bold">{currentIdx + 1} / {QUESTIONS[category].length}</div>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {([
            { key: "personal" as Category, label: "شخصية", emoji: "👤" },
            { key: "behavioral" as Category, label: "سلوكية", emoji: "🤝" },
            { key: "technical" as Category, label: "تقنية", emoji: "💻" },
            { key: "lebanese" as Category, label: "لبنانية", emoji: "🇱🇧" },
          ]).map((c) => (
            <button
              key={c.key}
              onClick={() => changeCategory(c.key)}
              className={`p-3 rounded-xl border-2 text-sm font-semibold ${
                category === c.key ? "border-primary bg-primary/5" : "border-gray-200"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* Question */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 md:p-8 mb-4">
          <div className="text-xs text-gray-500 mb-2">السؤال {currentIdx + 1}</div>
          <h2 className="text-xl md:text-2xl font-bold leading-relaxed mb-6">
            {current.q}
          </h2>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className={`text-6xl font-mono font-extrabold ${timerColor} mb-2`}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div className="text-xs text-gray-500">
              {running ? "⏰ الوقت يجري..." : timeLeft === 0 ? "انتهى الوقت!" : "اضغط ابدأ لتسجيل وقتك"}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!running && timeLeft === TIME_PER_QUESTION && (
              <button
                onClick={startTimer}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90"
              >
                ▶️ ابدأ الإجابة (2 دقيقة)
              </button>
            )}
            {running && (
              <button
                onClick={() => setRunning(false)}
                className="flex-1 bg-amber-500 text-white px-6 py-3 rounded-xl font-bold"
              >
                ⏸️ توقّف
              </button>
            )}
            {!running && timeLeft < TIME_PER_QUESTION && timeLeft > 0 && (
              <button
                onClick={() => setRunning(true)}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold"
              >
                ▶️ متابعة
              </button>
            )}
            <button
              onClick={() => setShowTip(!showTip)}
              className="px-6 py-3 border-2 border-primary text-primary rounded-xl font-bold"
            >
              💡 {showTip ? "إخفاء" : "نصيحة"}
            </button>
            <button
              onClick={nextQuestion}
              className="px-6 py-3 border-2 border-gray-300 rounded-xl font-bold text-gray-700"
            >
              السؤال التالي ←
            </button>
          </div>

          {showTip && (
            <div className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <div className="font-bold text-amber-900 text-sm mb-1">💡 نصيحة</div>
              <p className="text-sm text-amber-900">{current.tip}</p>
            </div>
          )}
        </div>

        {/* General Tips */}
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
          <div className="font-bold text-emerald-900 mb-2">🎯 نصائح ذهبية للمقابلة</div>
          <ul className="text-sm text-emerald-900 space-y-1.5 list-disc pr-5">
            <li>اوصل قبل 10 دقائق على الأقل</li>
            <li>ابحث عن الشركة/الجامعة قبل المقابلة</li>
            <li>ارتدِ ملابس مناسبة (smart casual أو formal)</li>
            <li>اطرح أسئلة بنهاية المقابلة (يبيّن اهتمامك)</li>
            <li>ابعت Thank You email بعد المقابلة</li>
            <li>كن صادق — التظاهر يظهر بسرعة</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
