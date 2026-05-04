"use client";
import { useState, useRef } from "react";
import Link from "next/link";

type CVData = {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  summary: string;
  experiences: { company: string; role: string; period: string; desc: string }[];
  educations: { school: string; degree: string; year: string; gpa: string }[];
  skills: string[];
  languages: { lang: string; level: string }[];
  certifications: string[];
};

const EMPTY_CV: CVData = {
  name: "", title: "", email: "", phone: "", location: "", linkedin: "", summary: "",
  experiences: [{ company: "", role: "", period: "", desc: "" }],
  educations: [{ school: "", degree: "", year: "", gpa: "" }],
  skills: [""],
  languages: [{ lang: "", level: "متوسط" }],
  certifications: [""],
};

const SAMPLE_CV: CVData = {
  name: "محمد علي حسن",
  title: "مهندس برمجيات",
  email: "mohamad@email.com",
  phone: "+961 70 123 456",
  location: "بيروت، لبنان",
  linkedin: "linkedin.com/in/mohamad",
  summary: "مهندس برمجيات بخبرة 3 سنوات في تطوير تطبيقات الويب والموبايل. متخصص في React وNode.js وقواعد البيانات. شغوف بالتكنولوجيا وحل المشكلات المعقدة.",
  experiences: [
    { company: "شركة التقنية اللبنانية", role: "مطور Full-Stack", period: "2023 - الحاضر", desc: "تطوير تطبيقات ويب باستخدام React وNode.js. تحسين أداء قاعدة البيانات بنسبة 40%." },
    { company: "ستارت-أب بيروت", role: "مطور Front-End", period: "2021 - 2023", desc: "بناء واجهات مستخدم تفاعلية. التعاون مع فريق التصميم لإنتاج تجارب مستخدم رائعة." },
  ],
  educations: [
    { school: "الجامعة الأمريكية في بيروت (AUB)", degree: "بكالوريوس هندسة حاسوب", year: "2021", gpa: "3.8/4.0" },
  ],
  skills: ["React", "Node.js", "TypeScript", "Python", "SQL", "Git", "Docker", "AWS"],
  languages: [{ lang: "العربية", level: "لغة أم" }, { lang: "الإنجليزية", level: "ممتاز" }, { lang: "الفرنسية", level: "متوسط" }],
  certifications: ["AWS Certified Developer", "Google Cloud Professional"],
};

const LANG_LEVELS = ["لغة أم", "ممتاز", "جيد جداً", "متوسط", "مبتدئ"];

export default function CVBuilderPage() {
  const [cv, setCV] = useState<CVData>(EMPTY_CV);
  const [tab, setTab] = useState<"personal" | "experience" | "education" | "skills">("personal");
  const [template, setTemplate] = useState<"classic" | "modern" | "minimal">("modern");
  const printRef = useRef<HTMLDivElement>(null);

  function set(field: keyof CVData, val: unknown) {
    setCV(prev => ({ ...prev, [field]: val }));
  }

  function updateExp(i: number, field: string, val: string) {
    const exps = [...cv.experiences];
    exps[i] = { ...exps[i], [field]: val };
    set("experiences", exps);
  }
  function addExp() { set("experiences", [...cv.experiences, { company: "", role: "", period: "", desc: "" }]); }
  function removeExp(i: number) { set("experiences", cv.experiences.filter((_, idx) => idx !== i)); }

  function updateEdu(i: number, field: string, val: string) {
    const edus = [...cv.educations];
    edus[i] = { ...edus[i], [field]: val };
    set("educations", edus);
  }
  function addEdu() { set("educations", [...cv.educations, { school: "", degree: "", year: "", gpa: "" }]); }
  function removeEdu(i: number) { set("educations", cv.educations.filter((_, idx) => idx !== i)); }

  function updateSkill(i: number, val: string) {
    const skills = [...cv.skills];
    skills[i] = val;
    set("skills", skills);
  }
  function addSkill() { set("skills", [...cv.skills, ""]); }
  function removeSkill(i: number) { set("skills", cv.skills.filter((_, idx) => idx !== i)); }

  function updateLang(i: number, field: string, val: string) {
    const langs = [...cv.languages];
    langs[i] = { ...langs[i], [field]: val };
    set("languages", langs);
  }
  function addLang() { set("languages", [...cv.languages, { lang: "", level: "متوسط" }]); }
  function removeLang(i: number) { set("languages", cv.languages.filter((_, idx) => idx !== i)); }

  function updateCert(i: number, val: string) {
    const certs = [...cv.certifications];
    certs[i] = val;
    set("certifications", certs);
  }
  function addCert() { set("certifications", [...cv.certifications, ""]); }
  function removeCert(i: number) { set("certifications", cv.certifications.filter((_, idx) => idx !== i)); }

  function handlePrint() {
    window.print();
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all";
  const label = "block text-xs font-semibold text-text-sub mb-1";

  const themeColors = {
    classic: { header: "bg-[#1a2d5a]", accent: "#1a2d5a", skill: "bg-[#1a2d5a]/10 text-[#1a2d5a]" },
    modern:  { header: "bg-gradient-to-r from-primary to-[#1e4080]", accent: "#1a4a9f", skill: "bg-primary/10 text-primary" },
    minimal: { header: "bg-gray-800", accent: "#374151", skill: "bg-gray-100 text-gray-700" },
  };
  const theme = themeColors[template];

  return (
    <div className="min-h-screen bg-light">
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #cv-preview, #cv-preview * { visibility: visible !important; }
          #cv-preview { position: fixed !important; top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important; width: 100% !important; height: auto !important; margin: 0 !important; padding: 0 !important; overflow: visible !important; }
          header, nav, .no-print { display: none !important; }
        }
      `}</style>

      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm no-print">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
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
            <span className="text-primary text-sm font-semibold">بناء السيرة الذاتية</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setCV(SAMPLE_CV)}
              className="text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:border-primary text-text-sub hover:text-primary transition-all">
              📋 مثال تجريبي
            </button>
            <button onClick={() => setCV(EMPTY_CV)}
              className="text-sm border border-gray-200 px-3 py-1.5 rounded-lg hover:border-danger text-text-sub hover:text-danger transition-all">
              🗑️ مسح
            </button>
            <button onClick={handlePrint}
              className="btn-primary text-sm px-4 py-2 rounded-lg flex items-center gap-2">
              🖨️ طباعة / PDF
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6 no-print">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-extrabold text-primary">📄 بناء السيرة الذاتية</h1>
            <p className="text-text-sub text-sm mt-0.5">اكتب معلوماتك وشاهد سيرتك تتشكل مباشرةً</p>
          </div>
          {/* Template selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-text-sub font-semibold">القالب:</span>
            {(["classic", "modern", "minimal"] as const).map(t => (
              <button key={t} onClick={() => setTemplate(t)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold border-2 transition-all ${
                  template === t ? "border-primary bg-primary text-white" : "border-gray-200 text-text-sub hover:border-primary"
                }`}>
                {t === "classic" ? "كلاسيكي" : t === "modern" ? "حديث" : "بسيط"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ── LEFT: Form ── */}
          <div className="space-y-4">
            {/* Tab switcher */}
            <div className="flex gap-1 bg-white rounded-xl p-1 border border-gray-100 shadow-sm">
              {([
                ["personal", "👤 الشخصية"],
                ["experience", "💼 الخبرات"],
                ["education", "🎓 التعليم"],
                ["skills", "⚡ المهارات"],
              ] as const).map(([key, label]) => (
                <button key={key} onClick={() => setTab(key)}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                    tab === key ? "bg-primary text-white shadow-sm" : "text-text-sub hover:text-primary"
                  }`}>{label}</button>
              ))}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 space-y-4">

              {/* PERSONAL */}
              {tab === "personal" && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={label}>الاسم الكامل *</label>
                      <input className={inp} value={cv.name} onChange={e => set("name", e.target.value)} placeholder="محمد علي حسن" />
                    </div>
                    <div>
                      <label className={label}>المسمى الوظيفي</label>
                      <input className={inp} value={cv.title} onChange={e => set("title", e.target.value)} placeholder="مهندس برمجيات" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={label}>البريد الإلكتروني</label>
                      <input className={inp} value={cv.email} onChange={e => set("email", e.target.value)} placeholder="name@email.com" />
                    </div>
                    <div>
                      <label className={label}>رقم الهاتف</label>
                      <input className={inp} value={cv.phone} onChange={e => set("phone", e.target.value)} placeholder="+961 70 000 000" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={label}>المدينة / البلد</label>
                      <input className={inp} value={cv.location} onChange={e => set("location", e.target.value)} placeholder="بيروت، لبنان" />
                    </div>
                    <div>
                      <label className={label}>LinkedIn</label>
                      <input className={inp} value={cv.linkedin} onChange={e => set("linkedin", e.target.value)} placeholder="linkedin.com/in/..." dir="ltr" />
                    </div>
                  </div>
                  <div>
                    <label className={label}>ملخص مهني</label>
                    <textarea className={inp + " resize-none h-24"} value={cv.summary}
                      onChange={e => set("summary", e.target.value)}
                      placeholder="اكتب ملخصاً قصيراً عن نفسك ومهاراتك وأهدافك المهنية..." />
                  </div>
                </>
              )}

              {/* EXPERIENCE */}
              {tab === "experience" && (
                <>
                  {cv.experiences.map((exp, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 relative">
                      {cv.experiences.length > 1 && (
                        <button onClick={() => removeExp(i)}
                          className="absolute top-3 left-3 text-xs text-danger hover:bg-danger/10 w-6 h-6 rounded-full flex items-center justify-center">✕</button>
                      )}
                      <div className="text-xs font-bold text-primary mb-2">💼 خبرة #{i + 1}</div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={label}>اسم الشركة</label>
                          <input className={inp} value={exp.company} onChange={e => updateExp(i, "company", e.target.value)} placeholder="شركة ABC" />
                        </div>
                        <div>
                          <label className={label}>المسمى الوظيفي</label>
                          <input className={inp} value={exp.role} onChange={e => updateExp(i, "role", e.target.value)} placeholder="مطور Full-Stack" />
                        </div>
                      </div>
                      <div>
                        <label className={label}>الفترة الزمنية</label>
                        <input className={inp} value={exp.period} onChange={e => updateExp(i, "period", e.target.value)} placeholder="2022 - الحاضر" />
                      </div>
                      <div>
                        <label className={label}>الإنجازات والمهام</label>
                        <textarea className={inp + " resize-none h-20"} value={exp.desc}
                          onChange={e => updateExp(i, "desc", e.target.value)}
                          placeholder="اذكر إنجازاتك بالأرقام: حسّنت الأداء بنسبة 30%، طوّرت ميزة X..." />
                      </div>
                    </div>
                  ))}
                  <button onClick={addExp}
                    className="w-full border-2 border-dashed border-primary/30 text-primary/70 rounded-xl py-3 text-sm font-semibold hover:border-primary hover:text-primary transition-all">
                    + أضف خبرة أخرى
                  </button>
                </>
              )}

              {/* EDUCATION */}
              {tab === "education" && (
                <>
                  {cv.educations.map((edu, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3 relative">
                      {cv.educations.length > 1 && (
                        <button onClick={() => removeEdu(i)}
                          className="absolute top-3 left-3 text-xs text-danger hover:bg-danger/10 w-6 h-6 rounded-full flex items-center justify-center">✕</button>
                      )}
                      <div className="text-xs font-bold text-primary mb-2">🎓 شهادة #{i + 1}</div>
                      <div>
                        <label className={label}>اسم الجامعة / المؤسسة</label>
                        <input className={inp} value={edu.school} onChange={e => updateEdu(i, "school", e.target.value)} placeholder="الجامعة الأمريكية في بيروت" />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={label}>الشهادة / التخصص</label>
                          <input className={inp} value={edu.degree} onChange={e => updateEdu(i, "degree", e.target.value)} placeholder="بكالوريوس هندسة حاسوب" />
                        </div>
                        <div>
                          <label className={label}>سنة التخرج</label>
                          <input className={inp} value={edu.year} onChange={e => updateEdu(i, "year", e.target.value)} placeholder="2024" />
                        </div>
                      </div>
                      <div>
                        <label className={label}>المعدل التراكمي (اختياري)</label>
                        <input className={inp} value={edu.gpa} onChange={e => updateEdu(i, "gpa", e.target.value)} placeholder="3.7 / 4.0" />
                      </div>
                    </div>
                  ))}
                  <button onClick={addEdu}
                    className="w-full border-2 border-dashed border-primary/30 text-primary/70 rounded-xl py-3 text-sm font-semibold hover:border-primary hover:text-primary transition-all">
                    + أضف شهادة أخرى
                  </button>
                </>
              )}

              {/* SKILLS */}
              {tab === "skills" && (
                <>
                  <div>
                    <label className="block text-sm font-bold text-primary mb-3">⚡ المهارات التقنية</label>
                    <div className="grid grid-cols-2 gap-2">
                      {cv.skills.map((skill, i) => (
                        <div key={i} className="flex gap-1">
                          <input className={inp + " flex-1"} value={skill}
                            onChange={e => updateSkill(i, e.target.value)} placeholder={`مهارة ${i + 1}`} />
                          {cv.skills.length > 1 && (
                            <button onClick={() => removeSkill(i)}
                              className="text-danger text-xs px-2 hover:bg-danger/10 rounded">✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button onClick={addSkill} className="mt-2 text-xs text-primary hover:underline">+ أضف مهارة</button>
                  </div>

                  <hr className="border-gray-100" />

                  <div>
                    <label className="block text-sm font-bold text-primary mb-3">🌐 اللغات</label>
                    <div className="space-y-2">
                      {cv.languages.map((lng, i) => (
                        <div key={i} className="flex gap-2 items-center">
                          <input className={inp + " flex-1"} value={lng.lang}
                            onChange={e => updateLang(i, "lang", e.target.value)} placeholder="اللغة" />
                          <select className={inp + " w-32"} value={lng.level}
                            onChange={e => updateLang(i, "level", e.target.value)}>
                            {LANG_LEVELS.map(l => <option key={l}>{l}</option>)}
                          </select>
                          {cv.languages.length > 1 && (
                            <button onClick={() => removeLang(i)}
                              className="text-danger text-xs px-2 hover:bg-danger/10 rounded">✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button onClick={addLang} className="mt-2 text-xs text-primary hover:underline">+ أضف لغة</button>
                  </div>

                  <hr className="border-gray-100" />

                  <div>
                    <label className="block text-sm font-bold text-primary mb-3">🏆 الشهادات والدورات</label>
                    <div className="space-y-2">
                      {cv.certifications.map((cert, i) => (
                        <div key={i} className="flex gap-1">
                          <input className={inp + " flex-1"} value={cert}
                            onChange={e => updateCert(i, e.target.value)} placeholder="اسم الشهادة أو الدورة" />
                          {cv.certifications.length > 1 && (
                            <button onClick={() => removeCert(i)}
                              className="text-danger text-xs px-2 hover:bg-danger/10 rounded">✕</button>
                          )}
                        </div>
                      ))}
                    </div>
                    <button onClick={addCert} className="mt-2 text-xs text-primary hover:underline">+ أضف شهادة</button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* ── RIGHT: Live Preview ── */}
          <div className="lg:sticky lg:top-24 lg:h-[calc(100vh-120px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-text-sub">👁️ معاينة مباشرة</span>
              <button onClick={handlePrint}
                className="btn-primary text-xs px-4 py-2 rounded-lg flex items-center gap-1.5">
                🖨️ تصدير PDF
              </button>
            </div>

            <div id="cv-preview" ref={printRef}
              className="bg-white shadow-xl rounded-xl overflow-hidden text-right"
              style={{ minHeight: "842px", fontFamily: "'Segoe UI', Arial, sans-serif" }}
              dir="rtl">

              {/* CV Header */}
              <div className={`${theme.header} px-8 py-7 text-white`}>
                <h1 className="text-2xl font-extrabold mb-0.5">
                  {cv.name || <span className="opacity-40">اسمك الكامل</span>}
                </h1>
                {cv.title && <p className="text-white/80 text-sm font-semibold mb-3">{cv.title}</p>}
                <div className="flex flex-wrap gap-4 text-xs text-white/80 mt-2">
                  {cv.email && <span>✉ {cv.email}</span>}
                  {cv.phone && <span>📞 {cv.phone}</span>}
                  {cv.location && <span>📍 {cv.location}</span>}
                  {cv.linkedin && <span>🔗 {cv.linkedin}</span>}
                </div>
              </div>

              <div className="p-6 space-y-5 text-sm">

                {/* Summary */}
                {cv.summary && (
                  <div>
                    <h2 className="font-extrabold text-xs uppercase tracking-widest mb-2 pb-1 border-b-2"
                      style={{ color: theme.accent, borderColor: theme.accent }}>الملخص المهني</h2>
                    <p className="text-gray-600 leading-relaxed text-xs">{cv.summary}</p>
                  </div>
                )}

                {/* Experience */}
                {cv.experiences.some(e => e.company || e.role) && (
                  <div>
                    <h2 className="font-extrabold text-xs uppercase tracking-widest mb-3 pb-1 border-b-2"
                      style={{ color: theme.accent, borderColor: theme.accent }}>الخبرات العملية</h2>
                    <div className="space-y-3">
                      {cv.experiences.filter(e => e.company || e.role).map((exp, i) => (
                        <div key={i}>
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-bold text-gray-800 text-xs">{exp.role}</div>
                              <div className="text-gray-500 text-xs">{exp.company}</div>
                            </div>
                            {exp.period && <span className="text-gray-400 text-xs">{exp.period}</span>}
                          </div>
                          {exp.desc && <p className="text-gray-600 text-xs mt-1 leading-relaxed">{exp.desc}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {cv.educations.some(e => e.school || e.degree) && (
                  <div>
                    <h2 className="font-extrabold text-xs uppercase tracking-widest mb-3 pb-1 border-b-2"
                      style={{ color: theme.accent, borderColor: theme.accent }}>التعليم</h2>
                    <div className="space-y-2">
                      {cv.educations.filter(e => e.school || e.degree).map((edu, i) => (
                        <div key={i} className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-gray-800 text-xs">{edu.degree}</div>
                            <div className="text-gray-500 text-xs">{edu.school}</div>
                            {edu.gpa && <div className="text-gray-400 text-xs">المعدل: {edu.gpa}</div>}
                          </div>
                          {edu.year && <span className="text-gray-400 text-xs">{edu.year}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {cv.skills.some(s => s) && (
                  <div>
                    <h2 className="font-extrabold text-xs uppercase tracking-widest mb-3 pb-1 border-b-2"
                      style={{ color: theme.accent, borderColor: theme.accent }}>المهارات</h2>
                    <div className="flex flex-wrap gap-1.5">
                      {cv.skills.filter(s => s).map((s, i) => (
                        <span key={i} className={`text-xs px-2.5 py-1 rounded-full font-semibold ${theme.skill}`}>{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {cv.languages.some(l => l.lang) && (
                  <div>
                    <h2 className="font-extrabold text-xs uppercase tracking-widest mb-3 pb-1 border-b-2"
                      style={{ color: theme.accent, borderColor: theme.accent }}>اللغات</h2>
                    <div className="flex flex-wrap gap-4">
                      {cv.languages.filter(l => l.lang).map((l, i) => (
                        <div key={i} className="text-xs">
                          <span className="font-bold text-gray-700">{l.lang}</span>
                          <span className="text-gray-400 mr-1">— {l.level}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {cv.certifications.some(c => c) && (
                  <div>
                    <h2 className="font-extrabold text-xs uppercase tracking-widest mb-3 pb-1 border-b-2"
                      style={{ color: theme.accent, borderColor: theme.accent }}>الشهادات والدورات</h2>
                    <ul className="space-y-1">
                      {cv.certifications.filter(c => c).map((c, i) => (
                        <li key={i} className="text-xs text-gray-600 flex items-center gap-2">
                          <span style={{ color: theme.accent }}>▸</span> {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
