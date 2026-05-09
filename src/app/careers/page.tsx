"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

interface Career {
  id: string;
  title: string;
  titleAr: string;
  emoji: string;
  category: string;
  demand: "عالي جداً" | "عالي" | "متوسط";
  demandColor: string;
  salaryLB: string;
  salaryRemote: string;
  yearsToEntry: string;
  description: string;
  skills: string[];
  certifications: string[];
  universities: string[];
  roadmap: string[];
}

const CAREERS: Career[] = [
  {
    id: "software-engineer", title: "Software Engineer", titleAr: "مهندس برمجيات", emoji: "💻",
    category: "تكنولوجيا", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700",
    salaryLB: "$800–$2,500", salaryRemote: "$3,000–$8,000",
    yearsToEntry: "4 سنوات", description: "تصميم وبناء التطبيقات والأنظمة البرمجية. من أكثر المجالات طلباً في لبنان والعالم.",
    skills: ["JavaScript", "Python", "React", "Node.js", "SQL", "Git"],
    certifications: ["AWS Certified", "Google Cloud", "Meta Front-End"],
    universities: ["AUB", "LAU", "USJ", "NDU"],
    roadmap: ["تعلّم أساسيات البرمجة", "اختر تخصصك (Frontend/Backend/Full-Stack)", "ابنِ 3–5 مشاريع Portfolio", "تدريب صيفي في شركة تقنية", "احضر Hackathons ومجتمعات Dev"],
  },
  {
    id: "data-scientist", title: "Data Scientist", titleAr: "عالم بيانات", emoji: "📊",
    category: "بيانات", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700",
    salaryLB: "$700–$2,000", salaryRemote: "$4,000–$10,000",
    yearsToEntry: "4–5 سنوات", description: "تحليل البيانات الضخمة واستخراج رؤى تساعد الشركات على اتخاذ قرارات أفضل.",
    skills: ["Python", "SQL", "Machine Learning", "Statistics", "Tableau", "Pandas"],
    certifications: ["IBM Data Science", "Google Data Analytics", "Kaggle Competitions"],
    universities: ["AUB", "LAU", "USEK"],
    roadmap: ["دراسة الرياضيات والإحصاء", "تعلّم Python وSQL", "إتقان مكتبات Data Science", "بناء مشاريع Kaggle", "الحصول على شهادة معتمدة"],
  },
  {
    id: "doctor", title: "Medical Doctor", titleAr: "طبيب", emoji: "🏥",
    category: "طب وصحة", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700",
    salaryLB: "$1,500–$5,000+", salaryRemote: "N/A",
    yearsToEntry: "7–10 سنوات", description: "تشخيص وعلاج الأمراض ورعاية المرضى. من أرفع المهن في لبنان مع مسار واضح للتخصص.",
    skills: ["التشخيص الطبي", "الفحص السريري", "قراءة الأشعة", "التواصل مع المرضى", "الطوارئ"],
    certifications: ["شهادة طب بشري", "Board Certification", "تخصص بعد الدراسة"],
    universities: ["AUB Medicine", "USJ Médecine", "BAU Medicine", "UOB Medicine"],
    roadmap: ["دراسة العلوم في الثانوية بمعدل عالٍ", "الالتحاق بكلية الطب (6 سنوات)", "السنة الإقامية", "الحصول على ترخيص مزاولة المهنة", "اختيار التخصص"],
  },
  {
    id: "business-analyst", title: "Business Analyst", titleAr: "محلل أعمال", emoji: "📈",
    category: "إدارة أعمال", demand: "عالي", demandColor: "bg-blue-100 text-blue-700",
    salaryLB: "$600–$1,800", salaryRemote: "$2,000–$5,000",
    yearsToEntry: "4 سنوات", description: "تحليل عمليات الشركات وتحديد فرص التحسين والنمو من خلال البيانات والمنهجيات التحليلية.",
    skills: ["Excel", "Power BI", "SQL", "Process Mapping", "Stakeholder Management"],
    certifications: ["CBAP", "PMI-PBA", "Google Data Analytics"],
    universities: ["AUB", "LAU", "USJ", "NDU"],
    roadmap: ["دراسة إدارة الأعمال أو الهندسة الصناعية", "إتقان Excel وPower BI", "تعلّم منهجيات التحليل", "اكتساب خبرة في قطاع محدد", "الحصول على شهادة CBAP"],
  },
  {
    id: "graphic-designer", title: "Graphic Designer", titleAr: "مصمم جرافيك", emoji: "🎨",
    category: "إبداعي", demand: "عالي", demandColor: "bg-blue-100 text-blue-700",
    salaryLB: "$400–$1,200", salaryRemote: "$1,500–$4,000",
    yearsToEntry: "3–4 سنوات", description: "تصميم الهويات البصرية والمواد الإعلانية والمحتوى الرقمي للشركات والعلامات التجارية.",
    skills: ["Adobe Illustrator", "Photoshop", "Figma", "Typography", "Branding"],
    certifications: ["Adobe Certified", "Google UX Design"],
    universities: ["LAU Design", "LU Fine Arts", "NDU Graphic Design"],
    roadmap: ["بناء أساس قوي في أدوات Adobe", "دراسة نظرية التصميم والألوان", "بناء Portfolio متنوع", "تدريب في وكالة إعلانية", "التخصص في Brand Design أو Motion"],
  },
  {
    id: "digital-marketer", title: "Digital Marketer", titleAr: "مسوّق رقمي", emoji: "📱",
    category: "تسويق", demand: "عالي", demandColor: "bg-blue-100 text-blue-700",
    salaryLB: "$500–$1,500", salaryRemote: "$1,500–$4,000",
    yearsToEntry: "3–4 سنوات", description: "إدارة الحملات التسويقية الرقمية عبر منصات التواصل الاجتماعي والبحث والبريد الإلكتروني.",
    skills: ["Meta Ads", "Google Ads", "SEO", "Content Writing", "Analytics"],
    certifications: ["Meta Blueprint", "Google Digital Marketing", "HubSpot"],
    universities: ["AUB", "LAU", "NDU", "USEK"],
    roadmap: ["تعلّم أساسيات التسويق الرقمي", "احصل على شهادة Google/Meta", "أنشئ حملات تجريبية بميزانية صغيرة", "ابنِ Portfolio من نتائج حقيقية", "تخصّص في paid ads أو content"],
  },
  {
    id: "accountant", title: "Accountant / CPA", titleAr: "محاسب / مدقق حسابات", emoji: "📒",
    category: "مالي", demand: "عالي", demandColor: "bg-blue-100 text-blue-700",
    salaryLB: "$500–$1,800", salaryRemote: "$1,500–$3,500",
    yearsToEntry: "4 سنوات", description: "إدارة السجلات المالية وإعداد القوائم المالية وضمان الامتثال للتشريعات الضريبية.",
    skills: ["Excel", "QuickBooks", "SAP", "Tax Law", "Financial Reporting", "IFRS"],
    certifications: ["CPA", "ACCA", "CMA"],
    universities: ["AUB", "LAU", "USJ", "LU"],
    roadmap: ["دراسة المحاسبة أو المالية", "إتقان Excel وبرامج المحاسبة", "اكتساب خبرة في firm محاسبية", "الحصول على شهادة ACCA أو CPA", "التخصص في Audit أو Tax أو Advisory"],
  },
  {
    id: "lawyer", title: "Lawyer", titleAr: "محامي", emoji: "⚖️",
    category: "قانوني", demand: "متوسط", demandColor: "bg-yellow-100 text-yellow-700",
    salaryLB: "$600–$3,000+", salaryRemote: "محدود",
    yearsToEntry: "5–6 سنوات", description: "تمثيل الموكلين أمام المحاكم وتقديم الاستشارات القانونية في مجالات متنوعة.",
    skills: ["القانون المدني", "القانون التجاري", "البحث القانوني", "التفاوض", "كتابة المذكرات"],
    certifications: ["إجازة في الحقوق", "شهادة Bar Exam", "LLM (اختياري)"],
    universities: ["USJ Droit", "LU Law", "Balamand", "NDU"],
    roadmap: ["دراسة الحقوق (4 سنوات)", "اجتياز امتحان Bar Exam", "التمرين في مكتب محاماة", "التخصص في مجال قانوني", "بناء شبكة علاقات مهنية"],
  },
  {
    id: "architect", title: "Architect", titleAr: "مهندس معماري", emoji: "🏗️",
    category: "هندسة", demand: "متوسط", demandColor: "bg-yellow-100 text-yellow-700",
    salaryLB: "$500–$1,500", salaryRemote: "$1,500–$3,500",
    yearsToEntry: "5 سنوات", description: "تصميم المباني والفضاءات مع مراعاة الجماليات والوظيفية ومعايير السلامة.",
    skills: ["AutoCAD", "Revit", "SketchUp", "3ds Max", "Structural Knowledge"],
    certifications: ["شهادة العمارة", "LEED Certification", "Order of Engineers"],
    universities: ["AUB Architecture", "LAU Architecture", "NDU Architecture"],
    roadmap: ["دراسة الهندسة المعمارية (5 سنوات)", "إتقان برامج 3D وCAD", "تدريب في مكتب هندسي", "بناء Portfolio من المشاريع", "التسجيل في نقابة المهندسين"],
  },
  {
    id: "teacher", title: "Teacher / Educator", titleAr: "معلم / مدرّس", emoji: "🍎",
    category: "تعليم", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700",
    salaryLB: "$300–$1,000", salaryRemote: "$800–$2,500",
    yearsToEntry: "4 سنوات", description: "توجيه وتعليم الطلاب في مختلف المراحل الدراسية وتنمية مهاراتهم الأكاديمية والشخصية.",
    skills: ["التخطيط التعليمي", "إدارة الصف", "تطوير المناهج", "التقييم", "التواصل"],
    certifications: ["إجازة في التربية", "Teaching Certificate", "TEFL/TESOL"],
    universities: ["LAU Education", "NDU", "Balamand", "USEK"],
    roadmap: ["دراسة التربية أو التخصص + تربية", "التدريب الميداني في مدرسة", "الحصول على شهادة التعليم", "اكتساب خبرة في الصف", "التخصص في مرحلة أو مادة معينة"],
  },
  {
    id: "nurse", title: "Nurse", titleAr: "ممرضة / ممرض", emoji: "💉",
    category: "طب وصحة", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700",
    salaryLB: "$400–$1,200", salaryRemote: "N/A",
    yearsToEntry: "3–4 سنوات", description: "رعاية المرضى وتنفيذ الخطط العلاجية والتنسيق مع الفريق الطبي في المستشفيات والعيادات.",
    skills: ["الرعاية السريرية", "قراءة العلامات الحيوية", "إعطاء الأدوية", "التواصل مع المرضى", "الطوارئ"],
    certifications: ["BSN", "RN License", "ACLS/BLS"],
    universities: ["AUB Nursing", "BAU Nursing", "Balamand Nursing", "NDU"],
    roadmap: ["دراسة التمريض (3–4 سنوات)", "التدريب السريري المكثف", "الحصول على ترخيص RN", "العمل في مستشفى كبير", "التخصص في ICU أو ER أو غيره"],
  },
  {
    id: "hr-manager", title: "HR Manager", titleAr: "مدير موارد بشرية", emoji: "👥",
    category: "إدارة", demand: "متوسط", demandColor: "bg-yellow-100 text-yellow-700",
    salaryLB: "$600–$2,000", salaryRemote: "$1,500–$4,000",
    yearsToEntry: "4–5 سنوات", description: "إدارة دورة حياة الموظفين من التوظيف والتطوير حتى الاحتفاظ بالمواهب وتطوير ثقافة الشركة.",
    skills: ["Recruitment", "Labor Law", "Performance Management", "Training & Dev", "HRIS"],
    certifications: ["SHRM-CP", "PHR", "CIPD"],
    universities: ["AUB", "LAU", "USJ", "NDU"],
    roadmap: ["دراسة إدارة الأعمال أو علم النفس", "تدريب في قسم HR", "إتقان أدوات HR التقنية", "دراسة قانون العمل اللبناني", "الحصول على شهادة SHRM"],
  },
];

const CATEGORIES = ["الكل", ...Array.from(new Set(CAREERS.map(c => c.category)))];
const DEMAND_FILTER = ["الكل", "عالي جداً", "عالي", "متوسط"];

export default function CareersPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [demand, setDemand] = useState("الكل");
  const [selected, setSelected] = useState<Career | null>(null);

  const filtered = useMemo(() => CAREERS.filter(c => {
    const matchSearch = !search || c.titleAr.includes(search) || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.includes(search);
    const matchCat = category === "الكل" || c.category === category;
    const matchDemand = demand === "الكل" || c.demand === demand;
    return matchSearch && matchCat && matchDemand;
  }), [search, category, demand]);

  return (
    <div className="min-h-screen bg-light">

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1A3C6E] to-[#0E7C7B] rounded-2xl p-8 md:p-12 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <span className="bg-white/20 text-white/90 text-xs font-bold px-3 py-1 rounded-full">خرائط المسارات المهنية</span>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-3 mb-3">استكشف المسارات المهنية</h1>
              <p className="text-white/80 text-lg leading-relaxed">
                12 مسار مهني مفصّل — الرواتب، المهارات المطلوبة، خارطة الطريق، وأفضل الجامعات في لبنان
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <div className="bg-white/15 rounded-xl px-3 py-2 text-sm">💰 رواتب حقيقية</div>
                <div className="bg-white/15 rounded-xl px-3 py-2 text-sm">🗺️ خارطة طريق</div>
                <div className="bg-white/15 rounded-xl px-3 py-2 text-sm">📈 الطلب في السوق</div>
                <div className="bg-white/15 rounded-xl px-3 py-2 text-sm">🏛️ أفضل الجامعات</div>
              </div>
            </div>
            <div className="text-8xl">🧭</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="🔍 ابحث عن مسار مهني..."
              className="flex-1 border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
            />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-3 py-2 rounded-full text-xs font-bold border transition-all ${category === c ? "bg-primary text-white border-primary" : "bg-white text-text-sub border-gray-200 hover:border-primary"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-text-sub font-semibold mt-1">الطلب:</span>
            {DEMAND_FILTER.map(d => (
              <button key={d} onClick={() => setDemand(d)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${demand === d ? "bg-accent text-white border-accent" : "bg-white text-text-sub border-gray-200 hover:border-accent"}`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Careers grid */}
          <div className={`${selected ? "hidden md:block md:w-2/5 lg:w-1/3" : "w-full"}`}>
            <p className="text-text-sub text-sm mb-4">{filtered.length} مسار مهني</p>
            <div className="space-y-3">
              {filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full bg-white rounded-xl p-4 border-2 text-right transition-all hover:shadow-md ${selected?.id === c.id ? "border-primary shadow-md" : "border-gray-100 hover:border-primary/40"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{c.emoji}</span>
                      <div>
                        <div className="font-bold text-primary">{c.titleAr}</div>
                        <div className="text-text-sub text-xs">{c.title}</div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.demandColor}`}>{c.demand}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs bg-light-gold text-accent font-semibold px-2 py-0.5 rounded-full">💰 {c.salaryLB}/شهر</span>
                    <span className="text-xs text-text-sub">{c.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Career detail */}
          {selected && (
            <div className="flex-1 md:sticky md:top-20 md:self-start">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {/* Detail header */}
                <div className="bg-gradient-to-r from-primary to-[#1e4080] p-6 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white text-sm mb-3 md:hidden flex items-center gap-1">
                        ← رجوع
                      </button>
                      <div className="text-4xl mb-2">{selected.emoji}</div>
                      <h2 className="text-2xl font-extrabold">{selected.titleAr}</h2>
                      <p className="text-white/70 text-sm">{selected.title}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full bg-white/20 text-white`}>
                      طلب {selected.demand}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-white/15 rounded-xl p-3 text-center">
                      <div className="text-lg font-extrabold text-accent">{selected.salaryLB}</div>
                      <div className="text-white/60 text-xs mt-0.5">راتب لبنان/شهر</div>
                    </div>
                    <div className="bg-white/15 rounded-xl p-3 text-center">
                      <div className="text-lg font-extrabold text-accent">{selected.salaryRemote}</div>
                      <div className="text-white/60 text-xs mt-0.5">عن بُعد/شهر</div>
                    </div>
                    <div className="bg-white/15 rounded-xl p-3 text-center">
                      <div className="text-lg font-extrabold">{selected.yearsToEntry}</div>
                      <div className="text-white/60 text-xs mt-0.5">للدخول</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Description */}
                  <p className="text-text-sub leading-relaxed">{selected.description}</p>

                  {/* Skills */}
                  <div>
                    <h3 className="font-bold text-primary mb-2">⚡ المهارات المطلوبة</h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.skills.map(s => (
                        <span key={s} className="bg-light text-text-main text-xs font-semibold px-3 py-1 rounded-full border border-gray-200">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h3 className="font-bold text-primary mb-2">🏅 شهادات مفيدة</h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.certifications.map(c => (
                        <span key={c} className="bg-light-gold text-accent text-xs font-bold px-3 py-1 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>

                  {/* Universities */}
                  <div>
                    <h3 className="font-bold text-primary mb-2">🏛️ أفضل الجامعات في لبنان</h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.universities.map(u => (
                        <Link key={u} href="/universities" className="bg-blue-50 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-blue-100 hover:bg-primary hover:text-white transition-all">{u}</Link>
                      ))}
                    </div>
                  </div>

                  {/* Roadmap */}
                  <div>
                    <h3 className="font-bold text-primary mb-3">🗺️ خارطة الطريق</h3>
                    <div className="space-y-2">
                      {selected.roadmap.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                          <span className="text-sm text-text-main">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link href="/tools/skill-gap" className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl text-sm text-center hover:bg-[#1e4080] transition-colors">
                      🎯 قيّم مهاراتك الآن
                    </Link>
                    <Link href="/tools/cv-builder" className="flex-1 border-2 border-primary text-primary font-bold py-2.5 rounded-xl text-sm text-center hover:bg-primary hover:text-white transition-all">
                      📄 ابنِ CV
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!selected && filtered.length === 0 && (
            <div className="flex-1 text-center py-20 text-text-sub">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-semibold">ما في نتائج — جرّب كلمة بحث مختلفة</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
