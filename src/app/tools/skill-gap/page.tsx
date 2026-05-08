"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────────
type SkillLevel = 0 | 1 | 2 | 3 | 4;

interface Skill {
  id: string;
  name: string;
  nameAr: string;
  category: string;
  required: SkillLevel;    // what the role needs
  current: SkillLevel;     // what user has
  importance: "critical" | "important" | "nice";
  learnLinks: { label: string; url: string }[];
}

interface Role {
  id: string;
  title: string;
  titleAr: string;
  emoji: string;
  category: string;
  avgSalary: string;
  skills: Omit<Skill, "current" | "id">[];
}

// ── Skill level labels ─────────────────────────────────────────────────────
const LEVEL_LABELS: Record<SkillLevel, string> = {
  0: "لا أعرفه",
  1: "مبتدئ",
  2: "متوسط",
  3: "متقدم",
  4: "خبير",
};
const LEVEL_COLORS: Record<SkillLevel, string> = {
  0: "bg-gray-200 text-gray-600",
  1: "bg-red-100 text-red-700",
  2: "bg-yellow-100 text-yellow-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-green-100 text-green-700",
};

// ── Role data ──────────────────────────────────────────────────────────────
const ROLES: Role[] = [
  {
    id: "frontend",
    title: "Frontend Developer",
    titleAr: "مطوّر واجهات",
    emoji: "💻",
    category: "تكنولوجيا",
    avgSalary: "$800–$2,500/شهر",
    skills: [
      { id: "", name: "HTML & CSS", nameAr: "HTML و CSS", category: "أساسيات", required: 4, importance: "critical", learnLinks: [{ label: "MDN Web Docs", url: "https://developer.mozilla.org" }] },
      { id: "", name: "JavaScript", nameAr: "JavaScript", category: "أساسيات", required: 4, importance: "critical", learnLinks: [{ label: "javascript.info", url: "https://javascript.info" }] },
      { id: "", name: "React / Next.js", nameAr: "React / Next.js", category: "Frameworks", required: 3, importance: "critical", learnLinks: [{ label: "React Docs", url: "https://react.dev" }] },
      { id: "", name: "TypeScript", nameAr: "TypeScript", category: "Frameworks", required: 2, importance: "important", learnLinks: [{ label: "TypeScript Docs", url: "https://www.typescriptlang.org/docs" }] },
      { id: "", name: "Git & GitHub", nameAr: "Git و GitHub", category: "أدوات", required: 3, importance: "critical", learnLinks: [{ label: "GitHub Skills", url: "https://skills.github.com" }] },
      { id: "", name: "Responsive Design", nameAr: "التصميم المتجاوب", category: "تصميم", required: 3, importance: "important", learnLinks: [{ label: "CSS-Tricks", url: "https://css-tricks.com" }] },
      { id: "", name: "REST APIs", nameAr: "REST APIs", category: "Backend", required: 2, importance: "important", learnLinks: [{ label: "Postman Learning", url: "https://learning.postman.com" }] },
      { id: "", name: "Testing (Jest)", nameAr: "الاختبارات (Jest)", category: "جودة", required: 2, importance: "nice", learnLinks: [{ label: "Jest Docs", url: "https://jestjs.io" }] },
    ],
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    titleAr: "محلل بيانات",
    emoji: "📊",
    category: "بيانات",
    avgSalary: "$700–$2,000/شهر",
    skills: [
      { id: "", name: "Excel / Google Sheets", nameAr: "Excel / Google Sheets", category: "أساسيات", required: 4, importance: "critical", learnLinks: [{ label: "Excel Jet", url: "https://exceljet.net" }] },
      { id: "", name: "SQL", nameAr: "SQL", category: "قواعد بيانات", required: 4, importance: "critical", learnLinks: [{ label: "SQLZoo", url: "https://sqlzoo.net" }] },
      { id: "", name: "Python (Pandas)", nameAr: "Python (Pandas)", category: "برمجة", required: 3, importance: "critical", learnLinks: [{ label: "Kaggle Python", url: "https://www.kaggle.com/learn/python" }] },
      { id: "", name: "Data Visualization", nameAr: "تصوير البيانات", category: "تحليل", required: 3, importance: "important", learnLinks: [{ label: "Tableau Public", url: "https://public.tableau.com" }] },
      { id: "", name: "Statistics", nameAr: "الإحصاء", category: "أساسيات", required: 3, importance: "important", learnLinks: [{ label: "Khan Academy Stats", url: "https://khanacademy.org/math/statistics-probability" }] },
      { id: "", name: "Power BI", nameAr: "Power BI", category: "أدوات", required: 2, importance: "important", learnLinks: [{ label: "Microsoft Learn", url: "https://learn.microsoft.com/power-bi" }] },
      { id: "", name: "Machine Learning Basics", nameAr: "أساسيات ML", category: "متقدم", required: 1, importance: "nice", learnLinks: [{ label: "Coursera ML", url: "https://coursera.org/learn/machine-learning" }] },
    ],
  },
  {
    id: "digital-marketing",
    title: "Digital Marketer",
    titleAr: "مسوّق رقمي",
    emoji: "📱",
    category: "تسويق",
    avgSalary: "$500–$1,800/شهر",
    skills: [
      { id: "", name: "Social Media Marketing", nameAr: "التسويق عبر السوشيال ميديا", category: "تسويق", required: 4, importance: "critical", learnLinks: [{ label: "Meta Blueprint", url: "https://www.facebookblueprint.com" }] },
      { id: "", name: "SEO / SEM", nameAr: "SEO / SEM", category: "بحث", required: 3, importance: "critical", learnLinks: [{ label: "Google Digital Garage", url: "https://learndigital.withgoogle.com" }] },
      { id: "", name: "Google Analytics", nameAr: "Google Analytics", category: "تحليل", required: 3, importance: "critical", learnLinks: [{ label: "GA Academy", url: "https://analytics.google.com/analytics/academy" }] },
      { id: "", name: "Content Writing", nameAr: "كتابة المحتوى", category: "محتوى", required: 3, importance: "important", learnLinks: [{ label: "Coursera Content Marketing", url: "https://coursera.org/specializations/content-marketing" }] },
      { id: "", name: "Email Marketing", nameAr: "التسويق بالبريد", category: "تسويق", required: 2, importance: "important", learnLinks: [{ label: "Mailchimp Academy", url: "https://mailchimp.com/resources/mailchimp-101" }] },
      { id: "", name: "Canva / Design", nameAr: "Canva والتصميم", category: "تصميم", required: 2, importance: "important", learnLinks: [{ label: "Canva Design School", url: "https://designschool.canva.com" }] },
      { id: "", name: "Paid Ads (Meta/Google)", nameAr: "الإعلانات المدفوعة", category: "تسويق", required: 2, importance: "nice", learnLinks: [{ label: "Google Ads Help", url: "https://support.google.com/google-ads" }] },
    ],
  },
  {
    id: "graphic-designer",
    title: "Graphic Designer",
    titleAr: "مصمم جرافيك",
    emoji: "🎨",
    category: "إبداعي",
    avgSalary: "$500–$1,500/شهر",
    skills: [
      { id: "", name: "Adobe Illustrator", nameAr: "Adobe Illustrator", category: "أدوات", required: 4, importance: "critical", learnLinks: [{ label: "Adobe Learn", url: "https://helpx.adobe.com/illustrator" }] },
      { id: "", name: "Adobe Photoshop", nameAr: "Adobe Photoshop", category: "أدوات", required: 4, importance: "critical", learnLinks: [{ label: "Adobe Learn", url: "https://helpx.adobe.com/photoshop" }] },
      { id: "", name: "Typography", nameAr: "الطباعة الفنية", category: "تصميم", required: 3, importance: "critical", learnLinks: [{ label: "Fonts In Use", url: "https://fontsinuse.com" }] },
      { id: "", name: "Color Theory", nameAr: "نظرية الألوان", category: "تصميم", required: 3, importance: "important", learnLinks: [{ label: "Canva Color Theory", url: "https://www.canva.com/colors/color-wheel" }] },
      { id: "", name: "Figma", nameAr: "Figma", category: "أدوات", required: 2, importance: "important", learnLinks: [{ label: "Figma Learn", url: "https://www.figma.com/learn" }] },
      { id: "", name: "Branding", nameAr: "تصميم الهوية البصرية", category: "تخصص", required: 3, importance: "important", learnLinks: [{ label: "Skillshare Branding", url: "https://skillshare.com" }] },
      { id: "", name: "Motion Graphics", nameAr: "موشن جرافيك", category: "متقدم", required: 2, importance: "nice", learnLinks: [{ label: "After Effects Tutorial", url: "https://helpx.adobe.com/after-effects" }] },
    ],
  },
  {
    id: "accountant",
    title: "Accountant",
    titleAr: "محاسب",
    emoji: "📒",
    category: "مالي",
    avgSalary: "$600–$1,800/شهر",
    skills: [
      { id: "", name: "Bookkeeping", nameAr: "المحاسبة الأساسية", category: "أساسيات", required: 4, importance: "critical", learnLinks: [{ label: "Coursera Accounting", url: "https://coursera.org/specializations/finance-accounting" }] },
      { id: "", name: "Excel (Advanced)", nameAr: "Excel (متقدم)", category: "أدوات", required: 4, importance: "critical", learnLinks: [{ label: "Excel Easy", url: "https://www.excel-easy.com" }] },
      { id: "", name: "Financial Statements", nameAr: "البيانات المالية", category: "تحليل", required: 4, importance: "critical", learnLinks: [{ label: "Investopedia", url: "https://www.investopedia.com/financial-statements" }] },
      { id: "", name: "Tax Regulations (Lebanon)", nameAr: "قوانين الضريبة (لبنان)", category: "تشريعات", required: 3, importance: "critical", learnLinks: [{ label: "MOF Lebanon", url: "http://finance.gov.lb" }] },
      { id: "", name: "QuickBooks / SAP", nameAr: "QuickBooks / SAP", category: "أدوات", required: 2, importance: "important", learnLinks: [{ label: "QuickBooks Training", url: "https://quickbooks.intuit.com/tutorials" }] },
      { id: "", name: "Financial Analysis", nameAr: "التحليل المالي", category: "متقدم", required: 3, importance: "important", learnLinks: [{ label: "CFI Courses", url: "https://corporatefinanceinstitute.com" }] },
      { id: "", name: "Auditing", nameAr: "المراجعة والتدقيق", category: "متقدم", required: 2, importance: "nice", learnLinks: [{ label: "ACCA Learn", url: "https://www.accaglobal.com/gb/en/student.html" }] },
    ],
  },
  {
    id: "project-manager",
    title: "Project Manager",
    titleAr: "مدير مشاريع",
    emoji: "📋",
    category: "إدارة",
    avgSalary: "$900–$3,000/شهر",
    skills: [
      { id: "", name: "Project Planning", nameAr: "تخطيط المشاريع", category: "أساسيات", required: 4, importance: "critical", learnLinks: [{ label: "PMI Resources", url: "https://www.pmi.org/learning" }] },
      { id: "", name: "Agile / Scrum", nameAr: "Agile / Scrum", category: "منهجيات", required: 3, importance: "critical", learnLinks: [{ label: "Scrum Guide", url: "https://scrumguides.org" }] },
      { id: "", name: "Risk Management", nameAr: "إدارة المخاطر", category: "تخصص", required: 3, importance: "critical", learnLinks: [{ label: "Coursera PM", url: "https://coursera.org/professional-certificates/google-project-management" }] },
      { id: "", name: "Stakeholder Management", nameAr: "إدارة أصحاب المصلحة", category: "تواصل", required: 3, importance: "important", learnLinks: [{ label: "LinkedIn Learning PM", url: "https://linkedin.com/learning" }] },
      { id: "", name: "MS Project / Jira", nameAr: "MS Project / Jira", category: "أدوات", required: 2, importance: "important", learnLinks: [{ label: "Atlassian University", url: "https://university.atlassian.com" }] },
      { id: "", name: "Budget Management", nameAr: "إدارة الميزانية", category: "مالي", required: 3, importance: "important", learnLinks: [{ label: "Coursera Finance", url: "https://coursera.org" }] },
      { id: "", name: "PMP Certification", nameAr: "شهادة PMP", category: "شهادات", required: 2, importance: "nice", learnLinks: [{ label: "PMP Exam Prep", url: "https://www.pmi.org/certifications/project-management-pmp" }] },
    ],
  },
];

const CATEGORIES = ["الكل", ...Array.from(new Set(ROLES.map(r => r.category)))];

// ── Progress bar ─────────────────────────────────────────────────────────
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
      <div
        className={`h-3 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Star rating selector ─────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: SkillLevel; onChange: (v: SkillLevel) => void }) {
  return (
    <div className="flex items-center gap-1">
      {([0, 1, 2, 3, 4] as SkillLevel[]).map(level => (
        <button
          key={level}
          onClick={() => onChange(level)}
          title={LEVEL_LABELS[level]}
          className={`w-7 h-7 rounded-full text-xs font-bold transition-all border-2 ${
            value >= level && level > 0
              ? "bg-primary text-white border-primary"
              : level === 0 && value === 0
              ? "bg-gray-300 text-gray-600 border-gray-300"
              : "bg-white text-gray-300 border-gray-200 hover:border-primary"
          }`}
        >
          {level === 0 ? "✕" : level}
        </button>
      ))}
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-1 ${LEVEL_COLORS[value]}`}>
        {LEVEL_LABELS[value]}
      </span>
    </div>
  );
}

// ── Gap badge ─────────────────────────────────────────────────────────────
function GapBadge({ gap }: { gap: number }) {
  if (gap <= 0) return <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">✓ مكتمل</span>;
  if (gap === 1) return <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">فجوة صغيرة</span>;
  if (gap === 2) return <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">فجوة متوسطة</span>;
  return <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">فجوة كبيرة</span>;
}

// ── Main component ────────────────────────────────────────────────────────
export default function SkillGapAnalyzer() {
  const [step, setStep] = useState<"select" | "assess" | "result">("select");
  const [catFilter, setCatFilter] = useState("الكل");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [skillLevels, setSkillLevels] = useState<Record<string, SkillLevel>>({});

  const filteredRoles = catFilter === "الكل" ? ROLES : ROLES.filter(r => r.category === catFilter);

  function startAssessment(role: Role) {
    setSelectedRole(role);
    const initial: Record<string, SkillLevel> = {};
    role.skills.forEach((s, i) => { initial[`${role.id}-${i}`] = 0; });
    setSkillLevels(initial);
    setStep("assess");
  }

  function setSkill(key: string, level: SkillLevel) {
    setSkillLevels(prev => ({ ...prev, [key]: level }));
  }

  const analysis = useMemo(() => {
    if (!selectedRole) return null;
    const skills = selectedRole.skills.map((s, i) => {
      const key = `${selectedRole.id}-${i}`;
      const current = skillLevels[key] ?? 0;
      return { ...s, id: key, current };
    });
    const critical = skills.filter(s => s.importance === "critical");
    const criticalMet = critical.filter(s => s.current >= s.required).length;
    const totalGap = skills.reduce((acc, s) => acc + Math.max(0, s.required - s.current), 0);
    const maxGap = skills.reduce((acc, s) => acc + s.required, 0);
    const score = maxGap > 0 ? Math.round(((maxGap - totalGap) / maxGap) * 100) : 0;
    const readyPct = score;
    const gapSkills = skills.filter(s => s.current < s.required).sort((a, b) => {
      const imp = { critical: 0, important: 1, nice: 2 };
      return imp[a.importance] - imp[b.importance] || (b.required - b.current) - (a.required - a.current);
    });
    const strongSkills = skills.filter(s => s.current >= s.required);
    return { skills, score, readyPct, totalGap, criticalMet, criticalTotal: critical.length, gapSkills, strongSkills };
  }, [selectedRole, skillLevels]);

  const scoreColor = analysis
    ? analysis.score >= 80 ? "text-green-600" : analysis.score >= 50 ? "text-yellow-600" : "text-red-600"
    : "";
  const scoreBarColor = analysis
    ? analysis.score >= 80 ? "bg-green-500" : analysis.score >= 50 ? "bg-yellow-500" : "bg-red-500"
    : "bg-gray-300";

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">مسارك</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href="/tools" className="text-primary border-b-2 border-primary pb-0.5">أدوات مهنية</Link>
            <Link href="/internships/hub" className="text-text-sub hover:text-primary">التدريب والتطوع</Link>
            <Link href="/scholarships" className="text-text-sub hover:text-primary">المنح</Link>
          </nav>
          <Link href="/tools" className="text-text-sub text-sm hover:text-primary">← الأدوات</Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* ── STEP 1: Role Selection ── */}
        {step === "select" && (
          <>
            {/* Hero */}
            <div className="bg-gradient-to-br from-[#1A3C6E] to-[#0E7C7B] rounded-2xl p-8 md:p-12 mb-8 text-white text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">محلل الفجوة المهارية</h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                اختر المسار المهني الذي تطمح إليه واكتشف الفجوة بين مهاراتك الحالية وما يحتاجه السوق
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
                <div className="bg-white/15 rounded-xl px-4 py-2">⚡ 3 دقائق فقط</div>
                <div className="bg-white/15 rounded-xl px-4 py-2">📈 تقرير مفصّل</div>
                <div className="bg-white/15 rounded-xl px-4 py-2">🎓 خطة تعلم مخصصة</div>
              </div>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    catFilter === cat
                      ? "bg-primary text-white border-primary"
                      : "bg-white text-text-sub border-gray-200 hover:border-primary"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Role cards */}
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
              {filteredRoles.map(role => (
                <button
                  key={role.id}
                  onClick={() => startAssessment(role)}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-primary text-right transition-all group"
                >
                  <div className="text-4xl mb-3">{role.emoji}</div>
                  <div className="font-extrabold text-primary text-lg">{role.titleAr}</div>
                  <div className="text-text-sub text-sm mb-3">{role.title}</div>
                  <div className="text-xs bg-light-gold text-accent font-semibold px-2 py-1 rounded-full inline-block mb-4">
                    💰 {role.avgSalary}
                  </div>
                  <div className="text-xs text-text-sub">{role.skills.length} مهارة للتقييم</div>
                  <div className="mt-4 w-full bg-primary text-white rounded-xl py-2 text-sm font-bold group-hover:bg-accent transition-colors">
                    ابدأ التقييم →
                  </div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── STEP 2: Skills Assessment ── */}
        {step === "assess" && selectedRole && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setStep("select")} className="text-text-sub hover:text-primary text-sm">← اختر مساراً آخر</button>
              <div className="flex-1 h-2 bg-gray-200 rounded-full">
                <div className="h-2 bg-primary rounded-full" style={{ width: "50%" }} />
              </div>
              <span className="text-sm text-text-sub">خطوة 2 من 2</span>
            </div>

            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{selectedRole.emoji}</span>
                <div>
                  <h2 className="text-xl font-extrabold text-primary">{selectedRole.titleAr}</h2>
                  <p className="text-text-sub text-sm">{selectedRole.title} — قيّم مستواك في كل مهارة بصدق</p>
                </div>
              </div>
            </div>

            {/* Skills by category */}
            {Array.from(new Set(selectedRole.skills.map(s => s.category))).map(cat => (
              <div key={cat} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-4">
                <h3 className="font-bold text-text-sub text-sm uppercase tracking-wide mb-4 border-b pb-2">{cat}</h3>
                <div className="space-y-5">
                  {selectedRole.skills
                    .map((s, i) => ({ ...s, key: `${selectedRole.id}-${i}` }))
                    .filter(s => s.category === cat)
                    .map(s => (
                      <div key={s.key}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-text-main">{s.nameAr}</span>
                            {s.importance === "critical" && (
                              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">أساسي</span>
                            )}
                            {s.importance === "important" && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">مهم</span>
                            )}
                          </div>
                          <span className="text-xs text-text-sub">المطلوب: مستوى {s.required}</span>
                        </div>
                        <StarPicker
                          value={skillLevels[s.key] ?? 0}
                          onChange={v => setSkill(s.key, v)}
                        />
                      </div>
                    ))}
                </div>
              </div>
            ))}

            <button
              onClick={() => setStep("result")}
              className="w-full bg-primary text-white rounded-2xl py-4 font-extrabold text-lg hover:bg-[#1e4080] transition-colors mt-2"
            >
              احسب الفجوة المهارية 🎯
            </button>
          </>
        )}

        {/* ── STEP 3: Results ── */}
        {step === "result" && selectedRole && analysis && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setStep("assess")} className="text-text-sub hover:text-primary text-sm">← عدّل إجاباتك</button>
              <button onClick={() => setStep("select")} className="text-text-sub hover:text-primary text-sm">اختر مساراً آخر</button>
            </div>

            {/* Score card */}
            <div className="bg-gradient-to-br from-primary to-[#1e4080] text-white rounded-2xl p-8 mb-6 text-center">
              <div className="text-5xl mb-2">{selectedRole.emoji}</div>
              <h2 className="text-2xl font-extrabold mb-1">{selectedRole.titleAr}</h2>
              <p className="text-white/70 mb-6">نتيجة التحليل المهاري</p>

              <div className={`text-7xl font-extrabold mb-2 ${analysis.score >= 80 ? "text-green-300" : analysis.score >= 50 ? "text-yellow-300" : "text-red-300"}`}>
                {analysis.score}%
              </div>
              <div className="text-white/80 mb-4">
                {analysis.score >= 80 ? "🌟 أنت قريب جداً من الاحتراف!" : analysis.score >= 60 ? "💪 لديك أساس جيد، تابع التطوير" : analysis.score >= 40 ? "📚 مسيرتك بدأت، استمر في التعلم" : "🚀 نقطة البداية، كل خبير كان مبتدئاً!"}
              </div>
              <div className="w-full bg-white/20 rounded-full h-4 overflow-hidden">
                <div className="h-4 bg-white rounded-full transition-all duration-700" style={{ width: `${analysis.score}%` }} />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                <div className="text-3xl font-extrabold text-green-600">{analysis.strongSkills.length}</div>
                <div className="text-xs text-text-sub mt-1">مهارة مكتملة</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                <div className="text-3xl font-extrabold text-orange-500">{analysis.gapSkills.length}</div>
                <div className="text-xs text-text-sub mt-1">مهارة تحتاج تطوير</div>
              </div>
              <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                <div className="text-3xl font-extrabold text-primary">{analysis.criticalMet}/{analysis.criticalTotal}</div>
                <div className="text-xs text-text-sub mt-1">مهارات أساسية</div>
              </div>
            </div>

            {/* Skills breakdown */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
              <h3 className="font-extrabold text-lg mb-4">تفاصيل كل مهارة</h3>
              <div className="space-y-4">
                {analysis.skills.map(s => {
                  const gap = s.required - s.current;
                  const pct = Math.min(100, Math.round((s.current / s.required) * 100));
                  return (
                    <div key={s.id}>
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{s.nameAr}</span>
                          <GapBadge gap={gap} />
                        </div>
                        <span className="text-xs text-text-sub">{s.current}/{s.required}</span>
                      </div>
                      <ProgressBar
                        value={s.current}
                        max={s.required}
                        color={gap <= 0 ? "bg-green-500" : gap === 1 ? "bg-yellow-400" : gap === 2 ? "bg-orange-400" : "bg-red-500"}
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Learning plan */}
            {analysis.gapSkills.length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                <h3 className="font-extrabold text-lg mb-2">🎓 خطة التعلم المقترحة</h3>
                <p className="text-text-sub text-sm mb-4">ركّز على هذه المهارات بالترتيب — الأساسية أولاً</p>
                <div className="space-y-4">
                  {analysis.gapSkills.slice(0, 6).map((s, idx) => (
                    <div key={s.id} className="border border-gray-100 rounded-xl p-4 hover:border-primary transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-primary text-white rounded-full text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                          <span className="font-semibold">{s.nameAr}</span>
                          {s.importance === "critical" && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">أساسي</span>}
                        </div>
                        <GapBadge gap={s.required - s.current} />
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {s.learnLinks.map(link => (
                          <a
                            key={link.label}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs bg-light text-primary border border-primary/20 rounded-full px-3 py-1 hover:bg-primary hover:text-white transition-all"
                          >
                            📚 {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Strong skills */}
            {analysis.strongSkills.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                <h3 className="font-extrabold text-green-800 mb-3">✅ نقاط قوتك الحالية</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.strongSkills.map(s => (
                    <span key={s.id} className="bg-green-100 text-green-800 text-sm font-semibold px-3 py-1.5 rounded-full">
                      ✓ {s.nameAr}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA */}
            <div className="bg-gradient-to-br from-accent to-[#b5860a] text-white rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">🚀</div>
              <h3 className="font-extrabold text-xl mb-2">ابنِ CV يعكس مهاراتك</h3>
              <p className="text-white/80 mb-4">استخدم أدواتنا لتطوير مسيرتك المهنية</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/tools/cv-builder" className="bg-white text-accent font-bold px-5 py-2.5 rounded-xl hover:bg-light transition-colors text-sm">
                  📄 أنشئ CV الآن
                </Link>
                <Link href="/internships/hub" className="bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/30 transition-colors text-sm">
                  💼 ابحث عن تدريب
                </Link>
                <button
                  onClick={() => { setStep("select"); setSelectedRole(null); }}
                  className="bg-white/20 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-white/30 transition-colors text-sm"
                >
                  🎯 جرّب مساراً آخر
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
