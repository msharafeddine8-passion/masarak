"use client";
// Partnership lead capture — used on /for-schools and /for-universities (?partnership=1).
// School/University accounts cannot self-register. They submit this form; admin reviews.
// If the DB table isn't created yet, we fall back to mailto so requests still arrive.

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = { orgType: "school" | "university" };

const SUPPORT_EMAIL = "support@masaraklb.com";

export default function PartnershipForm({ orgType }: Props) {
  const [orgName, setOrgName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("لبنان");
  const [numStudents, setNumStudents] = useState("");
  const [capacity, setCapacity] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [fallback, setFallback] = useState<{ subject: string; body: string } | null>(null);
  const [error, setError] = useState("");

  const isUni = orgType === "university";
  const labels = {
    title: isUni ? "اطلب شراكة جامعة" : "اطلب شراكة مدرسة",
    desc: isUni
      ? "حدّثنا عن جامعتكم ومنطقة اهتمامكم. فريقنا يراجع كل طلب ويتواصل معكم."
      : "حدّثنا عن مدرستكم. فريقنا يراجع كل طلب ويتواصل معكم بأسرع وقت.",
    name: isUni ? "اسم الجامعة" : "اسم المدرسة",
    placeholder: isUni ? "الجامعة الأمريكية في بيروت" : "مدرسة سيدة الجمهور",
    locField: isUni ? "البلد" : "المدينة",
    sizeField: isUni ? "طاقة استقبال الطلاب" : "عدد الطلاب",
  };

  function buildEmailBody() {
    const subject = `طلب شراكة ${isUni ? "جامعة" : "مدرسة"} — ${orgName}`;
    const lines = [
      `النوع: ${isUni ? "جامعة" : "مدرسة"}`,
      `الاسم: ${orgName}`,
      `الشخص المسؤول: ${contactPerson}`,
      position && `المنصب: ${position}`,
      `البريد: ${email}`,
      phone && `الهاتف: ${phone}`,
      isUni && country && `البلد: ${country}`,
      !isUni && city && `المدينة: ${city}`,
      isUni && capacity && `طاقة الاستقبال: ${capacity}`,
      !isUni && numStudents && `عدد الطلاب: ${numStudents}`,
      message && `\nالرسالة:\n${message}`,
    ].filter(Boolean).join("\n");
    return { subject, body: lines };
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const payload = {
      org_type: orgType,
      org_name: orgName.trim(),
      contact_person: contactPerson.trim(),
      position: position.trim() || null,
      email: email.trim(),
      phone: phone.trim() || null,
      message: message.trim() || null,
      ...(isUni
        ? { country: country.trim() || null, student_capacity: capacity ? Number(capacity) : null }
        : { city: city.trim() || null, num_students: numStudents ? Number(numStudents) : null }),
    };

    try {
      const { error: insErr } = await supabase.from("partnership_requests").insert(payload as any);
      if (insErr) throw insErr;
      setSent(true);
    } catch (err) {
      // DB insert failed (table maybe not created yet). Fall back to mailto.
      // This guarantees requests still reach the team while the admin runs the SQL migration.
      const { subject, body } = buildEmailBody();
      setFallback({ subject, body });
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 text-center" dir="rtl">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-extrabold text-emerald-800 mb-2">وصلنا طلبك!</h2>
        <p className="text-emerald-900 leading-relaxed">
          شكراً للتواصل. فريق مسارك بيراجع طلب الشراكة ورح يتواصل معك خلال 2-3 أيام عمل
          على البريد <span dir="ltr" className="font-bold">{email}</span>.
        </p>
      </div>
    );
  }

  if (fallback) {
    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(fallback.subject)}&body=${encodeURIComponent(fallback.body)}`;
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-8" dir="rtl">
        <div className="text-5xl mb-3 text-center">📧</div>
        <h2 className="text-xl font-extrabold text-amber-900 mb-3 text-center">خطوة أخيرة — أرسل بريدك</h2>
        <p className="text-amber-900 mb-4 leading-relaxed">
          نظامنا يستقبل الطلبات بكامل تفاصيلها. اضغط الزر تحت — رح ينفتح بريدك مع كل
          البيانات اللي عبّيتها جاهزة. بعد ما تبعت، نتواصل معك خلال 2-3 أيام عمل.
        </p>
        <a
          href={href}
          className="block w-full text-center py-3.5 rounded-2xl bg-amber-600 text-white font-extrabold hover:bg-amber-700 transition mb-3"
        >
          📤 افتح البريد وأرسل لـ {SUPPORT_EMAIL}
        </a>
        <button
          onClick={() => setFallback(null)}
          className="block w-full text-center py-2 text-amber-800 text-sm font-bold hover:underline"
        >
          رجوع وتعديل البيانات
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface rounded-3xl border border-white/10 p-6 md:p-8 shadow-sm space-y-4"
      dir="rtl"
    >
      <header className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#012730] mb-2">{labels.title}</h2>
        <p className="text-ink-muted">{labels.desc}</p>
        <p className="text-xs text-ink-subtle mt-3">
          📨 الطلب بيوصل لفريق مسارك على <span dir="ltr" className="font-bold">{SUPPORT_EMAIL}</span>
        </p>
      </header>

      <Field label={labels.name} required>
        <input value={orgName} onChange={(e) => setOrgName(e.target.value)} required placeholder={labels.placeholder} className="input" />
      </Field>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="الشخص المسؤول" required>
          <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required className="input" />
        </Field>
        <Field label="المنصب">
          <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder="مدير، عميد، منسّق..." className="input" />
        </Field>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label="البريد الإلكتروني" required>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" className="input" />
        </Field>
        <Field label="رقم الهاتف">
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" placeholder="+961 70 000 000" className="input" />
        </Field>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label={labels.locField}>
          {isUni ? (
            <input value={country} onChange={(e) => setCountry(e.target.value)} className="input" />
          ) : (
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder="بيروت" className="input" />
          )}
        </Field>
        <Field label={labels.sizeField}>
          <input
            type="number"
            min="1"
            value={isUni ? capacity : numStudents}
            onChange={(e) => (isUni ? setCapacity : setNumStudents)(e.target.value.replace(/[^0-9]/g, ""))}
            dir="ltr"
            className="input"
          />
        </Field>
      </div>

      <Field label="رسالتك (اختياري)">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="حدّثنا عن أهدافكم ونوع الشراكة اللي يهمكم..."
          className="input resize-none"
        />
      </Field>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">⚠️ {error}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-[#012730] text-white font-extrabold hover:bg-[#143b43] transition disabled:opacity-60"
      >
        {loading ? "جارٍ الإرسال..." : "إرسال طلب الشراكة ←"}
      </button>

      <p className="text-xs text-ink-subtle text-center">
        فريقنا يراجع كل طلب ويتواصل خلال 2-3 أيام عمل.
      </p>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-ink-muted mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
