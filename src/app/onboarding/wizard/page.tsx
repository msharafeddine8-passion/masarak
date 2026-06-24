'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { track } from '@/lib/analytics';

/**
 * Sprint 3.5: 3-question wizard shown right after signup.
 * Saves answers to auth user_metadata.profile so dashboard can personalize.
 */

const GRADES = [
  { id: 'grade_10', label: 'الصف العاشر' },
  { id: 'grade_11', label: 'الصف الحادي عشر' },
  { id: 'grade_12', label: 'الصف الثاني عشر (بكالوريا)' },
  { id: 'bac_done', label: 'خلصت بكالوريا — بدور على جامعة' },
  { id: 'university', label: 'بالجامعة فعلاً' },
];

const TRACKS = [
  { id: 'lh',     label: 'علوم اقتصادية واجتماعية',   emoji: '📊' },
  { id: 'sg',     label: 'علوم عامة',                  emoji: '🔬' },
  { id: 'sv',     label: 'علوم الحياة',                emoji: '🧬' },
  { id: 'lit',    label: 'آداب وإنسانيات',             emoji: '📚' },
  { id: 'voc',    label: 'فنون مهنية / تقنية',         emoji: '🛠️' },
  { id: 'na',     label: 'مش متأكد بعد',                emoji: '🤔' },
];

const BUDGETS = [
  { id: 'low',    label: 'أقل من $5,000 سنوياً',   note: 'منح ضرورية' },
  { id: 'med',    label: '$5,000 – $12,000 سنوياً' },
  { id: 'high',   label: '$12,000 – $20,000 سنوياً' },
  { id: 'top',    label: 'أكتر من $20,000' },
  { id: 'na',     label: 'مش عارف بعد' },
];

export default function WizardPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [grade, setGrade] = useState<string | null>(null);
  const [track, setTrack] = useState<string | null>(null);
  const [budget, setBudget] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const canNext =
    (step === 0 && grade) ||
    (step === 1 && track) ||
    (step === 2 && budget);

  async function finish() {
    setSaving(true);
    try {
      await supabase.auth.updateUser({
        data: {
          profile: { grade, track, budget, wizardCompletedAt: new Date().toISOString() }
        }
      });
      window.gtag?.('event', 'wizard_complete', { grade, track, budget });
    } catch {}
    setSaving(false);
    router.push('/dashboard?new=1');
  }

  function next() {
    if (step < 2) { setStep(s => s + 1); return; }
    finish();
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-mint-pale via-bg to-bg-mint py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-2xl">
        <div className="text-center mb-6">
          <div className="text-xs text-ink-muted mb-2">
            خطوة {step + 1} من 3
          </div>
          <div className="flex justify-center gap-2 mb-6" aria-hidden="true">
            {[0,1,2].map(i => (
              <div key={i} className={`h-1.5 w-12 rounded-full ${i <= step ? 'bg-primary' : 'bg-gray-200'}`} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border-2 border-gray-100 p-6 md:p-8 shadow-sm">
          {step === 0 && (
            <>
              <h1 className="text-2xl font-extrabold text-primary mb-2">👋 أهلاً فيك بمسارك</h1>
              <p className="text-ink-muted mb-6">أي صف انت فيه حالياً؟</p>
              <ul className="space-y-2">
                {GRADES.map(g => (
                  <li key={g.id}>
                    <button
                      type="button"
                      onClick={() => setGrade(g.id)}
                      className={`w-full text-right p-4 rounded-xl border-2 transition-all ${
                        grade === g.id
                          ? 'border-primary bg-primary-50 font-bold'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      {g.label}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="text-2xl font-extrabold text-primary mb-2">🎯 ميلك العلمي؟</h1>
              <p className="text-ink-muted mb-6">شو الفرع/المسار اللي بتميل إله؟</p>
              <div className="grid sm:grid-cols-2 gap-2">
                {TRACKS.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTrack(t.id)}
                    className={`text-right p-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                      track === t.id
                        ? 'border-primary bg-primary-50 font-bold'
                        : 'border-gray-200 hover:border-primary/50'
                    }`}
                  >
                    <span className="text-2xl">{t.emoji}</span>
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="text-2xl font-extrabold text-primary mb-2">💰 الميزانية المتاحة؟</h1>
              <p className="text-ink-muted mb-6">معلومة خاصة بـيك — منستخدمها لاقتراحات أنسب.</p>
              <ul className="space-y-2">
                {BUDGETS.map(b => (
                  <li key={b.id}>
                    <button
                      type="button"
                      onClick={() => setBudget(b.id)}
                      className={`w-full text-right p-4 rounded-xl border-2 transition-all ${
                        budget === b.id
                          ? 'border-primary bg-primary-50 font-bold'
                          : 'border-gray-200 hover:border-primary/50'
                      }`}
                    >
                      {b.label}
                      {b.note && <span className="text-xs text-ink-muted block mt-1">→ {b.note}</span>}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          <div className="flex justify-between items-center mt-8">
            <Link href="/dashboard" className="text-sm text-ink-muted hover:text-primary">
              تخطّي ←
            </Link>
            <button
              type="button"
              onClick={next}
              disabled={!canNext || saving}
              className="btn-primary px-6 py-2.5 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {step === 2 ? (saving ? 'حفظ…' : 'ابدأ المنصة') : 'التالي ←'}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

declare global {
  interface Window {
    gtag?: (cmd: string, eventOrId: string, params?: Record<string, unknown>) => void;
  }
}
