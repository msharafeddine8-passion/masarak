'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useI18n, type TranslationKey } from '@/lib/i18n';

interface Question {
  id: number;
  subject: string;
  language: 'en' | 'ar';
  stem: string;
  options: string[];
  hints?: string[];
  // Interactive memory games: flash `memory_show` for `memory_seconds`, then hide
  // it and ask `stem` (normal MCQ). 'mcq' (default) skips the memorize phase.
  question_type?: string;
  memory_show?: string | null;
  memory_seconds?: number | null;
}

function QuizPlayInner() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('session');
  const { t, dir } = useI18n();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState<{
    wasCorrect: boolean; correctIndex: number; explanation: string; xp: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [questionStart, setQuestionStart] = useState(Date.now());
  const [usedHint, setUsedHint] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  // Memory-game "memorize" phase: true while the content is flashed, counting down.
  const [memorizing, setMemorizing] = useState(false);
  const [memoLeft, setMemoLeft] = useState(0);
  // Category labels (subject code → Arabic name + icon) so the badge shows the
  // real category, not a hardcoded "science" fallback for the 40+ categories.
  const [cats, setCats] = useState<Record<string, { name: string; icon: string }>>({});

  useEffect(() => {
    if (!sessionId) { router.push('/quiz/today'); return; }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const res = await fetch('/api/quiz/today');
      const data = await res.json();
      if (!data.questions) {
        router.push('/quiz/today');
        return;
      }
      setQuestions(data.questions);
      setQuestionStart(Date.now());
      setLoading(false);

      // Load category display names once (small table) for accurate badges.
      const { data: catRows } = await supabase.from('quiz_categories').select('code, name_ar, icon');
      if (catRows) {
        const m: Record<string, { name: string; icon: string }> = {};
        for (const c of catRows as { code: string; name_ar: string; icon: string | null }[]) {
          m[c.code] = { name: c.name_ar, icon: c.icon || '' };
        }
        setCats(m);
      }
    })();
  }, [sessionId, router]);

  const currentQ = questions[index];
  const isLast = index === questions.length - 1;

  // Memory games: when the question changes, enter the "memorize" phase for
  // memory-type questions (flash content → countdown → hide → ask). MCQ skips it.
  useEffect(() => {
    const q = questions[index];
    if (q && q.question_type === 'memory' && q.memory_show) {
      setMemorizing(true);
      setMemoLeft(Math.max(2, q.memory_seconds ?? 4));
    } else {
      setMemorizing(false);
    }
  }, [index, questions]);

  useEffect(() => {
    if (!memorizing) return;
    if (memoLeft <= 0) { setMemorizing(false); setQuestionStart(Date.now()); return; }
    const id = setTimeout(() => setMemoLeft((n) => n - 1), 1000);
    return () => clearTimeout(id);
  }, [memorizing, memoLeft]);

  // Reveal early (hide the flashed content and start the recall timer).
  const revealMemory = () => { setMemorizing(false); setQuestionStart(Date.now()); };

  const submitAnswer = async () => {
    if (selected === null || submitted) return;
    const timeMs = Date.now() - questionStart;

    const res = await fetch('/api/quiz/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        questionId: currentQ.id,
        answerIndex: selected,
        timeMs,
        usedHint,
        isQuizComplete: isLast,
      }),
    });
    const data = await res.json();
    setSubmitted(data);
    if (data.wasCorrect) setScore(s => s + 1);
  };

  const nextQuestion = () => {
    if (isLast) {
      router.push(`/quiz/result?session=${sessionId}`);
      return;
    }
    setIndex(i => i + 1);
    setSelected(null);
    setSubmitted(null);
    setUsedHint(false);
    setShowHint(false);
    setQuestionStart(Date.now());
  };

  if (loading || !currentQ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-4xl animate-pulse">🎯</div>
      </div>
    );
  }

  // Memory game — "memorize" phase: flash the content, then it disappears.
  if (memorizing) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center py-6 px-4" dir={dir}>
        <div className="max-w-2xl w-full text-center">
          <div className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full mb-4">🧠 {t('qp.memory.badge')}</div>
          <p className="text-lg font-bold text-ink mb-4">{t('qp.memory.memorize')}</p>
          <div className="bg-surface rounded-3xl shadow-xl p-10 md:p-14 mb-6 flex items-center justify-center min-h-[160px]">
            <div className="text-3xl md:text-5xl font-extrabold text-ink leading-relaxed" style={{ letterSpacing: '0.06em' }}>
              {currentQ.memory_show}
            </div>
          </div>
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center text-3xl font-black text-purple-600">
            {memoLeft}
          </div>
          <button onClick={revealMemory} className="text-sm text-purple-600 font-bold hover:text-purple-700">{t('qp.memory.hide')} ←</button>
        </div>
      </main>
    );
  }

  const progress = ((index + (submitted ? 1 : 0)) / questions.length) * 100;
  const isRTL = currentQ.language === 'ar';

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-6 px-4">
      <div className="max-w-2xl mx-auto" dir={dir}>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-ink-muted">{index + 1} / {questions.length}</span>
            <span className="text-sm font-bold text-green-600">{score} {t('qp.correct_label')}</span>
          </div>
          <div className="bg-bg-soft h-2 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Subject Badge */}
        <div className="mb-3 text-center">
          <span className="inline-block bg-purple-100 text-purple-700 text-xs font-bold px-3 py-1 rounded-full">
            {currentQ.question_type === 'memory'
              ? `🧠 ${t('qp.memory.recall')}`
              : cats[currentQ.subject]
                ? `${cats[currentQ.subject].icon} ${cats[currentQ.subject].name}`.trim()
                : t(subjectKey(currentQ.subject))}
          </span>
        </div>

        {/* Question Card */}
        <div className="bg-surface rounded-3xl shadow-xl p-6 md:p-8 mb-4">
          <p className={`text-lg md:text-xl font-bold text-ink leading-relaxed mb-6 ${isRTL ? '' : 'text-left'}`}
            dir={isRTL ? 'rtl' : 'ltr'}>
            {currentQ.stem}
          </p>

          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selected === idx;
              const isCorrect = submitted && idx === submitted.correctIndex;
              const isWrongPicked = submitted && isSelected && !submitted.wasCorrect;

              let className = 'w-full text-right p-4 rounded-xl border-2 font-medium transition-all ';
              if (submitted) {
                if (isCorrect) className += 'bg-green-50 border-green-500 text-green-800';
                else if (isWrongPicked) className += 'bg-red-50 border-red-500 text-red-800';
                else className += 'bg-bg-soft border-line text-ink-subtle';
              } else {
                className += isSelected
                  ? 'bg-purple-50 border-purple-500 text-purple-900'
                  : 'bg-surface border-line hover:border-purple-300 hover:bg-purple-50 text-ink-muted';
              }

              return (
                <button
                  key={idx}
                  onClick={() => !submitted && setSelected(idx)}
                  disabled={!!submitted}
                  className={className}
                  dir={isRTL ? 'rtl' : 'ltr'}
                >
                  <span className="inline-flex items-center gap-3 w-full">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0
                      ${submitted && isCorrect ? 'bg-green-500 text-white'
                        : submitted && isWrongPicked ? 'bg-red-500 text-white'
                        : isSelected ? 'bg-purple-500 text-white'
                        : 'bg-bg-soft text-ink-subtle'}`}>
                      {['أ','ب','ج','د'][idx]}
                    </span>
                    <span className="flex-1">{opt}</span>
                    {submitted && isCorrect && <span className="text-green-600 text-xl">✓</span>}
                    {submitted && isWrongPicked && <span className="text-red-600 text-xl">✗</span>}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Hints (before answering) */}
          {!submitted && currentQ.hints && currentQ.hints.length > 0 && (
            <button
              onClick={() => { setShowHint(true); setUsedHint(true); }}
              className="mt-4 text-sm text-purple-600 hover:text-purple-700 font-bold"
            >
              💡 {showHint ? '' : t('qp.need_hint')}
            </button>
          )}
          {showHint && currentQ.hints && (
            <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-sm text-yellow-900">
              <strong>💡 {t('qp.hint_label')}</strong> {currentQ.hints[0]}
            </div>
          )}

          {/* Explanation after submission */}
          {submitted && (
            <div className={`mt-5 p-4 rounded-xl border-2 ${submitted.wasCorrect
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'}`}
              dir={isRTL ? 'rtl' : 'ltr'}>
              <div className={`font-bold mb-2 ${submitted.wasCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {submitted.wasCorrect ? `${t('qp.correct_xp')} +${submitted.xp} XP` : t('qp.wrong')}
              </div>
              <p className="text-sm text-ink-muted leading-relaxed">{submitted.explanation}</p>
            </div>
          )}
        </div>

        {/* Bottom Action */}
        {!submitted ? (
          <button
            onClick={submitAnswer}
            disabled={selected === null}
            className="w-full bg-purple-600 text-white font-bold py-4 rounded-2xl text-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-purple-700 shadow-lg"
          >
            {t('qp.confirm')}
          </button>
        ) : (
          <button
            onClick={nextQuestion}
            className="w-full bg-green-500 text-white font-bold py-4 rounded-2xl text-lg hover:bg-green-600 shadow-lg"
          >
            {isLast ? t('qp.finish') : t('qp.next')}
          </button>
        )}
      </div>
    </main>
  );
}

function subjectKey(subject: string): TranslationKey {
  const map: Record<string, TranslationKey> = {
    math: 'qp.subj.math',
    physics: 'qp.subj.physics',
    chemistry: 'qp.subj.chemistry',
    science: 'qp.subj.science',
    logic: 'qp.subj.logic',
    arabic: 'qp.subj.arabic',
    history: 'qp.subj.history',
    civics: 'qp.subj.civics',
    general_culture: 'qp.subj.general_culture',
    life_skills: 'qp.subj.life_skills',
    religion: 'qp.subj.religion',
  };
  return map[subject] ?? ('qp.subj.science' as TranslationKey);
}

export default function QuizPlayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-4xl">🎯</div></div>}>
      <QuizPlayInner />
    </Suspense>
  );
}
