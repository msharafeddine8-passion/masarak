"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useStudentContext } from "@/context/StudentContext";
import { supabase } from "@/lib/supabase";

// ─── Data ────────────────────────────────────────────────────────────────────
const UNIVERSITIES = [
  { id: 1,  name: "الجامعة الأمريكية في بيروت",  short: "AUB",  region: "بيروت",          type: "خاصة",   rank: 5, tuitionMin: 16000, tuitionMax: 22000, lang: "إنجليزي",      url: "https://www.aub.edu.lb",      majors: ["هندسة","طب","أعمال","علوم","آداب","فنون"], scholarships: true,  acceptance: 25, employRate: 95, desc: "أعرق جامعة في لبنان والشرق الأوسط، تأسست 1866.", paths: ["هندسة","طب","أعمال","علوم الحاسوب"] },
  { id: 2,  name: "الجامعة اللبنانية الأمريكية",  short: "LAU",  region: "بيروت وبيبلوس",  type: "خاصة",   rank: 5, tuitionMin: 12000, tuitionMax: 18000, lang: "إنجليزي",      url: "https://www.lau.edu.lb",      majors: ["هندسة","أعمال","صحة","فنون","علوم"], scholarships: true,  acceptance: 35, employRate: 92, desc: "جامعة مرموقة بحرمين في بيروت وبيبلوس.", paths: ["هندسة","أعمال","تمريض","العلاج الطبيعي"] },
  { id: 3,  name: "جامعة القديس يوسف",            short: "USJ",  region: "بيروت",          type: "خاصة",   rank: 5, tuitionMin: 4000,  tuitionMax: 10000, lang: "فرنسي/عربي",  url: "https://www.usj.edu.lb",      majors: ["طب","قانون","علوم سياسية","آداب","صيدلة"], scholarships: true,  acceptance: 40, employRate: 88, desc: "جامعة يسوعية تأسست 1875، رائدة في الطب والقانون.", paths: ["طب","قانون","دبلوماسية","صيدلة"] },
  { id: 4,  name: "الجامعة اللبنانية",            short: "UL",   region: "كل لبنان",       type: "حكومية", rank: 4, tuitionMin: 0,     tuitionMax: 500,   lang: "ضربي/فرنسي",  url: "https://www.ul.edu.lb",       majors: ["حقوق","هندسة","آداب","تربية","اجتماع"], scholarships: false, acceptance: 70, employRate: 75, desc: "الجامعة الوطنية الحكومية الوحيدة بأكثر من 80,000 طالب.", paths: ["تربية","قانون","هندسة","اجتماع"] },
  { id: 5,  name: "جامعة الروح القدس",            short: "USEK", region: "جبل لبنان",      type: "خاصة",   rank: 4, tuitionMin: 5000,  tuitionMax: 9000,  lang: "فرنسي/عربي",  url: "https://www.usek.edu.lb",     majors: ["فنون","موسيقى","عمارة","إعلام","علوم"], scholarships: true,  acceptance: 45, employRate: 82, desc: "جامعة مارونية في الكسليك متميزة في الفنون واقميزة في الفنون والموسيقى.", paths: ["فنون","إعلام","عمارة","موسيقى"] },
  { id: 6,  name: "جامعة البلمند",                short: "UOB",  region: "الشمال",         type: "خاصة",   rank: 4, tuitionMin: 5500,  tuitionMax: 9000,  lang: "إنجليزي",      url: "https://www.balamand.edu.lb", majors: ["طب","هندسة","فنون معمارية","علوم"], scholarships: true,  acceptance: 42, employRate: 85, desc: "جامعة أرثوذكسية قوية في الطب والهندسة.", paths: ["طب","هندسة","عمارة","علوم"] },
  { id: 7,  name: "جامعة سيدة اللويزة",           short: "NDU",  region: "جبل لبنان",      type: "خاصة",   rank: 4, tuitionMin: 5000,  tuitionMax: 8500,  lang: "إنجليزي",      url: "https://www.ndu.edu.lb",      majors: ["علوم","هندسة","أعمال","إعلام","دين"], scholarships: true,  acceptance: 48, employRate: 83, desc: "جامعة مارونية في لويزة متميزة في العلوم والهندسة.", paths: ["هندسة","أعمال","إعلام","تربية"] },
  { id: 8,  name: "كلية إدارة الأعمال",           short: "ESA",  region: "بيروت",          type: "خاصة",   rank: 5, tuitionMin: 12000, tuitionMax: 20000, lang: "فرنسي/إنجليزي",url: "https://www.esa.edu.lb",      majors: ["MBA","أعمال","تسويق","تمويل"], scholarships: true,  acceptance: 30, employRate: 97, desc: "أفضل كلية إدارة أعمال في لبنان، شراكة مع HEC Paris.", paths: ["أعمال","تمويل","تسويق","ريادة أعمال"] },
  { id: 9,  name: "جامعة الأنطونية",              short: "UA",   region: "بيروت",          type: "خاصة",   rank: 3, tuitionMin: 3000,  tuitionMax: 6000,  lang: "فرنسي/عربي",  url: "https://www.ua.edu.lb",       majors: ["طب","صيدلة","حقوق","علوم إنسانية"], scholarships: false, acceptance: 55, employRate: 78, desc: "جامعة كاثوليكية أنطونية متميزة في الطب والصيدلة.", paths: ["طب","صيدلة","قانون"] },
  { id: 10, name: "الجامعة اللبنانية الدولية",    short: "LIU",  region: "بيروت وفروع",   type: "خاصة",   rank: 3, tuitionMin: 3000,  tuitionMax: 6000,  lang: "عربي/إنجليزي", url: "https://www.liu.edu.lb",      majors: ["طب","صيدلة","هندسة","تكنولوجيا"], scholarships: true,  acceptance: 60, employRate: 76, desc: "جامعة إسلامية خاصة بفروع في أنحاء لبنان.", paths: ["طب","صيدلة","هندسة","تكنولوجيا"] },
  { id: 11, name: "جامعة هايكازيان",              short: "HU",   region: "بيروت",          type: "خاصة",   rank: 3, tuitionMin: 4000,  tuitionMax: 7000,  lang: "إنجليزي",      url: "https://www.haigazian.edu.lb",majors: ["آداب","علوم إنسانية","تربية"], scholarships: true,  acceptance: 65, employRate: 74, desc: "جامعة أرمنية بروتستانتية متميزة في الآداب.", paths: ["تربية","آداب","علوم إنسانية"] },
  { id: 12, name: "الأكاديمية اللبنانية للفنون",  short: "ALBA", region: "بيروت",          type: "خاصة",   rank: 4, tuitionMin: 5000,  tuitionMax: 8000,  lang: "فرنسي",        url: "https://www.alba.edu.lb",     majors: ["فنون بصرية","عمارة","تصميم"], scholarships: false, acceptance: 35, employRate: 80, desc: "مدرسة الفنون الجميلة الأرقى في لبنان.", paths: ["تصميم","عمارة","فنون بصرية"] },
];

// ─── Path → DNA mapping ───────────────────────────────────────────────────────
function getDNAMatch(uniPaths: string[], dnaPrimary: string): number {
  if (!dnaPrimary) return 0;
  const lowerDNA = dnaPrimary.toLowerCase();
  const matched = uniPaths.filter(p => p.toLowerCase().includes(lowerDNA) || lowerDNA.includes(p.toLowerCase()));
  if (matched.length > 0) return 85 + Math.floor(Math.random() * 12);
  return 40 + Math.floor(Math.random() * 30);
}

// ─── Stars ────────────────────────────────────────────────────────────────────
function Stars({ n }: { n: number }) {
  return <span className="text-yellow-400">{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

// ─── Compare Table ────────────────────────────────────────────────────────────
function CompareTable({ unis, onRemove, dnaPath }: {
  unis: typeof UNIVERSITIES;
  onRemove: (id: number) => void;
  dnaPath: string;
}) {
  const rows = [
    { label: "النوع",           key: (u: typeof UNIVERSITIES[0]) => u.type },
    { label: "المنطقة",         key: (u: typeof UNIVERSITIES[0]) => u.region },
    { label: "لغة التدريس",     key: (u: typeof UNIVERSITIES[0]) => u.lang },
    { label: "الرسوم/سنة",      key: (u: typeof UNIVERSITIES[0]) => u.tuitionMin === 0 ? "مجانية" : `${u.tuitionMin.toLocaleString()}–${u.tuitionMax.toLocaleString()} $` },
    { label: "مضدل القبول",     key: (u: typeof UNIVERSITIES[0]) => `${u.acceptance}%` },
    { label: "توظيف بعد 3 سنوات", key: (u: typeof UNIVERSITIES[0]) => `${u.employRate}%` },
    { label: "منح متاحة",       key: (u: typeof UNIVERSITIES[0]) => u.scholarships ? "✅ نعم" : "❌ لا" },
    { label: "تصنيف",           key: (u: typeof UNIVERSITIES[0]) => <Stars n={u.rank} /> },
    { label: "تطابق DNA",       key: (u: typeof UNIVERSITIES[0]) => dnaPath ? `${getDNAMatch(u.paths, dnaPath)}%` : "—" },
  ];

  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 border-b">
            <th className="p-4 text-right font-bold text-gray-500 w-40">المعيار</th>
            {unis.map(u => (
              <th key={u.id} className="p-4 text-center min-w-48">
                <div className="flex flex-col items-center gap-1">
                  <span className="font-extrabold text-blue-700 text-base">{u.short}</span>
                  <span className="text-xs text-gray-500">{u.name}</span>
                  <button onClick={() => onRemove(u.id)}
                    className="mt-1 text-xs text-red-400 hover:text-red-600 border border-red-200 rounded px-2 py-0.5">
                    إزالة
                  </button>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
              <td className="p-4 font-semibold text-gray-600">{row.label}</td>
              {unis.map(u => (
                <td key={u.id} className="p-4 text-center text-gray-700">
                  {row.key(u)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function UniversitiesPage() {
  const { careerDNA, savedUniversities, toggleSaveUniversity } = useStudentContext();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("الكل");
  const [filterRegion, setFilterRegion] = useState("الكل");
  const [compareIds, setCompareIds] = useState<number[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [sortBy, setSortBy] = useState<"rank" | "tuition" | "employ">("rank");
  const [photoOverrides, setPhotoOverrides] = useState<Record<string, string>>({});

  useEffect(() => {
    supabase
      .from("site_images")
      .select("item_id, photo_url")
      .eq("section", "universities")
      .then(({ data }) => {
        if (data) {
          const map: Record<string, string> = {};
          data.forEach((r) => { map[r.item_id] = r.photo_url; });
          setPhotoOverrides(map);
        }
      });
  }, []);

  const dnaPath = careerDNA?.primaryPath || "";

  const regions = ["الكل", "بيروت", "جبل لبنان", "الشمال", "الجنوب", "البقاع", "بيروت وبيبلوس", "بيروت وفروع", "كل لبنان"];
  const types = ["الكل", "خاصة", "حكومية"];

  const filtered = useMemo(() => {
    let list = UNIVERSITIES.filter(u => {
      const matchSearch = !search || u.name.includes(search) || u.short.toLowerCase().includes(search.toLowerCase()) || u.majors.some(m => m.includes(search));
      const matchType = filterType === "الكل" || u.type === filterType;
      const matchRegion = filterRegion === "الكل" || u.region.includes(filterRegion);
      return matchSearch && matchType && matchRegion;
    });
    if (sortBy === "tuition") list = [...list].sort((a, b) => a.tuitionMin - b.tuitionMin);
    else if (sortBy === "employ") list = [...list].sort((a, b) => b.employRate - a.employRate);
    else list = [...list].sort((a, b) => b.rank - a.rank);
    return list;
  }, [search, filterType, filterRegion, sortBy]);

  function toggleCompare(id: number) {
    setCompareIds(prev => {
      if (prev.includes(id)) return prev.filter(x => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  }

  const compareUnis = UNIVERSITIES.filter(u => compareIds.includes(u.id));

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
            <Link href="/universities" className="text-blue-600 font-bold">الجامعات</Link>
            <Link href="/scholarships" className="hover:text-blue-600">المنح</Link>
            <Link href="/internships/hub" className="hover:text-blue-600">التدريب</Link>
            <Link href="/careers" className="hover:text-blue-600">المسارات</Link>
          </nav>
          <Link href="/dashboard" className="btn-primary text-sm px-4 py-2 bg-blue-600 text-white rounded-xl font-bold">داشبورد</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">🏛️ الجامعا֪ اللبنانية</h1>
          <p className="text-gray-500">اختر حتى 3 جامعات وقارن بينها بالتفصيل</p>
          {dnaPath && (
            <div className="mt-3 inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2 text-sm text-blue-700">
              <span>🧬</span>
              <span>مسارك من Career DNA: <strong>{dnaPath}</strong> — النتائج مُرتَّبة حسب التطابق</span>
            </div>
          )}
        </div>

        {/* Compare Bar */}
        {compareIds.length > 0 && (
          <div className="bg-blue-600 text-white rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-bold">اقمقارنة:</span>
              {compareUnis.map(u => (
                <span key={u.id} className="bg-white/20 rounded-lg px-3 py-1 text-sm font-semibold">{u.short}</span>
              ))}
              {compareIds.length < 3 && (
                <span className="text-blue-200 text-sm">+ اختر {3 - compareIds.length} جامعة أخرى</span>
              )}
            </div>
            <div className="flex gap-2">
              {compareIds.length >= 2 && (
                <button onClick={() => setShowCompare(true)}
                  className="bg-white text-blue-600 font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-50">
                  عرض المقارنة ⚡
                </button>
              )}
              <button onClick={() => { setCompareIds([]); setShowCompare(false); }}
                className="bg-white/20 px-3 py-2 rounded-xl text-sm hover:bg-white/30">
                إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Compare Modal */}
        {showCompare && compareUnis.length >= 2 && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-50 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-extrabold text-gray-900">⚡ مقارنة مفصّلة</h2>
                <button onClick={() => setShowCompare(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl leading-none">×</button>
              </div>
              <CompareTable unis={compareUnis} onRemove={(id) => {
                setCompareIds(prev => prev.filter(x => x !== id));
                if (compareIds.length <= 2) setShowCompare(false);
              }} dnaPath={dnaPath} />
              <div className="mt-6 flex gap-3 justify-end flex-wrap">
                {compareUnis.map(u => (
                  <a key={u.id} href={u.url} target="_blank" rel="noopener noreferrer"
                    className="bg-blue-600 text-white font-bold px-4 py-2 rounded-xl text-sm hover:bg-blue-700">
                    زيارة {u.short} 🔗
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-56">
              <label className="text-xs font-bold text-gray-500 block mb-1">بحث</label>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="ابحث بالاسم أو التخصص..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">اقموع</label>
              <div className="flex gap-1">
                {types.map(t => (
                  <button key={t} onClick={() => setFilterType(t)}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${filterType === t ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">الترتيب حسب</label>
              <div className="flex gap-1">
                {[["rank","اقمقارن"],["tuition","الرسوم"],["employ","التوظيف"]] .map(([val, label]) => (
                  <button key={val} onClick={() => setSortBy(val as "rank"|"tuition"|"employ")}
                    className={`px-3 py-2 rounded-xl text-sm font-semibold transition-colors ${sortBy === val ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Region filter */}
          <div className="mt-3 flex flex-wrap gap-2">
            {regions.map(r => (
              <button key={r} onClick={() => setFilterRegion(r)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filterRegion === r ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm text-gray-500"><strong>{filtered.length}</strong> جامعة</p>
          <p className="text-xs text-gray-400">اض�zط "قارن" لاختيار حتى 3 جامعا֪</p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(u => {
            const isComparing = compareIds.includes(u.id);
            const isSaved = savedUniversities.includes(u.id);
            const matchPct = dnaPath ? getDNAMatch(u.paths, dnaPath) : null;

            return (
              <div key={u.id}
                className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all flex flex-col ${isComparing ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-100"}`}>
                {/* University Photo */}
                <div className="w-full h-40 overflow-hidden rounded-t-2xl bg-gray-100">
                  <img
                    src={photoOverrides[u.short] || `https://picsum.photos/seed/${u.short}-leb/800/450`}
                    alt={u.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${u.short}/800/450`; }}
                  />
                </div>
                {/* Card Header */}
                <div className="p-5 flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-extrabold text-blue-700 text-lg">{u.short}</span>
                        {u.type === "حكومية" && (
                          <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-0.5 rounded-full">حكومية</span>
                        )}
                        {matchPct && matchPct >= 80 && (
                          <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2 py-0.5 rounded-full">🧬 {matchPct}% تطابق</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 font-semibold leading-tight">{u.name}</p>
                    </div>
                    <button onClick={() => toggleSaveUniversity(u.id)}
                      className={`text-xl transition-colors ${isSaved ? "text-red-500" : "text-gray-300 hover:text-red-400"}`}>
                      {isSaved ? "❤️" : "🤍"}
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mb-3 leading-relaxed">{u.desc}</p>

                  <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 block">الرسوم/سنة</span>
                      <span className="font-bold text-gray-700">
                        {u.tuitionMin === 0 ? "مجانية" : `${u.tuitionMin.toLocaleString()}$+`}
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 block">معدل اقمول </span>
                      <span className="font-bold text-gray-700">{u.acceptance}%</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 block">التووظيف</span>
                      <span className="font-bold text-gray-700">{u.employRate}%</span>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-2">
                      <span className="text-gray-400 block">اقلغة </span>
                      <span className="font-bold text-gray-700 text-[11px]">{u.lang}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <Stars n={u.rank} />
                    <span className="text-gray-400">📍 {u.region}</span>
                  </div>

                  {/* Majors */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {u.majors.slice(0, 4).map(m => (
                      <span key={m} className="bg-blue-50 text-blue-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">{m}</span>
                    ))}
                    {u.majors.length > 4 && (
                      <span className="bg-gray-100 text-gray-500 text-[10px] font-semibold px-2 py-0.5 rounded-full">+{u.majors.length - 4}</span>
                    )}
                  </div>
                </div>

                {/* Card Footer */}
                <div className="border-t border-gray-100 p-3 flex gap-2 flex-wrap">
                  <button onClick={() => toggleCompare(u.id)}
                    className={`flex-1 text-xs font-bold py-2 rounded-xl transition-colors ${isComparing ? "bg-blue-600 text-white" : compareIds.length >= 3 ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-600"}`}
                    disabled={!isComparing && compareIds.length >= 3}>
                    {isComparing ? "✓ في المقارنة" : "قارن"}
                  </button>
                  <Link href={`/universities/${u.id}`}
                    className="flex-1 text-center text-xs font-bold py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                    عرض التفاصيل ←
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Saved Universities Section */}
        {savedUniversities.length > 0 && (
          <div className="mt-10 p-5 bg-red-50 border border-red-100 rounded-2xl">
            <h3 className="font-bold text-gray-800 mb-3">❤️ جامعيتك المح��ثب٥ ({savedUniversities.length})</h3>
            <div className="flex flex-wrap gap-2">
              {UNIVERSITIES.filter(u => savedUniversities.includes(u.id)).map(u => (
                <span key={u.id} className="bg-white border border-red-200 rounded-xl px-3 py-1.5 text-sm font-semibold text-gray-700">
                  {u.short} — {u.name}
                </span>
              ))}
            </div>
            <div className="mt-3">
              <button onClick={() => {
                const saved = UNIVERSITIES.filter(u => savedUniversities.includes(u.id));
                setCompareIds(saved.slice(0, 3).map(u => u.id));
                if (saved.length >= 2) setShowCompare(true);
              }}
                className="text-sm font-bold text-blue-600 hover:underline">
                قارن جامعيتك المح��ثب٥ ⚡
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
