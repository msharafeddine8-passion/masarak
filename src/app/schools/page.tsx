"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────────
type School = {
  id: number;
  name: string;
  region: string;
  area: string;
  type: "خاصة" | "رسمية" | "دولية" | "مهنية";
  curriculum: string[];
  lang: string;
  feesMin: number;
  feesMax: number;
  grades: string;
  founded: number;
  students: number;
  rating: number;
  features: string[];
  desc: string;
  phone?: string;
  website?: string;
  emoji: string;
  color: string;
};

// ─── Schools Data ──────────────────────────────────────────────────────────────
const SCHOOLS: School[] = [
  // ─── بيروت ────────────────────────────────────────────────────────────────
  { id:1,  name:"مدرسة الإيفانجليكال الوطنية",          region:"بيروت", area:"المزرعة",     type:"خاصة",    curriculum:["لبناني","SAT"],         lang:"عربي/إنجليزي", feesMin:3000, feesMax:6000,  grades:"KG-12", founded:1888, students:1200, rating:5, features:["نشاطات رياضية","فنون","تكنولوجيا"],         desc:"من أعرق المدارس الإنجيلية في بيروت.",          emoji:"⛪", color:"from-blue-600 to-blue-800" },
  { id:2,  name:"مدارس المقاصد الإسلامية",               region:"بيروت", area:"طريق الجديدة", type:"خاصة",    curriculum:["لبناني"],               lang:"عربي/إنجليزي", feesMin:1000, feesMax:3000,  grades:"KG-12", founded:1878, students:8000, rating:4, features:["منح دراسية","نشاطات ثقافية","تربية إسلامية"], desc:"أكبر شبكة مدارس إسلامية في لبنان.",            emoji:"🕌", color:"from-green-600 to-green-800" },
  { id:3,  name:"ثانوية الجمهور الرسمية",                region:"بيروت", area:"الجمهور",      type:"رسمية",   curriculum:["لبناني"],               lang:"عربي/فرنسي",   feesMin:0,    feesMax:0,     grades:"7-12",  founded:1960, students:2000, rating:3, features:["تعليم مجاني","منهج رسمي"],                 desc:"من المدارس الرسمية الكبرى في بيروت.",          emoji:"🏫", color:"from-red-600 to-red-800" },
  { id:4,  name:"كوليج مار يوسف — الآباء اليسوعيون",    region:"بيروت", area:"الأشرفية",     type:"خاصة",    curriculum:["لبناني","French Bac"],  lang:"فرنسي/عربي",   feesMin:4000, feesMax:8000,  grades:"KG-12", founded:1875, students:2500, rating:5, features:["Bac français","فنون","علوم","نشاطات"],     desc:"من أرقى المدارس الكاثوليكية الفرنسية.",         emoji:"⚜️", color:"from-indigo-600 to-indigo-800" },
  { id:5,  name:"مدرسة رفيق الحريري الثانوية",           region:"بيروت", area:"الطريق الجديدة",type:"خاصة",   curriculum:["لبناني"],               lang:"عربي/إنجليزي", feesMin:500,  feesMax:2000,  grades:"7-12",  founded:1999, students:3000, rating:4, features:["منح","رياضيات متقدمة","برمجة"],            desc:"مدرسة تدعمها مؤسسة الحريري.",                  emoji:"🌟", color:"from-blue-500 to-blue-700" },
  { id:6,  name:"Collège Protestant Français",           region:"بيروت", area:"صنوبر",       type:"خاصة",    curriculum:["French Bac","لبناني"],  lang:"فرنسي",        feesMin:5000, feesMax:9000,  grades:"KG-12", founded:1906, students:1800, rating:5, features:["French Bac","نشاطات ثقافية فرنسية"],       desc:"مدرسة بروتستانتية فرنسية عريقة في بيروت.",     emoji:"🇫🇷", color:"from-blue-700 to-indigo-700" },
  { id:7,  name:"International College (IC)",            region:"بيروت", area:"الحمرا",      type:"دولية",   curriculum:["IB","AP","SAT"],        lang:"إنجليزي",      feesMin:8000, feesMax:14000, grades:"KG-12", founded:1891, students:2200, rating:5, features:["IB Diploma","AP Courses","Model UN","رياضة"], desc:"من أفضل المدارس الدولية في لبنان، خريجوها في أفضل جامعات العالم.", emoji:"🌍", color:"from-teal-600 to-teal-800" },
  { id:8,  name:"American Community School (ACS)",        region:"بيروت", area:"الحمرا",      type:"دولية",   curriculum:["American","AP","SAT"],  lang:"إنجليزي",      feesMin:10000,feesMax:18000, grades:"K-12",  founded:1905, students:1400, rating:5, features:["AP","SAT prep","عروض مسرحية","فنون"],      desc:"المدرسة الأمريكية الأعرق في الشرق الأوسط.",    emoji:"🇺🇸", color:"from-red-600 to-blue-700" },
  { id:9,  name:"Lycée Français de Beyrouth",            region:"بيروت", area:"الصنائع",     type:"دولية",   curriculum:["French Bac"],           lang:"فرنسي",        feesMin:6000, feesMax:11000, grades:"MS-Terminale",founded:1909,students:2000,rating:5, features:["Baccalauréat français","تبادل ثقافي"],    desc:"المدرسة الفرنسية الرسمية في لبنان.",           emoji:"🗼", color:"from-blue-600 to-red-600" },
  // ─── جبل لبنان ────────────────────────────────────────────────────────────
  { id:10, name:"Notre Dame de Jamhour",                  region:"جبل لبنان",area:"الجمهور",  type:"خاصة",    curriculum:["لبناني","French Bac"],  lang:"فرنسي/عربي",   feesMin:5000, feesMax:9000,  grades:"KG-12", founded:1939, students:2800, rating:5, features:["French Bac","مسرح","موسيقى","رياضة"],     desc:"من أرقى المدارس اليسوعية خارج بيروت.",         emoji:"⛰️", color:"from-purple-600 to-purple-800" },
  { id:11, name:"مدارس اللويزة - المقدسيات",             region:"جبل لبنان",area:"لويزة",     type:"خاصة",    curriculum:["لبناني","IB"],          lang:"عربي/إنجليزي", feesMin:4000, feesMax:7500,  grades:"KG-12", founded:1910, students:2000, rating:5, features:["IB","برامج دولية","نشاطات"],               desc:"من أبرز المدارس المارونية في جبل لبنان.",       emoji:"🏔️", color:"from-sky-600 to-sky-800" },
  { id:12, name:"Beirut Baptist School (BBS)",            region:"جبل لبنان",area:"بشامون",    type:"خاصة",    curriculum:["لبناني","SAT"],         lang:"إنجليزي/عربي", feesMin:3000, feesMax:6000,  grades:"KG-12", founded:1956, students:1500, rating:4, features:["SAT prep","رياضة","علوم"],                  desc:"مدرسة إنجيلية مرموقة في بشامون.",              emoji:"✝️", color:"from-amber-600 to-amber-800" },
  { id:13, name:"مدرسة الفرير — عاليه",                  region:"جبل لبنان",area:"عاليه",     type:"خاصة",    curriculum:["French Bac","لبناني"],  lang:"فرنسي/عربي",   feesMin:3500, feesMax:7000,  grades:"KG-12", founded:1921, students:1600, rating:4, features:["Bac français","علوم","رياضيات"],           desc:"مدرسة الأخوة المسيحيين في عاليه.",             emoji:"📚", color:"from-gray-600 to-gray-800" },
  { id:14, name:"Sagesse High School",                    region:"جبل لبنان",area:"دكوانة",    type:"خاصة",    curriculum:["لبناني","SAT","AP"],    lang:"عربي/إنجليزي", feesMin:4000, feesMax:7000,  grades:"KG-12", founded:1970, students:1800, rating:5, features:["AP","SAT","علوم متقدمة","فنون"],           desc:"مدرسة الحكمة الثانوية، أعلى نتائج في البكالوريا.", emoji:"💡", color:"from-yellow-500 to-orange-600" },
  { id:15, name:"الثانوية الرسمية — عاليه",               region:"جبل لبنان",area:"عاليه",     type:"رسمية",   curriculum:["لبناني"],               lang:"عربي/فرنسي",   feesMin:0,    feesMax:0,     grades:"7-12",  founded:1958, students:1200, rating:3, features:["تعليم مجاني","منهج لبناني"],               desc:"من الثانويات الرسمية في جبل لبنان.",           emoji:"🏫", color:"from-red-500 to-red-700" },
  // ─── الشمال ───────────────────────────────────────────────────────────────
  { id:16, name:"مدرسة الفرير — طرابلس",                 region:"الشمال", area:"طرابلس",     type:"خاصة",    curriculum:["لبناني","French Bac"],  lang:"فرنسي/عربي",   feesMin:2500, feesMax:5000,  grades:"KG-12", founded:1888, students:2200, rating:4, features:["Bac français","رياضة","علوم"],             desc:"من أعرق مدارس الشمال.",                        emoji:"🌊", color:"from-blue-500 to-cyan-600" },
  { id:17, name:"مدارس المقاصد — طرابلس",                region:"الشمال", area:"طرابلس",     type:"خاصة",    curriculum:["لبناني"],               lang:"عربي/إنجليزي", feesMin:1000, feesMax:3000,  grades:"KG-12", founded:1920, students:3500, rating:4, features:["منهج إسلامي","نشاطات","منح"],              desc:"شبكة مدارس إسلامية في الشمال.",                emoji:"🕌", color:"from-green-500 to-green-700" },
  { id:18, name:"ثانوية عبد الحميد كرامي الرسمية",       region:"الشمال", area:"طرابلس",     type:"رسمية",   curriculum:["لبناني"],               lang:"عربي/فرنسي",   feesMin:0,    feesMax:0,     grades:"7-12",  founded:1953, students:2500, rating:3, features:["تعليم مجاني"],                             desc:"من أبرز الثانويات الرسمية في طرابلس.",         emoji:"🏫", color:"from-red-500 to-red-700" },
  { id:19, name:"Evangelical School — Tripoli",          region:"الشمال", area:"طرابلس",     type:"خاصة",    curriculum:["لبناني","SAT"],         lang:"إنجليزي/عربي", feesMin:2000, feesMax:4500,  grades:"KG-12", founded:1901, students:1100, rating:4, features:["SAT","رياضيات","إنجليزي متقدم"],           desc:"مدرسة إنجيلية مرموقة في طرابلس.",             emoji:"⛪", color:"from-indigo-500 to-indigo-700" },
  // ─── الجنوب ───────────────────────────────────────────────────────────────
  { id:20, name:"مدارس الإمام الخميني — صور",            region:"الجنوب", area:"صور",        type:"خاصة",    curriculum:["لبناني"],               lang:"عربي",         feesMin:800,  feesMax:2500,  grades:"KG-12", founded:1985, students:4000, rating:4, features:["منهج ديني","نشاطات","منح"],               desc:"شبكة تعليمية في الجنوب.",                      emoji:"🌟", color:"from-amber-500 to-amber-700" },
  { id:21, name:"مدارس الأمل — صيدا",                    region:"الجنوب", area:"صيدا",       type:"خاصة",    curriculum:["لبناني"],               lang:"عربي/إنجليزي", feesMin:1500, feesMax:3500,  grades:"KG-12", founded:1978, students:2200, rating:4, features:["تكنولوجيا","نشاطات رياضية","فنون"],        desc:"من أبرز مدارس صيدا الخاصة.",                   emoji:"🏖️", color:"from-blue-500 to-teal-600" },
  { id:22, name:"ثانوية النبطية الرسمية",                 region:"الجنوب", area:"النبطية",    type:"رسمية",   curriculum:["لبناني"],               lang:"عربي/فرنسي",   feesMin:0,    feesMax:0,     grades:"7-12",  founded:1962, students:1800, rating:3, features:["تعليم مجاني"],                             desc:"من الثانويات الرسمية في النبطية.",             emoji:"🏫", color:"from-red-500 to-red-700" },
  // ─── البقاع ───────────────────────────────────────────────────────────────
  { id:23, name:"مدارس الأونروا — البقاع",               region:"البقاع", area:"زحلة",       type:"رسمية",   curriculum:["لبناني"],               lang:"عربي",         feesMin:0,    feesMax:0,     grades:"KG-9",  founded:1950, students:5000, rating:3, features:["تعليم مجاني للاجئين","دعم اجتماعي"],      desc:"مدارس الأمم المتحدة للاجئين في البقاع.",       emoji:"🏕️", color:"from-slate-500 to-slate-700" },
  { id:24, name:"مدرسة الفرير — زحلة",                   region:"البقاع", area:"زحلة",       type:"خاصة",    curriculum:["French Bac","لبناني"],  lang:"فرنسي/عربي",   feesMin:2500, feesMax:5500,  grades:"KG-12", founded:1893, students:1400, rating:4, features:["Bac français","كيمياء","رياضيات","فنون"],  desc:"الفرير في زحلة من أعرق مدارس البقاع.",         emoji:"🍷", color:"from-purple-500 to-purple-700" },
  { id:25, name:"ثانوية زحلة الرسمية",                   region:"البقاع", area:"زحلة",       type:"رسمية",   curriculum:["لبناني"],               lang:"عربي/فرنسي",   feesMin:0,    feesMax:0,     grades:"7-12",  founded:1960, students:2000, rating:3, features:["تعليم مجاني","منهج رسمي"],                 desc:"الثانوية الرسمية في مدينة زحلة.",             emoji:"🏫", color:"from-red-500 to-red-700" },
  // ─── مدارس دولية بارزة إطافية ────────────────────────────────────────────
  { id:26, name:"Lebanese American University School",   region:"بيروت", area:"بيروت",      type:"دولية",   curriculum:["American","AP"],        lang:"إنجليزي",      feesMin:7000, feesMax:12000, grades:"KG-12", founded:2000, students:900,  rating:5, features:["AP","SAT","Model UN","STEM"],              desc:"مدرسة LAU النموذجية بمنهج أمريكي متكامل.",     emoji:"🎓", color:"from-red-700 to-red-900" },
  { id:27, name:"Brummana High School",                  region:"جبل لبنان",area:"برمانا",    type:"خاصة",    curriculum:["IB","لبناني"],          lang:"إنجليزي/عربي", feesMin:5000, feesMax:9500,  grades:"KG-12", founded:1876, students:1100, rating:5, features:["IB Diploma","كوياكر","تعليم سلام","فنون"],  desc:"مدرسة كوياكر عريقة، رائدة بالـIB في لبنان.",   emoji:"🌿", color:"from-emerald-600 to-emerald-800" },
  { id:28, name:"Hariri High School — Saida",            region:"الجنوب", area:"صيدا",       type:"خاصة",    curriculum:["لبناني"],               lang:"عربي/إنجليزي", feesMin:1500, feesMax:3500,  grades:"KG-12", founded:1994, students:2000, rating:4, features:["تكنولوجيا","منح","مختبرات حديثة"],         desc:"من مدارس مؤسسة الحريري في الجنوب.",            emoji:"🌺", color:"from-blue-500 to-blue-700" },
  { id:29, name:"Deir El Ahmar School (LT)",             region:"البقاع", area:"دير الأحمر", type:"مهنية",   curriculum:["LT تقني"],              lang:"عربي",         feesMin:500,  feesMax:2000,  grades:"7-12",  founded:1972, students:600,  rating:3, features:["تعليم تقني","مهن يدوية","لحام","كهرباء"], desc:"مدرسة تقنية مهنية في البقاع الشمالي.",         emoji:"🔧", color:"from-orange-500 to-orange-700" },
  { id:30, name:"مدرسة الكفاءة التقنية — بيروت",            region:"بيروت", area:"الكرنتينا",   type:"مهنية",   curriculum:["BT تقني","TS"],         lang:"عربي/فرنسي",   feesMin:1000, feesMax:3000,  grades:"10-14", founded:1980, students:800,  rating:4, features:["BT/TS","كهرباء","ميكانيك","تكنولوجيا"],   desc:"مدرسة تقنية متخصصة في الكرنتينا.",            emoji:"⚙️", color:"from-gray-500 to-gray-700" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Stars({ n }: { n: number }) {
  return <span className="text-yellow-400">{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

function FeeBadge({ min, max }: { min: number; max: number }) {
  if (min === 0) return <span className="text-green-600 font-bold">مجاني</span>;
  if (max <= 3000) return <span className="text-emerald-600 font-bold">${min.toLocaleString()}–${max.toLocaleString()}</span>;
  if (max <= 8000) return <span className="text-amber-600 font-bold">${min.toLocaleString()}–${max.toLocaleString()}</span>;
  return <span className="text-red-600 font-bold">${min.toLocaleString()}–${max.toLocaleString()}</span>;
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function SchoolsPage() {
  const [search, setSearch] = useState("");
  const [filterRegion, setFilterRegion] = useState("الكل");
  const [filterType, setFilterType] = useState("الكل");
  const [filterCurriculum, setFilterCurriculum] = useState("الكل");
  const [sortBy, setSortBy] = useState<"rating" | "fees" | "students">("rating");
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const regions = ["الكل", "بيروت", "جبل لبنان", "الشمال", "الجنوب", "البقاع"];
  const types: Array<"الكل" | School["type"]> = ["الكل", "خاصة", "رسمية", "دولية", "مهنية"];
  const curricula = ["الكل", "لبناني", "IB", "French Bac", "American", "LT تقني", "BT تقني"];

  const filtered = useMemo(() => {
    let list = SCHOOLS.filter(s => {
      const matchSearch = !search ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.area.includes(search) ||
        s.features.some(f => f.includes(search));
      const matchRegion = filterRegion === "الكل" || s.region === filterRegion;
      const matchType = filterType === "الكل" || s.type === filterType;
      const matchCurriculum = filterCurriculum === "الكل" ||
        s.curriculum.some(c => c.includes(filterCurriculum));
      return matchSearch && matchRegion && matchType && matchCurriculum;
    });
    if (sortBy === "fees") list = [...list].sort((a, b) => a.feesMin - b.feesMin);
    else if (sortBy === "students") list = [...list].sort((a, b) => b.students - a.students);
    else list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [search, filterRegion, filterType, filterCurriculum, sortBy]);

  const typeColors: Record<string, string> = {
    "خاصة":  "bg-blue-100 text-blue-700",
    "رسمية": "bg-green-100 text-green-700",
    "دولية": "bg-purple-100 text-purple-700",
    "مهنية": "bg-orange-100 text-orange-700",
  };

  // Stats
  const stats = {
    total: SCHOOLS.length,
    private: SCHOOLS.filter(s => s.type === "خاصة").length,
    public: SCHOOLS.filter(s => s.type === "رسمية").length,
    international: SCHOOLS.filter(s => s.type === "دولية").length,
    vocational: SCHOOLS.filter(s => s.type === "مهنية").length,
  };

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
            <Link href="/schools" className="text-blue-600 font-bold">المدارس</Link>
            <Link href="/vocational" className="hover:text-blue-600">التعليم التقني</Link>
            <Link href="/scholarships" className="hover:text-blue-600">المنح</Link>
          </nav>
          <Link href="/dashboard" className="bg-blue-600 text-white rounded-xl font-bold text-sm px-4 py-2">داشبورد</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-bold mb-4">
                🏫 دليل المدارس اللبنانية
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">اختر المدرسة المناسبة لطفلك</h1>
              <p className="text-blue-100 text-lg max-w-xl">دليل شامل لأكثر من {stats.total} مدرسة في لبنان — خاصة، رسمية، دولية، وتقنية مهنية</p>
            </div>
            <div className="text-6xl opacity-80">🏫</div>
          </div>
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { label: "مدارس خاصة",     count: stats.private,       bg: "bg-white/20", emoji: "🏛️" },
              { label: "مدارس رسمية",    count: stats.public,        bg: "bg-white/15", emoji: "🏫" },
              { label: "مدارس دولية",    count: stats.international, bg: "bg-white/20", emoji: "🌍" },
              { label: "معاهد مهنية",    count: stats.vocational,    bg: "bg-white/15", emoji: "🔧" },
            ].map(s => (
              <div key={s.label} className={`${s.bg} rounded-2xl p-4 text-center`}>
                <div className="text-2xl mb-1">{s.emoji}</div>
                <div className="text-2xl font-extrabold">{s.count}</div>
                <div className="text-xs text-blue-100">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-wrap gap-3 items-end mb-4">
            <div className="flex-1 min-w-56">
              <label className="text-xs font-bold text-gray-500 block mb-1">🔍 بحث</label>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو المنطقة أو الميزة..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">الترتيب</label>
              <div className="flex gap-1">
                {[["rating","التقييم"],["fees","الرسوم"],["students","الطلاب"]] .map(([v,l]) => (
                  <button key={v} onClick={() => setSortBy(v as "rating"|"fees"|"students")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${sortBy === v ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Region filter */}
          <div className="mb-3">
            <p className="text-xs font-bold text-gray-500 mb-1.5">📍 المنطقة</p>
            <div className="flex flex-wrap gap-1.5">
              {regions.map(r => (
                <button key={r} onClick={() => setFilterRegion(r)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterRegion === r ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Type filter */}
          <div className="mb-3">
            <p className="text-xs font-bold text-gray-500 mb-1.5">🏷️ نوع المدرسة</p>
            <div className="flex flex-wrap gap-1.5">
              {types.map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterType === t ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Curriculum filter */}
          <div>
            <p className="text-xs font-bold text-gray-500 mb-1.5">📋 المنهج</p>
            <div className="flex flex-wrap gap-1.5">
              {curricula.map(c => (
                <button key={c} onClick={() => setFilterCurriculum(c)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterCurriculum === c ? "bg-amber-500 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500 font-medium"><strong className="text-gray-800">{filtered.length}</strong> مدرسة</p>
          <p className="text-xs text-gray-400">اضغط على بطاقة المدرسة لمزيد من التفاصيل</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(s => {
            const isExpanded = expandedId === s.id;
            return (
              <div key={s.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : s.id)}>

                {/* Gradient Header */}
                <div className={`bg-gradient-to-r ${s.color} p-5 text-white`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{s.emoji}</span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white/20`}>{s.type}</span>
                  </div>
                  <h3 className="font-extrabold text-base leading-tight mb-1">{s.name}</h3>
                  <p className="text-white/80 text-xs">📍 {s.area}، {s.region}</p>
                </div>

                {/* Body */}
                <div className="p-4">
                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{s.desc}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 block">الرسوم/سنة</span>
                      <FeeBadge min={s.feesMin} max={s.feesMax} />
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 block">الصفوف</span>
                      <span className="font-bold text-gray-700">{s.grades}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 block">الطلاب</span>
                      <span className="font-bold text-gray-700">{s.students.toLocaleString()}</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 block">تأسست</span>
                      <span className="font-bold text-gray-700">{s.founded}</span>
                    </div>
                  </div>

                  {/* Curriculum badges */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {s.curriculum.map(c => (
                      <span key={c} className="bg-amber-50 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-200">{c}</span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between">
                    <Stars n={s.rating} />
                    <span className="text-xs text-gray-400">{s.lang}</span>
                  </div>

                  {/* Expanded section */}
                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs font-bold text-gray-600 mb-2">✨ مميزX�ت المدرسة:</p>
                      <div className="flex flex-wrap gap-1">
                        {s.features.map(f => (
                          <span key={f} className="bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">{f}</span>
                        ))}
                      </div>
                      {s.website && (
                        <a href={s.website} target="_blank" rel="noopener noreferrer"
                          className="mt-3 flex items-center gap-1 text-xs text-blue-600 font-bold hover:underline">
                          🔗 زيارة الموقع
                        </a>
                      )}
                    </div>
                  )}

                  <button
                    onClick={e => { e.stopPropagation(); setExpandedId(isExpanded ? null : s.id); }}
                    className="mt-3 w-full text-xs font-bold py-2 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                          {isExpanded ? "▲ إخفاء التفاصيل" : "▼ عرض المزيد"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 font-semibold">لم يتم الظ��ور على مدارس</p>
            <p className="text-gray-400 text-sm mt-1">جرب تغيير معايير البحث</p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { emoji:"📋", title:"المنهج اللبناني", desc:"المنهج الرسمي الذي يؤدي إلى البكالوريا اللبنانية — معترف به في معظم الجامضات العربية والدولية.", color:"bg-blue-50 border-blue-200" },
            { emoji:"🌍", title:"شهادة IB الدولية", desc:"International Baccalaureate — تفتح أبواب الجامعا�� الكبرى حول العالم، خاصة في أوروبا وأمريكا الشمالية.", color:"bg-purple-50 border-purple-200" },
            { emoji:"🇫🇷", title:"البكالوريا الفرنسية", desc:"Baccalauréat Français — تتيح الالتحاق بالجامعا�� الفرنسية والفرنكوفونية مباشرة، وتقبلها جامعات USJ وESIB.", color:"bg-indigo-50 border-indigo-200" },
          ].map(info => (
            <div key={info.title} className={`rounded-2xl border p-5 ${info.color}`}>
              <div className="text-3xl mb-2">{info.emoji}</div>
              <h3 className="font-bold text-gray-800 mb-2">{info.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{info.desc}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-extrabold mb-3">🎯 هل أنهيت دراستك الثانوية؟</h2>
          <p className="text-blue-100 mb-6">اكتشف أفضل الجامعات التي تناسب تخصصك وميزانيتك</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/universities"
              className="bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
              🏛️ استكشف الجامعات
            </Link>
            <Link href="/tools/career-dna"
              className="bg-white/20 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors border border-white/30">
              🧬 Career DNA Test
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
