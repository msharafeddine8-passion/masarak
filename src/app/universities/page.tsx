"use client";
import { useState } from "react";
import Link from "next/link";

// ─── Data ─────────────────────────────────────────────────────────────────────

const UNIVERSITIES = [
  { id: 1,  name: "الجامعة الأمريكية في بيروت",         short: "AUB",   region: "بيروت",        lang: "إنجليزي",       type: "خاصة",    tuition: "$10,000 – $25,000", fields: ["الطب","الهندسة","الأعمال","العلوم الإنسانية","الصحة العامة"],        desc: "أعرق الجامعات في الشرق الأوسط، تأسست 1866. مستوى أكاديمي رفيع وبحث علمي مكثف.",      site: "https://www.aub.edu.lb",    scholarships: true  },
  { id: 2,  name: "الجامعة اللبنانية الأمريكية",         short: "LAU",   region: "بيروت وبيبلوس", lang: "إنجليزي",       type: "خاصة",    tuition: "$7,000 – $20,000",  fields: ["الأعمال","الهندسة","الفنون","الصحة","العلوم الإنسانية"],             desc: "تجمع بين الجودة الأمريكية والبيئة اللبنانية. حرمان في بيروت وبيبلوس.",              site: "https://www.lau.edu.lb",    scholarships: true  },
  { id: 3,  name: "جامعة القديس يوسف",                  short: "USJ",   region: "بيروت",        lang: "فرنسي/إنجليزي", type: "خاصة",    tuition: "$4,000 – $15,000",  fields: ["الطب","الصيدلة","الحقوق","الهندسة","العلوم الاجتماعية"],            desc: "جامعة يسوعية تأسست 1875، تتميز بطابعها الفرنكوفوني وتخصصاتها في الطب والحقوق.",     site: "https://www.usj.edu.lb",    scholarships: true  },
  { id: 4,  name: "الجامعة اللبنانية",                   short: "UL",    region: "كل لبنان",     lang: "عربي/فرنسي",    type: "حكومية",  tuition: "$100 – $500",       fields: ["الحقوق","الهندسة","الآداب","العلوم الاجتماعية","الصحة"],             desc: "الجامعة الوطنية الحكومية الوحيدة. فروع في كل المحافظات برسوم رمزية.",               site: "https://www.ul.edu.lb",     scholarships: true  },
  { id: 5,  name: "جامعة الروح القدس – الكسليك",         short: "USEK",  region: "جبل لبنان",    lang: "فرنسي/إنجليزي", type: "خاصة",    tuition: "$4,000 – $12,000",  fields: ["الموسيقى","الفنون","الطب","الصيدلة","الأعمال","الهندسة"],            desc: "جامعة مارونية تتميز بحرمها الجبلي الجميل وبرامجها في الفنون والطب.",                 site: "https://www.usek.edu.lb",   scholarships: true  },
  { id: 6,  name: "جامعة البلمند",                       short: "UOB",   region: "الشمال",       lang: "إنجليزي",       type: "خاصة",    tuition: "$4,000 – $12,000",  fields: ["الهندسة","الطب","الأعمال","الفنون","العلوم"],                         desc: "تقع في منطقة الكورة، حرم جامعي جميل وتخصصات متنوعة.",                               site: "https://www.balamand.edu.lb", scholarships: true },
  { id: 7,  name: "الجامعة الأمريكية للتكنولوجيا",       short: "AUT",   region: "بيروت",        lang: "إنجليزي",       type: "خاصة",    tuition: "$4,000 – $12,000",  fields: ["هندسة الحاسوب","إدارة الأعمال","التكنولوجيا التطبيقية"],            desc: "تتخصص في التقنية والهندسة التطبيقية بمنهج أمريكي متميز.",                            site: "https://www.aut.edu.lb",    scholarships: false },
  { id: 8,  name: "الجامعة اللبنانية الدولية",            short: "LIU",   region: "بيروت وفروع",  lang: "إنجليزي/عربي",  type: "خاصة",    tuition: "$3,000 – $8,000",   fields: ["الهندسة","الأعمال","الصحة","تقنية المعلومات","التربية"],             desc: "جامعة ذات رسوم معقولة مع برامج متنوعة وفروع في أنحاء لبنان.",                        site: "https://www.liu.edu.lb",    scholarships: false },
  { id: 9,  name: "جامعة بيروت العربية",                 short: "BAU",   region: "بيروت",        lang: "عربي/إنجليزي",  type: "خاصة",    tuition: "$2,500 – $7,000",   fields: ["الهندسة","الطب","الأعمال","الحقوق","العلوم الإنسانية"],              desc: "فرع لبناني من جامعة الإسكندرية، رسوم معتدلة وبرامج متنوعة.",                         site: "https://www.bau.edu.lb",    scholarships: false },
  { id: 10, name: "جامعة الأنطونية",                     short: "UA",    region: "جبل لبنان",    lang: "فرنسي/عربي",    type: "خاصة",    tuition: "$3,500 – $9,000",   fields: ["الموسيقى","الاجتماع","التربية","الأعمال","الصحة"],                   desc: "جامعة في بعبدا، طابع إنساني ومجتمعي مميز.",                                           site: "https://www.antonine-university.edu.lb", scholarships: false },
  { id: 11, name: "جامعة الحكمة",                        short: "UH",    region: "بيروت",        lang: "فرنسي/عربي",    type: "خاصة",    tuition: "$3,500 – $9,000",   fields: ["الحقوق","العلوم السياسية","الترجمة","الأدب","الأعمال"],             desc: "جامعة مسيحية مارونية في الأشرفية بجو عائلي مميز.",                                   site: "https://www.wisdom.edu.lb", scholarships: false },
  { id: 12, name: "جامعة رفيق الحريري",                  short: "HU",    region: "بيروت",        lang: "عربي/إنجليزي",  type: "خاصة",    tuition: "$3,000 – $8,000",   fields: ["الصحة","الأعمال","الهندسة","التربية","تقنية المعلومات"],            desc: "جامعة خاصة بتوجه نحو سوق العمل وبرامج متنوعة.",                                      site: "https://www.hu.edu.lb",     scholarships: false },
  { id: 13, name: "جامعة هيغازيان",                      short: "HU",    region: "بيروت",        lang: "إنجليزي/أرمني", type: "خاصة",    tuition: "$3,000 – $8,000",   fields: ["الأعمال","العلوم الاجتماعية","اللاهوت","الأدب"],                    desc: "جامعة أرمنية مسيحية بروح مجتمعية متميزة في الأشرفية.",                               site: "https://www.haigazian.edu.lb", scholarships: false },
  { id: 14, name: "الجامعة اللبنانية الألمانية",          short: "LGU",   region: "البقاع",       lang: "إنجليزي/ألماني", type: "خاصة",   tuition: "$4,000 – $10,000",  fields: ["الهندسة","تقنية المعلومات","الأعمال","البيئة"],                      desc: "برامج هندسية وتقنية بمنهج ألماني تطبيقي في زحلة.",                                   site: "https://www.lgu-lb.org",    scholarships: false },
  { id: 15, name: "الجامعة اللبنانية الكندية",            short: "LCU",   region: "البقاع",       lang: "إنجليزي",       type: "خاصة",    tuition: "$3,000 – $8,000",   fields: ["الأعمال","تقنية المعلومات","التربية","العلوم الاجتماعية"],          desc: "برامج بمعايير كندية في بعلبك.",                                                       site: "https://www.lcu.edu.lb",    scholarships: false },
  { id: 16, name: "الجامعة الإسلامية في لبنان",           short: "IUL",   region: "البقاع",       lang: "عربي",          type: "خاصة",    tuition: "$1,500 – $5,000",   fields: ["الشريعة","الحقوق","الآداب","التربية","العلوم الاجتماعية"],          desc: "تعليم يجمع بين الإسلامي والأكاديمي الحديث بأسعار مناسبة.",                           site: "https://www.iul.edu.lb",    scholarships: false },
  { id: 17, name: "جامعة الجنان",                        short: "JU",    region: "الشمال",       lang: "عربي/إنجليزي",  type: "خاصة",    tuition: "$2,500 – $6,000",   fields: ["الأعمال","الهندسة","الحقوق","التربية","الصحة"],                     desc: "تخدم شمال لبنان من طرابلس بأسعار مناسبة.",                                           site: "https://www.jinan.edu.lb",  scholarships: false },
  { id: 18, name: "جامعة الشرق الأوسط",                  short: "MEU",   region: "البقاع",       lang: "عربي/إنجليزي",  type: "خاصة",    tuition: "$2,500 – $6,000",   fields: ["الأعمال","الهندسة","التربية","الحقوق","تقنية المعلومات"],           desc: "تخدم منطقة البقاع بتخصصات متعددة وأسعار مناسبة.",                                    site: "#",                         scholarships: false },
  { id: 19, name: "الجامعة الحديثة للعلوم والآداب",       short: "MSA",   region: "بيروت",        lang: "عربي/إنجليزي",  type: "خاصة",    tuition: "$2,000 – $5,000",   fields: ["الأعمال","الاتصالات","العلوم الاجتماعية","التربية"],                 desc: "جامعة خاصة بأسعار مناسبة في بيروت.",                                                 site: "#",                         scholarships: false },
  { id: 20, name: "جامعة سيدة اللويزة",                  short: "USL",   region: "جبل لبنان",    lang: "عربي/فرنسي",    type: "خاصة",    tuition: "$4,000 – $10,000",  fields: ["الهندسة","الأعمال","العلوم الإنسانية","التربية"],                   desc: "جامعة مسيحية أنطاكية في الزوق بجو جامعي هادئ.",                                      site: "#",                         scholarships: false },
  { id: 21, name: "جامعة العلوم والتكنولوجيا اللبنانية",  short: "LST",   region: "بيروت",        lang: "إنجليزي",       type: "خاصة",    tuition: "$3,500 – $9,000",   fields: ["هندسة الحاسوب","التكنولوجيا","العلوم التطبيقية","الأعمال"],         desc: "تتخصص في العلوم التطبيقية والتكنولوجيا.",                                             site: "#",                         scholarships: false },
  { id: 22, name: "الجامعة العربية المفتوحة",              short: "AOU",   region: "بيروت",        lang: "عربي/إنجليزي",  type: "خاصة",    tuition: "$5,000 – $9,000",   fields: ["تكنولوجيا المعلومات","الأعمال","التربية","الآداب"],                  desc: "تعلم مدمج حضوري وإلكتروني مع شهادات مزدوجة.",                                        site: "#",                         scholarships: false },
];

const INSTITUTES = [
  { id: 1,  name: "المعهد الوطني للإدارة",                short: "INA",  region: "بيروت",      type: "معهد حكومي",   tuition: "رمزية",             fields: ["الإدارة العامة","السياسات العامة"],                        desc: "تكوين الكوادر الإدارية والحكومية في لبنان." },
  { id: 2,  name: "المعهد التقني اللبناني",               short: "LTI",  region: "كل لبنان",   type: "معهد تقني",    tuition: "$800 – $2,500",      fields: ["الميكانيك","الكهرباء","البناء","تقنية المعلومات"],         desc: "شهادات تقنية بكفاءة عالية ومدة دراسة قصيرة." },
  { id: 3,  name: "معهد العلوم الاجتماعية",               short: "ISS",  region: "بيروت",      type: "معهد خاص",     tuition: "$2,000 – $4,000",    fields: ["الخدمة الاجتماعية","علم النفس التطبيقي"],                 desc: "متخصص في تأهيل الأخصائيين الاجتماعيين." },
  { id: 4,  name: "معهد الفنون الجميلة",                  short: "IFA",  region: "بيروت",      type: "معهد فني",     tuition: "$2,500 – $5,000",    fields: ["الرسم","النحت","الغرافيك","الخط"],                        desc: "تدريب متخصص في الفنون البصرية والتطبيقية." },
  { id: 5,  name: "معهد الطيران اللبناني",                 short: "LAI",  region: "بيروت",      type: "معهد تقني",    tuition: "$5,000 – $15,000",   fields: ["الطيران","الملاحة الجوية","الهندسة الجوية"],              desc: "تأهيل الطيارين والتقنيين في مجال الطيران." },
  { id: 6,  name: "معهد العلوم الصحية التطبيقية",          short: "AIHS", region: "كل لبنان",   type: "معهد صحي",     tuition: "$1,500 – $3,500",    fields: ["التمريض","الصيدلة المساعدة","التحاليل الطبية"],           desc: "برامج صحية قصيرة ومعتمدة من وزارة الصحة." },
  { id: 7,  name: "معهد الفندقة والسياحة",                 short: "HTI",  region: "بيروت",      type: "معهد مهني",    tuition: "$1,500 – $3,000",    fields: ["الفندقة","الطهي","إدارة السياحة"],                       desc: "شهادات مهنية معتمدة في صناعة الضيافة." },
  { id: 8,  name: "معهد تكنولوجيا المعلومات",              short: "ITI",  region: "بيروت",      type: "معهد تقني",    tuition: "$1,000 – $2,500",    fields: ["البرمجة","الشبكات","الأمن السيبراني","الذكاء الاصطناعي"], desc: "دورات وشهادات في مجالات التقنية الحديثة." },
];

const SCHOOLS = [
  { id: 1,  name: "مدرسة الإيمان",              region: "بيروت",      type: "خاصة",    system: "رسمي لبناني", levels: ["ابتدائي","متوسط","ثانوي"],  lang: "عربي/فرنسي", desc: "مدرسة مسيحية عريقة في بيروت تتبع المنهج اللبناني." },
  { id: 2,  name: "المقاصد الإسلامية",           region: "بيروت",      type: "خاصة",    system: "رسمي لبناني", levels: ["ابتدائي","متوسط","ثانوي"],  lang: "عربي/إنجليزي", desc: "شبكة مدارس إسلامية بجودة عالية في بيروت وضواحيها." },
  { id: 3,  name: "ليسيه عبدالقادر",             region: "بيروت",      type: "خاصة",    system: "فرنسي Bac",  levels: ["ابتدائي","متوسط","ثانوي"],  lang: "فرنسي/عربي", desc: "مدرسة فرنكوفونية عريقة تمنح شهادة البكالوريا الفرنسية." },
  { id: 4,  name: "الكلية الإنجيلية",            region: "جبل لبنان",  type: "خاصة",    system: "أمريكي SAT",  levels: ["ابتدائي","متوسط","ثانوي"],  lang: "إنجليزي/عربي", desc: "مدرسة بروتستانتية بمنهج أمريكي ومستوى أكاديمي مرتفع." },
  { id: 5,  name: "مدرسة راهبات العائلة المقدسة", region: "جبل لبنان",  type: "خاصة",    system: "رسمي لبناني", levels: ["ابتدائي","متوسط","ثانوي"],  lang: "فرنسي/عربي", desc: "مدرسة كاثوليكية تتميز بتربيتها الشاملة وبيئتها الآمنة." },
  { id: 6,  name: "المدرسة العالمية في لبنان",    region: "بيروت",      type: "خاصة",    system: "IB دولي",     levels: ["ابتدائي","متوسط","ثانوي"],  lang: "إنجليزي", desc: "تمنح شهادة الباكالوريا الدولية IB المعترف بها عالمياً." },
  { id: 7,  name: "مدرسة كلية التراث",            region: "الشمال",     type: "خاصة",    system: "رسمي لبناني", levels: ["ابتدائي","متوسط","ثانوي"],  lang: "عربي/فرنسي", desc: "مدرسة أرثوذكسية في طرابلس بتراث أكاديمي عريق." },
  { id: 8,  name: "المدارس الرسمية اللبنانية",    region: "كل لبنان",   type: "حكومية",  system: "رسمي لبناني", levels: ["ابتدائي","متوسط","ثانوي"],  lang: "عربي/فرنسي", desc: "شبكة المدارس الحكومية المجانية المنتشرة في كل المناطق." },
];

const REGIONS = ["الكل","بيروت","جبل لبنان","الشمال","الجنوب","البقاع","كل لبنان","بيروت وبيبلوس","بيروت وفروع"];
const TYPES_UNI = ["الكل","خاصة","حكومية"];
const TABS = [
  { id: "universities", label: "الجامعات", emoji: "🏛️", count: UNIVERSITIES.length },
  { id: "institutes",   label: "المعاهد",  emoji: "🔬", count: INSTITUTES.length   },
  { id: "schools",      label: "المدارس",  emoji: "🏫", count: SCHOOLS.length      },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function EducationPage() {
  const [tab, setTab]           = useState<"universities"|"institutes"|"schools">("universities");
  const [search, setSearch]     = useState("");
  const [regionFilter, setRegionFilter] = useState("الكل");
  const [typeFilter, setTypeFilter]     = useState("الكل");
  const [expanded, setExpanded] = useState<number | null>(null);

  // ── Filtered lists ──────────────────────────────────────────────────────────
  const filteredUnis = UNIVERSITIES.filter(u => {
    const s = search.toLowerCase();
    return (
      (u.name.includes(search) || u.short.toLowerCase().includes(s)) &&
      (regionFilter === "الكل" || u.region === regionFilter) &&
      (typeFilter   === "الكل" || u.type   === typeFilter)
    );
  });

  const filteredInstitutes = INSTITUTES.filter(i =>
    i.name.includes(search) && (regionFilter === "الكل" || i.region === regionFilter)
  );

  const filteredSchools = SCHOOLS.filter(s =>
    s.name.includes(search) && (regionFilter === "الكل" || s.region === regionFilter)
  );

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">مسارك</span>
          </Link>
          <Link href="/dashboard" className="text-text-sub text-sm hover:text-primary">← الداشبورد</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-[#1e4080] rounded-2xl p-6 md:p-8 mb-6 text-white">
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">🎓 دليل المؤسسات التعليمية في لبنان</h1>
          <p className="text-white/80 mb-4">جامعات، معاهد، ومدارس — كل ما تحتاجه في مكان واحد</p>
          <div className="flex flex-wrap gap-4">
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-extrabold text-accent">{UNIVERSITIES.length}</div>
              <div className="text-white/80 text-xs">جامعة</div>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-extrabold text-accent">{INSTITUTES.length}</div>
              <div className="text-white/80 text-xs">معهد</div>
            </div>
            <div className="bg-white/15 rounded-xl px-4 py-2 text-center">
              <div className="text-2xl font-extrabold text-accent">{SCHOOLS.length}+</div>
              <div className="text-white/80 text-xs">مدرسة</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-5 overflow-x-auto">
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id as typeof tab); setSearch(""); setRegionFilter("الكل"); }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all border-2 ${
                tab === t.id
                  ? "bg-primary text-white border-primary shadow-md"
                  : "bg-white text-text-sub border-gray-200 hover:border-primary hover:text-primary"
              }`}>
              <span>{t.emoji}</span>
              <span>{t.label}</span>
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${tab === t.id ? "bg-white/20 text-white" : "bg-gray-100 text-text-sub"}`}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {/* Filters */}
        <div className="card mb-5">
          <div className="flex flex-col md:flex-row gap-3">
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              placeholder={`🔍 ابحث في ${tab === "universities" ? "الجامعات" : tab === "institutes" ? "المعاهد" : "المدارس"}...`} />
            <select value={regionFilter} onChange={e => setRegionFilter(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary bg-white">
              {REGIONS.map(r => <option key={r}>{r}</option>)}
            </select>
            {tab === "universities" && (
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary bg-white">
                {TYPES_UNI.map(t => <option key={t}>{t}</option>)}
              </select>
            )}
          </div>
        </div>

        {/* ── UNIVERSITIES ────────────────────────────────────────────── */}
        {tab === "universities" && (
          <>
            <p className="text-sm text-text-sub mb-4">
              يعرض <strong className="text-primary">{filteredUnis.length}</strong> جامعة
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUnis.map(u => (
                <div key={u.id}
                  className="card hover:shadow-lg transition-all hover:-translate-y-0.5 cursor-pointer"
                  onClick={() => setExpanded(expanded === u.id ? null : u.id)}>

                  {/* Header strip */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-accent font-extrabold text-sm">{u.short}</span>
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-primary text-sm leading-snug line-clamp-2">{u.name}</h3>
                      <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                        <span className={`badge text-xs ${u.type === "حكومية" ? "bg-green-100 text-green-700" : "bg-blue-50 text-blue-700"}`}>{u.type}</span>
                        <span className="text-text-sub text-xs">📍 {u.region}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-text-sub text-xs leading-relaxed mb-3 line-clamp-2">{u.desc}</p>

                  {/* Quick stats */}
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="font-bold text-primary text-xs">{u.tuition}</div>
                      <div className="text-text-sub text-xs">الرسوم/سنة</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="font-bold text-primary text-xs">{u.lang}</div>
                      <div className="text-text-sub text-xs">لغة الدراسة</div>
                    </div>
                  </div>

                  {/* Fields */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {u.fields.slice(0, 3).map(f => (
                      <span key={f} className="badge bg-light text-primary text-xs">{f}</span>
                    ))}
                    {u.fields.length > 3 && (
                      <span className="badge bg-gray-100 text-text-sub text-xs">+{u.fields.length - 3}</span>
                    )}
                  </div>

                  {/* Expanded */}
                  {expanded === u.id && (
                    <div className="pt-3 border-t border-gray-100 mt-1">
                      <div className="text-xs text-text-sub space-y-1 mb-3">
                        <div className="font-semibold text-primary mb-1">كل التخصصات:</div>
                        {u.fields.map(f => <div key={f} className="flex items-center gap-1">✓ {f}</div>)}
                      </div>
                      {u.scholarships && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-xs text-green-700 mb-3">
                          🏆 منح دراسية متاحة — <Link href="/scholarships" className="font-bold underline" onClick={e => e.stopPropagation()}>اعرف أكثر</Link>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 mt-auto pt-2">
                    <a href={u.site} target="_blank" rel="noopener noreferrer"
                      className="flex-1 btn-primary py-2 rounded-xl text-xs text-center"
                      onClick={e => e.stopPropagation()}>
                      الموقع الرسمي ↗
                    </a>
                    <button
                      className="border-2 border-gray-200 text-text-sub text-xs px-3 py-2 rounded-xl hover:border-primary hover:text-primary transition-colors">
                      {expanded === u.id ? "أقل ↑" : "تفاصيل ↓"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── INSTITUTES ──────────────────────────────────────────────── */}
        {tab === "institutes" && (
          <>
            <p className="text-sm text-text-sub mb-4">
              يعرض <strong className="text-primary">{filteredInstitutes.length}</strong> معهد
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredInstitutes.map(i => (
                <div key={i.id} className="card hover:shadow-md transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-[#0E7C7B] rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-extrabold text-xs text-center leading-none px-1">{i.short}</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-primary text-sm leading-snug">{i.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="badge bg-teal-50 text-teal-700 text-xs">{i.type}</span>
                        <span className="text-text-sub text-xs">📍 {i.region}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-text-sub text-sm leading-relaxed mb-3">{i.desc}</p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="font-bold text-primary text-xs">{i.tuition}</div>
                      <div className="text-text-sub text-xs">الرسوم</div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2 text-center">
                      <div className="font-bold text-primary text-xs">{i.fields.length} تخصصات</div>
                      <div className="text-text-sub text-xs">متاحة</div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {i.fields.map(f => (
                      <span key={f} className="badge bg-teal-50 text-teal-700 text-xs">{f}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ── SCHOOLS ─────────────────────────────────────────────────── */}
        {tab === "schools" && (
          <>
            <p className="text-sm text-text-sub mb-4">
              يعرض <strong className="text-primary">{filteredSchools.length}</strong> مدرسة
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {filteredSchools.map(s => (
                <div key={s.id} className="card hover:shadow-md transition-all">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="text-4xl">🏫</div>
                    <div>
                      <h3 className="font-bold text-primary text-sm leading-snug">{s.name}</h3>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        <span className={`badge text-xs ${s.type === "حكومية" ? "bg-green-100 text-green-700" : "bg-purple-50 text-purple-700"}`}>{s.type}</span>
                        <span className="badge bg-amber-50 text-amber-700 text-xs">{s.system}</span>
                        <span className="text-text-sub text-xs">📍 {s.region}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-text-sub text-sm leading-relaxed mb-3">{s.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    <div className="flex items-center gap-1 text-xs text-text-sub">
                      <span>🌐</span> {s.lang}
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {s.levels.map(l => (
                        <span key={l} className="badge bg-gray-100 text-text-sub text-xs">{l}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Note */}
            <div className="card mt-6 bg-amber-50 border-2 border-amber-200">
              <p className="text-amber-800 text-sm">
                <strong>ملاحظة:</strong> هذا الدليل يعرض نماذج من المدارس اللبنانية. نحن نعمل على إضافة كل المدارس تدريجياً.
                إذا كنت تريد إضافة مدرستك، تواصل معنا على <strong>hello@masaraklb.com</strong>
              </p>
            </div>
          </>
        )}

        {/* Bottom CTA */}
        <div className="card mt-8 bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/10 text-center py-8">
          <h3 className="font-bold text-primary text-xl mb-2">مش عارف من أين تبدأ؟</h3>
          <p className="text-text-sub mb-5">اعمل اختبار Career DNA واكتشف التخصص المناسب قبل ما تختار مؤسستك</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/career-dna" className="btn-primary px-6 py-3 rounded-xl">
              🧬 ابدأ Career DNA
            </Link>
            <Link href="/scholarships" className="border-2 border-primary text-primary font-bold px-6 py-3 rounded-xl hover:bg-light transition-colors">
              🏆 ابحث عن منح
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
