"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useStudentContext } from "@/context/StudentContext";
import { useI18n, type TranslationKey } from "@/lib/i18n";

interface Scholarship {
  id: number;
  name: string;
  org: string;
  amount: string;
  deadline: string;
  type: string;
  fields: string[];
  region: string;
  gpa: number;
  desc: string;
  link: string;
  emoji: string;
  tag: string;
  tagColor: string;
}

const STATIC_SCHOLARSHIPS: Scholarship[] = [
  {
    id: 1, name: "منحة الجامعة الأمريكية في بيروت AUB", org: "AUB",
    amount: "تغطية كاملة", deadline: "30 نوفمبر 2026", type: "need",
    fields: ["جميع التخصصات"], region: "all", gpa: 80,
    desc: "منحة شاملة تغطي الرسوم الدراسية والإقامة لأبرز الطلاب المحتاجين مالياً",
    link: "https://www.aub.edu.lb", emoji: "🏛️", tag: "تغطية كاملة", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 2, name: "منحة الجامعة اللبنانية الأمريكية LAU", org: "LAU",
    amount: "50% من الرسوم", deadline: "1 ديسمبر 2026", type: "merit",
    fields: ["الهندسة","التجارة","الفنون"], region: "all", gpa: 85,
    desc: "منح الجدارة للطلاب المتميزين في الدراسة الثانوية",
    link: "https://www.lau.edu.lb", emoji: "🎓", tag: "جدارة", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 3, name: "منحة مؤسسة رفيق الحريري", org: "مؤسسة الحريري",
    amount: "2,500$ سنوياً", deadline: "31 أكتوبر 2026", type: "need",
    fields: ["الطب","الهندسة","العلوم"], region: "all", gpa: 75,
    desc: "دعم مالي للطلاب اللبنانيين المتفوقين من الأسر المحدودة الدخل",
    link: "#", emoji: "🌟", tag: "دعم مالي", tagColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 4, name: "منحة الجامعة اليسوعية USJ", org: "USJ",
    amount: "30% - 70%", deadline: "15 ديسمبر 2026", type: "mixed",
    fields: ["الحقوق","الطب","الإنسانيات"], region: "all", gpa: 78,
    desc: "برنامج دعم متعدد المستويات للطلاب المتميزين والمحتاجين",
    link: "https://www.usj.edu.lb", emoji: "⚖️", tag: "متعدد المستويات", tagColor: "bg-purple-100 text-purple-700",
  },
  {
    id: 5, name: "منحة USEK الجامعة الروح القدس", org: "USEK",
    amount: "25% - 50%", deadline: "30 نوفمبر 2026", type: "merit",
    fields: ["الهندسة","العلوم","الآداب"], region: "الشمال", gpa: 80,
    desc: "منح الجدارة للطلاب المتميزين في الشمال والمناطق المجاورة",
    link: "https://www.usek.edu.lb", emoji: "📚", tag: "جدارة", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 6, name: "منحة البنك الدولي للتعليم في لبنان", org: "البنك الدولي",
    amount: "3,000$ سنوياً", deadline: "15 مارس 2027", type: "need",
    fields: ["الاقتصاد","العلوم الاجتماعية","السياسات العامة"], region: "all", gpa: 70,
    desc: "منحة دولية تدعم التعليم العالي في لبنان للأسر المتضررة",
    link: "#", emoji: "🌍", tag: "دولية", tagColor: "bg-teal-100 text-teal-700",
  },
  {
    id: 7, name: "منحة الجامعة اللبنانية LU", org: "الجامعة اللبنانية",
    amount: "إعفاء كامل", deadline: "31 يناير 2027", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 85,
    desc: "إعفاء كامل من الرسوم للطلاب الأوائل على الثانوية العامة",
    link: "https://www.ul.edu.lb", emoji: "🏅", tag: "إعفاء كامل", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 8, name: "منحة Teach For Lebanon", org: "TFL",
    amount: "1,500$ + تدريب", deadline: "31 أكتوبر 2026", type: "program",
    fields: ["التربية والتعليم","العلوم الاجتماعية"], region: "all", gpa: 75,
    desc: "برنامج للطلاب المهتمين بالتعليم ودعم المجتمعات المحلية",
    link: "#", emoji: "📖", tag: "برنامج", tagColor: "bg-orange-100 text-orange-700",
  },
  {
    id: 9, name: "منحة جامعة Notre Dame NDU", org: "NDU",
    amount: "40% - 60%", deadline: "15 ديسمبر 2026", type: "merit",
    fields: ["الهندسة","الأعمال","الفنون","العلوم"], region: "جبل لبنان", gpa: 82,
    desc: "منح الجدارة للطلاب المتميزين من المناطق اللبنانية المختلفة، مع الأولوية لأبناء جبل لبنان",
    link: "https://www.ndu.edu.lb", emoji: "🕊️", tag: "جدارة", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 10, name: "منحة AMIDEAST للطلاب اللبنانيين", org: "AMIDEAST",
    amount: "2,000$ - 5,000$", deadline: "1 مارس 2027", type: "need",
    fields: ["جميع التخصصات"], region: "all", gpa: 75,
    desc: "برنامج دعم مالي للطلاب اللبنانيين الموهوبين من الأسر المحدودة الدخل — تمويل أمريكي",
    link: "https://www.amideast.org", emoji: "🇺🇸", tag: "دعم مالي", tagColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 11, name: "منحة التفوق الفرنسية — Campus France", org: "السفارة الفرنسية",
    amount: "800€ شهرياً", deadline: "15 نوفمبر 2026", type: "merit",
    fields: ["الإنسانيات","العلوم الاجتماعية","الهندسة","الأعمال"], region: "all", gpa: 80,
    desc: "منح للطلاب اللبنانيين المتميزين للدراسة في فرنسا — تشمل تأشيرة وتذاكر وتأمين صحي",
    link: "https://www.institutfrancais-liban.com", emoji: "🇫🇷", tag: "دراسة في الخارج", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 12, name: "منح DAAD الألمانية للطلاب اللبنانيين", org: "DAAD",
    amount: "1,200€ شهرياً", deadline: "30 نوفمبر 2026", type: "merit",
    fields: ["الهندسة","العلوم","الاقتصاد","الفنون"], region: "all", gpa: 78,
    desc: "الوكالة الألمانية للتبادل الأكاديمي تقدم منحاً للدراسة في ألمانيا، تشمل التأمين والإقامة",
    link: "https://www.daad.de", emoji: "🇩🇪", tag: "دراسة في الخارج", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 13, name: "منحة مؤسسة مخزومي للطلاب", org: "مؤسسة مخزومي",
    amount: "1,500$ - 3,000$", deadline: "28 فبراير 2027", type: "need",
    fields: ["الطب","الهندسة","الأعمال","التربية"], region: "all", gpa: 72,
    desc: "دعم مالي للطلاب اللبنانيين من الأسر المتضررة من الأزمة الاقتصادية، مع التركيز على أبناء بيروت",
    link: "#", emoji: "🌱", tag: "دعم مالي", tagColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 14, name: "منحة اتحاد مصارف لبنان للتميز", org: "اتحاد المصارف",
    amount: "2,000$ سنوياً", deadline: "31 يناير 2027", type: "merit",
    fields: ["الاقتصاد","المحاسبة","إدارة الأعمال","التمويل"], region: "all", gpa: 83,
    desc: "منحة للطلاب المتميزين في تخصصات الاقتصاد والتمويل، مع فرصة تدريب في أحد المصارف",
    link: "#", emoji: "🏦", tag: "جدارة + تدريب", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 15, name: "منحة Chevening البريطانية للقيادة", org: "الحكومة البريطانية",
    amount: "تغطية كاملة + راتب شهري", deadline: "1 نوفمبر 2026", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 80,
    desc: "واحدة من أرقى منح الدراسة في المملكة المتحدة للدراسات العليا — تشمل الرسوم والمعيشة والتأشيرة",
    link: "https://www.chevening.org", emoji: "🇬🇧", tag: "دراسة في الخارج", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 16, name: "منحة Erasmus+ للتبادل الأكاديمي", org: "الاتحاد الأوروبي",
    amount: "800€ - 1,200€ شهرياً", deadline: "15 فبراير 2027", type: "program",
    fields: ["جميع التخصصات"], region: "all", gpa: 75,
    desc: "برنامج التبادل الأكاديمي الأوروبي الأشهر — يمنح الطلاب فرصة الدراسة لفصل أو أكثر في أوروبا",
    link: "https://erasmus-plus.ec.europa.eu", emoji: "🇪🇺", tag: "تبادل أكاديمي", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 17, name: "منحة Fulbright الأمريكية للدراسات العليا", org: "السفارة الأمريكية",
    amount: "تغطية كاملة", deadline: "15 أكتوبر 2026", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 83,
    desc: "أعرق المنح الأمريكية للدراسة العليا — تغطي كل شيء من الرسوم إلى تذاكر السفر وبدل المعيشة",
    link: "https://lb.usembassy.gov/education-culture/fulbright-program", emoji: "🇺🇸", tag: "ماجستير/دكتوراه", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 18, name: "منحة Canada Awards للطلاب الدوليين", org: "الحكومة الكندية",
    amount: "10,000$ - 20,000$ CAD", deadline: "1 فبراير 2027", type: "merit",
    fields: ["الهندسة","العلوم","الأعمال","الزراعة","البيئة"], region: "all", gpa: 80,
    desc: "منح كندية للطلاب الدوليين المتميزين في تخصصات ذات أولوية للتنمية المستدامة",
    link: "https://www.scholarships-bourses.gc.ca", emoji: "🇨🇦", tag: "دراسة في الخارج", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 19, name: "منحة MEXT اليابانية للطلاب العرب", org: "وزارة التعليم اليابانية",
    amount: "تغطية كاملة + 117,000 ين شهرياً", deadline: "30 مايو 2027", type: "merit",
    fields: ["الهندسة","العلوم","التكنولوجيا","الفنون"], region: "all", gpa: 80,
    desc: "برنامج ياباني مرموق للطلاب الدوليين — يشمل اللغة اليابانية والرسوم والسكن والراتب الشهري",
    link: "https://www.mext.go.jp", emoji: "🇯🇵", tag: "دراسة في الخارج", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 20, name: "منحة Australia Awards للطلاب اللبنانيين", org: "الحكومة الأسترالية",
    amount: "تغطية كاملة", deadline: "30 أبريل 2027", type: "merit",
    fields: ["الإدارة","العلوم","الصحة العامة","البيئة"], region: "all", gpa: 78,
    desc: "منح أسترالية مرموقة تدعم قادة المستقبل في الدول النامية — تشمل الرسوم والمعيشة والتأمين",
    link: "https://www.australiaawards.gov.au", emoji: "🇦🇺", tag: "دراسة في الخارج", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 21, name: "منحة Takreem للشباب العربي المتميز", org: "مؤسسة Takreem",
    amount: "5,000$ - 10,000$", deadline: "28 فبراير 2027", type: "merit",
    fields: ["الريادة","الفنون","العلوم","التكنولوجيا"], region: "all", gpa: 78,
    desc: "تكريم الشباب العربي المبدع والمؤثر — منح ودعم لمشاريع الابتكار والريادة في الوطن العربي",
    link: "https://www.takreem.org", emoji: "🌟", tag: "إبداع وريادة", tagColor: "bg-purple-100 text-purple-700",
  },
  {
    id: 22, name: "منحة مؤسسة René Moawad للطلاب", org: "مؤسسة رينيه معوض",
    amount: "1,500$ - 3,500$", deadline: "15 مارس 2027", type: "need",
    fields: ["جميع التخصصات"], region: "الشمال", gpa: 72,
    desc: "دعم مالي للطلاب من محافظة الشمال وعكار من الأسر المحدودة الدخل — يشمل المرافقة الأكاديمية",
    link: "#", emoji: "🕊️", tag: "دعم مالي", tagColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 23, name: "منحة جمعية الهلال الأحمر اللبناني", org: "الهلال الأحمر اللبناني",
    amount: "1,000$ - 2,000$", deadline: "30 أبريل 2027", type: "need",
    fields: ["الطب","التمريض","الصحة العامة","الأعمال الاجتماعية"], region: "all", gpa: 70,
    desc: "دعم الطلاب في التخصصات الصحية والاجتماعية من الأسر المتأثرة بالأزمات في لبنان",
    link: "#", emoji: "🏥", tag: "دعم مالي", tagColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 24, name: "منحة رابطة الخريجين الأمريكيين AALEB", org: "AALEB",
    amount: "2,500$ - 4,000$", deadline: "31 يناير 2027", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 82,
    desc: "رابطة الخريجين الأمريكيين في لبنان تمنح الطلاب المتميزين دعماً للالتحاق بأفضل الجامعات",
    link: "#", emoji: "🎖️", tag: "جدارة", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 25, name: "منحة مؤسسة إيفاد للتنمية الريفية", org: "IFAD",
    amount: "3,000$ - 6,000$", deadline: "31 مارس 2027", type: "need",
    fields: ["الزراعة","العلوم البيئية","التنمية الريفية","الاقتصاد"], region: "البقاع", gpa: 70,
    desc: "منح للطلاب من المناطق الريفية والزراعية، مع التركيز على تخصصات التنمية الزراعية والبيئية",
    link: "https://www.ifad.org", emoji: "🌾", tag: "تنمية ريفية", tagColor: "bg-green-100 text-green-700",
  },
];

const TYPE_LABEL_KEYS: Record<string, TranslationKey> = {
  all: "sch.type.all", need: "sch.type.need", merit: "sch.type.merit", mixed: "sch.type.mixed", program: "sch.type.program",
};

function mapRow(row: Record<string, unknown>): Scholarship {
  let fields: string[] = ["جميع التخصصات"];
  if (typeof row.fields === "string") {
    try { fields = JSON.parse(row.fields); } catch { fields = [row.fields]; }
  } else if (Array.isArray(row.fields)) {
    fields = row.fields as string[];
  }
  return {
    id:       Number(row.id),
    name:     String(row.name || ""),
    org:      String(row.org  || ""),
    amount:   String(row.amount || ""),
    deadline: String(row.deadline || ""),
    type:     String(row.type || "need"),
    fields,
    region:   String(row.region || "all"),
    gpa:      Number(row.min_gpa || row.gpa || 0),
    desc:     String(row.description || row.desc || ""),
    link:     String(row.url || row.link || "#"),
    emoji:    String(row.emoji || "🏆"),
    tag:      String(row.tag || "منحة"),
    tagColor: String(row.tag_color || "bg-blue-100 text-blue-700"),
  };
}

// ─── Deadline Countdown Helper ───────────────────────────────────────────────
function daysUntilDeadline(deadlineStr: string): number | null {
  // Parse Arabic month names
  const months: Record<string,number> = {
    "يناير":1,"فبراير":2,"مارس":3,"أبريل":4,"مايو":5,"يونيو":6,
    "يوليو":7,"أغسطس":8,"سبتمبر":9,"أكتوبر":10,"نوفمبر":11,"ديسمبر":12
  };
  const parts = deadlineStr.trim().split(" ");
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const month = months[parts[1]];
  const year = parseInt(parts[2]);
  if (!day || !month || !year) return null;
  const deadline = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0,0,0,0);
  return Math.ceil((deadline.getTime() - today.getTime()) / 86400000);
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const { t } = useI18n();
  const days = daysUntilDeadline(deadline);
  if (days === null) return <span className="font-semibold text-red-600">{deadline}</span>;
  if (days < 0) return <span className="text-xs font-bold text-ink-subtle bg-bg-soft px-2 py-0.5 rounded-full">{t('sch.deadline.closed')}</span>;
  if (days === 0) return <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">{t('sch.deadline.today')}</span>;
  if (days <= 7) return <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">⚡ {days} {t('sch.deadline.days_left')}</span>;
  if (days <= 30) return <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">🕐 {days} {t('sch.deadline.day')}</span>;
  return <span className="text-xs font-semibold text-ink-subtle">{deadline}</span>;
}

export default function ScholarshipsPage() {
  const { t, dir } = useI18n();
  const { profile, savedScholarships, toggleSaveScholarship } = useStudentContext();

  // Eligibility wizard state
  const [showEligibility, setShowEligibility] = useState(false);
  const [eGpa, setEGpa] = useState(profile?.gpa || 75);
  const [eMajor, setEMajor] = useState("");
  const [eRegion, setERegion] = useState(profile?.region || "");
  const [eligibilityRun, setEligibilityRun] = useState(false);
  const [scholarships, setScholarships] = useState<Scholarship[]>(STATIC_SCHOLARSHIPS);
  const [search, setSearch]   = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [gpaFilter, setGpaFilter]   = useState(0);
  const [saved, setSaved]     = useState<number[]>([]);
  const [hideExpired, setHideExpired] = useState(true);

  // Load from Supabase; merge with static data so the total count is never lower
  // than the curated static list.  DB rows override statics that share the same id.
  // FIX-12: previously did a full replace, causing the displayed count to drop
  // whenever the DB had fewer rows than STATIC_SCHOLARSHIPS (count mismatch vs homepage).
  useEffect(() => {
    supabase
      .from("scholarships")
      .select("*")
      .eq("active", true)
      .order("id", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const dbIds = new Set(data.map((r: { id: number }) => Number(r.id)));
          const merged = [
            ...data.map(mapRow),
            ...STATIC_SCHOLARSHIPS.filter(s => !dbIds.has(s.id)),
          ];
          setScholarships(merged);
        }
      });
  }, []);

  const filtered = scholarships.filter(s => {
    const matchSearch = s.name.includes(search) || s.org.includes(search) || s.fields.some(f => f.includes(search));
    const matchType   = typeFilter === "all" || s.type === typeFilter;
    const matchGpa    = gpaFilter === 0 || s.gpa <= gpaFilter;
    const days = daysUntilDeadline(s.deadline);
    const isExpired = days !== null && days < 0;
    const matchExpiry = !hideExpired || !isExpired;
    return matchSearch && matchType && matchGpa && matchExpiry;
  });

  function toggleSave(id: number) {
    toggleSaveScholarship(id);
  }


  const MAJOR_OPTIONS = [t('sch.major.all'),"الهندسة","الطب","الأعمال","الحقوق","الفنون","التربية","العلوم","الاقتصاد","الإعلام"];

  const eligibilityMatches = useMemo(() => {
    if (!eligibilityRun) return null;
    return scholarships.map(s => {
      let score = 0;
      if (s.gpa <= eGpa) score += 40;
      else if (s.gpa - eGpa <= 5) score += 20;
      if (eMajor === "جميع التخصصات" || s.fields.includes("جميع التخصصات") || s.fields.some(f => f.includes(eMajor) || eMajor.includes(f))) score += 30;
      if (s.region === "all" || s.region.includes(eRegion) || eRegion === "") score += 30;
      return { ...s, matchPct: Math.min(score, 100) };
    }).filter(s => s.matchPct >= 40).sort((a, b) => b.matchPct - a.matchPct);
  }, [eligibilityRun, eGpa, eMajor, eRegion, scholarships]);

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden" dir={dir}>
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none" />

      <main className="relative max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-hero rounded-4xl p-8 md:p-10 mb-6 text-white shadow-floaty relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/30 rounded-full blur-3xl" />
          <div className="absolute top-4 left-8 text-3xl animate-float opacity-50">🎓</div>

          <div className="relative flex items-center gap-5">
            <div className="text-7xl animate-bounce-soft drop-shadow-2xl">🏆</div>
            <div>
              <span className="inline-block bg-surface/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-2">{t('sch.badge')}</span>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{t('sch.title.short')}</h1>
              <p className="text-white/90">{t('sch.subtitle.discover')} <strong className="text-mint">{scholarships.length}+</strong> {t('sch.subtitle.suffix')}</p>
            </div>
          </div>
        </div>

        {/* Eligibility Wizard */}
        <div className="bg-surface rounded-2xl border-2 border-blue-200 shadow-sm mb-6 overflow-hidden">
          <button onClick={() => setShowEligibility(!showEligibility)}
            className="w-full flex items-center justify-between p-5 text-right hover:bg-blue-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-bold text-ink">{t('sch.elig.title')}</p>
                <p className="text-sm text-ink-subtle">{t('sch.elig.subtitle')}</p>
              </div>
            </div>
            <span className="text-ink-subtle text-xl">{showEligibility ? "▲" : "▼"}</span>
          </button>
          {showEligibility && (
            <div className="border-t border-blue-100 p-5 bg-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-bold text-ink-muted block mb-2">{t('sch.elig.gpa')} <strong>{eGpa}%</strong></label>
                  <input type="range" min={40} max={100} value={eGpa} onChange={e => setEGpa(+e.target.value)}
                    className="w-full accent-blue-600" />
                </div>
                <div>
                  <label className="text-sm font-bold text-ink-muted block mb-2">{t('sch.elig.major')}</label>
                  <select value={eMajor} onChange={e => setEMajor(e.target.value)}
                    className="w-full border-2 border-white/10 rounded-xl px-3 py-2 text-sm bg-surface focus:border-blue-400 focus:outline-none">
                    {MAJOR_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-ink-muted block mb-2">{t('sch.elig.region')}</label>
                  <select value={eRegion} onChange={e => setERegion(e.target.value)}
                    className="w-full border-2 border-white/10 rounded-xl px-3 py-2 text-sm bg-surface focus:border-blue-400 focus:outline-none">
                    <option value="">{t('sch.elig.any_region')}</option>
                    {["بيروت","جبل لبنان","الشمال","الجنوب","البقاع"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => { setEligibilityRun(true); setShowEligibility(false); }}
                className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors">
                {t('sch.elig.run')}
              </button>
            </div>
          )}
        </div>

        {/* Eligibility Results */}
        {eligibilityRun && eligibilityMatches && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-green-800 flex items-center gap-2">
                ✅ {t('sch.elig.found')} <span className="bg-green-600 text-white rounded-full px-2 py-0.5 text-sm">{eligibilityMatches.length}</span> {t('sch.elig.found.suffix')}
              </h3>
              <button onClick={() => setEligibilityRun(false)} className="text-sm text-ink-subtle hover:text-ink-muted">{t('sch.elig.close')}</button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {eligibilityMatches.slice(0, 4).map(s => (
                <div key={s.id} className="bg-surface rounded-xl p-4 border border-green-100 flex items-center gap-3">
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-ink text-sm truncate">{s.name}</p>
                    <p className="text-xs text-ink-subtle">{s.amount} · {t('sch.elig.gpa_min')} {s.gpa}%+</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">{s.matchPct}% {t('sch.elig.match')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="w-full border-2 border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder={t('sch.search.detailed')} />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="border-2 border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none bg-surface min-w-[160px]">
              {Object.entries(TYPE_LABEL_KEYS).map(([k, vKey]) => <option key={k} value={k}>{t(vKey)}</option>)}
            </select>
            <select value={gpaFilter} onChange={e => setGpaFilter(Number(e.target.value))}
              className="border-2 border-white/10 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none bg-surface min-w-[160px]">
              <option value={0}>{t('sch.gpa.any')}</option>
              <option value={70}>{t('sch.gpa.70')}</option>
              <option value={75}>{t('sch.gpa.75')}</option>
              <option value={80}>{t('sch.gpa.80')}</option>
              <option value={85}>{t('sch.gpa.85')}</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-3 text-sm text-text-sub flex-wrap gap-2">
            <span>{t('sch.showing')} <strong className="text-primary">{filtered.length}</strong> {t('sch.count.label')}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setHideExpired(!hideExpired)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
                  hideExpired
                    ? "bg-green-50 border-green-300 text-green-700"
                    : "bg-bg-soft border-white/10 text-ink-subtle"
                }`}
              >
                {hideExpired ? "✅" : "🔲"} {hideExpired ? "إخفاء المنتهية" : "إظهار المنتهية"}
              </button>
              {saved.length > 0 && (
                <span className="text-accent font-semibold">⭐ {saved.length} {t('sch.count.label')}</span>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-text-sub">{t('sch.empty.title')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(s => (
              <div key={s.id} className="card hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{s.emoji}</div>
                    <div>
                      <span className={`badge ${s.tagColor} text-xs mb-1 inline-block`}>{s.tag}</span>
                      <h3 className="font-bold text-primary text-sm leading-snug">{s.name}</h3>
                    </div>
                  </div>
                  <button onClick={() => toggleSave(s.id)}
                    className={`text-xl transition-transform hover:scale-110 ${saved.includes(s.id) ? "text-yellow-500" : "text-gray-300"}`}>
                    ⭐
                  </button>
                </div>

                <p className="text-text-sub text-sm mb-4 leading-relaxed">{s.desc}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-sub">{t('sch.card.amount')}</span>
                    <span className="font-bold text-success">{s.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-text-sub">{t('sch.card.deadline')}</span>
                    <DeadlineBadge deadline={s.deadline} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-sub">{t('sch.card.required_gpa')}</span>
                    <span className="font-semibold text-primary">{s.gpa}{t('sch.card.gpa.suffix')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-sub">{t('sch.card.fields')}</span>
                    <span className="text-text-main text-xs">{s.fields.join("، ")}</span>
                  </div>
                </div>

                {(() => {
                  const days = daysUntilDeadline(s.deadline);
                  const isExpired = days !== null && days < 0;
                  return isExpired ? (
                    <span className="w-full py-2.5 rounded-xl text-sm text-center block bg-bg-soft text-ink-subtle cursor-not-allowed select-none">
                      {t('sch.card.closed')}
                    </span>
                  ) : (
                    <a href={s.link} target="_blank" rel="noopener noreferrer"
                      className="w-full btn-primary py-2.5 rounded-xl text-sm text-center block">
                      {t('sch.card.apply')}
                    </a>
                  );
                })()}
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="card mt-8 bg-light border-2 border-accent/20">
          <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
            <span>💡</span> {t('sch.tips.title')}
          </h3>
          <ul className="space-y-2 text-sm text-text-sub">
            {(['sch.tip.1','sch.tip.2','sch.tip.3','sch.tip.4','sch.tip.5'] as TranslationKey[]).map((tipKey, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">✓</span>
                <span>{t(tipKey)}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
