"use client";

import { useState } from "react";
import Link from "next/link";

type Skill = "math" | "science" | "language" | "arts" | "social" | "tech" | "business" | "physical";

const SKILL_LABELS: Record<Skill, { label: string; emoji: string; color: string }> = {
  math: { label: "الرياضيات والمنطق", emoji: "🔢", color: "bg-blue-500" },
  science: { label: "العلوم والتجارب", emoji: "🔬", color: "bg-emerald-500" },
  language: { label: "اللغات والكتابة", emoji: "📝", color: "bg-purple-500" },
  arts: { label: "الفنون والإبداع", emoji: "🎨", color: "bg-pink-500" },
  social: { label: "العلوم الاجتماعية", emoji: "🌍", color: "bg-amber-500" },
  tech: { label: "التكنولوجيا والبرمجة", emoji: "💻", color: "bg-indigo-500" },
  business: { label: "الأعمال والمال", emoji: "📈", color: "bg-teal-500" },
  physical: { label: "الرياضة والحركة", emoji: "⚽", color: "bg-red-500" },
};

const SKILL_CAREERS: Record<Skill, string[]> = {
  math: ["مهندس", "محلل بيانات", "محاسب", "اقتصادي", "إحصائي"],
  science: ["طبيب", "صيدلي", "كيميائي", "بيولوجي", "باحث"],
  language: ["محرر", "مترجم", "صحفي", "كاتب", "أستاذ لغة"],
  arts: ["مصمم جرافيك", "مهندس معماري", "فنان", "مخرج", "موسيقي"],
  social: ["محامي", "صحفي", "أخصائي اجتماعي", "أستاذ تاريخ", "دبلوماسي"],
  tech: ["مهندس برمجيات", "مطوّر تطبيقات", "خبير أمن سيبراني", "مهندس AI", "DevOps"],
  business: ["رائد أعمال", "مدير تسويق", "محلل مالي", "مستشار", "مدير مبيعات"],
  physical: ["مدرّب لياقة", "أخصائي علاج طبيعي", "لاعب محترف", "مدرّب رياضي", "خبير تغذية"],
};

interface Question {
  text: string;
  options: { label: string; skill: Skill }[];
}

const QUESTIONS: Question[] = [
  {
    text: "وقت الفراغ، شو أكتر شي بتحبّ تعمل؟",
    options: [
      { label: "حلّ ألغاز رياضية أو ألعاب منطق", skill: "math" },
      { label: "تجارب علمية ومشاهدة وثائقيات", skill: "science" },
      { label: "قراءة قصص وكتب", skill: "language" },
      { label: "رسم أو موسيقى أو تصوير", skill: "arts" },
    ],
  },
  {
    text: "بالمدرسة، أيّ مادة بتحقّق فيها أعلى علامات؟",
    options: [
      { label: "رياضيات", skill: "math" },
      { label: "علوم (أحياء/فيزياء/كيمياء)", skill: "science" },
      { label: "لغة عربية أو إنجليزية أو فرنسية", skill: "language" },
      { label: "تاريخ وجغرافيا", skill: "social" },
    ],
  },
  {
    text: "إذا في مشكلة بيتك أو مدرستك، كيف بتحبّ تتعامل معها؟",
    options: [
      { label: "بحلّلها بالأرقام والمنطق", skill: "math" },
      { label: "بفكّر برحاء وأكتب شعور الكل", skill: "language" },
      { label: "بحضر الناس مع بعض وأتفاوض", skill: "social" },
      { label: "بصمّم حل مبدع", skill: "arts" },
    ],
  },
  {
    text: "شو أكتر نوع برامج بتشاهد على YouTube/TikTok؟",
    options: [
      { label: "تعليم برمجة وتكنولوجيا", skill: "tech" },
      { label: "كيف تربح فلوس / business tips", skill: "business" },
      { label: "تطوّر شخصي وقصص نجاح", skill: "social" },
      { label: "رياضة ولياقة", skill: "physical" },
    ],
  },
  {
    text: "إذا أعطيناك مشروع جماعي، شو دورك المفضّل؟",
    options: [
      { label: "أحلّل البيانات وأعمل الأبحاث", skill: "math" },
      { label: "أكتب التقرير وأعرضه", skill: "language" },
      { label: "أصمّم العروض والمواد البصرية", skill: "arts" },
      { label: "أنظّم الفريق وأقود المشروع", skill: "business" },
    ],
  },
  {
    text: "أيّ نشاط لاصفّي بتفضّل تشارك فيه؟",
    options: [
      { label: "نادي علوم/روبوتيك", skill: "tech" },
      { label: "نادي مسرح/موسيقى", skill: "arts" },
      { label: "MUN أو نادي مناظرات", skill: "social" },
      { label: "فريق رياضي", skill: "physical" },
    ],
  },
  {
    text: "إذا فينا نختار 3 مهارات بنا تتعلّمها مدى الحياة:",
    options: [
      { label: "البرمجة وتطوير التطبيقات", skill: "tech" },
      { label: "اللغات الأجنبية", skill: "language" },
      { label: "إدارة الأعمال والاستثمار", skill: "business" },
      { label: "العلوم الطبية", skill: "science" },
    ],
  },
  {
    text: "شو الشي يلي بيمكّنك أكتر إنجاز بيخلّيك تحس بسعادة كبيرة؟",
    options: [
      { label: "إيجاد حل لمشكلة معقّدة", skill: "math" },
      { label: "إقناع شخص بفكرة مهمة", skill: "social" },
      { label: "إبداع شي جديد بالكامل", skill: "arts" },
      { label: "تحقيق هدف صعب جسدياً", skill: "physical" },
    ],
  },
  {
    text: "إذا فينا نختار وظيفة الصيف، شو بتفضّل؟",
    options: [
      { label: "مساعد بمختبر علمي", skill: "science" },
      { label: "intern بشركة برمجة", skill: "tech" },
      { label: "مساعد بمحل تجاري", skill: "business" },
      { label: "مدرّس صفّ ثيف", skill: "language" },
    ],
  },
  {
    text: "بعد 10 سنين، شو بتشوف حالك؟",
    options: [
      { label: "بشركة تكنولوجيا كبيرة بالخليج/أمريكا", skill: "tech" },
      { label: "طبيب أو صيدلي بمستشفى محترم", skill: "science" },
      { label: "صاحب شركتي الخاصة", skill: "business" },
      { label: "فنان معروف أو معماري مبدع", skill: "arts" },
    ],
  },
];

export default function SkillStrengthsPage() {
  const [step, setStep] = useState(0);
  const [scores, setScores] = useState<Record<Skill, number>>({
    math: 0, science: 0, language: 0, arts: 0,
    social: 0, tech: 0, business: 0, physical: 0,
  });
  const [done, setDone] = useState(false);

  function answer(skill: Skill) {
    setScores((prev) => ({ ...prev, [skill]: prev[skill] + 1 }));
    if (step + 1 < QUESTIONS.length) {
      setStep(step + 1);
    } else {
      setDone(true);
    }
  }

  function restart() {
    setStep(0);
    setScores({ math: 0, science: 0, language: 0, arts: 0, social: 0, tech: 0, business: 0, physical: 0 });
    setDone(false);
  }

  const sortedSkills = (Object.entries(scores) as [Skill, number][])
    .filter(([, score]) => score > 0)
    .sort((a, b) => b[1] - a[1]);

  const top3 = sortedSkills.slice(0, 3);
  const progress = ((step + (done ? 1 : 0)) / QUESTIONS.length) * 100;

  if (done) {
    return (
      <main className="min-h-screen bg-bg py-12 px-4" dir="rtl">
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🎉</div>
            <h1 className="text-4xl font-extrabold text-primary mb-2">نتائجك جاهزة!</h1>
            <p className="text-gray-600 text-lg">هاي نقاط قوّتك الأكاديمية الـ 3 الأكبر</p>
          </div>

          {top3.map(([skill, score], idx) => (
            <div key={skill} className="bg-white rounded-2xl border-2 border-gray-200 p-6 mb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 ${SKILL_LABELS[skill].color} rounded-2xl flex items-center justify-center text-3xl`}>
                  {SKILL_LABELS[skill].emoji}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 font-bold">رقم #{idx + 1}</div>
                  <h2 className="text-xl font-extrabold">{SKILL_LABELS[skill].label}</h2>
                  <div className="text-sm text-gray-600 mt-1">
                    اخترت {score} من أصل {QUESTIONS.length} ({Math.round((score / QUESTIONS.length) * 100)}%)
                  </div>
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="text-sm font-semibold text-gray-700 mb-2">مهن مقترحة:</div>
                <div className="flex flex-wrap gap-2">
                  {SKILL_CAREERS[skill].map((career) => (
                    <span key={career} className="text-xs bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-semibold">
                      {career}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="bg-primary/5 rounded-2xl p-6 mt-6 text-center">
            <h3 className="font-extrabold text-primary text-xl mb-2">شو الخطوة التالية؟</h3>
            <p className="text-gray-700 text-sm mb-4">اعمل اختبار Career DNA الكامل أو شوف التخصصات المناسبة</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/career-dna" className="bg-primary text-white px-5 py-2 rounded-xl font-bold text-sm">
                اختبار Career DNA →
              </Link>
              <Link href="/majors" className="border-2 border-primary text-primary px-5 py-2 rounded-xl font-bold text-sm">
                التخصصات الجامعية →
              </Link>
              <button onClick={restart} className="border border-gray-300 px-5 py-2 rounded-xl font-bold text-sm text-gray-700">
                ↻ إعادة الاختبار
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const q = QUESTIONS[step];

  return (
    <main className="min-h-screen bg-bg py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
            ← العودة
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary">
            🎯 اكتشف نقاط قوّتك
          </h1>
          <p className="text-gray-600 mt-2">10 أسئلة سريعة، نتائج فورية</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>سؤال {step + 1} من {QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-6">{q.text}</h2>
          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => answer(opt.skill)}
                className="w-full text-right p-4 rounded-xl border-2 border-gray-200 hover:border-primary hover:bg-primary/5 font-semibold transition-all"
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
