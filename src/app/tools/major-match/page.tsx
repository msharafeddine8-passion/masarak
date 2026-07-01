"use client";
// Major-Match: a short RIASEC quiz that ranks Masarak's majors by fit and links
// to their /majors/[slug] career-map pages. Self-contained (uses the riasec field
// already on each major) — the bridge from "I don't know what to study" → a
// shortlist of real decision pages.
import { useState, useMemo } from "react";
import Link from "next/link";
import { MAJORS } from "@/app/majors/data";
import { useI18n, type TranslationKey } from "@/lib/i18n";

type Letter = "R" | "I" | "A" | "S" | "E" | "C";

const DIM_LABEL: Record<Letter, string> = {
  R: "mmatch.dimR",
  I: "mmatch.dimI",
  A: "mmatch.dimA",
  S: "mmatch.dimS",
  E: "mmatch.dimE",
  C: "mmatch.dimC",
};

const QUESTIONS: { q: string; dim: Letter }[] = [
  { q: "mmatch.q1", dim: "R" },
  { q: "mmatch.q2", dim: "R" },
  { q: "mmatch.q3", dim: "I" },
  { q: "mmatch.q4", dim: "I" },
  { q: "mmatch.q5", dim: "A" },
  { q: "mmatch.q6", dim: "A" },
  { q: "mmatch.q7", dim: "S" },
  { q: "mmatch.q8", dim: "S" },
  { q: "mmatch.q9", dim: "E" },
  { q: "mmatch.q10", dim: "E" },
  { q: "mmatch.q11", dim: "C" },
  { q: "mmatch.q12", dim: "C" },
];

const OPTIONS = [
  { label: "mmatch.optYes", val: 2 },
  { label: "mmatch.optSometimes", val: 1 },
  { label: "mmatch.optNo", val: 0 },
];

export default function MajorMatchPage() {
  const { t } = useI18n();
  const [answers, setAnswers] = useState<number[]>(Array(QUESTIONS.length).fill(-1));
  const [showResult, setShowResult] = useState(false);

  const answeredCount = answers.filter((a) => a >= 0).length;
  const allAnswered = answeredCount === QUESTIONS.length;

  const { topLetters, ranked } = useMemo(() => {
    const vec: Record<Letter, number> = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    QUESTIONS.forEach((q, i) => { if (answers[i] > 0) vec[q.dim] += answers[i]; });
    const topLetters = (Object.entries(vec) as [Letter, number][])
      .sort((a, b) => b[1] - a[1]).map(([l]) => l);

    const ranked = MAJORS.map((m) => {
      const letters = m.riasec.split("") as Letter[];
      const raw = letters.reduce((s, l) => s + (vec[l] || 0), 0);
      const max = letters.length * 4; // each letter has 2 questions × max 2
      const pct = max > 0 ? Math.round((raw / max) * 100) : 0;
      return { m, pct };
    }).sort((a, b) => b.pct - a.pct);

    return { topLetters, ranked };
  }, [answers]);

  function setAnswer(qi: number, val: number) {
    setAnswers((prev) => { const next = [...prev]; next[qi] = val; return next; });
  }
  function reset() { setAnswers(Array(QUESTIONS.length).fill(-1)); setShowResult(false); }

  return (
    <div dir="rtl" className="min-h-screen bg-bg">
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-hero rounded-3xl p-6 md:p-8 text-white shadow-floaty mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">🎯 {t('mmatch.heroTitle')}</h1>
          <p className="text-white/85">{t('mmatch.heroSub')}</p>
        </div>

        {!showResult ? (
          <>
            <div className="sticky top-0 z-10 bg-bg/90 backdrop-blur py-2 mb-2">
              <div className="flex justify-between text-xs text-ink-muted mb-1">
                <span>{t('mmatch.progress')}</span><span>{answeredCount}/{QUESTIONS.length}</span>
              </div>
              <div className="h-2 bg-bg-soft rounded-full overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${(answeredCount / QUESTIONS.length) * 100}%` }} />
              </div>
            </div>

            <div className="space-y-3">
              {QUESTIONS.map((q, i) => (
                <div key={i} className="bg-surface rounded-2xl border border-line p-4">
                  <p className="font-bold text-ink mb-3">{i + 1}. {t(q.q as TranslationKey)}</p>
                  <div className="flex gap-2 flex-wrap">
                    {OPTIONS.map((o) => (
                      <button key={o.val} onClick={() => setAnswer(i, o.val)}
                        className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-colors ${
                          answers[i] === o.val ? "bg-primary text-white border-primary" : "bg-bg-soft text-ink-muted border-line hover:border-primary/50"
                        }`}>
                        {t(o.label as TranslationKey)}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button disabled={!allAnswered} onClick={() => setShowResult(true)}
              className="mt-5 w-full py-3.5 rounded-2xl bg-primary text-white font-extrabold text-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed">
              {allAnswered ? `🔍 ${t('mmatch.showResults')}` : `${t('mmatch.answerAll')} (${answeredCount}/${QUESTIONS.length})`}
            </button>
          </>
        ) : (
          <>
            <div className="bg-surface rounded-2xl border border-line p-5 mb-5">
              <h2 className="font-extrabold text-lg mb-2">🧬 {t('mmatch.strongestTraits')}</h2>
              <div className="flex gap-2 flex-wrap">
                {topLetters.slice(0, 3).map((l) => (
                  <span key={l} className="px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-sm border border-blue-200">{t(DIM_LABEL[l] as TranslationKey)}</span>
                ))}
              </div>
              <p className="text-xs text-ink-muted mt-3">{t('mmatch.deeperAnalysis')} <Link href="/career-dna" className="text-primary font-bold underline">{t('mmatch.careerDnaTest')}</Link>.</p>
            </div>

            <h2 className="font-extrabold text-lg mb-3">✨ {t('mmatch.bestMajors')}</h2>
            <div className="space-y-3">
              {ranked.slice(0, 6).map(({ m, pct }) => (
                <Link key={m.slug} href={`/majors/${m.slug}`}
                  className="flex items-center gap-4 bg-surface rounded-2xl border border-line p-4 hover:border-primary/40 hover:shadow-md transition-all">
                  <span className="text-4xl shrink-0">{m.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-ink">{m.name}</div>
                    <div className="text-xs text-ink-muted">{m.category}</div>
                    <div className="mt-2 h-2 bg-bg-soft rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary to-mint" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                  <div className="text-left shrink-0">
                    <div className="font-extrabold text-primary text-lg">{pct}%</div>
                    <div className="text-[10px] text-ink-muted">{t('mmatch.fit')}</div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-5 flex gap-2 flex-wrap">
              <button onClick={reset} className="flex-1 py-3 rounded-2xl bg-surface border-2 border-line font-bold hover:border-primary">🔄 {t('mmatch.retake')}</button>
              <Link href="/majors" className="flex-1 text-center py-3 rounded-2xl bg-primary text-white font-bold hover:bg-primary-dark">{t('mmatch.browseAll')}</Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
