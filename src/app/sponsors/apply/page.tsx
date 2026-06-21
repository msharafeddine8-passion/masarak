"use client";
/**
 * /sponsors/apply — صفحة تقديم طلب رعاية مسارك
 * مفتوحة للجميع، لا تحتاج تسجيل دخول.
 */
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const ORG_TYPES = [
  { value: "university",  label: "جامعة / كلية" },
  { value: "school",      label: "مدرسة / ثانوية" },
  { value: "company",     label: "شركة / مؤسسة تجارية" },
  { value: "ngo",         label: "منظمة / جمعية" },
  { value: "government",  label: "جهة حكومية" },
  { value: "other",       label: "أخرى" },
];

const INTERESTS = [
  { value: "homepage_banner",   label: "لافتة الصفحة الرئيسية" },
  { value: "scholarship_badge", label: "شارة المنح الدراسية" },
  { value: "event_sponsorship", label: "رعاية الفعاليات" },
  { value: "featured_org",      label: "مؤسسة مميّزة على مسارك" },
  { value: "newsletter",        label: "النشرة الأسبوعية" },
  { value: "career_dna",        label: "اختبار Career DNA" },
];

const BUDGETS = [
  { value: "under_1k",   label: "أقل من 1,000$" },
  { value: "1k_5k",      label: "1,000$ – 5,000$" },
  { value: "5k_15k",     label: "5,000$ – 15,000$" },
  { value: "15k_plus",   label: "أكثر من 15,000$" },
  { value: "flexible",   label: "مرن / نناقش" },
];

type Step = 1 | 2 | 3;

interface FormData {
  org_name: string;
  org_type: string;
  website: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  sponsorship_interest: string[];
  budget_range: string;
  message: string;
}

const INITIAL: FormData = {
  org_name: "", org_type: "", website: "",
  contact_name: "", contact_email: "", contact_phone: "",
  sponsorship_interest: [], budget_range: "", message: "",
};

export default function SponsorsApplyPage() {
  const [step, setStep]       = useState<Step>(1);
  const [form, setForm]       = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  function set(field: keyof FormData, value: string | string[]) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  function toggleInterest(v: string) {
    set("sponsorship_interest",
      form.sponsorship_interest.includes(v)
        ? form.sponsorship_interest.filter((x) => x !== v)
        : [...form.sponsorship_interest, v]
    );
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");
    const { error: err } = await supabase.from("sponsor_applications").insert({
      org_name: form.org_name.trim(),
      org_type: form.org_type,
      website: form.website.trim() || null,
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      contact_phone: form.contact_phone.trim() || null,
      sponsorship_interest: form.sponsorship_interest,
      budget_range: form.budget_range || null,
      message: form.message.trim() || null,
    });
    setSubmitting(false);
    if (err) { setError("حدث خطأ — يرجى المحاولة مجدداً"); return; }
    setDone(true);
  }

  const canNext1 = form.org_name.trim().length >= 2 && form.org_type;
  const canNext2 = form.contact_name.trim().length >= 2 && /\S+@\S+\.\S+/.test(form.contact_email);
  const canSubmit = canNext2 && form.sponsorship_interest.length > 0;

  if (done) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-4">🤝</div>
          <h1 className="text-2xl font-extrabold text-[#0F4A52] mb-2">شكراً لاهتمامك!</h1>
          <p className="text-ink-subtle mb-2 leading-relaxed">
            وصلنا طلب رعايتكم بنجاح. فريق مسارك سيتواصل معك على{" "}
            <strong dir="ltr">{form.contact_email}</strong> خلال 48 ساعة عمل.
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/" className="px-5 py-2.5 bg-[#0F4A52] text-white rounded-xl font-bold text-sm">
              الصفحة الرئيسية
            </Link>
            <Link href="/about" className="px-5 py-2.5 bg-bg-soft text-ink-muted rounded-xl font-bold text-sm">
              تعرّف على مسارك
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] py-12 px-4">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="text-sm text-ink-subtle hover:text-[#0F4A52] mb-4 inline-block">
            ← مسارك
          </Link>
          <div className="text-5xl mb-3">🤝</div>
          <h1 className="text-3xl font-extrabold text-[#1b3a6b]">كن راعياً لمسارك</h1>
          <p className="text-ink-subtle mt-2 leading-relaxed">
            مسارك يخدم آلاف الطلاب في لبنان والعالم العربي يومياً.
            شراكتك تفتح أبواباً لهم وتضع علامتك في طليعة مجال التعليم.
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? "bg-[#0F4A52]" : "bg-white/10"}`} />
          ))}
        </div>
        <p className="text-xs text-ink-subtle mb-6 text-center">
          الخطوة {step} من 3 — {step === 1 ? "بيانات المؤسسة" : step === 2 ? "بيانات التواصل" : "نوع الرعاية"}
        </p>

        <div className="bg-surface rounded-2xl border border-white/10 p-6 shadow-sm">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-extrabold text-[#1b3a6b] text-lg mb-4">🏛️ بيانات المؤسسة</h2>

              <Field label="اسم المؤسسة" required>
                <input
                  value={form.org_name}
                  onChange={(e) => set("org_name", e.target.value)}
                  placeholder="مثال: جامعة الحكمة، شركة XYZ"
                  className={inputCls}
                />
              </Field>

              <Field label="نوع المؤسسة" required>
                <select value={form.org_type} onChange={(e) => set("org_type", e.target.value)} className={inputCls}>
                  <option value="">— اختر —</option>
                  {ORG_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </Field>

              <Field label="الموقع الإلكتروني">
                <input
                  value={form.website}
                  onChange={(e) => set("website", e.target.value)}
                  placeholder="https://example.com"
                  dir="ltr"
                  className={inputCls}
                />
              </Field>

              <button
                onClick={() => setStep(2)}
                disabled={!canNext1}
                className={btnPrimaryCls}
              >
                التالي ←
              </button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-extrabold text-[#1b3a6b] text-lg mb-4">👤 بيانات التواصل</h2>

              <Field label="الاسم الكامل" required>
                <input
                  value={form.contact_name}
                  onChange={(e) => set("contact_name", e.target.value)}
                  placeholder="الاسم الأول والأخير"
                  className={inputCls}
                />
              </Field>

              <Field label="البريد الإلكتروني" required>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => set("contact_email", e.target.value)}
                  placeholder="you@example.com"
                  dir="ltr"
                  className={inputCls}
                />
              </Field>

              <Field label="رقم الهاتف (اختياري)">
                <input
                  type="tel"
                  value={form.contact_phone}
                  onChange={(e) => set("contact_phone", e.target.value)}
                  placeholder="+961 3 000 000"
                  dir="ltr"
                  className={inputCls}
                />
              </Field>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(1)} className={btnGhostCls}>← رجوع</button>
                <button onClick={() => setStep(3)} disabled={!canNext2} className={`${btnPrimaryCls} flex-1`}>
                  التالي ←
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-extrabold text-[#1b3a6b] text-lg mb-4">🎯 نوع الرعاية</h2>

              <Field label="ما الذي يهمك؟" required>
                <div className="grid grid-cols-2 gap-2">
                  {INTERESTS.map((i) => (
                    <button
                      key={i.value}
                      type="button"
                      onClick={() => toggleInterest(i.value)}
                      className={`text-right text-sm px-3 py-2 rounded-xl border-2 transition-all ${
                        form.sponsorship_interest.includes(i.value)
                          ? "border-[#0F4A52] bg-[#0F4A52]/5 text-[#0F4A52] font-bold"
                          : "border-white/10 text-ink-muted hover:border-white/10"
                      }`}
                    >
                      {i.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="الميزانية التقريبية">
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => set("budget_range", b.value)}
                      className={`text-sm px-3 py-1.5 rounded-xl border-2 transition-all ${
                        form.budget_range === b.value
                          ? "border-[#0F4A52] bg-[#0F4A52]/5 text-[#0F4A52] font-bold"
                          : "border-white/10 text-ink-muted hover:border-white/10"
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label="رسالة إضافية (اختياري)">
                <textarea
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  rows={3}
                  placeholder="أي تفاصيل إضافية عن احتياجاتك أو أهدافك..."
                  className={inputCls}
                />
              </Field>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  ❌ {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(2)} className={btnGhostCls}>← رجوع</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !canSubmit}
                  className={`${btnPrimaryCls} flex-1`}
                >
                  {submitting ? "جاري الإرسال..." : "أرسل طلب الرعاية 🚀"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: "👥", label: "+10,000", sub: "طالب شهرياً" },
            { icon: "🏫", label: "150+",    sub: "مدرسة وجامعة" },
            { icon: "🌍", label: "12",      sub: "دولة عربية" },
          ].map((s) => (
            <div key={s.label} className="bg-surface rounded-2xl border border-white/10 p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-lg font-extrabold text-[#1b3a6b]">{s.label}</div>
              <div className="text-xs text-ink-subtle">{s.sub}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-ink-muted">
        {label}{required && <span className="text-red-500 mr-1">*</span>}
      </label>
      {children}
    </div>
  );
}

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4A52]/30 focus:border-[#0F4A52]";
const btnPrimaryCls = "w-full py-3 rounded-xl bg-[#0F4A52] text-white font-bold text-sm hover:bg-[#065a59] disabled:opacity-40 disabled:cursor-not-allowed transition-colors";
const btnGhostCls = "px-4 py-3 rounded-xl border-2 border-white/10 text-ink-muted font-bold text-sm hover:border-white/10 transition-colors";
