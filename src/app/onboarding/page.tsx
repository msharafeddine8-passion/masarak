"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useStudentContext } from "@/context/StudentContext";
import { useI18n, type TranslationKey } from "@/lib/i18n";

// value = stored/compared string (do NOT translate); key = visible label translation key.
const GRADES = [
  { value: "ثانوي - الصف الأول", key: "onb.grade.hs1" },
  { value: "ثانوي - الصف الثاني", key: "onb.grade.hs2" },
  { value: "ثانوي - الصف الثالث", key: "onb.grade.hs3" },
  { value: "جامعي - سنة 1", key: "onb.grade.uni1" },
  { value: "جامعي - سنة 2", key: "onb.grade.uni2" },
  { value: "جامعي - سنة 3", key: "onb.grade.uni3" },
  { value: "جامعي - سنة 4", key: "onb.grade.uni4" },
  { value: "خريج", key: "onb.grade.grad" },
];
// Country of residence — the platform serves the whole Arab world, not just Lebanon.
const REGIONS = [
  { value: "لبنان", key: "onb.region.lb" },
  { value: "السعودية", key: "onb.region.sa" },
  { value: "الإمارات", key: "onb.region.ae" },
  { value: "مصر", key: "onb.region.eg" },
  { value: "الأردن", key: "onb.region.jo" },
  { value: "قطر", key: "onb.region.qa" },
  { value: "الكويت", key: "onb.region.kw" },
  { value: "البحرين", key: "onb.region.bh" },
  { value: "عُمان", key: "onb.region.om" },
  { value: "العراق", key: "onb.region.iq" },
  { value: "سوريا", key: "onb.region.sy" },
  { value: "فلسطين", key: "onb.region.ps" },
  { value: "المغرب", key: "onb.region.ma" },
  { value: "الجزائر", key: "onb.region.dz" },
  { value: "تونس", key: "onb.region.tn" },
  { value: "أخرى", key: "onb.region.other" },
];
const INTERESTS = [
  { emoji: "💻", value: "تكنولوجيا وبرمجة", key: "onb.interest.tech" },
  { emoji: "🔬", value: "علوم وطب", key: "onb.interest.science" },
  { emoji: "💼", value: "أعمال وريادة", key: "onb.interest.business" },
  { emoji: "⚖️", value: "قانون وسياسة", key: "onb.interest.law" },
  { emoji: "🎨", value: "فنون وتصميم", key: "onb.interest.arts" },
  { emoji: "📚", value: "آداب وتربية", key: "onb.interest.humanities" },
  { emoji: "🏗️", value: "هندسة", key: "onb.interest.engineering" },
  { emoji: "📊", value: "مالية واقتصاد", key: "onb.interest.finance" },
  { emoji: "🌿", value: "بيئة وزراعة", key: "onb.interest.environment" },
  { emoji: "🎭", value: "إعلام وإعلان", key: "onb.interest.media" },
];
const GOALS = [
  { emoji: "🏛️", value: "جامعة محلية في بلدي", key: "onb.goal.local_uni" },
  { emoji: "✈️", value: "جامعة خارجية", key: "onb.goal.abroad_uni" },
  { emoji: "💼", value: "سوق العمل المحلي", key: "onb.goal.local_job" },
  { emoji: "🌍", value: "العمل عن بُعد", key: "onb.goal.remote" },
];

// Quick DNA questions (5 only). q/opts are display-only (answers stored as indices).
const QUICK_DNA = [
  { qKey: "onb.dna.q1", optKeys: ["onb.dna.q1.o1", "onb.dna.q1.o2", "onb.dna.q1.o3", "onb.dna.q1.o4"] },
  { qKey: "onb.dna.q2", optKeys: ["onb.dna.q2.o1", "onb.dna.q2.o2", "onb.dna.q2.o3", "onb.dna.q2.o4"] },
  { qKey: "onb.dna.q3", optKeys: ["onb.dna.q3.o1", "onb.dna.q3.o2", "onb.dna.q3.o3", "onb.dna.q3.o4"] },
  { qKey: "onb.dna.q4", optKeys: ["onb.dna.q4.o1", "onb.dna.q4.o2", "onb.dna.q4.o3", "onb.dna.q4.o4"] },
  { qKey: "onb.dna.q5", optKeys: ["onb.dna.q5.o1", "onb.dna.q5.o2", "onb.dna.q5.o3", "onb.dna.q5.o4"] },
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
                    <button key={g.value} onClick={() => setGrade(g.value)}
                      className={`p-2.5 rounded-xl text-sm font-semibold border-2 transition-colors ${grade === g.value ? "border-blue-500 bg-blue-50 text-blue-700" : "border-line hover:border-blue-300"}`}>
                      {t(g.key as TranslationKey)}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-bold text-ink-muted block mb-2">{t('onb.s1.school')}</label>
                <input value={school} onChange={e => setSchool(e.target.value)}
                  placeholder={t('onb.s1.school.placeholder')}
                  className="w-full border-2 border-line rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="text-sm font-bold text-ink-muted block mb-2">{t('onb.s1.region')}</label>
                <div className="flex flex-wrap gap-2">
                  {REGIONS.map(r => (
                    <button key={r.value} onClick={() => setRegion(r.value)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors ${region === r.value ? "border-green-500 bg-green-50 text-green-700" : "border-line hover:border-green-300"}`}>
                      {t(r.key as TranslationKey)}
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
              {INTERESTS.map(({ emoji, value, key }) => (
                <button key={value} onClick={() => toggleInterest(value)}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${interests.includes(value) ? "border-blue-500 bg-blue-50 text-blue-700" : "border-line hover:border-blue-300 text-ink-muted"}`}>
                  <span className="text-xl">{emoji}</span>
                  <span>{t(key as TranslationKey)}</span>
                </button>
              ))}
            </div>
            <div>
              <p className="text-sm font-bold text-ink-muted mb-3">{t('onb.s2.goal')}</p>
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map(({ emoji, value, key }) => (
                  <button key={value} onClick={() => setGoal(value)}
                    className={`flex items-center gap-2 p-3 rounded-xl border-2 font-semibold text-sm transition-all ${goal === value ? "border-purple-500 bg-purple-50 text-purple-700" : "border-line hover:border-purple-300 text-ink-muted"}`}>
                    <span className="text-lg">{emoji}</span>
                    <span className="text-xs">{t(key as TranslationKey)}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 border-2 border-line text-ink-muted font-bold py-3 rounded-xl hover:bg-bg-soft">
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
                  <p className="font-bold text-ink-muted text-sm mb-2">{qi + 1}. {t(item.qKey as TranslationKey)}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {item.optKeys.map((optKey, ai) => (
                      <button key={ai} onClick={() => {
                        const next = [...dnaAnswers];
                        next[qi] = ai;
                        setDnaAnswers(next);
                      }}
                        className={`p-2.5 rounded-xl text-xs font-semibold border-2 transition-all ${dnaAnswers[qi] === ai ? "border-blue-500 bg-blue-50 text-blue-700" : "border-line hover:border-blue-300 text-ink-muted"}`}>
                        {t(optKey as TranslationKey)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 border-2 border-line text-ink-muted font-bold py-3 rounded-xl hover:bg-bg-soft">
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
