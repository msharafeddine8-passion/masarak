'use client';
/**
 * IDCardTab — تاب "هويتي" داخل /profile
 *
 * الوظائف:
 * 1. تجلب/تنشئ بطاقة الطالب (عبر /api/card/ensure)
 * 2. نموذج تعبئة: display_name_ar، display_name_en، birth_year، study_level
 * 3. معاينة حية للبطاقة بعد كل تغيير
 * 4. زر تصدير PNG
 * 5. شريط اكتمال البطاقة
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import MasarakIDCard, { type StudentCard, type CardProfile } from '@/components/id-card/MasarakIDCard';
import IDCardSkeleton from '@/components/id-card/IDCardSkeleton';
import CardExportButton from '@/components/id-card/CardExportButton';

// ─── Types ────────────────────────────────────────────────────────────────────

interface IDCardTabProps {
  profile: Record<string, unknown>;
  user: { id: string; email: string };
}

type CardRow = StudentCard & { user_id: string };

// ─── Completion helper ────────────────────────────────────────────────────────

function calcCompletion(card: Partial<CardRow>): number {
  const fields = [
    card.display_name_ar,
    card.display_name_en,
    card.birth_year,
    card.study_level,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
}

// ─── Study Level options ──────────────────────────────────────────────────────

const LEVELS = [
  { value: 'secondary',  label: 'ثانوي' },
  { value: 'university', label: 'جامعي' },
  { value: 'graduate',   label: 'خريج'  },
] as const;

// ─── Main component ───────────────────────────────────────────────────────────

export default function IDCardTab({ profile, user }: IDCardTabProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const [card, setCard]       = useState<CardRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');
  const [dirty, setDirty]     = useState(false);

  // Form state mirrors the DB card row
  const [form, setForm] = useState<{
    display_name_ar: string;
    display_name_en: string;
    birth_year: string;
    study_level: string;
  }>({
    display_name_ar: '',
    display_name_en: '',
    birth_year: '',
    study_level: '',
  });

  // ── 1. Ensure card exists on mount ──────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/card/ensure', { method: 'POST' });
        if (!res.ok) throw new Error(await res.text());
        const { card: c } = await res.json() as { card: CardRow };
        setCard(c);
        setForm({
          display_name_ar: c.display_name_ar || '',
          display_name_en: c.display_name_en || '',
          birth_year:      c.birth_year ? String(c.birth_year) : '',
          study_level:     c.study_level || '',
        });
      } catch (e) {
        console.error('[IDCardTab] ensure error:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ── 2. Form change handler ───────────────────────────────────────────────────
  const handleChange = useCallback(
    (field: keyof typeof form) =>
      (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm((prev) => ({ ...prev, [field]: e.target.value }));
        setDirty(true);
        setMsg('');
      },
    []
  );

  // ── 3. Save to DB ────────────────────────────────────────────────────────────
  async function handleSave() {
    if (!user?.id) return;
    setSaving(true);
    setMsg('');

    const payload = {
      display_name_ar: form.display_name_ar.trim() || null,
      display_name_en: form.display_name_en.trim() || null,
      birth_year:      form.birth_year ? parseInt(form.birth_year) : null,
      study_level:     form.study_level || null,
    };

    const { data, error } = await supabase
      .from('student_cards')
      .update(payload)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      setMsg('❌ حدث خطأ أثناء الحفظ');
    } else {
      setCard((prev) => ({ ...prev!, ...data }));
      setDirty(false);
      setMsg('✅ تم الحفظ');
      setTimeout(() => setMsg(''), 3000);
    }
    setSaving(false);
  }

  // ── Build preview data ───────────────────────────────────────────────────────
  const previewCard: StudentCard = {
    masarak_id:      card?.masarak_id   || 'MSR-000000',
    display_name_ar: form.display_name_ar || null,
    display_name_en: form.display_name_en || null,
    birth_year:      form.birth_year ? parseInt(form.birth_year) : null,
    study_level:     (form.study_level as StudentCard['study_level']) || null,
    card_theme:      card?.card_theme   || 'classic',
    created_at:      card?.created_at   || new Date().toISOString(),
  };

  const cardProfile: CardProfile = {
    avatar_url:        String(profile.avatar_url || ''),
    country:           String(profile.country    || ''),
    career_dna_result: String(profile.career_dna_result || ''),
    full_name:         String(profile.full_name  || ''),
  };

  const completion = card ? calcCompletion({ ...card, ...previewCard }) : 0;

  // ─────────────────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center py-10">
        <IDCardSkeleton />
        <div className="mt-4 text-sm text-slate-400 animate-pulse">جاري تحميل هويتك…</div>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-2 py-6 space-y-8">

      {/* ── Header ── */}
      <div>
        <h2 className="text-xl font-bold text-slate-800">🪪 بطاقة هويتي الرقمية</h2>
        <p className="text-sm text-slate-500 mt-1">
          بطاقتك الشخصية على مسارك — اجعلها تعكس هويتك الأكاديمية الحقيقية
        </p>
      </div>

      {/* ── Completion bar ── */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-slate-700">اكتمال البطاقة</span>
          <span className="text-sm font-bold text-primary">{completion}%</span>
        </div>
        <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-l from-primary to-primary-300 transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        {completion < 100 && (
          <p className="text-xs text-slate-400 mt-2">
            أكمل بياناتك لإظهار هوية مكتملة ✨
          </p>
        )}
      </div>

      {/* ── Masarak ID Badge ── */}
      {card?.masarak_id && (
        <div className="bg-[#0F172A] rounded-2xl px-5 py-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400">Masarak ID</p>
            <p className="text-lg font-bold text-[#D4AF37] tracking-widest font-mono">
              {card.masarak_id}
            </p>
          </div>
          <div className="text-xs text-slate-500 text-left">
            <p>رقم هويتك الفريد</p>
            <p>على منصة مسارك</p>
          </div>
        </div>
      )}

      {/* ── Live Card Preview ── */}
      <div>
        <p className="text-sm font-semibold text-slate-600 mb-3">معاينة البطاقة</p>
        <div className="overflow-x-auto pb-2">
          <MasarakIDCard
            ref={cardRef}
            card={previewCard}
            profile={cardProfile}
            forExport={false}
          />
        </div>
      </div>

      {/* ── Form ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-5">
        <h3 className="font-bold text-slate-700">✏️ بيانات البطاقة</h3>

        {/* Row 1: names */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="الاسم بالعربية (على البطاقة)"
            hint="مثال: محمد أحمد الحسن"
            required
          >
            <input
              type="text"
              value={form.display_name_ar}
              onChange={handleChange('display_name_ar')}
              placeholder="محمد أحمد الحسن"
              maxLength={50}
              className={inputCls}
              dir="rtl"
            />
          </Field>

          <Field
            label="الاسم بالإنجليزية"
            hint="كما هو في وثائقك الرسمية"
          >
            <input
              type="text"
              value={form.display_name_en}
              onChange={handleChange('display_name_en')}
              placeholder="Mohammad Ahmad Al-Hassan"
              maxLength={60}
              className={inputCls}
              dir="ltr"
            />
          </Field>
        </div>

        {/* Row 2: year + level */}
        <div className="grid sm:grid-cols-2 gap-4">
          <Field
            label="سنة الميلاد"
            hint="سنة فقط — لا نعرض تاريخاً كاملاً"
          >
            <input
              type="number"
              value={form.birth_year}
              onChange={handleChange('birth_year')}
              placeholder="2003"
              min={1991}
              max={2009}
              className={inputCls}
              dir="ltr"
            />
          </Field>

          <Field
            label="المرحلة الدراسية"
            hint="اختر ما يناسبك الآن"
          >
            <select
              value={form.study_level}
              onChange={handleChange('study_level')}
              className={inputCls}
            >
              <option value="">— اختر —</option>
              {LEVELS.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Readonly: DNA from profile */}
        <Field
          label="مسارك المهني (Career DNA)"
          hint="يُستمد تلقائياً من نتيجة اختبار Career DNA"
        >
          <input
            type="text"
            value={String(profile.career_dna_result || '')}
            readOnly
            placeholder="أكمل اختبار Career DNA أولاً"
            className={`${inputCls} bg-slate-50 cursor-not-allowed text-slate-400`}
          />
        </Field>

        {/* Save button */}
        <div className="flex items-center gap-4 pt-1">
          <button
            onClick={handleSave}
            disabled={saving || !dirty}
            className={`
              px-6 py-2.5 rounded-xl text-sm font-bold transition-all
              ${dirty && !saving
                ? 'bg-primary text-white hover:bg-primary-dark'
                : 'bg-slate-100 text-slate-400 cursor-not-allowed'}
            `}
          >
            {saving ? '⏳ جاري الحفظ…' : '💾 حفظ البيانات'}
          </button>
          {msg && (
            <span className="text-sm font-medium text-slate-600 animate-fade-in">
              {msg}
            </span>
          )}
        </div>
      </div>

      {/* ── Export ── */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
        <h3 className="font-bold text-slate-700 mb-2">📤 شارك بطاقتك</h3>
        <p className="text-sm text-slate-500 mb-4">
          حمّل بطاقتك كصورة PNG بجودة عالية (1200×756 px) وشاركها على السوشال ميديا.
        </p>
        <CardExportButton
          cardRef={cardRef}
          masarakId={card?.masarak_id || 'MSR-000000'}
        />
      </div>

    </div>
  );
}

// ─── Field wrapper ─────────────────────────────────────────────────────────────

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm bg-white ' +
  'text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 ' +
  'focus:border-primary transition';
