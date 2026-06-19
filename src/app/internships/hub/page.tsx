"use client";
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Internship = {
  id: number;
  title: string;
  company: string;
  companyEmoji: string;
  sector: string;
  region: string;
  type: "مدفوع" | "غير مدفوع" | "تطوعي";
  duration: string;
  stipend: string;
  deadline: string;
  skills: string[];
  desc: string;
  requirements: string[];
  benefits: string[];
  tag: string;
  tagColor: string;
  featured: boolean;
  remote: boolean;
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const STATIC_INTERNSHIPS: Internship[] = [
  {
    id:1, title:"مطور تطبيقات Full Stack", company:"Exotel Lebanon", companyEmoji:"💻",
    sector:"تكنولوجيا", region:"بيروت", type:"مدفوع", duration:"3 أشهر صيف 2026",
    stipend:"600–900$ / شهر", deadline:"30 مايو 2026",
    skills:["React","Node.js","PostgreSQL","Git"],
    desc:"انضم لفريق التطوير لبناء تطبيقات ويب متكاملة. تجربة حقيقية مع عملاء دوليين.",
    requirements:["طالب هندسة حاسوب أو CS سنة 2+","معرفة بـ React أو Vue","مشاريع على GitHub"],
    benefits:["راتب مجزٍ","شهادة خبرة","فرصة توظيف","مرشد متخصص"],
    tag:"🔥 مطلوب الآن", tagColor:"bg-red-100 text-red-700", featured:true, remote:false,
  },
  {
    id:2, title:"محلل بيانات تسويقية", company:"Beirut Digital District", companyEmoji:"📊",
    sector:"تسويق رقمي", region:"بيروت", type:"مدفوع", duration:"2-3 أشهر",
    stipend:"400–600$ / شهر", deadline:"15 مايو 2026",
    skills:["Google Analytics","Excel","SQL","Python أساسي"],
    desc:"تحليل بيانات الحملات الرقمية لعملاء الشركة. تقارير أسبوعية وتوصيات تحسين.",
    requirements:["طالب تسويق أو بيانات","Excel احترافي","مهارات تحليلية"],
    benefits:["خبرة في بيئة ناشئة","شبكة علاقات في BDD","توصية مهنية"],
    tag:"✨ متميز", tagColor:"bg-purple-100 text-purple-700", featured:true, remote:false,
  },
  {
    id:3, title:"مساعد محاسب مالي", company:"Deloitte Lebanon", companyEmoji:"🏦",
    sector:"محاسبة ومالية", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"700–1000$ / شهر", deadline:"1 يونيو 2026",
    skills:["Excel","QuickBooks","محاسبة مالية","IFRS أساسيات"],
    desc:"تدريب في أحد أكبر شركات المراجعة في العالم. خبرة تحت إشراف مراجعين قانونيين.",
    requirements:["محاسبة أو مالية سنة 3+","GPA 80%+","إنجليزي مستوى B2"],
    benefits:["شهادة Deloitte","فرصة توظيف كبيرة","تدريب Big 4","مرجع مهني قوي"],
    tag:"⭐ Big 4", tagColor:"bg-blue-100 text-blue-700", featured:true, remote:false,
  },
  {
    id:4, title:"صحفي / منتج محتوى رقمي", company:"Annahar Digital", companyEmoji:"📰",
    sector:"إعلام وصحافة", region:"بيروت", type:"مدفوع", duration:"2 أشهر صيف",
    stipend:"300–500$ / شهر", deadline:"20 مايو 2026",
    skills:["كتابة عربية محترفة","تصوير","Adobe Premiere","Social Media"],
    desc:"إنتاج محتوى رقمي لمنصات النهار الرقمية. مقالات، فيديوهات قصيرة، وتغطيات.",
    requirements:["إعلام أو صحافة أو كتابة","عينات كتابة","حماس للإعلام الرقمي"],
    benefits:["نشر تحت اسمك","خبرة في مؤسسة إعلامية كبرى","شبكة صحفية"],
    tag:"✍️ إعلام", tagColor:"bg-amber-100 text-amber-700", featured:false, remote:false,
  },
  {
    id:5, title:"مهندس ميداني مدني", company:"Khatib & Alami", companyEmoji:"🏗️",
    sector:"هندسة مدنية", region:"المتن", type:"مدفوع", duration:"3 أشهر",
    stipend:"500–700$ / شهر", deadline:"10 يونيو 2026",
    skills:["AutoCAD","متابعة تنفيذ","قراءة مخططات","Excel"],
    desc:"تدريب ميداني على مشروع إنشائي حقيقي. مراقبة جودة، متابعة مقاولين، تقارير يومية.",
    requirements:["هندسة مدنية سنة 3+","رخصة قيادة","استعداد للعمل الميداني"],
    benefits:["خبرة مشروع حقيقي","شهادة مكتب هندسي مرموق","مرشد مهندس أول"],
    tag:"🏗️ ميداني", tagColor:"bg-green-100 text-green-700", featured:false, remote:false,
  },
  {
    id:6, title:"مدرّب / مرشد يوث", company:"منظمة Beyond — لبنان", companyEmoji:"🌍",
    sector:"عمل اجتماعي", region:"بيروت والجبل", type:"تطوعي", duration:"6 أشهر",
    stipend:"تطوعي + بدل نقل", deadline:"1 مايو 2026",
    skills:["تواصل مع الشباب","تصميم برامج","تربية","عمل جماعي"],
    desc:"إرشاد وتدريب طلاب ثانوي في المناطق المهمّشة. برامج مهارات حياتية وتوجيه مهني.",
    requirements:["شغف بالعمل الاجتماعي","تربية أو علم نفس أو مجال ذات صلة","تنقل مستقل"],
    benefits:["شهادة منظمة دولية","خبرة NGO","شبكة UN/NGO","تأثير حقيقي"],
    tag:"💚 NGO", tagColor:"bg-teal-100 text-teal-700", featured:false, remote:false,
  },
  {
    id:7, title:"مصمم UX/UI", company:"Tamatem Games", companyEmoji:"🎮",
    sector:"تصميم تكنولوجيا", region:"عن بعد", type:"مدفوع", duration:"3 أشهر",
    stipend:"500–800$ / شهر", deadline:"25 مايو 2026",
    skills:["Figma","Prototyping","User Research","UI Design"],
    desc:"تصميم تجربة المستخدم لألعاب موبايل مشهورة في الوطن العربي. فريق شاب وبيئة إبداعية.",
    requirements:["Portfolio تصاميم","Figma احترافي","فضول واهتمام بالألعاب"],
    benefits:["شهادة شركة ألعاب عالمية","راتب مجزٍ","عمل عن بعد","مشاريع حقيقية"],
    tag:"🎮 ريموت", tagColor:"bg-indigo-100 text-indigo-700", featured:true, remote:true,
  },
  {
    id:8, title:"ممرض متدرب — طوارئ", company:"مستشفى الجامعة الأمريكية AUH", companyEmoji:"🏥",
    sector:"صحة وطب", region:"بيروت", type:"غير مدفوع", duration:"شهر (إلزامي جامعي)",
    stipend:"تدريب جامعي إلزامي", deadline:"1 أكتوبر 2026",
    skills:["رعاية مرضى","إسعافات أولية","تواصل طاقم طبي","ACLS أساسيات"],
    desc:"تدريب سريري في أحد أفضل مستشفيات المنطقة. خبرة في قسم الطوارئ والعناية.",
    requirements:["طالب تمريض سنة 3+","توصية أكاديمية","خلو من السوابق"],
    benefits:["توصية AUH","خبرة مستشفى مرموق","تدريب سريري متقدم"],
    tag:"🏥 طبي", tagColor:"bg-rose-100 text-rose-700", featured:false, remote:false,
  },
  {
    id:9, title:"باحث مساعد — علوم بيئية", company:"AUB AREC", companyEmoji:"🌿",
    sector:"بيئة وعلوم", region:"بيروت", type:"مدفوع", duration:"صيف 2026",
    stipend:"400–600$ / شهر", deadline:"15 يونيو 2026",
    skills:["GIS","بحث علمي","Excel/R","كتابة تقارير"],
    desc:"مشاركة في أبحاث الزراعة والبيئة في مركز AUB للموارد الطبيعية.",
    requirements:["علوم بيئية أو زراعة أو بيولوجيا","GPA 78%+","شغف بالبحث"],
    benefits:["نشر علمي محتمل","خبرة مختبر جامعي","مرجع AUB"],
    tag:"🔬 بحثي", tagColor:"bg-emerald-100 text-emerald-700", featured:false, remote:false,
  },
  {
    id:10, title:"محامي متدرب", company:"Badri & Salim El-Meouchi Law Firm", companyEmoji:"⚖️",
    sector:"قانون", region:"بيروت", type:"مدفوع", duration:"3 أشهر صيف",
    stipend:"300–500$ / شهر", deadline:"1 مايو 2026",
    skills:["بحث قانوني","كتابة مذكرات","القانون اللبناني","محاضر اجتماعات"],
    desc:"تدريب في مكتب محاماة دولي متخصص بالقانون التجاري والتحكيم الدولي.",
    requirements:["حقوق سنة 3+","فرنسي/إنجليزي ممتاز","اهتمام بالقانون التجاري"],
    benefits:["خبرة في قضايا دولية","شبكة علاقات قانونية","توصية من محامي أول"],
    tag:"⚖️ قانون", tagColor:"bg-gray-100 text-gray-700", featured:false, remote:false,
  },
];

const SECTORS_FALLBACK = ["الكل", ...Array.from(new Set(STATIC_INTERNSHIPS.map(i => i.sector)))];

// Map a Supabase row to the Internship type (column names use snake_case).
function mapRow(row: Record<string, unknown>): Internship {
  const arr = (v: unknown): string[] => Array.isArray(v) ? v as string[]
    : typeof v === 'string' ? (() => { try { return JSON.parse(v); } catch { return [v]; } })()
    : [];
  return {
    id: Number(row.id),
    title: String(row.title || ""),
    company: String(row.company || ""),
    companyEmoji: String(row.company_emoji || "💼"),
    sector: String(row.sector || ""),
    region: String(row.region || ""),
    type: (row.type as Internship['type']) || "مدفوع",
    duration: String(row.duration || ""),
    stipend: String(row.stipend || ""),
    deadline: String(row.deadline || ""),
    skills: arr(row.skills),
    desc: String(row.description || ""),
    requirements: arr(row.requirements),
    benefits: arr(row.benefits),
    tag: String(row.tag || ""),
    tagColor: String(row.tag_color || "bg-blue-100 text-blue-700"),
    featured: Boolean(row.featured),
    remote: Boolean(row.remote),
  };
}
const TYPES = ["الكل", "مدفوع", "غير مدفوع", "تطوعي"] as const;

// ─── Company Pages Data ────────────────────────────────────────────────────────
const COMPANIES = [
  { name:"Exotel Lebanon", emoji:"💻", sector:"تكنولوجيا", size:"50-200 موظف", desc:"شركة تقنية متخصصة في حلول الاتصالات السحابية للشرق الأوسط.", internships:3 },
  { name:"Deloitte Lebanon", emoji:"🏦", sector:"محاسبة", size:"+500 موظف", desc:"مكتب Big 4 الرائد في لبنان للمراجعة والاستشارات المالية.", internships:5 },
  { name:"Beirut Digital District", emoji:"🏢", sector:"ريادة أعمال", size:"حاضنة 100+ شركة", desc:"أكبر تجمع للشركات الرقمية والناشئة في لبنان والمنطقة العربية.", internships:8 },
  { name:"AUH — مستشفى الجامعة الأمريكية", emoji:"🏥", sector:"طب وصحة", size:"+1000 موظف", desc:"أرقى مستشفى في لبنان والمنطقة، مركز تدريب طبي عالمي.", internships:12 },
  { name:"Annahar Media", emoji:"📰", sector:"إعلام", size:"200+ موظف", desc:"أقدم وأشهر الصحف اللبنانية، رائدة في التحول الرقمي الإعلامي.", internships:4 },
  { name:"Khatib & Alami", emoji:"🏗️", sector:"هندسة", size:"+1000 موظف", desc:"أكبر مكتب هندسي في الشرق الأوسط وشمال أفريقيا.", internships:6 },
];

// ─── AI CV Tips ────────────────────────────────────────────────────────────────
const CV_TIPS = [
  { icon:"🎯", title:"خصّص سيرتك لكل وظيفة", tip:"اقرأ وصف الوظيفة بعناية وأضف الكلمات المفتاحية المطلوبة في سيرتك الذاتية. ليس نفس الـCV لكل فرصة." },
  { icon:"📊", title:"أرقام وإنجازات لا مهام", tip:"بدلاً من 'عملت في التسويق' اكتب 'رفعت engagement بنسبة 35% خلال 2 شهر'. الأرقام تتكلم." },
  { icon:"🔗", title:"LinkedIn + GitHub + Portfolio", tip:"أضف روابط قابلة للنقر في سيرتك. المجنّد سيضغط عليها. تأكد أنها محدّثة ومكتملة." },
  { icon:"⚡", title:"ابدأ بفعل قوي", tip:"كل نقطة في سيرتك تبدأ بفعل ماضٍ قوي: 'طوّرت'، 'أدرت'، 'حللت'، 'صممت'. تجنب 'مسؤول عن'." },
  { icon:"📏", title:"صفحة واحدة للطلاب", tip:"طالب جامعي = صفحة واحدة. لا حاجة للأهداف الشخصية الطويلة. المجنّد لديه 30 ثانية." },
];

export default function InternshipHubPage() {
  const { t, dir } = useI18n();
  const [activeTab, setActiveTab] = useState<"browse"|"companies"|"tips">("browse");
  const [search, setSearch] = useState("");
  const [filterSector, setFilterSector] = useState("الكل");
  const [filterType, setFilterType] = useState<"الكل"|"مدفوع"|"غير مدفوع"|"تطوعي">("الكل");
  const [filterRemote, setFilterRemote] = useState(false);
  const [expandedId, setExpandedId] = useState<number|null>(null);
  const [appliedIds, setAppliedIds] = useState<number[]>([]);
  const [applyModal, setApplyModal] = useState<Internship | null>(null);
  const [internships, setInternships] = useState<Internship[]>(STATIC_INTERNSHIPS);

  // Load from Supabase; keep static data as fallback
  useEffect(() => {
    supabase
      .from("internships")
      .select("*")
      .eq("active", true)
      .order("id", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          // Merge static + DB rows, deduped by id (DB wins)
          const dbRows = data.map(mapRow);
          const dbIds = new Set(dbRows.map(r => r.id));
          const merged = [...STATIC_INTERNSHIPS.filter(s => !dbIds.has(s.id)), ...dbRows];
          setInternships(merged);
        }
      });
  }, []);

  const sectors = useMemo(
    () => ["الكل", ...Array.from(new Set(internships.map(i => i.sector)))],
    [internships]
  );

  const filtered = useMemo(() => {
    return internships.filter(i => {
      const matchSearch = !search || i.title.includes(search) || i.company.includes(search) || i.sector.includes(search);
      const matchSector = filterSector === "الكل" || i.sector === filterSector;
      const matchType = filterType === "الكل" || i.type === filterType;
      const matchRemote = !filterRemote || i.remote;
      return matchSearch && matchSector && matchType && matchRemote;
    });
  }, [internships, search, filterSector, filterType, filterRemote]);

  const featuredInternships = internships.filter(i => i.featured);

  function handleApply(internship: Internship) {
    const isApplied = appliedIds.includes(internship.id);
    if (isApplied) {
      // Un-mark: just toggle off, no modal
      setAppliedIds(prev => prev.filter(x => x !== internship.id));
    } else {
      // First apply: add to list AND show confirmation modal
      setAppliedIds(prev => [...prev, internship.id]);
      setApplyModal(internship);
    }
  }

  return (
    <div dir={dir} className="min-h-screen bg-bg">

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-hero rounded-4xl p-8 md:p-12 mb-8 text-white shadow-floaty relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/30 rounded-full blur-3xl" />
          <div className="absolute top-6 left-1/4 text-3xl animate-float opacity-50">💼</div>
          <div className="absolute bottom-8 right-1/4 text-3xl animate-float opacity-50" style={{ animationDelay: '1s' }}>🎯</div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-bold mb-4">
                {t('ins.badge')}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{t('ins.hero.title')}</h1>
              <p className="text-purple-100 text-lg max-w-xl">
                {internships.length} {t('ins.hero.subtitle')}
              </p>
            </div>
            <div className="text-6xl opacity-80">🚀</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { n: internships.filter(i=>i.type==="مدفوع").length, label: t('ins.stat.paid'),      emoji:"💰" },
              { n: internships.filter(i=>i.featured).length,        label: t('ins.stat.featured'),  emoji:"⭐" },
              { n: internships.filter(i=>i.remote).length,          label: t('ins.stat.remote'),    emoji:"🌐" },
              { n: COMPANIES.length,                                label: t('ins.stat.companies'), emoji:"🏢" },
            ].map(s => (
              <div key={s.label} className="bg-white/15 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{s.emoji}</div>
                <div className="text-2xl font-extrabold">{s.n}</div>
                <div className="text-xs text-purple-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6">
          {([
            ["browse",    t('ins.tab.browse')],
            ["companies", t('ins.tab.companies')],
            ["tips",      t('ins.tab.tips')],
          ] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-colors ${activeTab === tab ? "bg-purple-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Browse Tab ── */}
        {activeTab === "browse" && (
          <div>
            {/* Featured */}
            {featuredInternships.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-extrabold text-gray-800 mb-3">{t('ins.featured.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredInternships.slice(0,4).map(i => (
                    <div key={i.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{i.companyEmoji}</span>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">{i.title}</h3>
                          <p className="text-xs text-purple-600 font-semibold">{i.company}</p>
                        </div>
                        <span className={`mr-auto text-xs font-bold px-2 py-1 rounded-full ${i.tagColor}`}>{i.tag}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>💰 {i.stipend}</span>
                        <span>📍 {i.remote ? t('ins.remote.label') : i.region}</span>
                        <span>⏱️ {i.duration}</span>
                      </div>
                      <button onClick={() => setExpandedId(expandedId === i.id ? null : i.id)}
                        className="w-full text-xs font-bold py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700">
                        {t('ins.detail.cta')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5">
              <div className="flex flex-wrap gap-3 mb-3">
                <div className="flex-1 min-w-48">
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={t('ins.filter.search')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={filterRemote} onChange={e => setFilterRemote(e.target.checked)} className="rounded" />
                  {t('ins.filter.remote')}
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {TYPES.map(ty => (
                  <button key={ty} onClick={() => setFilterType(ty)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filterType === ty ? "bg-purple-600 text-white border-purple-600" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-300"}`}>
                    {ty === "مدفوع" ? t('ins.type.paid') : ty === "تطوعي" ? t('ins.type.volunteer') : ty === "غير مدفوع" ? t('ins.type.unpaid') : t('ins.type.all')}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {sectors.map(s => (
                  <button key={s} onClick={() => setFilterSector(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filterSector === s ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4"><strong>{filtered.length}</strong> فرصة تدريب</p>

            {/* Internship Cards */}
            <div className="space-y-4">
              {filtered.map(i => {
                const isExp = expandedId === i.id;
                const isApplied = appliedIds.includes(i.id);
                return (
                  <div key={i.id}
                    className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${isExp ? "border-purple-400 ring-2 ring-purple-100" : "border-gray-100"}`}>
                    <div className="p-5">
                      <div className="flex items-start gap-4 flex-wrap">
                        <div className="text-4xl">{i.companyEmoji}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${i.tagColor}`}>{i.tag}</span>
                                {i.remote && <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">🌐 عن بعد</span>}
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${i.type === "مدفوع" ? "bg-green-100 text-green-700" : i.type === "تطوعي" ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"}`}>{i.type}</span>
                              </div>
                              <h3 className="font-extrabold text-gray-800 text-base">{i.title}</h3>
                              <p className="text-sm text-purple-700 font-semibold">{i.company}</p>
                            </div>
                            <div className="text-left text-xs text-gray-500 space-y-1">
                              <div>💰 {i.stipend}</div>
                              <div>📍 {i.region}</div>
                              <div>⏱️ {i.duration}</div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{i.desc}</p>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {i.skills.map(s => (
                              <span key={s} className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full border border-purple-200">{s}</span>
                            ))}
                          </div>

                          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                            <span className="font-semibold text-red-500">⏰ الموعد النهائي: {i.deadline}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 flex-wrap">
                        <button onClick={() => setExpandedId(isExp ? null : i.id)}
                          className="flex-1 text-xs font-bold py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                          {isExp ? "▲ إخفاء" : "▼ التفاصيل الكاملة"}
                        </button>
                        <button onClick={() => handleApply(i)}
                          className={`flex-1 text-xs font-bold py-2 rounded-xl transition-colors ${isApplied ? "bg-green-600 text-white" : "bg-purple-600 text-white hover:bg-purple-700"}`}>
                          {isApplied ? "✓ سجّلت اهتمامي" : "سجّل اهتمامك ←"}
                        </button>
                      </div>

                      {isExp && (
                        <div className="mt-4 pt-4 border-t border-gray-100 grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-gray-700 mb-2">📋 المتطلبات:</p>
                            <ul className="space-y-1.5">
                              {i.requirements.map(r => (
                                <li key={r} className="flex items-start gap-2 text-xs text-gray-600">
                                  <span className="text-purple-500 mt-0.5">•</span>{r}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-700 mb-2">🎁 ما ستكسبه:</p>
                            <ul className="space-y-1.5">
                              {i.benefits.map(b => (
                                <li key={b} className="flex items-start gap-2 text-xs text-gray-600">
                                  <span className="text-green-500 mt-0.5">✓</span>{b}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-500">لم يتم العثور على فرص</p>
              </div>
            )}

            {/* Saved Internships List */}
            {appliedIds.length > 0 && (
              <div className="mt-8 bg-blue-50 border border-blue-200 rounded-2xl p-5">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-gray-800">🔖 التدريبات التي سجّلت اهتمامك بها ({appliedIds.length})</h3>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  للتقديم الفعلي على أي منها، تواصل مع الشركة مباشرة وأرسل سيرتك الذاتية.
                  <Link href="/tools/application-tracker" className="text-blue-600 font-semibold mr-1">تتبّع تقدمك في Application Tracker ←</Link>
                </p>
                <div className="flex flex-wrap gap-2">
                  {internships.filter(i => appliedIds.includes(i.id)).map(i => (
                    <div key={i.id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-blue-200 text-sm">
                      <span>{i.companyEmoji}</span>
                      <span className="font-semibold text-gray-700">{i.company}</span>
                      <span className="text-xs text-gray-400">— {i.title}</span>
                      <button onClick={() => setAppliedIds(prev => prev.filter(x => x !== i.id))} className="text-gray-300 hover:text-red-400 transition-colors text-xs mr-1">✕</button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Companies Tab ── */}
        {activeTab === "companies" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {COMPANIES.map(c => (
              <div key={c.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
                <div className="text-4xl mb-3">{c.emoji}</div>
                <h3 className="font-extrabold text-gray-800 mb-1">{c.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">{c.sector}</span>
                  <span className="text-xs text-gray-500">{c.size}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{c.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
                    {c.internships} فرصة متاحة
                  </span>
                  <button onClick={() => { setActiveTab("browse"); setSearch(c.name.split(" ")[0]); }}
                    className="text-xs font-bold text-blue-600 hover:underline">
                    عرض الفرص ←
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tips Tab ── */}
        {activeTab === "tips" && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
              <h2 className="text-xl font-extrabold mb-2">💡 دليل بناء CV احترافي للطلاب</h2>
              <p className="text-purple-100">نصائح عملية من مجنّدين في أكبر شركات لبنان والخليج</p>
            </div>

            {CV_TIPS.map((tip, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{tip.icon}</div>
                  <div>
                    <h3 className="font-extrabold text-gray-800 mb-2">{tip.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{tip.tip}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-extrabold text-gray-800 mb-3">🛠️ أدوات مسارك لبناء CV</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link href="/tools/cv-builder"
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-400 hover:shadow-sm transition-all">
                  <span className="text-2xl">📄</span>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">CV Builder</div>
                    <div className="text-xs text-gray-500">قوالب احترافية باللغتين</div>
                  </div>
                  <span className="mr-auto text-blue-600">←</span>
                </Link>
                <Link href="/tools/cover-letter"
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-400 hover:shadow-sm transition-all">
                  <span className="text-2xl">✉️</span>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Cover Letter</div>
                    <div className="text-xs text-gray-500">رسالة تقديم مخصصة</div>
                  </div>
                  <span className="mr-auto text-blue-600">←</span>
                </Link>
                <Link href="/tools/interview"
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-400 hover:shadow-sm transition-all">
                  <span className="text-2xl">🎤</span>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">تحضير المقابلة</div>
                    <div className="text-xs text-gray-500">أسئلة وإجابات نموذجية</div>
                  </div>
                  <span className="mr-auto text-blue-600">←</span>
                </Link>
                <Link href="/tools/skill-gap"
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-400 hover:shadow-sm transition-all">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Skill Gap Analyzer</div>
                    <div className="text-xs text-gray-500">اكتشف ما تحتاج تتعلمه</div>
                  </div>
                  <span className="mr-auto text-blue-600">←</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-extrabold mb-3">🎯 جهّز ملفك للتدريب الآن</h2>
          <p className="text-purple-100 mb-6">أنشئ CV احترافي ورسالة تقديم قوية — مجاناً على مسارك</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/tools/cv-builder"
              className="bg-white text-purple-700 font-bold px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors">
              📄 ابنِ CV احترافي
            </Link>
            <Link href="/scholarships"
              className="bg-white/20 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors border border-white/30">
              🏆 ابحث عن منح دراسية
            </Link>
          </div>
        </div>
      </main>

      {/* ── Apply Confirmation Modal ─────────────────────────────────────── */}
      {applyModal && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setApplyModal(null)}
        >
          <div
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="text-center mb-5">
              <div className="text-5xl mb-3">{applyModal.companyEmoji}</div>
              <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 text-sm font-bold px-3 py-1.5 rounded-full mb-3">
                ✅ سجّلت اهتمامك بهذا التدريب
              </div>
              <h3 className="text-lg font-extrabold text-gray-900">{applyModal.title}</h3>
              <p className="text-sm text-purple-600 font-semibold">{applyModal.company}</p>
            </div>

            {/* What happens next */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-4">
              <p className="text-sm font-bold text-amber-800 mb-3">📋 ماذا يحصل بعد هذا؟</p>
              <ul className="space-y-2.5 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5">١.</span>
                  <span>تم حفظ هذا التدريب في قائمة اهتماماتك على هذه الصفحة فقط</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5">٢.</span>
                  <span>للتقديم الفعلي، تواصل مع <strong>{applyModal.company}</strong> مباشرة وأرسل سيرتك الذاتية ورسالة الدوافع</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-500 font-bold mt-0.5">٣.</span>
                  <span>اتبّع طلبك وحالته في متتبع الطلبات حتى تعرف أين وصلت</span>
                </li>
              </ul>
            </div>

            {/* Deadline reminder */}
            <div className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 mb-4">
              <span className="text-red-500">⏰</span>
              <span className="text-sm text-red-700 font-semibold">الموعد النهائي: {applyModal.deadline}</span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Link
                href="/tools/application-tracker"
                onClick={() => setApplyModal(null)}
                className="w-full text-center bg-[#1b3a6b] text-white font-bold py-3 rounded-xl text-sm hover:bg-[#2d5391] transition-colors"
              >
                📋 اتتبّع طلباتي في Application Tracker →
              </Link>
              <button
                onClick={() => setApplyModal(null)}
                className="w-full text-center text-gray-500 font-semibold py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
              >
                فهمت، شكراً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
