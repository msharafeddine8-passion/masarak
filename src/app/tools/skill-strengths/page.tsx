"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n, type TranslationKey } from "@/lib/i18n";

type Skill = "math" | "science" | "language" | "arts" | "social" | "tech" | "business" | "physical";

const SKILL_META: Record<Skill, { labelKey: string; emoji: string; color: string }> = {
  math: { labelKey: "skills.label.math", emoji: "🔢", color: "bg-blue-500" },
  science: { labelKey: "skills.label.science", emoji: "🔬", color: "bg-emerald-500" },
  language: { labelKey: "skills.label.language", emoji: "📝", color: "bg-purple-500" },
  arts: { labelKey: "skills.label.arts", emoji: "🎨", color: "bg-pink-500" },
  social: { labelKey: "skills.label.social", emoji: "🌍", color: "bg-amber-500" },
  tech: { labelKey: "skills.label.tech", emoji: "💻", color: "bg-indigo-500" },
  business: { labelKey: "skills.label.business", emoji: "📈", color: "bg-teal-500" },
  physical: { labelKey: "skills.label.physical", emoji: "⚽", color: "bg-red-500" },
};

const SKILL_CAREER_KEYS: Record<Skill, string[]> = {
  math: ["skills.career.math.0", "skills.career.math.1", "skills.career.math.2", "skills.career.math.3", "skills.career.math.4"],
  science: ["skills.career.science.0", "skills.career.science.1", "skills.career.science.2", "skills.career.science.3", "skills.career.science.4"],
  language: ["skills.career.language.0", "skills.career.language.1", "skills.career.language.2", "skills.career.language.3", "skills.career.language.4"],
  arts: ["skills.career.arts.0", "skills.career.arts.1", "skills.career.arts.2", "skills.career.arts.3", "skills.career.arts.4"],
  social: ["skills.career.social.0", "skills.career.social.1", "skills.career.social.2", "skills.career.social.3", "skills.career.social.4"],
  tech: ["skills.career.tech.0", "skills.career.tech.1", "skills.career.tech.2", "skills.career.tech.3", "skills.career.tech.4"],
  business: ["skills.career.business.0", "skills.career.business.1", "skills.career.business.2", "skills.career.business.3", "skills.career.business.4"],
  physical: ["skills.career.physical.0", "skills.career.physical.1", "skills.career.physical.2", "skills.career.physical.3", "skills.career.physical.4"],
};

interface Question {
  textKey: string;
  options: { labelKey: string; skill: Skill }[];
}

const QUESTIONS: Question[] = [
  {
    textKey: "skills.q0.text",
    options: [
      { labelKey: "skills.q0.opt0", skill: "math" },
      { labelKey: "skills.q0.opt1", skill: "science" },
      { labelKey: "skills.q0.opt2", skill: "language" },
      { labelKey: "skills.q0.opt3", skill: "arts" },
    ],
  },
  {
    textKey: "skills.q1.text",
    options: [
      { labelKey: "skills.q1.opt0", skill: "math" },
      { labelKey: "skills.q1.opt1", skill: "science" },
      { labelKey: "skills.q1.opt2", skill: "language" },
      { labelKey: "skills.q1.opt3", skill: "social" },
    ],
  },
  {
    textKey: "skills.q2.text",
    options: [
      { labelKey: "skills.q2.opt0", skill: "math" },
      { labelKey: "skills.q2.opt1", skill: "language" },
      { labelKey: "skills.q2.opt2", skill: "social" },
      { labelKey: "skills.q2.opt3", skill: "arts" },
    ],
  },
  {
    textKey: "skills.q3.text",
    options: [
      { labelKey: "skills.q3.opt0", skill: "tech" },
      { labelKey: "skills.q3.opt1", skill: "business" },
      { labelKey: "skills.q3.opt2", skill: "social" },
      { labelKey: "skills.q3.opt3", skill: "physical" },
    ],
  },
  {
    textKey: "skills.q4.text",
    options: [
      { labelKey: "skills.q4.opt0", skill: "math" },
      { labelKey: "skills.q4.opt1", skill: "language" },
      { labelKey: "skills.q4.opt2", skill: "arts" },
      { labelKey: "skills.q4.opt3", skill: "business" },
    ],
  },
  {
    textKey: "skills.q5.text",
    options: [
      { labelKey: "skills.q5.opt0", skill: "tech" },
      { labelKey: "skills.q5.opt1", skill: "arts" },
      { labelKey: "skills.q5.opt2", skill: "social" },
      { labelKey: "skills.q5.opt3", skill: "physical" },
    ],
  },
  {
    textKey: "skills.q6.text",
    options: [
      { labelKey: "skills.q6.opt0", skill: "tech" },
      { labelKey: "skills.q6.opt1", skill: "language" },
      { labelKey: "skills.q6.opt2", skill: "business" },
      { labelKey: "skills.q6.opt3", skill: "science" },
    ],
  },
  {
    textKey: "skills.q7.text",
    options: [
      { labelKey: "skills.q7.opt0", skill: "math" },
      { labelKey: "skills.q7.opt1", skill: "social" },
      { labelKey: "skills.q7.opt2", skill: "arts" },
      { labelKey: "skills.q7.opt3", skill: "physical" },
    ],
  },
  {
    textKey: "skills.q8.text",
    options: [
      { labelKey: "skills.q8.opt0", skill: "science" },
      { labelKey: "skills.q8.opt1", skill: "tech" },
      { labelKey: "skills.q8.opt2", skill: "business" },
      { labelKey: "skills.q8.opt3", skill: "language" },
    ],
  },
  {
    textKey: "skills.q9.text",
    options: [
      { labelKey: "skills.q9.opt0", skill: "tech" },
      { labelKey: "skills.q9.opt1", skill: "science" },
      { labelKey: "skills.q9.opt2", skill: "business" },
      { labelKey: "skills.q9.opt3", skill: "arts" },
    ],
  },
];

export default function SkillStrengthsPage() {
  const { t, dir } = useI18n();
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
      <main className="min-h-screen bg-bg py-12 px-4" dir={dir}>
        <div className="container mx-auto max-w-3xl">
          <div className="text-center mb-8">
            <div className="text-6xl mb-3">🎉</div>
            <h1 className="text-4xl font-extrabold text-primary mb-2">{t('skills.done.title')}</h1>
            <p className="text-ink-muted text-lg">{t('skills.done.subtitle')}</p>
          </div>

          {top3.map(([skill, score], idx) => (
            <div key={skill} className="bg-surface rounded-2xl border-2 border-line p-6 mb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-16 h-16 ${SKILL_META[skill].color} rounded-2xl flex items-center justify-center text-3xl`}>
                  {SKILL_META[skill].emoji}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-ink-subtle font-bold">{t('skills.rank')}{idx + 1}</div>
                  <h2 className="text-xl font-extrabold">{t(SKILL_META[skill].labelKey as TranslationKey)}</h2>
                  <div className="text-sm text-ink-muted mt-1">
                    {t('skills.score.1')} {score} {t('skills.score.2')} {QUESTIONS.length} ({Math.round((score / QUESTIONS.length) * 100)}%)
                  </div>
                </div>
              </div>
              <div className="border-t pt-3">
                <div className="text-sm font-semibold text-ink-muted mb-2">{t('skills.careers.suggested')}</div>
                <div className="flex flex-wrap gap-2">
                  {SKILL_CAREER_KEYS[skill].map((careerKey) => (
                    <span key={careerKey} className="text-xs bg-bg-soft text-ink px-3 py-1 rounded-full font-semibold">
                      {t(careerKey as TranslationKey)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}

          <div className="bg-primary/5 rounded-2xl p-6 mt-6 text-center">
            <h3 className="font-extrabold text-primary text-xl mb-2">{t('skills.next.title')}</h3>
            <p className="text-ink-muted text-sm mb-4">{t('skills.next.body')}</p>
            <div className="flex flex-wrap gap-2 justify-center">
              <Link href="/career-dna" className="bg-primary text-white px-5 py-2 rounded-xl font-bold text-sm">
                {t('skills.next.dna')}
              </Link>
              <Link href="/majors" className="border-2 border-primary text-primary px-5 py-2 rounded-xl font-bold text-sm">
                {t('skills.next.majors')}
              </Link>
              <button onClick={restart} className="border border-line px-5 py-2 rounded-xl font-bold text-sm text-ink-muted">
                {t('skills.next.restart')}
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const q = QUESTIONS[step];

  return (
    <main className="min-h-screen bg-bg py-12 px-4" dir={dir}>
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-sm text-ink-subtle hover:text-primary mb-2 inline-block">
            {t('skills.back')}
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary">
            {t('skills.title')}
          </h1>
          <p className="text-ink-muted mt-2">{t('skills.subtitle')}</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm text-ink-subtle mb-2">
            <span>{t('skills.q_of')} {step + 1} / {QUESTIONS.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 bg-bg-soft rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="bg-surface rounded-2xl border-2 border-line p-6 md:p-8">
          <h2 className="text-xl md:text-2xl font-bold mb-6">{t(q.textKey as TranslationKey)}</h2>
          <div className="space-y-3">
            {q.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => answer(opt.skill)}
                className="w-full text-right p-4 rounded-xl border-2 border-line hover:border-primary hover:bg-primary/5 font-semibold transition-all"
              >
                {t(opt.labelKey as TranslationKey)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
