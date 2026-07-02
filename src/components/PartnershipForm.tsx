"use client";
// Partnership lead capture — used on /for-schools and /for-universities (?partnership=1).
// School/University accounts cannot self-register. They submit this form; admin reviews.
// If the DB table isn't created yet, we fall back to mailto so requests still arrive.

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useI18n } from "@/lib/i18n";

type Props = { orgType: "school" | "university" };

const SUPPORT_EMAIL = "support@masaraklb.com";

export default function PartnershipForm({ orgType }: Props) {
  const { t } = useI18n();
  const [orgName, setOrgName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [position, setPosition] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("");
  const [numStudents, setNumStudents] = useState("");
  const [capacity, setCapacity] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [fallback, setFallback] = useState<{ subject: string; body: string } | null>(null);
  const [error, setError] = useState("");

  const isUni = orgType === "university";
  const labels = {
    title: isUni ? t("pform.titleUni") : t("pform.titleSchool"),
    desc: isUni ? t("pform.descUni") : t("pform.descSchool"),
    name: isUni ? t("pform.nameUni") : t("pform.nameSchool"),
    placeholder: isUni ? t("pform.placeholderUni") : t("pform.placeholderSchool"),
    locField: isUni ? t("pform.locCountry") : t("pform.locCity"),
    sizeField: isUni ? t("pform.sizeCapacity") : t("pform.sizeStudents"),
  };

  function buildEmailBody() {
    const orgWord = isUni ? t("pform.wordUni") : t("pform.wordSchool");
    const subject = `${t("pform.emailSubject")} ${orgWord} — ${orgName}`;
    const lines = [
      `${t("pform.emailType")}: ${orgWord}`,
      `${t("pform.emailName")}: ${orgName}`,
      `${t("pform.emailContact")}: ${contactPerson}`,
      position && `${t("pform.emailPosition")}: ${position}`,
      `${t("pform.emailEmail")}: ${email}`,
      phone && `${t("pform.emailPhone")}: ${phone}`,
      isUni && country && `${t("pform.emailCountry")}: ${country}`,
      !isUni && city && `${t("pform.emailCity")}: ${city}`,
      isUni && capacity && `${t("pform.emailCapacity")}: ${capacity}`,
      !isUni && numStudents && `${t("pform.emailStudents")}: ${numStudents}`,
      message && `\n${t("pform.emailMessage")}:\n${message}`,
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
      const { error: insErr } = await supabase.from("partnership_requests").insert(payload as never);
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
        <h2 className="text-2xl font-extrabold text-emerald-800 mb-2">{t("pform.sentTitle")}</h2>
        <p className="text-emerald-900 leading-relaxed">
          {t("pform.sentBodyBefore")}{" "}
          <span dir="ltr" className="font-bold">{email}</span>.
        </p>
      </div>
    );
  }

  if (fallback) {
    const href = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(fallback.subject)}&body=${encodeURIComponent(fallback.body)}`;
    return (
      <div className="bg-amber-50 border-2 border-amber-200 rounded-3xl p-8" dir="rtl">
        <div className="text-5xl mb-3 text-center">📧</div>
        <h2 className="text-xl font-extrabold text-amber-900 mb-3 text-center">{t("pform.fbTitle")}</h2>
        <p className="text-amber-900 mb-4 leading-relaxed">
          {t("pform.fbBody")}
        </p>
        <a
          href={href}
          className="block w-full text-center py-3.5 rounded-2xl bg-amber-600 text-white font-extrabold hover:bg-amber-700 transition mb-3"
        >
          📤 {t("pform.fbOpenMail")} {SUPPORT_EMAIL}
        </a>
        <button
          onClick={() => setFallback(null)}
          className="block w-full text-center py-2 text-amber-800 text-sm font-bold hover:underline"
        >
          {t("pform.fbBack")}
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-4"
      dir="rtl"
    >
      <header className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-extrabold text-[#012730] mb-2">{labels.title}</h2>
        <p className="text-gray-600">{labels.desc}</p>
        <p className="text-xs text-gray-500 mt-3">
          📨 {t("pform.headerNote")} <span dir="ltr" className="font-bold">{SUPPORT_EMAIL}</span>
        </p>
      </header>

      <Field label={labels.name} required>
        <input value={orgName} onChange={(e) => setOrgName(e.target.value)} required placeholder={labels.placeholder} className="input" />
      </Field>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label={t("pform.contactLabel")} required>
          <input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} required className="input" />
        </Field>
        <Field label={t("pform.positionLabel")}>
          <input value={position} onChange={(e) => setPosition(e.target.value)} placeholder={t("pform.positionPlaceholder")} className="input" />
        </Field>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label={t("pform.emailLabel")} required>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" className="input" />
        </Field>
        <Field label={t("pform.phoneLabel")}>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" placeholder="+___ ___ ___ ___" className="input" />
        </Field>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Field label={labels.locField}>
          {isUni ? (
            <input value={country} onChange={(e) => setCountry(e.target.value)} className="input" />
          ) : (
            <input value={city} onChange={(e) => setCity(e.target.value)} placeholder={t("pform.locCity")} className="input" />
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

      <Field label={t("pform.messageLabel")}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder={t("pform.messagePlaceholder")}
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
        {loading ? t("pform.submitting") : t("pform.submit")}
      </button>

      <p className="text-xs text-gray-500 text-center">
        {t("pform.footerNote")}
      </p>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-sm font-bold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
