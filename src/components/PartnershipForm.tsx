"use client";
// Partnership lead capture — used on /for-schools and /for-universities (?partnership=1).
// School/University accounts cannot self-register. They submit this form; admin reviews.

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Props = { orgType: "school" | "university" };

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
    const { error: insErr } = await supabase.from("partnership_requests").insert(payload);
    setLoading(false);
    if (insErr) {
      setError("صار خطأ بإرسال الطلب. حاول مرة ثانية أو راسلنا على support@masaraklb.com");
      return;
    }
    setSent(true);
  }

  if (sent) {
    return (
      <div className="bg-emerald-50 border-2 border-emerald-200 rounded-3xl p-8 text-center" dir="rtl">
        <div className="text-6xl mb-4">✅</div>
        <h2 className="text-2xl font-extrabold text-emerald-800 mb-2">وصلنا طلبك!</h2>
        <p className="text-emerald-900 leading-relaxed">
          شكراً للتواصل. فريق مسارك بيراجع طلب الشراكة ورح يتواصل معك خلال 2-3 أيام عمل.
        </p>
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
      </header>

      <Field label={labels.name} required>
        <input
          value={orgName}
          onChange={(e) => setOrgName(e.target.value)}
          required
          placeholder={labels.placeholder}
          className="input"
        />
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
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-3 text-sm">
          ⚠️ {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-2xl bg-[#012730] text-white font-extrabold hover:bg-[#143b43] transition disabled:opacity-60"
      >
        {loading ? "جارٍ الإرسال..." : "إرسال طلب الشراكة ←"}
      </button>

      <p className="text-xs text-gray-500 text-center">
        فريقنا يراجع كل طلب ويتواصل خلال 2-3 أيام عمل.
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
