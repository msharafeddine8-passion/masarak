'use client';
import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';

interface AnswerRow {
  question_id: string;
  selected_index: number;
  was_correct: boolean;
  answered_at: string;
}

interface QuestionRow {
  id: string;
  stem: string;
  options: string[];
  correct_index: number;
  language: string;
  subject: string;
}

function ReviewInner() {
  const router = useRouter();
  const params = useSearchParams();
  const sessionId = params.get('session');
  const { t, dir } = useI18n();
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<(AnswerRow & { question?: QuestionRow })[]>([]);

  useEffect(() => {
    if (!sessionId) { router.push('/quiz/today'); return; }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth/login'); return; }

      const { data: ans } = await supabase
        .from('quiz_answers')
        .select('question_id, selected_index, was_correct, answered_at')
        .eq('session_id', sessionId)
        .order('answered_at', { ascending: true });

      if (!ans?.length) { setAnswers([]); setLoading(false); return; }
      const ids = ans.map(a => a.question_id);
      const { data: qs } = await supabase
        .from('quiz_questions')
        .select('id, stem, options, correct_index, language, subject')
        .in('id', ids);
      const byId: Record<string, QuestionRow> = {};
      (qs ?? []).forEach((q: QuestionRow) => { byId[q.id] = q; });
      setAnswers(ans.map(a => ({ ...a, question: byId[a.question_id] })));
      setLoading(false);
    })();
  }, [sessionId, router]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-pulse">📋</div></div>;

  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4" dir={dir}>
      <div className="max-w-2xl mx-auto">
        <Link href={`/quiz/result?session=${sessionId}`} className="text-sm text-purple-600 hover:underline mb-4 inline-block">← العودة للنتيجة</Link>

        <div className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-3xl p-6 md:p-8 shadow-2xl mb-6">
          <div className="text-5xl mb-2 text-center">📋</div>
          <h1 className="text-3xl font-extrabold text-center mb-1">{t('qr.review_title') || 'تصفّح إجاباتك'}</h1>
          <p className="text-white/85 text-center text-sm">راجع الأسئلة، شوف وين أصبت ووين أخطأت، واتعلّم من كل واحد.</p>
        </div>

        {answers.length === 0 ? (
          <div className="bg-surface rounded-2xl p-10 text-center text-ink-subtle shadow-md">ما لقينا إجابات لهذه الجلسة.</div>
        ) : (
          <div className="space-y-4">
            {answers.map((a, i) => {
              const q = a.question;
              if (!q) return null;
              const isRTL = q.language === 'ar';
              return (
                <div key={a.question_id} className={`bg-surface rounded-2xl shadow-md overflow-hidden border-r-4 ${a.was_correct ? 'border-green-500' : 'border-red-500'}`}>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${a.was_correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {a.was_correct ? '✓ صحيحة' : '✗ خاطئة'}
                      </span>
                      <span className="text-xs text-ink-subtle">سؤال {i + 1}</span>
                    </div>
                    <p className="font-bold text-ink mb-4 leading-relaxed" dir={isRTL ? 'rtl' : 'ltr'}>
                      {q.stem}
                    </p>
                    <div className="space-y-2">
                      {q.options.map((opt, idx) => {
                        const isCorrect = idx === q.correct_index;
                        const isUserPick = idx === a.selected_index;
                        let cls = 'border-2 border-white/10 bg-bg-soft text-ink-muted';
                        if (isCorrect) cls = 'border-2 border-green-500 bg-green-50 text-green-900 font-bold';
                        else if (isUserPick) cls = 'border-2 border-red-400 bg-red-50 text-red-900';
                        return (
                          <div key={idx} className={`rounded-xl p-3 text-sm ${cls}`} dir={isRTL ? 'rtl' : 'ltr'}>
                            <span className="font-bold mx-1">{['أ','ب','ج','د'][idx]}.</span>
                            {opt}
                            {isCorrect && <span className="float-left text-green-600">✓ الصحيحة</span>}
                            {!isCorrect && isUserPick && <span className="float-left text-red-600">إجابتك</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

export default function QuizReviewPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-4xl animate-pulse">📋</div></div>}>
      <ReviewInner />
    </Suspense>
  );
}
