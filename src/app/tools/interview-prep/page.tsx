"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useI18n, type TranslationKey } from "@/lib/i18n";

type Category = "behavioral" | "technical" | "personal" | "lebanese";

// UI copy stored as i18n key strings; resolved via t() at render.
const QUESTIONS: Record<Category, { q: TranslationKey; tip: TranslationKey }[]> = {
  behavioral: [
    { q: "iprep.q.behavioral.1.q", tip: "iprep.q.behavioral.1.tip" },
    { q: "iprep.q.behavioral.2.q", tip: "iprep.q.behavioral.2.tip" },
    { q: "iprep.q.behavioral.3.q", tip: "iprep.q.behavioral.3.tip" },
    { q: "iprep.q.behavioral.4.q", tip: "iprep.q.behavioral.4.tip" },
    { q: "iprep.q.behavioral.5.q", tip: "iprep.q.behavioral.5.tip" },
    { q: "iprep.q.behavioral.6.q", tip: "iprep.q.behavioral.6.tip" },
  ],
  technical: [
    { q: "iprep.q.technical.1.q", tip: "iprep.q.technical.1.tip" },
    { q: "iprep.q.technical.2.q", tip: "iprep.q.technical.2.tip" },
    { q: "iprep.q.technical.3.q", tip: "iprep.q.technical.3.tip" },
    { q: "iprep.q.technical.4.q", tip: "iprep.q.technical.4.tip" },
    { q: "iprep.q.technical.5.q", tip: "iprep.q.technical.5.tip" },
  ],
  personal: [
    { q: "iprep.q.personal.1.q", tip: "iprep.q.personal.1.tip" },
    { q: "iprep.q.personal.2.q", tip: "iprep.q.personal.2.tip" },
    { q: "iprep.q.personal.3.q", tip: "iprep.q.personal.3.tip" },
    { q: "iprep.q.personal.4.q", tip: "iprep.q.personal.4.tip" },
    { q: "iprep.q.personal.5.q", tip: "iprep.q.personal.5.tip" },
    { q: "iprep.q.personal.6.q", tip: "iprep.q.personal.6.tip" },
  ],
  lebanese: [
    { q: "iprep.q.lebanese.1.q", tip: "iprep.q.lebanese.1.tip" },
    { q: "iprep.q.lebanese.2.q", tip: "iprep.q.lebanese.2.tip" },
    { q: "iprep.q.lebanese.3.q", tip: "iprep.q.lebanese.3.tip" },
    { q: "iprep.q.lebanese.4.q", tip: "iprep.q.lebanese.4.tip" },
  ],
};

const TIME_PER_QUESTION = 120; // 2 minutes

export default function InterviewPrepPage() {
  const { t, dir } = useI18n();
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
    <main className="min-h-screen bg-bg py-12 px-4" dir={dir}>
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <Link href="/" className="text-sm text-ink-subtle hover:text-primary mb-2 inline-block">
            {t('g.back')}
          </Link>
          <h1 className="text-4xl font-extrabold text-primary">{t('iv.title')}</h1>
          <p className="text-ink-muted mt-2">{t('iv.subtitle')}</p>
        </div>

        {/* Stats */}
        <div className="bg-surface rounded-2xl border border-line p-4 mb-6 flex justify-between items-center">
          <div>
            <div className="text-xs text-ink-subtle">{t('iv.stat.answered')}</div>
            <div className="text-2xl font-extrabold text-primary">{completedCount}</div>
          </div>
          <div>
            <div className="text-xs text-ink-subtle">{t('iv.stat.current_cat')}</div>
            <div className="text-sm font-bold">{currentIdx + 1} / {QUESTIONS[category].length}</div>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
          {([
            { key: "personal"   as Category, labelKey: "iv.cat.personal"   as TranslationKey, emoji: "👤" },
            { key: "behavioral" as Category, labelKey: "iv.cat.behavioral" as TranslationKey, emoji: "🤝" },
            { key: "technical"  as Category, labelKey: "iv.cat.technical"  as TranslationKey, emoji: "💻" },
            { key: "lebanese"   as Category, labelKey: "iv.cat.lebanese"   as TranslationKey, emoji: "🇱🇧" },
          ]).map((c) => (
            <button
              key={c.key}
              onClick={() => changeCategory(c.key)}
              className={`p-3 rounded-xl border-2 text-sm font-semibold ${
                category === c.key ? "border-primary bg-primary/5" : "border-line"
              }`}
            >
              {c.emoji} {t(c.labelKey)}
            </button>
          ))}
        </div>

        {/* Question */}
        <div className="bg-surface rounded-2xl border-2 border-line p-6 md:p-8 mb-4">
          <div className="text-xs text-ink-subtle mb-2">{t('iv.question_label')} {currentIdx + 1}</div>
          <h2 className="text-xl md:text-2xl font-bold leading-relaxed mb-6">
            {t(current.q)}
          </h2>

          {/* Timer */}
          <div className="text-center mb-6">
            <div className={`text-6xl font-mono font-extrabold ${timerColor} mb-2`}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div className="text-xs text-ink-subtle">
              {running ? t('iv.timer.running') : timeLeft === 0 ? t('iv.timer.done') : t('iv.timer.start_hint')}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            {!running && timeLeft === TIME_PER_QUESTION && (
              <button
                onClick={startTimer}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold hover:opacity-90"
              >
                {t('iv.btn.start')}
              </button>
            )}
            {running && (
              <button
                onClick={() => setRunning(false)}
                className="flex-1 bg-amber-500 text-white px-6 py-3 rounded-xl font-bold"
              >
                {t('iv.btn.pause')}
              </button>
            )}
            {!running && timeLeft < TIME_PER_QUESTION && timeLeft > 0 && (
              <button
                onClick={() => setRunning(true)}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold"
              >
                {t('iv.btn.resume')}
              </button>
            )}
            <button
              onClick={() => setShowTip(!showTip)}
              className="px-6 py-3 border-2 border-primary text-primary rounded-xl font-bold"
            >
              {showTip ? t('iv.btn.hide_tip') : t('iv.btn.tip')}
            </button>
            <button
              onClick={nextQuestion}
              className="px-6 py-3 border-2 border-line rounded-xl font-bold text-ink-muted"
            >
              {t('iv.btn.next')}
            </button>
          </div>

          {showTip && (
            <div className="mt-6 bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
              <div className="font-bold text-amber-900 text-sm mb-1">{t('iv.tip.label')}</div>
              <p className="text-sm text-amber-900">{t(current.tip)}</p>
            </div>
          )}
        </div>

        {/* General Tips */}
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-5">
          <div className="font-bold text-emerald-900 mb-2">{t('iv.gold.title')}</div>
          <ul className={`text-sm text-emerald-900 space-y-1.5 list-disc ${dir === 'rtl' ? 'pr-5' : 'pl-5'}`}>
            {(['iv.gold.1','iv.gold.2','iv.gold.3','iv.gold.4','iv.gold.5','iv.gold.6'] as TranslationKey[]).map(k => (
              <li key={k}>{t(k)}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}
