"use client";
/**
 * /org/request-access
 * للمؤسسات التي ليست موجودة في قاعدة بيانات مسارك بعد —
 * تتقدم لإضافة صفحتها وإدارتها على المنصة.
 */
import { useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

const ORG_TYPES = [
  { value: "university", label: "جامعة / كلية" },
  { value: "school",     label: "مدرسة / ثانوية" },
  { value: "vocational", label: "معهد مهني / تقني" },
  { value: "center",     label: "مركز تدريبي / إرشادي" },
];

const COUNTRIES = [
  "لبنان", "السعودية", "الإمارات", "الأردن", "مصر",
  "الكويت", "قطر", "البحرين", "عُمان", "العراق",
  "سوريا", "المغرب", "دولة أخرى",
];

const LEBANON_PROVINCES = [
  "بيروت",
  "جبل لبنان",
  "الشمال",
  "الجنوب",
  "النبطية",
  "البقاع",
  "عكار",
  "بعلبك-الهرمل",
];

interface FormData {
  org_name: string;
  org_type: string;
  country: string;
  province: string;   // Lebanese province — only used when country === "لبنان"
  city: string;       // City/region for non-Lebanon countries
  website: string;
  contact_name: string;
  contact_email: string;
  contact_role: string;
  note: string;
}

const INITIAL: FormData = {
  org_name: "", org_type: "", country: "", province: "", city: "", website: "",
  contact_name: "", contact_email: "", contact_role: "", note: "",
};

export default function OrgRequestAccessPage() {
  const [form, setForm]       = useState<FormData>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  function set(field: keyof FormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  const canSubmit =
    form.org_name.trim().length >= 2 &&
    form.org_type &&
    form.contact_name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(form.contact_email) &&
    form.note.trim().length >= 10;

  // Compose a readable region string for the DB
  function regionLabel(): string {
    if (!form.country) return "غير محدد";
    if (form.country === "لبنان") {
      return form.province ? `لبنان — ${form.province}` : "لبنان";
    }
    return form.city ? `${form.country} — ${form.city}` : form.country;
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    // Save to sponsor_applications with a special type to distinguish
    const { error: err } = await supabase.from("sponsor_applications").insert({
      org_name: form.org_name.trim(),
      org_type: form.org_type,
      website: form.website.trim() || null,
      contact_name: form.contact_name.trim(),
      contact_email: form.contact_email.trim(),
      sponsorship_interest: ["org_page_request"],
      message: `المنطقة: ${regionLabel()}\nمنصب مقدم الطلب: ${form.contact_role || "غير محدد"}\n\n${form.note.trim()}`,
    });

    setSubmitting(false);
    if (err) { setError("حدث خطأ — يرجى المحاولة مجدداً"); return; }
    setDone(true);
  }

  if (done) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-7xl mb-4">📨</div>
          <h1 className="text-2xl font-extrabold text-[#0F4A52] mb-2">تم إرسال طلبك!</h1>
          <p className="text-ink-subtle leading-relaxed mb-6">
            طلب إضافة <strong>{form.org_name}</strong> وصل لفريق مسارك. سنتواصل معك على{" "}
            <strong dir="ltr">{form.contact_email}</strong> قريباً للتحقق وإعداد صفحتكم.
          </p>
          <div className="flex gap-3 justify-center">
            <Link href="/" className="px-5 py-2.5 bg-[#0F4A52] text-white rounded-xl font-bold text-sm">
              الصفحة الرئيسية
            </Link>
            <Link href="/org/claim" className="px-5 py-2.5 bg-bg-soft text-ink-muted rounded-xl font-bold text-sm">
              إدارة صفحة موجودة
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
        <div className="mb-6">
          <Link href="/" className="text-sm text-ink-subtle hover:text-[#0F4A52] mb-3 inline-block">
            ← مسارك
          </Link>
          <div className="bg-gradient-to-br from-[#0F4A52] to-[#1A6F7C] rounded-2xl p-7 text-white">
            <div className="text-4xl mb-3">🏛️</div>
            <h1 className="text-2xl font-extrabold mb-1">اطلب إضافة مؤسستك على مسارك</h1>
            <p className="text-white/85 text-sm leading-relaxed">
              مؤسستك غير موجودة على المنصة بعد؟ أرسل طلباً وسنضيفها ونُعدّ لها صفحة خاصة.
            </p>
          </div>
        </div>

        {/* Already in DB? */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6 text-sm">
          <span className="font-bold text-blue-800">💡 مؤسستك موجودة على مسارك مسبقاً؟ </span>
          <Link href="/org/claim" className="text-blue-700 underline font-bold">
            اطلب إدارة صفحتها هنا
          </Link>
        </div>

        <div className="bg-surface rounded-2xl border border-line p-6 shadow-sm space-y-4">

          <h2 className="font-extrabold text-[#1b3a6b] text-lg">معلومات المؤسسة</h2>

          <Field label="اسم المؤسسة" required>
            <input
              value={form.org_name}
              onChange={(e) => set("org_name", e.target.value)}
              placeholder="مثال: ثانوية النور، جامعة الشرق"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="النوع" required>
              <select value={form.org_type} onChange={(e) => set("org_type", e.target.value)} className={inputCls}>
                <option value="">— اختر —</option>
                {ORG_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="الدولة">
              <select
                value={form.country}
                onChange={(e) => { set("country", e.target.value); set("province", ""); set("city", ""); }}
                className={inputCls}
              >
                <option value="">— اختر —</option>
                {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
          </div>

          {/* Province (Lebanon) or City (other countries) */}
          {form.country === "لبنان" && (
            <Field label="المحافظة">
              <select value={form.province} onChange={(e) => set("province", e.target.value)} className={inputCls}>
                <option value="">— اختر المحافظة —</option>
                {LEBANON_PROVINCES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </Field>
          )}
          {form.country && form.country !== "لبنان" && (
            <Field label="المدينة / المنطقة">
              <input
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
                placeholder="مثال: الرياض، دبي، عمّان..."
                className={inputCls}
              />
            </Field>
          )}

          <Field label="الموقع الإلكتروني">
            <input
              value={form.website}
              onChange={(e) => set("website", e.target.value)}
              placeholder="https://school.edu.lb"
              dir="ltr"
              className={inputCls}
            />
          </Field>

          <div className="border-t border-line pt-4">
            <h2 className="font-extrabold text-[#1b3a6b] text-lg mb-4">بيانات المسؤول</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="الاسم الكامل" required>
              <input
                value={form.contact_name}
                onChange={(e) => set("contact_name", e.target.value)}
                placeholder="أحمد السيد"
                className={inputCls}
              />
            </Field>
            <Field label="المنصب الوظيفي">
              <input
                value={form.contact_role}
                onChange={(e) => set("contact_role", e.target.value)}
                placeholder="مدير القبول، معلم، ..."
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="البريد الإلكتروني الرسمي" required>
            <input
              type="email"
              value={form.contact_email}
              onChange={(e) => set("contact_email", e.target.value)}
              placeholder="you@school.edu.lb"
              dir="ltr"
              className={inputCls}
            />
          </Field>

          <Field label="لماذا تريد إضافة مؤسستك على مسارك؟" required>
            <textarea
              value={form.note}
              onChange={(e) => set("note", e.target.value)}
              rows={4}
              placeholder="صِف مؤسستك بإيجاز وأخبرنا لماذا ستستفيد من التواجد على مسارك..."
              className={inputCls}
            />
            <p className="text-xs text-ink-subtle">
              {form.note.trim().length} / 10 حرف كحد أدنى
            </p>
          </Field>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              ❌ {error}
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting || !canSubmit}
            className="w-full py-3.5 rounded-xl bg-[#0F4A52] text-white font-bold text-sm hover:bg-[#065a59] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            {submitting ? "جاري الإرسال..." : "أرسل الطلب →"}
          </button>

          <p className="text-xs text-ink-subtle text-center">
            سيتواصل معك فريق مسارك خلال 24-48 ساعة عمل للتحقق وإعداد الصفحة.
          </p>
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

const inputCls =
  "w-full px-3 py-2.5 rounded-xl border border-line text-sm " +
  "focus:outline-none focus:ring-2 focus:ring-[#0F4A52]/30 focus:border-[#0F4A52] " +
  "bg-surface text-ink";
