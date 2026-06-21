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

type CardRow = StudentCard & { user_id: string; is_public: boolean };

// ─── Completion helper ────────────────────────────────────────────────────────
// FIX-13: include school_name + graduation_year so a card with all 4 basic
// fields filled but missing school info no longer shows 100%.

function calcCompletion(card: Partial<CardRow>): number {
  const fields: unknown[] = [
    card.display_name_ar,
    card.display_name_en,
    card.birth_year,
    card.study_level,
    card.school_name,      // must be set in student_profiles → synced to student_cards
    card.graduation_year,  // must be set in student_profiles → synced to student_cards
  ];
  // Use explicit check (not just Boolean) so numeric 0 doesn't count as filled
  const filled = fields.filter((v) => v !== null && v !== undefined && v !== '').length;
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
  const cardRef            = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [cardScale, setCardScale] = useState(1);

  const [card, setCard]       = useState<CardRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [msg, setMsg]         = useState('');
  const [dirty, setDirty]     = useState(false);

  const [isPublic, setIsPublic] = useState(false);

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
        setIsPublic(c.is_public ?? false);
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
      is_public:       isPublic,
    };

    const { data, error } = await supabase
      .from('student_cards')
      .update(payload)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('[IDCardTab] save error:', error);
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
    created_at:      card?.created_at   || new Date().toISOString(),
  };

  const cardProfile: CardProfile = {
    avatar_url:        String(profile.avatar_url || ''),
    country:           String(profile.country    || ''),
    career_dna_result: String(profile.career_dna_result || ''),
    full_name:         String(profile.full_name  || ''),
  };

  const completion = card ? calcCompletion({ ...card, ...previewCard }) : 0;

  // ── Responsive card scale ────────────────────────────────────────────────────
  useEffect(() => {
    function updateScale() {
      if (previewContainerRef.current) {
        const w = previewContainerRef.current.offsetWidth;
        setCardScale(Math.min(1, w / 600));
      }
    }
    updateScale();
    const ro = new ResizeObserver(updateScale);
    if (previewContainerRef.current) ro.observe(previewContainerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── 4. Download PDF ─────────────────────────────────────────────────────────
  const [pdfLoading, setPdfLoading] = useState(false);

  async function handleDownloadPDF() {
    setPdfLoading(true);
    try {
      const res = await fetch('/api/pdf/generate', { method: 'POST' });
      if (!res.ok) throw new Error('فشل توليد PDF');
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `masarak-${card?.masarak_id || 'profile'}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('[PDF download]', e);
      alert('تعذّر تنزيل الملف الشخصي — حاول لاحقاً');
    } finally {
      setPdfLoading(false);
    }
  }

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
    <div dir="rtl" className="max-w-3xl mx-auto px-2 py-5 space-y-5">

      {/* ── Header + Masarak ID Badge (merged) ── */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink">🪪 بطاقة هويتي الرقمية</h2>
          <p className="text-sm text-ink-subtle mt-0.5">
            اجعلها تعكس هويتك الأكاديمية الحقيقية
          </p>
        </div>
        {card?.masarak_id && (
          <div className="bg-[#0F172A] rounded-xl px-4 py-2 text-right flex-shrink-0">
            <p className="text-xs text-slate-400">Masarak ID</p>
            <p className="text-sm font-bold text-[#D4AF37] tracking-widest font-mono">
              {card.masarak_id}
            </p>
          </div>
        )}
      </div>

      {/* ── Completion bar ── */}
      <div className="bg-surface rounded-2xl px-4 py-3 border border-white/10 shadow-sm">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-sm font-semibold text-ink-muted">اكتمال البطاقة</span>
          <span className="text-sm font-bold text-primary">{completion}%</span>
        </div>
        <div className="h-2 rounded-full bg-bg-soft overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-l from-primary to-primary-300 transition-all duration-500"
            style={{ width: `${completion}%` }}
          />
        </div>
        {completion < 100 && (
          <p className="text-xs text-slate-400 mt-1.5">
            {/* FIX-13: guide users to profile settings for school/graduation fields */}
            أكمل بياناتك — اسم المدرسة وسنة التخرج تُحدَّث من{' '}
            <a href="/profile#info" className="underline text-primary">إعدادات ملفك الشخصي</a> ✨
          </p>
        )}
      </div>

      {/* ── Live Card Preview (responsive scale) ── */}
      <div>
        <p className="text-sm font-semibold text-ink-muted mb-3">معاينة البطاقة</p>
        {/* Container measures available width, card scales to fit */}
        <div ref={previewContainerRef} className="w-full">
          <div style={{
            width: 600,
            height: 378,
            transform: `scale(${cardScale})`,
            transformOrigin: 'top right',
            /* pull next element up when scaled down */
            marginBottom: cardScale < 1 ? `${(cardScale - 1) * 378}px` : 0,
          }}>
            <MasarakIDCard
              ref={cardRef}
              card={previewCard}
              profile={cardProfile}
              forExport={false}
            />
          </div>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="bg-surface rounded-2xl px-4 py-4 border border-white/10 shadow-sm space-y-4">
        <h3 className="font-bold text-ink-muted">✏️ بيانات البطاقة</h3>

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
              min={1965}
              max={2013}
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
            className={`${inputCls} bg-bg-soft cursor-not-allowed text-slate-400`}
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
                : 'bg-bg-soft text-slate-400 cursor-not-allowed'}
            `}
          >
            {saving ? '⏳ جاري الحفظ…' : '💾 حفظ البيانات'}
          </button>
          {msg && (
            <span className="text-sm font-medium text-ink-muted animate-fade-in">
              {msg}
            </span>
          )}
        </div>
      </div>

      {/* ── Visibility Toggle ── */}
      <div className="bg-surface rounded-2xl px-4 py-4 border border-white/10 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-ink-muted">🌐 الملف العام</h3>
            <p className="text-sm text-ink-subtle mt-0.5">
              {isPublic
                ? 'بطاقتك مرئية للعموم على masaraklb.com/v/' + (card?.masarak_id || '')
                : 'البطاقة خاصة — لا يمكن لأحد مشاهدتها الآن'}
            </p>
            {isPublic && card?.masarak_id && (
              <a
                href={`/student/${card.masarak_id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-block mt-2 text-xs text-primary underline"
              >
                مشاهدة صفحتك العامة ←
              </a>
            )}
          </div>
          {/* Toggle switch */}
          <button
            type="button"
            onClick={() => { setIsPublic((v) => !v); setDirty(true); }}
            className={`
              relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 focus:outline-none
              ${isPublic ? 'bg-emerald-500' : 'bg-slate-300'}
            `}
            aria-pressed={isPublic}
          >
            <span
              className={`
                inline-block h-5 w-5 transform rounded-full bg-surface shadow transition-transform duration-200
                ${isPublic ? 'translate-x-6' : 'translate-x-1'}
              `}
            />
          </button>
        </div>
      </div>

      {/* ── Export ── */}
      <div className="bg-surface rounded-2xl px-4 py-4 border border-white/10 shadow-sm space-y-3">
        <h3 className="font-bold text-ink-muted">📤 شارك بطاقتك</h3>

        {/* PNG export */}
        <div>
          <p className="text-sm text-ink-subtle mb-3">
            صورة PNG بجودة عالية (1200×756 px) للسوشال ميديا.
          </p>
          <CardExportButton
            cardRef={cardRef}
            masarakId={card?.masarak_id || 'MSR-000000'}
          />
        </div>

        {/* PDF export */}
        <div className="pt-3 border-t border-slate-100">
          <p className="text-sm text-ink-subtle mb-3">
            ملفك الشخصي الكامل بصيغة PDF — يشمل جميع الأقسام المرئية.
          </p>
          <button
            onClick={handleDownloadPDF}
            disabled={pdfLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all
              bg-[#0F172A] text-white hover:bg-[#1E293B] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pdfLoading ? '⏳ جاري التوليد…' : '📄 تنزيل الملف الشخصي PDF'}
          </button>
        </div>
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
      <label className="text-sm font-semibold text-ink-muted">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  'w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm bg-surface ' +
  'text-ink focus:outline-none focus:ring-2 focus:ring-primary/30 ' +
  'focus:border-primary transition';
