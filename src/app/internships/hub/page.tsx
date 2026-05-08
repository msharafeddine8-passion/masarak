"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

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
const INTERNSHIPS: Internship[] = [
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

const SECTORS = ["الكل", ...Array.from(new Set(INTERNSHIPS.map(i => i.sector)))];
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
  const [activeTab, setActiveTab] = useState<"browse"|"companies"|"tips">("browse");
  const [search, setSearch] = useState("");
  const [filterSector, setFilterSector] = useState("الكل");
  const [filterType, setFilterType] = useState<"الكل"|"مدفوع"|"غير مدفوع"|"تطوعي">("الكل");
  const [filterRemote, setFilterRemote] = useState(false);
  const [expandedId, setExpandedId] = useState<number|null>(null);
  const [appliedIds, setAppliedIds] = useState<number[]>([]);

  const filtered = useMemo(() => {
    return INTERNSHIPS.filter(i => {
      const matchSearch = !search || i.title.includes(search) || i.company.includes(search) || i.sector.includes(search);
      const matchSector = filterSector === "الكل" || i.sector === filterSector;
      const matchType = filterType === "الكل" || i.type === filterType;
      const matchRemote = !filterRemote || i.remote;
      return matchSearch && matchSector && matchType && matchRemote;
    });
  }, [search, filterSector, filterType, filterRemote]);

  const featuredInternships = INTERNSHIPS.filter(i => i.featured);

  function toggleApplied(id: number) {
    setAppliedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-blue-600 font-extrabold text-lg">مسارك</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm font-medium text-gray-500">
            <Link href="/internships/hub" className="text-blue-600 font-bold">التدريب</Link>
            <Link href="/scholarships" className="hover:text-blue-600">المنح</Link>
            <Link href="/tools/cv-builder" className="hover:text-blue-600">CV Builder</Link>
            <Link href="/universities" className="hover:text-blue-600">الجامعات</Link>
          </nav>
          <Link href="/dashboard" className="bg-blue-600 text-white rounded-xl font-bold text-sm px-4 py-2">داشبورد</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-violet-700 via-purple-700 to-indigo-800 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-bold mb-4">
                💼 مركز فرص التدريب الصيفي 2026
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">ابدأ مسيرتك المهنية الآن</h1>
              <p className="text-purple-100 text-lg max-w-xl">
                {INTERNSHIPS.length} فرصة تدريب في أفضل الشركات اللبنانية — مدفوعة، حقيقية، تبني CV احترافي
              </p>
            </div>
            <div className="text-6xl opacity-80">🚀</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { n: INTERNSHIPS.filter(i=>i.type==="مدفوع").length, label:"تدريب مدفوع", emoji:"💰" },
              { n: INTERNSHIPS.filter(i=>i.featured).length,       label:"فرصة مميزة", emoji:"⭐" },
              { n: INTERNSHIPS.filter(i=>i.remote).length,         label:"عن بعد",     emoji:"🌐" },
              { n: COMPANIES.length,                               label:"شركة مشاركة",emoji:"🏢" },
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
            ["browse",    "🔍 تصفح الفرص"],
            ["companies", "🏢 شركات مشاركة"],
            ["tips",      "💡 نصائح CV"],
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
                <h2 className="text-lg font-extrabold text-gray-800 mb-3">⭐ الفرص المميزة</h2>
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
                        <span>📍 {i.remote ? "عن بعد" : i.region}</span>
                        <span>⏱️ {i.duration}</span>
                      </div>
                      <button onClick={() => setExpandedId(expandedId === i.id ? null : i.id)}
                        className="w-full text-xs font-bold py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700">
                        عرض التفاصيل والتقديم ←
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
                    placeholder="🔍 ابحث عن وظيفة أو شركة..."
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={filterRemote} onChange={e => setFilterRemote(e.target.checked)} className="rounded" />
                  عن بعد فقط 🌐
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {TYPES.map(t => (
                  <button key={t} onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filterType === t ? "bg-purple-600 text-white border-purple-600" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-300"}`}>
                    {t === "مدفوع" ? "💰 مدفوع" : t === "تطوعي" ? "💚 تطوعي" : t === "غير مدفوع" ? "📋 غير مدفوع" : "الكل"}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SECTORS.map(s => (
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
                        <button onClick={() => toggleApplied(i.id)}
                          className={`flex-1 text-xs font-bold py-2 rounded-xl transition-colors ${isApplied ? "bg-green-600 text-white" : "bg-purple-600 text-white hover:bg-purple-700"}`}>
                          {isApplied ? "✓ قدّمت طلبي" : "تقديم الآن ←"}
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

            {/* Applied Tracker */}
            {appliedIds.length > 0 && (
              <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-5">
                <h3 className="font-bold text-gray-800 mb-3">✅ تتبع طلباتك ({appliedIds.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {INTERNSHIPS.filter(i => appliedIds.includes(i.id)).map(i => (
                    <div key={i.id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-green-200 text-sm">
                      <span>{i.companyEmoji}</span>
                      <span className="font-semibold text-gray-700">{i.company}</span>
                      <span className="text-xs text-gray-400">— {i.title}</span>
                      <span className="text-xs bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">قيد المراجعة</span>
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
    </div>
  );
}
