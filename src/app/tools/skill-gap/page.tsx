"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useI18n, type TranslationKey } from "@/lib/i18n";

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
  0: "bg-white/10 text-ink-muted",
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
      { name: "HTML & CSS", nameAr: "HTML و CSS", category: "أساسيات", required: 4, importance: "critical", learnLinks: [{ label: "MDN Web Docs", url: "https://developer.mozilla.org" }] },
      { name: "JavaScript", nameAr: "JavaScript", category: "أساسيات", required: 4, importance: "critical", learnLinks: [{ label: "javascript.info", url: "https://javascript.info" }] },
      { name: "React / Next.js", nameAr: "React / Next.js", category: "Frameworks", required: 3, importance: "critical", learnLinks: [{ label: "React Docs", url: "https://react.dev" }] },
      { name: "TypeScript", nameAr: "TypeScript", category: "Frameworks", required: 2, importance: "important", learnLinks: [{ label: "TypeScript Docs", url: "https://www.typescriptlang.org/docs" }] },
      { name: "Git & GitHub", nameAr: "Git و GitHub", category: "أدوات", required: 3, importance: "critical", learnLinks: [{ label: "GitHub Skills", url: "https://skills.github.com" }] },
      { name: "Responsive Design", nameAr: "التصميم المتجاوب", category: "تصميم", required: 3, importance: "important", learnLinks: [{ label: "CSS-Tricks", url: "https://css-tricks.com" }] },
      { name: "REST APIs", nameAr: "REST APIs", category: "Backend", required: 2, importance: "important", learnLinks: [{ label: "Postman Learning", url: "https://learning.postman.com" }] },
      { name: "Testing (Jest)", nameAr: "الاختبارات (Jest)", category: "جودة", required: 2, importance: "nice", learnLinks: [{ label: "Jest Docs", url: "https://jestjs.io" }] },
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
      { name: "Excel / Google Sheets", nameAr: "Excel / Google Sheets", category: "أساسيات", required: 4, importance: "critical", learnLinks: [{ label: "Excel Jet", url: "https://exceljet.net" }] },
      { name: "SQL", nameAr: "SQL", category: "قواعد بيانات", required: 4, importance: "critical", learnLinks: [{ label: "SQLZoo", url: "https://sqlzoo.net" }] },
      { name: "Python (Pandas)", nameAr: "Python (Pandas)", category: "برمجة", required: 3, importance: "critical", learnLinks: [{ label: "Kaggle Python", url: "https://www.kaggle.com/learn/python" }] },
      { name: "Data Visualization", nameAr: "تصوير البيانات", category: "تحليل", required: 3, importance: "important", learnLinks: [{ label: "Tableau Public", url: "https://public.tableau.com" }] },
      { name: "Statistics", nameAr: "الإحصاء", category: "أساسيات", required: 3, importance: "important", learnLinks: [{ label: "Khan Academy Stats", url: "https://khanacademy.org/math/statistics-probability" }] },
      { name: "Power BI", nameAr: "Power BI", category: "أدوات", required: 2, importance: "important", learnLinks: [{ label: "Microsoft Learn", url: "https://learn.microsoft.com/power-bi" }] },
      { name: "Machine Learning Basics", nameAr: "أساسيات ML", category: "متقدم", required: 1, importance: "nice", learnLinks: [{ label: "Coursera ML", url: "https://coursera.org/learn/machine-learning" }] },
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
      { name: "Social Media Marketing", nameAr: "التسويق عبر السوشيال ميديا", category: "تسويق", required: 4, importance: "critical", learnLinks: [{ label: "Meta Blueprint", url: "https://www.facebookblueprint.com" }] },
      { name: "SEO / SEM", nameAr: "SEO / SEM", category: "بحث", required: 3, importance: "critical", learnLinks: [{ label: "Google Digital Garage", url: "https://learndigital.withgoogle.com" }] },
      { name: "Google Analytics", nameAr: "Google Analytics", category: "تحليل", required: 3, importance: "critical", learnLinks: [{ label: "GA Academy", url: "https://analytics.google.com/analytics/academy" }] },
      { name: "Content Writing", nameAr: "كتابة المحتوى", category: "محتوى", required: 3, importance: "important", learnLinks: [{ label: "Coursera Content Marketing", url: "https://coursera.org/specializations/content-marketing" }] },
      { name: "Email Marketing", nameAr: "التسويق بالبريد", category: "تسويق", required: 2, importance: "important", learnLinks: [{ label: "Mailchimp Academy", url: "https://mailchimp.com/resources/mailchimp-101" }] },
      { name: "Canva / Design", nameAr: "Canva والتصميم", category: "تصميم", required: 2, importance: "important", learnLinks: [{ label: "Canva Design School", url: "https://designschool.canva.com" }] },
      { name: "Paid Ads (Meta/Google)", nameAr: "الإعلانات المدفوعة", category: "تسويق", required: 2, importance: "nice", learnLinks: [{ label: "Google Ads Help", url: "https://support.google.com/google-ads" }] },
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
      { name: "Adobe Illustrator", nameAr: "Adobe Illustrator", category: "أدوات", required: 4, importance: "critical", learnLinks: [{ label: "Adobe Learn", url: "https://helpx.adobe.com/illustrator" }] },
      { name: "Adobe Photoshop", nameAr: "Adobe Photoshop", category: "أدوات", required: 4, importance: "critical", learnLinks: [{ label: "Adobe Learn", url: "https://helpx.adobe.com/photoshop" }] },
      { name: "Typography", nameAr: "الطباعة الفنية", category: "تصميم", required: 3, importance: "critical", learnLinks: [{ label: "Fonts In Use", url: "https://fontsinuse.com" }] },
      { name: "Color Theory", nameAr: "نظرية الألوان", category: "تصميم", required: 3, importance: "important", learnLinks: [{ label: "Canva Color Theory", url: "https://www.canva.com/colors/color-wheel" }] },
      { name: "Figma", nameAr: "Figma", category: "أدوات", required: 2, importance: "important", learnLinks: [{ label: "Figma Learn", url: "https://www.figma.com/learn" }] },
      { name: "Branding", nameAr: "تصميم الهوية البصرية", category: "تخصص", required: 3, importance: "important", learnLinks: [{ label: "Skillshare Branding", url: "https://skillshare.com" }] },
      { name: "Motion Graphics", nameAr: "موشن جرافيك", category: "متقدم", required: 2, importance: "nice", learnLinks: [{ label: "After Effects Tutorial", url: "https://helpx.adobe.com/after-effects" }] },
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
      { name: "Bookkeeping", nameAr: "المحاسبة الأساسية", category: "أساسيات", required: 4, importance: "critical", learnLinks: [{ label: "Coursera Accounting", url: "https://coursera.org/specializations/finance-accounting" }] },
      { name: "Excel (Advanced)", nameAr: "Excel (متقدم)", category: "أدوات", required: 4, importance: "critical", learnLinks: [{ label: "Excel Easy", url: "https://www.excel-easy.com" }] },
      { name: "Financial Statements", nameAr: "البيانات المالية", category: "تحليل", required: 4, importance: "critical", learnLinks: [{ label: "Investopedia", url: "https://www.investopedia.com/financial-statements" }] },
      { name: "Tax Regulations (Lebanon)", nameAr: "قوانين الضريبة (لبنان)", category: "تشريعات", required: 3, importance: "critical", learnLinks: [{ label: "MOF Lebanon", url: "http://finance.gov.lb" }] },
      { name: "QuickBooks / SAP", nameAr: "QuickBooks / SAP", category: "أدوات", required: 2, importance: "important", learnLinks: [{ label: "QuickBooks Training", url: "https://quickbooks.intuit.com/tutorials" }] },
      { name: "Financial Analysis", nameAr: "التحليل المالي", category: "متقدم", required: 3, importance: "important", learnLinks: [{ label: "CFI Courses", url: "https://corporatefinanceinstitute.com" }] },
      { name: "Auditing", nameAr: "المراجعة والتدقيق", category: "متقدم", required: 2, importance: "nice", learnLinks: [{ label: "ACCA Learn", url: "https://www.accaglobal.com/gb/en/student.html" }] },
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
      { name: "Project Planning", nameAr: "تخطيط المشاريع", category: "أساسيات", required: 4, importance: "critical", learnLinks: [{ label: "PMI Resources", url: "https://www.pmi.org/learning" }] },
      { name: "Agile / Scrum", nameAr: "Agile / Scrum", category: "منهجيات", required: 3, importance: "critical", learnLinks: [{ label: "Scrum Guide", url: "https://scrumguides.org" }] },
      { name: "Risk Management", nameAr: "إدارة المخاطر", category: "تخصص", required: 3, importance: "critical", learnLinks: [{ label: "Coursera PM", url: "https://coursera.org/professional-certificates/google-project-management" }] },
      { name: "Stakeholder Management", nameAr: "إدارة أصحاب المصلحة", category: "تواصل", required: 3, importance: "important", learnLinks: [{ label: "LinkedIn Learning PM", url: "https://linkedin.com/learning" }] },
      { name: "MS Project / Jira", nameAr: "MS Project / Jira", category: "أدوات", required: 2, importance: "important", learnLinks: [{ label: "Atlassian University", url: "https://university.atlassian.com" }] },
      { name: "Budget Management", nameAr: "إدارة الميزانية", category: "مالي", required: 3, importance: "important", learnLinks: [{ label: "Coursera Finance", url: "https://coursera.org" }] },
      { name: "PMP Certification", nameAr: "شهادة PMP", category: "شهادات", required: 2, importance: "nice", learnLinks: [{ label: "PMP Exam Prep", url: "https://www.pmi.org/certifications/project-management-pmp" }] },
    ],
  },
];

const ALL_KEY = "__ALL__";
const RAW_CATEGORIES = Array.from(new Set(ROLES.map(r => r.category)));

// ── Progress bar ─────────────────────────────────────────────────────────
function ProgressBar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
      <div
        className={`h-3 rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Star rating selector ─────────────────────────────────────────────────
function StarPicker({ value, onChange }: { value: SkillLevel; onChange: (v: SkillLevel) => void }) {
  const { t } = useI18n();
  const LK: Record<SkillLevel, TranslationKey> = { 0: 'sg.lvl.0', 1: 'sg.lvl.1', 2: 'sg.lvl.2', 3: 'sg.lvl.3', 4: 'sg.lvl.4' };
  return (
    <div className="flex items-center gap-1">
      {([0, 1, 2, 3, 4] as SkillLevel[]).map(level => (
        <button
          key={level}
          onClick={() => onChange(level)}
          title={t(LK[level])}
          className={`w-7 h-7 rounded-full text-xs font-bold transition-all border-2 ${
            value >= level && level > 0
              ? "bg-primary text-white border-primary"
              : level === 0 && value === 0
              ? "bg-gray-300 text-ink-muted border-white/10"
              : "bg-surface text-gray-300 border-white/10 hover:border-primary"
          }`}
        >
          {level === 0 ? "✕" : level}
        </button>
      ))}
      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ml-1 ${LEVEL_COLORS[value]}`}>
        {t(LK[value])}
      </span>
    </div>
  );
}

// ── Gap badge ─────────────────────────────────────────────────────────────
function GapBadge({ gap }: { gap: number }) {
  const { t } = useI18n();
  if (gap <= 0) return <span className="text-xs bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">{t('sg.gap.done')}</span>;
  if (gap === 1) return <span className="text-xs bg-yellow-100 text-yellow-700 font-bold px-2 py-0.5 rounded-full">{t('sg.gap.small')}</span>;
  if (gap === 2) return <span className="text-xs bg-orange-100 text-orange-700 font-bold px-2 py-0.5 rounded-full">{t('sg.gap.medium')}</span>;
  return <span className="text-xs bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-full">{t('sg.gap.large')}</span>;
}

// ── Main component ────────────────────────────────────────────────────────
export default function SkillGapAnalyzer() {
  const { t, dir } = useI18n();
  const LEVEL_KEYS: Record<SkillLevel, TranslationKey> = {
    0: 'sg.lvl.0', 1: 'sg.lvl.1', 2: 'sg.lvl.2', 3: 'sg.lvl.3', 4: 'sg.lvl.4',
  };
  const [step, setStep] = useState<"select" | "assess" | "result">("select");
  const [catFilter, setCatFilter] = useState(ALL_KEY);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [skillLevels, setSkillLevels] = useState<Record<string, SkillLevel>>({});

  const filteredRoles = catFilter === ALL_KEY ? ROLES : ROLES.filter(r => r.category === catFilter);

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
    <div className="min-h-screen bg-bg" dir={dir}>

      <main className="max-w-5xl mx-auto px-4 py-8">

        {/* ── STEP 1: Role Selection ── */}
        {step === "select" && (
          <>
            {/* Hero */}
            <div className="bg-gradient-to-br from-[#1A3C6E] to-[#0E7C7B] rounded-2xl p-8 md:p-12 mb-8 text-white text-center">
              <div className="text-5xl mb-4">🎯</div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{t('sg.title')}</h1>
              <p className="text-white/80 text-lg max-w-2xl mx-auto">
                {t('sg.subtitle')}
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-6 text-sm">
                <div className="bg-surface/15 rounded-xl px-4 py-2">{t('sg.chip.time')}</div>
                <div className="bg-surface/15 rounded-xl px-4 py-2">{t('sg.chip.report')}</div>
                <div className="bg-surface/15 rounded-xl px-4 py-2">{t('sg.chip.plan')}</div>
              </div>
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              <button
                onClick={() => setCatFilter(ALL_KEY)}
                className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                  catFilter === ALL_KEY
                    ? "bg-primary text-white border-primary"
                    : "bg-surface text-text-sub border-white/10 hover:border-primary"
                }`}
              >
                {t('sg.cat.all')}
              </button>
              {RAW_CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                    catFilter === cat
                      ? "bg-primary text-white border-primary"
                      : "bg-surface text-text-sub border-white/10 hover:border-primary"
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
                  className="bg-surface rounded-2xl p-6 border border-white/10 shadow-sm hover:shadow-md hover:border-primary text-right transition-all group"
                >
                  <div className="text-4xl mb-3">{role.emoji}</div>
                  <div className="font-extrabold text-primary text-lg">{role.titleAr}</div>
                  <div className="text-text-sub text-sm mb-3">{role.title}</div>
                  <div className="text-xs bg-light-gold text-accent font-semibold px-2 py-1 rounded-full inline-block mb-4">
                    💰 {role.avgSalary}
                  </div>
                  <div className="text-xs text-text-sub">{role.skills.length} {t('sg.role.skills_count')}</div>
                  <div className="mt-4 w-full bg-primary text-white rounded-xl py-2 text-sm font-bold group-hover:bg-accent transition-colors">
                    {t('sg.role.start')}
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
              <button onClick={() => setStep("select")} className="text-text-sub hover:text-primary text-sm">{t('sg.back_to_select')}</button>
              <div className="flex-1 h-2 bg-white/10 rounded-full">
                <div className="h-2 bg-primary rounded-full" style={{ width: "50%" }} />
              </div>
              <span className="text-sm text-text-sub">{t('sg.step_of')}</span>
            </div>

            <div className="bg-surface rounded-2xl p-6 md:p-8 shadow-sm border border-white/10 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl">{selectedRole.emoji}</span>
                <div>
                  <h2 className="text-xl font-extrabold text-primary">{selectedRole.titleAr}</h2>
                  <p className="text-text-sub text-sm">{selectedRole.title} — {t('sg.assess.subtitle')}</p>
                </div>
              </div>
            </div>

            {/* Skills by category */}
            {Array.from(new Set(selectedRole.skills.map(s => s.category))).map(cat => (
              <div key={cat} className="bg-surface rounded-2xl p-6 shadow-sm border border-white/10 mb-4">
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
                              <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">{t('sg.imp.critical')}</span>
                            )}
                            {s.importance === "important" && (
                              <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold">{t('sg.imp.important')}</span>
                            )}
                          </div>
                          <span className="text-xs text-text-sub">{t('sg.required.label')} {s.required}</span>
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
              {t('sg.btn.calculate')}
            </button>
          </>
        )}

        {/* ── STEP 3: Results ── */}
        {step === "result" && selectedRole && analysis && (
          <>
            <div className="flex items-center gap-4 mb-6">
              <button onClick={() => setStep("assess")} className="text-text-sub hover:text-primary text-sm">{t('sg.btn.edit_answers')}</button>
              <button onClick={() => setStep("select")} className="text-text-sub hover:text-primary text-sm">{t('sg.btn.choose_other')}</button>
            </div>

            {/* Score card */}
            <div className="bg-gradient-to-br from-primary to-[#1e4080] text-white rounded-2xl p-8 mb-6 text-center">
              <div className="text-5xl mb-2">{selectedRole.emoji}</div>
              <h2 className="text-2xl font-extrabold mb-1">{selectedRole.titleAr}</h2>
              <p className="text-white/70 mb-6">{t('sg.result.subtitle')}</p>

              <div className={`text-7xl font-extrabold mb-2 ${analysis.score >= 80 ? "text-green-300" : analysis.score >= 50 ? "text-yellow-300" : "text-red-300"}`}>
                {analysis.score}%
              </div>
              <div className="text-white/80 mb-4">
                {analysis.score >= 80 ? t('sg.msg.high') : analysis.score >= 60 ? t('sg.msg.mid_high') : analysis.score >= 40 ? t('sg.msg.mid') : t('sg.msg.low')}
              </div>
              <div className="w-full bg-surface/20 rounded-full h-4 overflow-hidden">
                <div className="h-4 bg-surface rounded-full transition-all duration-700" style={{ width: `${analysis.score}%` }} />
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-surface rounded-xl p-4 text-center shadow-sm border border-white/10">
                <div className="text-3xl font-extrabold text-green-600">{analysis.strongSkills.length}</div>
                <div className="text-xs text-text-sub mt-1">{t('sg.stat.completed')}</div>
              </div>
              <div className="bg-surface rounded-xl p-4 text-center shadow-sm border border-white/10">
                <div className="text-3xl font-extrabold text-orange-500">{analysis.gapSkills.length}</div>
                <div className="text-xs text-text-sub mt-1">{t('sg.stat.needs_dev')}</div>
              </div>
              <div className="bg-surface rounded-xl p-4 text-center shadow-sm border border-white/10">
                <div className="text-3xl font-extrabold text-primary">{analysis.criticalMet}/{analysis.criticalTotal}</div>
                <div className="text-xs text-text-sub mt-1">{t('sg.stat.essentials')}</div>
              </div>
            </div>

            {/* Skills breakdown */}
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-white/10 mb-6">
              <h3 className="font-extrabold text-lg mb-4">{t('sg.skills_details')}</h3>
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
              <div className="bg-surface rounded-2xl p-6 shadow-sm border border-white/10 mb-6">
                <h3 className="font-extrabold text-lg mb-2">{t('sg.plan.title')}</h3>
                <p className="text-text-sub text-sm mb-4">{t('sg.result.gaps')}</p>
                <div className="space-y-4">
                  {analysis.gapSkills.slice(0, 6).map((s, idx) => (
                    <div key={s.id} className="border border-white/10 rounded-xl p-4 hover:border-primary transition-all">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 bg-primary text-white rounded-full text-xs font-bold flex items-center justify-center">{idx + 1}</span>
                          <span className="font-semibold">{s.nameAr}</span>
                          {s.importance === "critical" && <span className="text-xs bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold">{t('sg.imp.critical')}</span>}
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
                <h3 className="font-extrabold text-green-800 mb-3">{t('sg.strong.title')}</h3>
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
              <h3 className="font-extrabold text-xl mb-2">{t('sg.cta.title')}</h3>
              <p className="text-white/80 mb-4">{t('sg.bottom.title')}</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link href="/tools/cv-builder" className="bg-surface text-accent font-bold px-5 py-2.5 rounded-xl hover:bg-light transition-colors text-sm">
                  {t('sg.cta.cv')}
                </Link>
                <Link href="/internships/hub" className="bg-surface/20 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-surface/30 transition-colors text-sm">
                  {t('sg.cta.internship')}
                </Link>
                <button
                  onClick={() => { setStep("select"); setSelectedRole(null); }}
                  className="bg-surface/20 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-surface/30 transition-colors text-sm"
                >
                  {t('sg.cta.try_other')}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
