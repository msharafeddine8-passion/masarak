"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudentContext } from "@/context/StudentContext";
import { useI18n } from "@/lib/i18n";

const GRADES = ["ثانوي - الصف الأول", "ثانوي - الصف الثاني", "ثانوي - الصف الثالث", "جامعي - سنة 1", "جامعي - سنة 2", "جامعي - سنة 3", "جامعي - سنة 4", "خريج"];
const REGIONS = ["بيروت", "جبل لبنان", "الشمال", "الجنوب", "البقاع", "النبطية", "خارج لبنان"];
const INTERESTS = [
  { emoji: "💻", label: "تكنولوجيا وبرمجة" },
  { emoji: "🔬", label: "علوم وطب" },
  { emoji: "💼", label: "أعمال وريادة" },
  { emoji: "⚖️", label: "قانون وسياسة" },
  { emoji: "🎨", label: "فنون وتصميم" },
  { emoji: "📚", label: "آداب وتربية" },
  { emoji: "🏗️", label: "هندسة" },
  { emoji: "📊", label: "مالية واقتصاد" },
  { emoji: "🌿", label: "بيئة وزراعة" },
  { emoji: "🎭", label: "إعلام وإعلان" },
];
const GOALS = [
  { emoji: "🏛️", label: "جامعة محلية في لبنان" },
  { emoji: "✈️", label: "جامعة خارجية" },
  { emoji: "💼", label: "سوق العمل المحلي" },
  { emoji: "🌍", label: "العمل عن بُعد" },
];

// Quick DNA questions (5 only)
const QUICK_DNA = [
  { q: "ما الذي يجذبك أكثر؟", opts: ["حل مشاكل تقنية 💻", "مساعدة الناس 🤝", "إدارة مشاريع 📋", "الإبداع والفن 🎨"] },
  { q: "كيف تفضّل العمل؟", opts: ["منفرداً بعمق 🧘", "مع فريق صغير 👥", "أمام جمهور كبير 🎤", "في الطبيعة 🌿"] },
  { q: "ما أكثر مادة تستمتع بها؟", opts: ["الرياضيات والفيزياء", "البيولوجيا والكيمياء", "الاقتصاد والتاريخ", "الفنون والأدب"] },
  { q: "أي بيئة عمل تريدها؟", opts: ["شركة تكنولوجيا", "مستشفى أو عيادة", "شركة تجارية", "استوديو أو وكالة"] },
  { q: "ما هدفك بعد 10 سنوات؟", opts: ["مؤسس شركة ناشئة", "متخصص في مجالي", "قائد في منظمة", "فنان أو مبدع"] },
];

const DNA_MAP: Record<number, string[]> = {
  0: ["هندسة البرمجيات", "الذكاء الاصطناعي", "الأعمال", "الفنون الرقمية"],
  1: ["الهندسة", "الطب", "الطب والعلوم", "علم النبات"],
  2: ["إدارة الأعمال", "التمريض", "إدارة الأعمال", "الإعلام"],
  3: ["علوم الحاسوب", "الطب", "التسويق", "التصميم الإبداعي"],
};

export default function OnboardingPage() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const { setProfile, setCareerDNA } = useStudentContext();
  const [step, setStep] = useState(1);
  const [grade, setGrade] = useState("");
  const [school, setSchool] = useState("");
  const [region, setRegion] = useState("");
  const [gpa, setGpa] = useState(75);
  const [interests, setInterests] = useState<string[]>([]);
  const [goal, setGoal] = useState("");
  const [dnaAnswers, setDnaAnswers] = useState<number[]>([]);

  function toggleInterest(label: string) {
    setInterests(prev =>
      prev.includes(label) ? prev.filter(x => x !== label) : prev.length < 4 ? [...prev, label] : prev
    );
  }

  function computeDNA() {
    const counts: Record<string, number> = {};
    dnaAnswers.forEach((ans, qi) => {
      const path = DNA_MAP[ans]?.[qi % 4] || "هندسة";
      counts[path] = (counts[path] || 0) + 1;
    });
    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
    return { primary: sorted[0]?.[0] || "هندسة", secondary: sorted[1]?.[0] || "أعمال" };
  }

  function finish() {
    const { primary, secondary } = computeDNA();
    setProfile({ grade, school, region, gpa, interests, goal, onboardingDone: true });
    setCareerDNA({
      primaryPath: primary,
      secondaryPath: secondary,
      scores: {},
      takenAt: new Date().toISOString(),
    });
    router.push("/dashboard");
  }

  const totalSteps = 4;
  const pct = Math.round((step / totalSteps) * 100);

  return (
    <div dir={dir} className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-3xl shadow-xl w-full max-w-lg p-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-ink-subtle">{t('onb.step.of')} {step} / {totalSteps}</span>
            <span className="text-sm font-bold text-blue-600">{pct}%</span>
          </div>
          <div className="bg-bg-soft rounded-full h-2">
            <div className="bg-blue-600 rounded-full h-2 transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            {[t('onb.steps.basics'), t('onb.steps.interests'), t('onb.steps.dna'), t('onb.steps.ready')].map((label, i) => (
              <span key={i} className={`text-xs font-semibold ${step > i ? "text-blue-600" : "text-gray-300"}`}>{label}</span>
            ))}
          </div>
        </div>

        {/* ── Step 1: Basics ── */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-extrabold text-ink mb-2">{t('onb.s1.title')}</h2>
            <p className="text-ink-subtle text-sm mb-6">{t('onb.s1.subtitle')}</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-bold text-ink-muted block mb-2">{t('onb.s1.grade')}</label>
                <div className="grid grid-cols-2 gap-2">
                  {GRADES.map(g => (
                    <button key={g} onClick={() => setGrade(g)}
                      className={`p-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${grade === g ? "border-blue-500 bg-blue-50 text-blue-700" : "border-white/10 hover:border-blue-300"}`}>
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-ink-muted block mb-2">{t('onb.s1.school')}</label>
                <input value={school} onChange={e => setSchool(e.target.value)}
                  placeholder={t('onb.s1.school.placeholder')}
                  className="w-full border-2 border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-sm font-bold text-ink-muted block mb-2">{t('onb.s1.region')}</label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map(r => (
                    <button key={r} onClick={() => setRegion(r)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors ${region === r ? "border-green-500 bg-green-50 text-green-700" : "border-white/10 hover:border-green-300"}`}>
                      {r}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-ink-muted block mb-2">{t('onb.s1.gpa')} <strong>{gpa}%</strong></label>
                <input type="range" min={40} max={100} value={gpa} onChange={e => setGpa(+e.target.value)}
                  className="w-full accent-blue-600" />
                <div className="flex justify-between text-xs text-ink-subtle mt-1">
                  <span>40%</span><span>70%</span><span>100%</span>
                </div>
              </div>
            </div>
            <button onClick={() => setStep(2)} disabled={!grade || !region}
              className="mt-6 w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              {t('onb.next')}
            </button>
          </div>
        )}

        {/* ── Step 2: Interests ── */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-extrabold text-ink mb-2">{t('onb.s2.title')}</h2>
            <p className="text-ink-subtle text-sm mb-6">{t('onb.s2.subtitle')}</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              {INTERESTS.map(({ emoji, label }) => (
                <button key={label} onClick={() => toggleInterest(label)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${interests.includes(label) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-white/10 hover:border-blue-300 text-ink-muted"}`}>
                  <span className="text-xl">{emoji}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-ink-muted mb-3">{t('onb.s2.goal')}</p>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map(({ emoji, label }) => (
                  <button key={label} onClick={() => setGoal(label)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${goal === label ? "border-purple-500 bg-purple-50 text-purple-700" : "border-white/10 hover:border-purple-300 text-ink-muted"}`}>
                    <span className="text-lg">{emoji}</span>
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 border-2 border-white/10 text-ink-muted font-bold py-3 rounded-xl hover:bg-bg-soft">
                {t('onb.prev')}
              </button>
              <button onClick={() => setStep(3)} disabled={interests.length === 0 || !goal}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
                {t('onb.next')}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Quick DNA ── */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-extrabold text-ink mb-2">{t('onb.s3.title')}</h2>
            <p className="text-ink-subtle text-sm mb-6">{t('onb.s3.subtitle')}</p>
            <div className="space-y-5">
              {QUICK_DNA.map((item, qi) => (
                <div key={qi}>
                  <p className="font-bold text-ink-muted text-sm mb-2">{qi + 1}. {item.q}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {item.opts.map((opt, ai) => (
                      <button key={ai} onClick={() => {
                        const next = [...dnaAnswers];
                        next[qi] = ai;
                        setDnaAnswers(next);
                      }}
                        className={`p-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${dnaAnswers[qi] === ai ? "border-blue-500 bg-blue-50 text-blue-700" : "border-white/10 hover:border-blue-300 text-ink-muted"}`}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 border-2 border-white/10 text-ink-muted font-bold py-3 rounded-xl hover:bg-bg-soft">
                {t('onb.prev')}
              </button>
              <button onClick={() => setStep(4)} disabled={dnaAnswers.length < QUICK_DNA.length}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed">
                {t('onb.next')}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Ready ── */}
        {step === 4 && (() => {
          const { primary, secondary } = computeDNA();
          return (
            <div className="text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-extrabold text-ink mb-2">{t('onb.s4.title')}</h2>
              <p className="text-ink-subtle text-sm mb-6">{t('onb.s4.subtitle')}</p>
              <div className={`bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-5 mb-6 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">🥇</span>
                  <div>
                    <p className="text-xs text-ink-subtle">{t('onb.s4.primary')}</p>
                    <p className="font-extrabold text-blue-700 text-lg">{primary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🥈</span>
                  <div>
                    <p className="text-xs text-ink-subtle">{t('onb.s4.secondary')}</p>
                    <p className="font-bold text-purple-700">{secondary}</p>
                  </div>
                </div>
              </div>
              <div className={`bg-bg-soft rounded-2xl p-4 mb-6 ${dir === 'rtl' ? 'text-right' : 'text-left'} space-y-2`}>
                <p className="text-sm font-bold text-ink-muted">{t('onb.s4.next_steps')}</p>
                <p className="text-sm text-ink-muted">{t('onb.s4.action.1.1')} <strong>{primary}</strong></p>
                <p className="text-sm text-ink-muted">{t('onb.s4.action.2')}</p>
                <p className="text-sm text-ink-muted">{t('onb.s4.action.3')}</p>
              </div>
              <button onClick={finish}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-extrabold py-4 rounded-2xl text-lg hover:opacity-90 transition-opacity">
                {t('onb.s4.finish')}
              </button>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
