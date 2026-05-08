"use client";
import { useState } from "react";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────────
type VocationalTrack = {
  id: string;
  photo?: string;
  code: string;
  name: string;
  duration: string;
  level: "LT" | "BT" | "TS" | "licence";
  sector: string;
  desc: string;
  subjects: string[];
  salaryLB: string;
  salaryGulf: string;
  demand: "عالٍ جداً" | "عالٍ" | "متوسط" | "منخفض";
  uniEquiv?: string;
  emoji: string;
};

type Institute = {
  id: number;
  name: string;
  region: string;
  type: "رسمي" | "خاص" | "مهني";
  specialties: string[];
  website?: string;
  emoji: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const TRACKS: VocationalTrack[] = [
  // ── الكهرباء والإلكترونيات ────────────────────────────────────────────────
  { id:"lt-elec", photo:"https://picsum.photos/seed/electrical-tech/800/450",  code:"LT",  name:"لافته كهرباء عامة",          duration:"3 سنوات (بعد ص9)", level:"LT",     sector:"كهرباء",           desc:"تأهيل في تمديدات كهربائية، تركيب وصيانة الأجهزة المنزلية والصناعية.",                               subjects:["كهرباء تطبيقية","دوائر كهربائية","أتمتة أساسية","سلامة كهربائية"],          salaryLB:"800–1200$",  salaryGulf:"1500–3000$",  demand:"عالٍ جداً",  uniEquiv:"قبول مشروط في بعض برامج LAU/UL", emoji:"⚡" },
  { id:"bt-elec", photo:"https://picsum.photos/seed/electrical-bac/800/450",  code:"BT",  name:"بكالوريا تقنية — كهرباء",    duration:"2 سنوات (بعد ص9)", level:"BT",     sector:"كهرباء",           desc:"تعمّق في الدوائر الكهربائية والتحكم والصيانة الصناعية.",                                             subjects:["إلكترونيات تطبيقية","أتمتة صناعية","برمجة PLC","قياسات"],                    salaryLB:"1000–1800$", salaryGulf:"2000–4000$",  demand:"عالٍ جداً",  uniEquiv:"قبول في برامج هندسة UL وLAU", emoji:"🔌" },
  { id:"ts-elec", photo:"https://picsum.photos/seed/electronics-ts/800/450",  code:"TS",  name:"تقني سامٍ — إلكترونيات",      duration:"2 سنوات (بعد BT)",level:"TS",     sector:"كهرباء",           desc:"الدرجة التقنية العليا في مجال الإلكترونيات والبرمجيات المضمّنة.",                                      subjects:["ميكروكونترولر","برمجة C++","أنظمة تضمين","اتصالات"],                         salaryLB:"1500–2500$", salaryGulf:"3000–6000$",  demand:"عالٍ جداً",  uniEquiv:"معادلة سنة جامعية أولى", emoji:"💻" },
  // ── ميكانيك ──────────────────────────────────────────────────────────────
  { id:"lt-mec", photo:"https://picsum.photos/seed/mechanic-cars/800/450",   code:"LT",  name:"لافته ميكانيك السيارات",      duration:"3 سنوات",          level:"LT",     sector:"ميكانيك",          desc:"صيانة وإصلاح السيارات، قراءة رسومات هندسية، تشخيص الأعطال.",                                          subjects:["محركات احتراق","ناقل الحركة","فرامل","تشخيص إلكتروني"],                      salaryLB:"700–1200$",  salaryGulf:"1500–2800$",  demand:"عالٍ",       uniEquiv:undefined, emoji:"🔧" },
  { id:"bt-mec", photo:"https://picsum.photos/seed/industrial-mec/800/450",   code:"BT",  name:"بكالوريا تقنية — ميكانيك صناعي",duration:"2 سنوات",       level:"BT",     sector:"ميكانيك",          desc:"تقنيات التصنيع الصناعي، مخاريط CNC، الضخ والهيدروليك.",                                               subjects:["CNC","هيدروليك","ميكانيك طاقة","رسم تقني"],                                  salaryLB:"1000–1800$", salaryGulf:"2000–3500$",  demand:"عالٍ",       uniEquiv:"معادلة UL كلية هندسة", emoji:"⚙️" },
  // ── بناء وتشييد ──────────────────────────────────────────────────────────
  { id:"bt-civil", photo:"https://picsum.photos/seed/civil-construction/800/450", code:"BT",  name:"بكالوريا تقنية — بناء",        duration:"2 سنوات",         level:"BT",     sector:"بناء وعمارة",      desc:"تقنيات البناء والخرسانة، الأعمال المدنية، إشراف ميداني.",                                               subjects:["ميكانيك بناء","خرسانة مسلحة","مساحة","رسم هندسي"],                          salaryLB:"900–1600$",  salaryGulf:"2000–4000$",  demand:"عالٍ",       uniEquiv:"قبول جزئي UL هندسة مدنية", emoji:"🏗️" },
  { id:"ts-civil", photo:"https://picsum.photos/seed/civil-engineering/800/450", code:"TS",  name:"تقني سامٍ — هندسة مدنية",      duration:"2 سنوات (بعد BT)",level:"TS",     sector:"بناء وعمارة",      desc:"الإشراف الكامل على المشاريع الإنشائية، إدارة الموقع والتصميم.",                                         subjects:["تصميم هيكلي","إدارة مشاريع","AutoCAD","تشييد متقدم"],                        salaryLB:"1500–2500$", salaryGulf:"3000–5500$",  demand:"عالٍ جداً",  uniEquiv:"معادلة سنة أولى NDU/UOB", emoji:"🏛️" },
  // ── تكنولوجيا المعلومات ───────────────────────────────────────────────────
  { id:"bt-it", photo:"https://picsum.photos/seed/computer-tech/800/450",    code:"BT",  name:"بكالوريا تقنية — معلوماتية",   duration:"2 سنوات",         level:"BT",     sector:"تكنولوجيا المعلومات",desc:"برمجة، تطوير مواقع، شبكات كمبيوتر، قواعد بيانات.",                                                  subjects:["Python","Java","شبكات","SQL","HTML/CSS"],                                    salaryLB:"1000–2000$", salaryGulf:"2500–5000$",  demand:"عالٍ جداً",  uniEquiv:"قبول LAU/LIU علوم حاسوب", emoji:"💻" },
  { id:"ts-it", photo:"https://picsum.photos/seed/software-ts/800/450",    code:"TS",  name:"تقني سامٍ — علوم الحاسوب",     duration:"2 سنوات (بعد BT)",level:"TS",     sector:"تكنولوجيا المعلومات",desc:"تطوير برمجيات متقدمة، أمن المعلومات، ذكاء اصطناعي.",                                                 subjects:["Web Dev","Cybersecurity","AI أساسيات","DevOps","Cloud"],                     salaryLB:"1500–3000$", salaryGulf:"3500–7000$",  demand:"عالٍ جداً",  uniEquiv:"معادلة سنتين AUB/LAU", emoji:"🖥️" },
  // ── تمريض وصحة ───────────────────────────────────────────────────────────
  { id:"bt-nurs", photo:"https://picsum.photos/seed/nursing-care/800/450",  code:"BT",  name:"بكالوريا تقنية — مساعد تمريض", duration:"2 سنوات",        level:"BT",     sector:"صحة وطب",          desc:"رعاية المرضى، تطبيق الحقن والعلاجات، دعم الفرق الطبية.",                                               subjects:["تشريح","تمريض طبي","رعاية مرضى","أخلاقيات طبية"],                           salaryLB:"600–1200$",  salaryGulf:"1500–3000$",  demand:"عالٍ جداً",  uniEquiv:"قبول مشروط كليات تمريض", emoji:"🏥" },
  { id:"ts-nurs", photo:"https://picsum.photos/seed/nursing-ts/800/450",  code:"TS",  name:"تقني سامٍ — تمريض",            duration:"3 سنوات",         level:"TS",     sector:"صحة وطب",          desc:"ممرض مؤهل يعمل في المشافي والعيادات، تخطيط رعاية صحية.",                                               subjects:["تمريض طبي-جراحي","أطفال","توليد","طوارئ","إدارة"],                          salaryLB:"1200–2000$", salaryGulf:"2500–5000$",  demand:"عالٍ جداً",  uniEquiv:"معادلة AUB/LAU تمريض", emoji:"💉" },
  // ── فندقة وسياحة ──────────────────────────────────────────────────────────
  { id:"bt-hotel", photo:"https://picsum.photos/seed/hotel-hospitality/800/450", code:"BT",  name:"بكالوريا تقنية — فندقة",       duration:"2 سنوات",         level:"BT",     sector:"فندقة وسياحة",     desc:"إدارة الفنادق، الطهي الاحترافي، خدمة الضيوف.",                                                         subjects:["إدارة فندقية","طهي فرنسي","خدمة عملاء","محاسبة فندقية"],                    salaryLB:"700–1500$",  salaryGulf:"1500–3500$",  demand:"متوسط",      uniEquiv:"قبول كليات فندقة", emoji:"🏨" },
  // ── محاسبة وأعمال ─────────────────────────────────────────────────────────
  { id:"ts-biz", photo:"https://picsum.photos/seed/business-accounting/800/450",   code:"TS",  name:"تقني سامٍ — محاسبة وإدارة",    duration:"2 سنوات (بعد BT)",level:"TS",     sector:"أعمال ومال",       desc:"محاسبة متقدمة، إدارة مالية، مراجعة حسابات.",                                                           subjects:["محاسبة مالية","ضرائب","Excel/ERP","إدارة مشاريع"],                           salaryLB:"1000–2000$", salaryGulf:"2000–4500$",  demand:"عالٍ",       uniEquiv:"معادلة سنة ESA/AUB أعمال", emoji:"📊" },
  // ── تصميم وفنون ───────────────────────────────────────────────────────────
  { id:"ts-design", photo:"https://picsum.photos/seed/graphic-design/800/450",code:"TS",  name:"تقني سامٍ — تصميم غرافيكي",    duration:"2 سنوات",         level:"TS",     sector:"إعلام وتصميم",     desc:"تصميم الجرافيك، هوية بصرية، تصوير، ونشر رقمي.",                                                        subjects:["Photoshop","Illustrator","InDesign","Branding","Motion"],                    salaryLB:"800–1800$",  salaryGulf:"1500–3500$",  demand:"متوسط",      uniEquiv:"قبول ALBA/USEK فنون", emoji:"🎨" },
];

const INSTITUTES: Institute[] = [
  { id:1, name:"المعهد التقني العالي — منطقة الشيّاح",  region:"بيروت",     type:"رسمي",  specialties:["كهرباء","إلكترونيات","ميكانيك"], emoji:"🏭" },
  { id:2, name:"المعهد التقني — طرابلس",                 region:"الشمال",    type:"رسمي",  specialties:["CNC","هيدروليك","بناء"],          emoji:"🏗️" },
  { id:3, name:"معهد الفنون والمهن — صيدا",              region:"الجنوب",    type:"رسمي",  specialties:["نجارة","حدادة","فندقة"],           emoji:"🔨" },
  { id:4, name:"مدرسة سان جوزيف المهنية — الكسليك",     region:"جبل لبنان", type:"خاص",   specialties:["إلكترونيات","برمجة","شبكات"],     emoji:"💻" },
  { id:5, name:"معهد AUST التكنولوجي",                   region:"بيروت",     type:"خاص",   specialties:["تكنولوجيا معلومات","شبكات","أمن"], emoji:"🖥️" },
  { id:6, name:"المعهد التقني — زحلة",                    region:"البقاع",    type:"رسمي",  specialties:["كهرباء","بناء","تبريد"],           emoji:"❄️" },
  { id:7, name:"معهد INCI للتمريض",                      region:"بيروت",     type:"خاص",   specialties:["تمريض","صحة","مختبرات"],           emoji:"🏥" },
  { id:8, name:"المعهد اللبناني للفندقة (LTI)",          region:"بيروت",     type:"خاص",   specialties:["فندقة","طهي","سياحة"],             emoji:"🍽️" },
  { id:9, name:"معهد الفنون التطبيقية — الحمرا",         region:"بيروت",     type:"خاص",   specialties:["تصميم غرافيكي","تصوير","فنون"],    emoji:"🎨" },
  { id:10,name:"المعهد التقني — النبطية",                 region:"الجنوب",    type:"رسمي",  specialties:["كهرباء","ميكانيك","حاسوب"],        emoji:"⚙️" },
];

const DEMAND_COLORS = {
  "عالٍ جداً": "bg-green-100 text-green-700 border-green-300",
  "عالٍ":      "bg-blue-100 text-blue-700 border-blue-300",
  "متوسط":     "bg-yellow-100 text-yellow-700 border-yellow-300",
  "منخفض":     "bg-gray-100 text-gray-600 border-gray-300",
};

const LEVEL_COLORS = {
  "LT":      "bg-orange-100 text-orange-700",
  "BT":      "bg-blue-100 text-blue-700",
  "TS":      "bg-purple-100 text-purple-700",
  "licence": "bg-green-100 text-green-700",
};

export default function VocationalPage() {
  const [activeTab, setActiveTab] = useState<"tracks" | "institutes" | "guide">("tracks");
  const [filterLevel, setFilterLevel] = useState("الكل");
  const [filterSector, setFilterSector] = useState("الكل");
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null);

  const sectors = ["الكل", "كهرباء", "ميكانيك", "بناء وعمارة", "تكنولوجيا المعلومات", "صحة وطب", "فندقة وسياحة", "أعمال ومال", "إعلام وتصميم"];
  const levels = ["الكل", "LT", "BT", "TS"];

  const filteredTracks = TRACKS.filter(t => {
    const matchLevel = filterLevel === "الكل" || t.level === filterLevel;
    const matchSector = filterSector === "الكل" || t.sector === filterSector;
    return matchLevel && matchSector;
  });

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
            <Link href="/universities" className="hover:text-blue-600">الجامعات</Link>
            <Link href="/schools" className="hover:text-blue-600">المدارس</Link>
            <Link href="/vocational" className="text-blue-600 font-bold">التعليم التقني</Link>
            <Link href="/scholarships" className="hover:text-blue-600">المنح</Link>
          </nav>
          <Link href="/dashboard" className="bg-blue-600 text-white rounded-xl font-bold text-sm px-4 py-2">داشبورد</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-bold mb-4">
                🔧 التعليم التقني والمهني — TVET
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">مسار التعليم التقني في لبنان</h1>
              <p className="text-orange-100 text-lg max-w-xl">
                LT → BT → TS — مسارات واضحة، شهادات معترف بها، ومستقبل واعد في لبنان والخليج
              </p>
            </div>
            <div className="text-6xl opacity-80">⚙️</div>
          </div>

          {/* System overview */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            {[
              { code:"LT", label:"Licence Technique", duration:"3 سنوات", years:"بعد الصف 9", color:"bg-white/15" },
              { code:"BT", label:"Bac Technique",     duration:"2 سنوات", years:"بعد الصف 9 أو LT", color:"bg-white/20" },
              { code:"TS", label:"Technicien Supérieur",duration:"2 سنوات", years:"بعد BT أو BAC", color:"bg-white/25" },
            ].map(s => (
              <div key={s.code} className={`${s.color} rounded-2xl p-4 text-center`}>
                <div className="text-2xl font-extrabold">{s.code}</div>
                <div className="text-xs text-orange-100 mt-1">{s.label}</div>
                <div className="text-sm font-bold mt-2">{s.duration}</div>
                <div className="text-[11px] text-orange-200">{s.years}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6">
          {([
            ["tracks",     "🎓 المسارات والشهادات"],
            ["institutes", "🏭 المعاهد والمدارس"],
            ["guide",      "📖 دليل النظام"],
          ] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-colors ${activeTab === tab ? "bg-orange-500 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Tab: Tracks ── */}
        {activeTab === "tracks" && (
          <div>
            {/* Filters */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
              <div className="flex flex-wrap gap-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1.5">📊 المستوى</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {levels.map(l => (
                      <button key={l} onClick={() => setFilterLevel(l)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filterLevel === l ? "bg-orange-500 text-white border-orange-500" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-orange-300"}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 mb-1.5">🏭 القطاع</p>
                  <div className="flex gap-1.5 flex-wrap">
                    {sectors.map(s => (
                      <button key={s} onClick={() => setFilterSector(s)}
                        className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filterSector === s ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-600 border-gray-200 hover:border-blue-300"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredTracks.map(t => {
                const isExpanded = expandedTrack === t.id;
                return (
                  <div key={t.id}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                    {/* Track Photo Banner */}
                    {t.photo && (
                      <div className="relative h-28 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={t.photo} alt={t.name}
                          className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                        <div className="absolute bottom-2 right-3 text-2xl">{t.emoji}</div>
                        <span className={`absolute top-2 right-2 text-xs font-extrabold px-2 py-0.5 rounded-full ${LEVEL_COLORS[t.level]}`}>{t.code}</span>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        {!t.photo && <div className="text-3xl">{t.emoji}</div>}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            {!t.photo && <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${LEVEL_COLORS[t.level]}`}>{t.code}</span>}
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{t.sector}</span>
                          </div>
                          <h3 className="font-extrabold text-gray-800 leading-tight">{t.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">⏱️ {t.duration}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${DEMAND_COLORS[t.demand]}`}>
                          {t.demand}
                        </span>
                      </div>

                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">{t.desc}</p>

                      <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                        <div className="bg-green-50 rounded-xl p-3">
                          <span className="text-gray-400 block mb-1">🇱🇧 راتب لبنان</span>
                          <span className="font-extrabold text-green-700">{t.salaryLB}</span>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-3">
                          <span className="text-gray-400 block mb-1">🌍 راتب الخليج</span>
                          <span className="font-extrabold text-amber-700">{t.salaryGulf}</span>
                        </div>
                      </div>

                      {t.uniEquiv && (
                        <div className="bg-blue-50 rounded-xl p-3 text-xs mb-3">
                          <span className="text-blue-500 font-bold">🎓 معادلة جامعية: </span>
                          <span className="text-blue-700">{t.uniEquiv}</span>
                        </div>
                      )}

                      <button onClick={() => setExpandedTrack(isExpanded ? null : t.id)}
                        className="text-xs font-bold text-orange-600 hover:underline">
                        {isExpanded ? "▲ إخفاء المواد" : "▼ عرض المواد الدراسية"}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs font-bold text-gray-600 mb-2">📚 المواد الرئيسية:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {t.subjects.map(s => (
                              <span key={s} className="bg-orange-50 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-200">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTracks.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-500">لم يتم العثور على مسارات</p>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Institutes ── */}
        {activeTab === "institutes" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {INSTITUTES.map(inst => (
              <div key={inst.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="text-3xl">{inst.emoji}</div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        inst.type === "رسمي" ? "bg-green-100 text-green-700" :
                        inst.type === "خاص"  ? "bg-blue-100 text-blue-700" :
                        "bg-orange-100 text-orange-700"
                      }`}>{inst.type}</span>
                      <span className="text-xs text-gray-500">📍 {inst.region}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 text-sm leading-tight">{inst.name}</h3>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {inst.specialties.map(s => (
                    <span key={s} className="bg-orange-50 text-orange-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-orange-200">{s}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tab: Guide ── */}
        {activeTab === "guide" && (
          <div className="space-y-6">
            {/* System Diagram */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h2 className="text-xl font-extrabold text-gray-800 mb-6">🗺️ خارطة النظام التعليمي التقني</h2>
              <div className="overflow-x-auto">
                <div className="flex items-start gap-4 min-w-[600px] pb-4">
                  {[
                    { step:"الصف 9", label:"شهادة التعليم المتوسط (BEM)", color:"bg-gray-100 text-gray-700", arrow:true },
                    { step:"LT",     label:"3 سنوات — تقني أساسي", color:"bg-orange-100 text-orange-700", arrow:true },
                    { step:"BT",     label:"2 سنوات — بكالوريا تقنية", color:"bg-blue-100 text-blue-700", arrow:true },
                    { step:"TS",     label:"2 سنوات — تقني سامٍ", color:"bg-purple-100 text-purple-700", arrow:true },
                    { step:"جامعة", label:"معادلة أو قبول مشروط", color:"bg-green-100 text-green-700", arrow:false },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className={`rounded-2xl p-4 text-center min-w-[120px] ${s.color}`}>
                        <div className="font-extrabold text-lg">{s.step}</div>
                        <div className="text-xs mt-1 leading-tight">{s.label}</div>
                      </div>
                      {s.arrow && <div className="text-gray-400 text-2xl font-light">←</div>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* FAQ */}
            {[
              { q:"ما الفرق بين LT وBT وTS؟", a:"LT (Licence Technique) هو شهادة تقنية أساسية مدتها 3 سنوات بعد الصف التاسع. BT (Baccalauréat Technique) شهادة أعلى تفتح باب الجامعة. TS (Technicien Supérieur) هو الأعلى في السلم التقني ومعادل لسنتين جامعيتين في بعض التخصصات." },
              { q:"هل تقبل الجامعات اللبنانية شهادات BT وTS؟", a:"نعم، الجامعة اللبنانية تقبل BT في تخصصات مقابلة. LAU وNDU وAUB قد تقبل TS مع امتحانات إضافية. بعض الجامعات لديها برامج موجهة لحاملي TS مع تسريع في التخرج." },
              { q:"ما آفاق العمل في دول الخليج؟", a:"الإمارات والسعودية وقطر يطلبون بشدة التقنيين في الكهرباء والإلكترونيات والبناء والتمريض وتكنولوجيا المعلومات. الرواتب تبدأ من 1500$ وقد تصل إلى 6000$ للمتخصصين." },
              { q:"كيف أحصل على معادلة شهادتي في لبنان؟", a:"يمكن تقديم طلب معادلة لدى وزارة التربية والتعليم العالي. المعادلة تحدد ما إذا كانت شهادتك تعادل جزءاً من الدراسة الجامعية. المعادلات تختلف حسب الجامعة والتخصص." },
              { q:"هل هناك منح للتعليم التقني؟", a:"نعم، عدة جهات تمنح منحاً للطلاب التقنيين: وزارة التربية، USAID، مؤسسات أهلية، وبعض الجامعات الخاصة. ابحث في صفحة المنح على مسارك." },
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-3 flex items-start gap-2">
                  <span className="text-orange-500 font-extrabold">Q</span>
                  {faq.q}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed pr-5">{faq.a}</p>
              </div>
            ))}

            {/* Gulf Demand */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-extrabold mb-4">🌍 أكثر التخصصات طلباً في الخليج 2026</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { emoji:"⚡", spec:"كهرباء وإلكترونيات", demand:"↑↑↑" },
                  { emoji:"💻", spec:"تكنولوجيا المعلومات", demand:"↑↑↑" },
                  { emoji:"🏗️", spec:"هندسة مدنية/بناء",    demand:"↑↑" },
                  { emoji:"💉", spec:"تمريض وصحة",           demand:"↑↑↑" },
                  { emoji:"⚙️", spec:"ميكانيك صناعي",        demand:"↑↑" },
                  { emoji:"🔒", spec:"أمن معلومات",           demand:"↑↑↑" },
                  { emoji:"📊", spec:"محاسبة ومالية",         demand:"↑↑" },
                  { emoji:"🍽️", spec:"فندقة وطهي",            demand:"↑" },
                ].map(d => (
                  <div key={d.spec} className="bg-white/20 rounded-xl p-3 text-center">
                    <div className="text-2xl mb-1">{d.emoji}</div>
                    <div className="text-xs font-bold leading-tight">{d.spec}</div>
                    <div className="text-amber-200 font-extrabold mt-1">{d.demand}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-extrabold mb-3">🎯 لا تعرف ما يناسبك؟</h2>
          <p className="text-orange-100 mb-6">اكتشف مسارك المثالي — أكاديمي أم تقني — من خلال اختبار Career DNA</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/tools/career-dna"
              className="bg-white text-orange-600 font-bold px-6 py-3 rounded-xl hover:bg-orange-50 transition-colors">
              🧬 ابدأ Career DNA Test
            </Link>
            <Link href="/universities"
              className="bg-white/20 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors border border-white/30">
              🏛️ مسار جامعي بدلاً من ذلك؟
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
