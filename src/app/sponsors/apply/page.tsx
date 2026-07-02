"use client";
/**
 * /sponsors/apply — صفحة تقديم طلب رعاية مسارك
 * مفتوحة للجميع، لا تحتاج تسجيل دخول.
 */
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useI18n, type TranslationKey } from "@/lib/i18n";

const ORG_TYPES = [
  { value: "university",  labelKey: "sponsapply.orgType.university" },
  { value: "school",      labelKey: "sponsapply.orgType.school" },
  { value: "company",     labelKey: "sponsapply.orgType.company" },
  { value: "ngo",         labelKey: "sponsapply.orgType.ngo" },
  { value: "government",  labelKey: "sponsapply.orgType.government" },
  { value: "other",       labelKey: "sponsapply.orgType.other" },
];

const INTERESTS = [
  { value: "homepage_banner",   labelKey: "sponsapply.interest.homepageBanner" },
  { value: "scholarship_badge", labelKey: "sponsapply.interest.scholarshipBadge" },
  { value: "event_sponsorship", labelKey: "sponsapply.interest.eventSponsorship" },
  { value: "featured_org",      labelKey: "sponsapply.interest.featuredOrg" },
  { value: "newsletter",        labelKey: "sponsapply.interest.newsletter" },
  { value: "career_dna",        labelKey: "sponsapply.interest.careerDna" },
];

const BUDGETS = [
  { value: "under_1k",   labelKey: "sponsapply.budget.under1k" },
  { value: "1k_5k",      labelKey: "sponsapply.budget.1k5k" },
  { value: "5k_15k",     labelKey: "sponsapply.budget.5k15k" },
  { value: "15k_plus",   labelKey: "sponsapply.budget.15kPlus" },
  { value: "flexible",   labelKey: "sponsapply.budget.flexible" },
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
  const { t } = useI18n();
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
    if (err) { setError(t("sponsapply.errorGeneric")); return; }
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
          <h1 className="text-2xl font-extrabold text-[#0F4A52] mb-2">{t("sponsapply.doneTitle")}</h1>
          <p className="text-ink-subtle mb-2 leading-relaxed">
            {t("sponsapply.doneBodyBefore")}{" "}
            <strong dir="ltr">{form.contact_email}</strong> {t("sponsapply.doneBodyAfter")}
          </p>
          <div className="flex gap-3 justify-center mt-6">
            <Link href="/" className="px-5 py-2.5 bg-[#0F4A52] text-white rounded-xl font-bold text-sm">
              {t("sponsapply.homeLink")}
            </Link>
            <Link href="/about" className="px-5 py-2.5 bg-bg-soft text-ink-muted rounded-xl font-bold text-sm">
              {t("sponsapply.aboutLink")}
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
            {t("sponsapply.backLink")}
          </Link>
          <div className="text-5xl mb-3">🤝</div>
          <h1 className="text-3xl font-extrabold text-[#1b3a6b]">{t("sponsapply.headTitle")}</h1>
          <p className="text-ink-subtle mt-2 leading-relaxed">
            {t("sponsapply.headSubtitle")}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1.5 flex-1 rounded-full transition-all ${s <= step ? "bg-[#0F4A52]" : "bg-bg-soft"}`} />
          ))}
        </div>
        <p className="text-xs text-ink-subtle mb-6 text-center">
          {t("sponsapply.stepPrefix")} {step} {t("sponsapply.stepOf")} — {step === 1 ? t("sponsapply.stepOrgData") : step === 2 ? t("sponsapply.stepContactData") : t("sponsapply.stepSponsorType")}
        </p>

        <div className="bg-surface rounded-2xl border border-line p-6 shadow-sm">

          {/* ── Step 1 ── */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="font-extrabold text-[#1b3a6b] text-lg mb-4">🏛️ {t("sponsapply.stepOrgData")}</h2>

              <Field label={t("sponsapply.orgNameLabel")} required>
                <input
                  value={form.org_name}
                  onChange={(e) => set("org_name", e.target.value)}
                  placeholder={t("sponsapply.orgNamePlaceholder")}
                  className={inputCls}
                />
              </Field>

              <Field label={t("sponsapply.orgTypeLabel")} required>
                <select value={form.org_type} onChange={(e) => set("org_type", e.target.value)} className={inputCls}>
                  <option value="">{t("sponsapply.selectPlaceholder")}</option>
                  {ORG_TYPES.map((o) => <option key={o.value} value={o.value}>{t(o.labelKey as TranslationKey)}</option>)}
                </select>
              </Field>

              <Field label={t("sponsapply.websiteLabel")}>
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
                {t("sponsapply.nextBtn")}
              </button>
            </div>
          )}

          {/* ── Step 2 ── */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="font-extrabold text-[#1b3a6b] text-lg mb-4">👤 {t("sponsapply.stepContactData")}</h2>

              <Field label={t("sponsapply.contactNameLabel")} required>
                <input
                  value={form.contact_name}
                  onChange={(e) => set("contact_name", e.target.value)}
                  placeholder={t("sponsapply.contactNamePlaceholder")}
                  className={inputCls}
                />
              </Field>

              <Field label={t("sponsapply.contactEmailLabel")} required>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={(e) => set("contact_email", e.target.value)}
                  placeholder="you@example.com"
                  dir="ltr"
                  className={inputCls}
                />
              </Field>

              <Field label={t("sponsapply.contactPhoneLabel")}>
                <input
                  type="tel"
                  value={form.contact_phone}
                  onChange={(e) => set("contact_phone", e.target.value)}
                  placeholder="+___ ___ ___ ___"
                  dir="ltr"
                  className={inputCls}
                />
              </Field>

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(1)} className={btnGhostCls}>{t("sponsapply.backBtn")}</button>
                <button onClick={() => setStep(3)} disabled={!canNext2} className={`${btnPrimaryCls} flex-1`}>
                  {t("sponsapply.nextBtn")}
                </button>
              </div>
            </div>
          )}

          {/* ── Step 3 ── */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="font-extrabold text-[#1b3a6b] text-lg mb-4">🎯 {t("sponsapply.stepSponsorType")}</h2>

              <Field label={t("sponsapply.interestLabel")} required>
                <div className="grid grid-cols-2 gap-2">
                  {INTERESTS.map((i) => (
                    <button
                      key={i.value}
                      type="button"
                      onClick={() => toggleInterest(i.value)}
                      className={`text-right text-sm px-3 py-2 rounded-xl border-2 transition-all ${
                        form.sponsorship_interest.includes(i.value)
                          ? "border-[#0F4A52] bg-[#0F4A52]/5 text-[#0F4A52] font-bold"
                          : "border-line text-ink-muted hover:border-line"
                      }`}
                    >
                      {t(i.labelKey as TranslationKey)}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={t("sponsapply.budgetLabel")}>
                <div className="flex flex-wrap gap-2">
                  {BUDGETS.map((b) => (
                    <button
                      key={b.value}
                      type="button"
                      onClick={() => set("budget_range", b.value)}
                      className={`text-sm px-3 py-1.5 rounded-xl border-2 transition-all ${
                        form.budget_range === b.value
                          ? "border-[#0F4A52] bg-[#0F4A52]/5 text-[#0F4A52] font-bold"
                          : "border-line text-ink-muted hover:border-line"
                      }`}
                    >
                      {t(b.labelKey as TranslationKey)}
                    </button>
                  ))}
                </div>
              </Field>

              <Field label={t("sponsapply.messageLabel")}>
                <textarea
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  rows={3}
                  placeholder={t("sponsapply.messagePlaceholder")}
                  className={inputCls}
                />
              </Field>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  ❌ {error}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button onClick={() => setStep(2)} className={btnGhostCls}>{t("sponsapply.backBtn")}</button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !canSubmit}
                  className={`${btnPrimaryCls} flex-1`}
                >
                  {submitting ? t("sponsapply.submitting") : t("sponsapply.submitBtn")}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-3 gap-3">
          {[
            { icon: "👥", label: "+10,000", subKey: "sponsapply.benefit.students" },
            { icon: "🏫", label: "150+",    subKey: "sponsapply.benefit.schools" },
            { icon: "🌍", label: "12",      subKey: "sponsapply.benefit.countries" },
          ].map((s) => (
            <div key={s.label} className="bg-surface rounded-2xl border border-line p-4 text-center">
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-lg font-extrabold text-[#1b3a6b]">{s.label}</div>
              <div className="text-xs text-ink-subtle">{t(s.subKey as TranslationKey)}</div>
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

const inputCls = "w-full px-3 py-2.5 rounded-xl border border-line text-sm focus:outline-none focus:ring-2 focus:ring-[#0F4A52]/30 focus:border-[#0F4A52]";
const btnPrimaryCls = "w-full py-3 rounded-xl bg-[#0F4A52] text-white font-bold text-sm hover:bg-[#065a59] disabled:opacity-40 disabled:cursor-not-allowed transition-colors";
const btnGhostCls = "px-4 py-3 rounded-xl border-2 border-line text-ink-muted font-bold text-sm hover:border-line transition-colors";
