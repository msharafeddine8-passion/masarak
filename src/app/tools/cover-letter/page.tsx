"use client";
import { useState } from "react";
import Link from "next/link";

type FormData = {
  applicantName: string;
  applicantTitle: string;
  applicantEmail: string;
  applicantPhone: string;
  jobTitle: string;
  company: string;
  hiringManager: string;
  topSkill1: string;
  topSkill2: string;
  topSkill3: string;
  achievement: string;
  whyCompany: string;
  lang: "arabic" | "english";
  tone: "formal" | "professional" | "enthusiastic";
};

const EMPTY: FormData = {
  applicantName: "", applicantTitle: "", applicantEmail: "", applicantPhone: "",
  jobTitle: "", company: "", hiringManager: "",
  topSkill1: "", topSkill2: "", topSkill3: "",
  achievement: "", whyCompany: "",
  lang: "arabic", tone: "professional",
};

function generateLetter(f: FormData): string {
  const today = new Date().toLocaleDateString("ar-LB", { year: "numeric", month: "long", day: "numeric" });
  const greeting = f.hiringManager ? `السيد/ة ${f.hiringManager} المحترم/ة،` : "إلى مسؤول التوظيف المحترم،";
  const skill1 = f.topSkill1 || "المهارات التقنية";
  const skill2 = f.topSkill2 || "العمل الجماعي";
  const skill3 = f.topSkill3 || "حل المشكلات";
  const achievement = f.achievement || "أنجزت مشاريع ناجحة في مجال تخصصي";
  const whyCompany = f.whyCompany || "سمعتها الرائدة وبيئة عملها الإبداعية";
  const company = f.company || "شركتكم";
  const jobTitle = f.jobTitle || "المنصب المطلوب";
  const name = f.applicantName || "اسمك";
  const title = f.applicantTitle || "المسمى الوظيفي";

  if (f.lang === "english") {
    return `${today}

Dear ${f.hiringManager ? `${f.hiringManager},` : "Hiring Manager,"}

I am writing to express my strong interest in the ${jobTitle} position at ${company}. With my background in ${skill1} and proven expertise in ${skill2} and ${skill3}, I am confident that I would be a valuable addition to your team.

Throughout my career, ${achievement}. This experience has equipped me with the skills and mindset needed to excel in a challenging and dynamic environment like ${company}.

What excites me most about ${company} is ${whyCompany}. I am passionate about contributing to your mission and believe my experience aligns perfectly with what you are looking for.

I would welcome the opportunity to discuss how my background and skills can contribute to ${company}'s continued success. Thank you for your time and consideration.

Sincerely,

${name}
${title}
${f.applicantEmail}
${f.applicantPhone}`;
  }

  return `${today}

${greeting}

يسعدني أن أتقدم بطلبي لشغل منصب **${jobTitle}** في ${company}، وأنا واثق أن خلفيتي في **${skill1}**، وكفاءتي في **${skill2}** و**${skill3}**، ستضيف قيمة حقيقية لفريقكم المتميز.

خلال مسيرتي المهنية، **${achievement}**. هذه التجربة منحتني المهارات والعقلية اللازمة للتميز في بيئة عمل ديناميكية ومبتكرة كـ${company}.

ما يستهويني في ${company} هو ${whyCompany}. أنا متحمس للمساهمة في رؤيتكم، وأؤمن أن خبرتي تتوافق تماماً مع ما تبحثون عنه.

يسعدني أن أناقش معكم كيف يمكنني إثراء مسيرة ${company} نحو مزيد من النجاح. أشكركم على وقتكم واهتمامكم.

مع فائق الاحترام والتقدير،

**${name}**
${title}
${f.applicantEmail ? `✉ ${f.applicantEmail}` : ""}
${f.applicantPhone ? `📞 ${f.applicantPhone}` : ""}`;
}

export default function CoverLetterPage() {
  const [form, setForm] = useState<FormData>(EMPTY);
  const [generated, setGenerated] = useState(false);
  const [letter, setLetter] = useState("");
  const [copied, setCopied] = useState(false);

  function set(field: keyof FormData, val: string) {
    setForm(prev => ({ ...prev, [field]: val }));
    setGenerated(false);
  }

  function handleGenerate() {
    setLetter(generateLetter(form));
    setGenerated(true);
  }

  function handleCopy() {
    navigator.clipboard.writeText(letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handlePrint() {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html dir="${form.lang === "arabic" ? "rtl" : "ltr"}">
      <head><title>Cover Letter</title>
      <style>body{font-family:Arial,sans-serif;padding:60px;line-height:1.8;font-size:14px;color:#222;}</style>
      </head><body>${letter.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")}</body></html>
    `);
    w.document.close();
    w.print();
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";
  const lbl = "block text-xs font-semibold text-text-sub mb-1";

  return (
    <div className="min-h-screen bg-bg">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-extrabold">م</span>
              </div>
              <span className="text-primary font-extrabold text-lg">مسارك</span>
            </Link>
            <span className="text-gray-300">›</span>
            <Link href="/tools" className="text-text-sub text-sm hover:text-primary">الأدوات</Link>
            <span className="text-gray-300">›</span>
            <span className="text-primary text-sm font-semibold">خطاب التقديم</span>
          </div>
          <Link href="/dashboard" className="text-text-sub text-sm hover:text-primary">← الداشبورد</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-r from-[#0E7C7B] to-[#065a59] rounded-2xl p-6 md:p-8 mb-8 text-white">
          <div className="text-4xl mb-2">✉️</div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">كتابة خطاب التقديم</h1>
          <p className="text-white/80 text-sm">أدخل معلوماتك، واحصل على خطاب تقديم احترافي مخصص لكل وظيفة</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-4">
            {/* Settings */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-primary mb-4">⚙️ إعدادات الخطاب</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lbl}>لغة الخطاب</label>
                  <div className="flex gap-2">
                    {(["arabic", "english"] as const).map(l => (
                      <button key={l} onClick={() => set("lang", l)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                          form.lang === l ? "border-[#0E7C7B] bg-[#0E7C7B] text-white" : "border-gray-200 text-text-sub"
                        }`}>
                        {l === "arabic" ? "🇱🇧 عربي" : "🇬🇧 English"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={lbl}>أسلوب الكتابة</label>
                  <select className={inp} value={form.tone} onChange={e => set("tone", e.target.value)}>
                    <option value="formal">رسمي</option>
                    <option value="professional">احترافي</option>
                    <option value="enthusiastic">متحمس</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-primary mb-4">👤 معلوماتك الشخصية</h2>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={lbl}>الاسم الكامل *</label>
                  <input className={inp} value={form.applicantName} onChange={e => set("applicantName", e.target.value)} placeholder="محمد علي حسن" />
                </div>
                <div>
                  <label className={lbl}>المسمى الوظيفي</label>
                  <input className={inp} value={form.applicantTitle} onChange={e => set("applicantTitle", e.target.value)} placeholder="مهندس برمجيات" />
                </div>
                <div>
                  <label className={lbl}>البريد الإلكتروني</label>
                  <input className={inp} value={form.applicantEmail} onChange={e => set("applicantEmail", e.target.value)} placeholder="name@email.com" />
                </div>
                <div>
                  <label className={lbl}>رقم الهاتف</label>
                  <input className={inp} value={form.applicantPhone} onChange={e => set("applicantPhone", e.target.value)} placeholder="+961 70 000 000" />
                </div>
              </div>
            </div>

            {/* Job Info */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-primary mb-4">💼 معلومات الوظيفة</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={lbl}>المسمى الوظيفي المطلوب *</label>
                    <input className={inp} value={form.jobTitle} onChange={e => set("jobTitle", e.target.value)} placeholder="مطور Full-Stack" />
                  </div>
                  <div>
                    <label className={lbl}>اسم الشركة *</label>
                    <input className={inp} value={form.company} onChange={e => set("company", e.target.value)} placeholder="شركة ABC" />
                  </div>
                </div>
                <div>
                  <label className={lbl}>اسم مسؤول التوظيف (اختياري)</label>
                  <input className={inp} value={form.hiringManager} onChange={e => set("hiringManager", e.target.value)} placeholder="ساره الأحمد" />
                </div>
              </div>
            </div>

            {/* Skills & Achievements */}
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
              <h2 className="font-bold text-primary mb-4">⚡ مهاراتك وإنجازاتك</h2>
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {([
                    ["topSkill1", "مهارة #1 (مثل: React)"],
                    ["topSkill2", "مهارة #2 (مثل: التواصل)"],
                    ["topSkill3", "مهارة #3 (مثل: القيادة)"],
                  ] as const).map(([field, ph]) => (
                    <div key={field}>
                      <input className={inp} value={form[field]} onChange={e => set(field, e.target.value)} placeholder={ph} />
                    </div>
                  ))}
                </div>
                <div>
                  <label className={lbl}>أبرز إنجاز لك *</label>
                  <textarea className={inp + " resize-none h-16"} value={form.achievement}
                    onChange={e => set("achievement", e.target.value)}
                    placeholder="مثال: قدت مشروعاً يضم 5 مطورين وأنجزته قبل الموعد بأسبوعين" />
                </div>
                <div>
                  <label className={lbl}>لماذا هذه الشركة تحديداً؟ *</label>
                  <textarea className={inp + " resize-none h-16"} value={form.whyCompany}
                    onChange={e => set("whyCompany", e.target.value)}
                    placeholder="مثال: ريادتها في التكنولوجيا المالية وثقافتها الإبداعية المشجعة للابتكار" />
                </div>
              </div>
            </div>

            <button onClick={handleGenerate}
              className="w-full bg-gradient-to-r from-[#0E7C7B] to-[#065a59] text-white font-extrabold py-4 rounded-xl text-base hover:opacity-90 transition-all shadow-lg">
              ✨ اكتب لي الخطاب الآن
            </button>
          </div>

          {/* Preview */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] overflow-y-auto space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-text-sub">📄 الخطاب المُولَّد</span>
              {generated && (
                <div className="flex gap-2">
                  <button onClick={handleCopy}
                    className={`text-xs px-3 py-1.5 rounded-lg border-2 font-semibold transition-all ${
                      copied ? "border-green-500 text-green-600 bg-green-50" : "border-gray-200 text-text-sub hover:border-[#0E7C7B] hover:text-[#0E7C7B]"
                    }`}>
                    {copied ? "✓ تم النسخ!" : "📋 نسخ"}
                  </button>
                  <button onClick={handlePrint}
                    className="text-xs px-3 py-1.5 rounded-lg border-2 border-[#0E7C7B] text-[#0E7C7B] font-semibold hover:bg-[#0E7C7B] hover:text-white transition-all">
                    🖨️ طباعة
                  </button>
                </div>
              )}
            </div>

            {!generated ? (
              <div className="bg-white rounded-xl border-2 border-dashed border-gray-200 min-h-[500px] flex flex-col items-center justify-center text-center p-8">
                <div className="text-6xl mb-4">✉️</div>
                <h3 className="font-bold text-primary mb-2">خطابك في انتظارك!</h3>
                <p className="text-text-sub text-sm">أكمل المعلومات على اليسار واضغط على زر "اكتب لي الخطاب" لتوليد خطاب احترافي مخصص.</p>
                <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-text-sub">
                  {["مخصص لكل وظيفة", "أسلوب احترافي", "عربي وإنجليزي", "قابل للتعديل"].map(f => (
                    <div key={f} className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center font-bold text-xs">✓</span>
                      {f}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`bg-white rounded-xl border border-gray-100 shadow-sm p-6`} dir={form.lang === "arabic" ? "rtl" : "ltr"}>
                <div className="text-sm leading-[2] text-gray-700 whitespace-pre-wrap font-serif">
                  {letter.split(/\*\*(.*?)\*\*/g).map((part, i) =>
                    i % 2 === 1 ? <strong key={i} className="text-gray-900">{part}</strong> : part
                  )}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100 flex gap-3">
                  <button onClick={handleCopy}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                      copied ? "border-green-500 text-green-600 bg-green-50" : "border-[#0E7C7B] text-[#0E7C7B] hover:bg-[#0E7C7B] hover:text-white"
                    }`}>
                    {copied ? "✓ تم النسخ!" : "📋 نسخ الخطاب"}
                  </button>
                  <button onClick={handlePrint}
                    className="flex-1 py-2 rounded-xl text-sm font-bold bg-gradient-to-r from-[#0E7C7B] to-[#065a59] text-white hover:opacity-90 transition-all">
                    🖨️ طباعة / PDF
                  </button>
                </div>
              </div>
            )}

            {/* Tips */}
            <div className="bg-[#f0fafa] border border-[#0E7C7B]/20 rounded-xl p-4">
              <h3 className="font-bold text-[#0E7C7B] text-sm mb-2">💡 نصائح لخطاب متميز</h3>
              <ul className="text-xs text-text-sub space-y-1">
                <li>• خصص كل خطاب للشركة والوظيفة المحددة</li>
                <li>• استخدم أرقاماً لإبراز إنجازاتك (رفعت المبيعات 30%)</li>
                <li>• اذكر مهارات مطابقة لما هو مذكور في الإعلان</li>
                <li>• أبقِ الخطاب في حدود صفحة واحدة</li>
                <li>• راجع الخطاب وعدّل عليه قبل الإرسال</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
