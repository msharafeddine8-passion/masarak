"use client";
import { useState } from "react";
import Link from "next/link";
import { useStudentContext } from "@/context/StudentContext";

interface University {
  id: string;
  name: string;
  short: string;
  region: string;
  type: "خاصة" | "رسمية";
  rank: number;
  tuitionMin: number;
  tuitionMax: number;
  lang: string;
  url: string;
  majors: string[];
  scholarships: boolean;
  acceptance: number;
  employRate: number;
  desc: string;
  paths: string[];
}

const UNIVERSITIES: University[] = [
  { id:"aub", name:"الجامعة الأمريكية في بيروت", short:"AUB", region:"بيروت", type:"خاصة", rank:1, tuitionMin:18000, tuitionMax:28000, lang:"English", url:"https://www.aub.edu.lb", majors:["طب","هندسة","أعمال","علوم الحاسوب","فنون وعلوم"], scholarships:true, acceptance:35, employRate:92, desc:"أعرق جامعة في لبنان والشرق الأوسط، تأسست عام 1866.", paths:["الطب","هندسة البرمجيات","الذكاء الاصطناعي","إدارة الأعمال"] },
  { id:"lau", name:"الجامعة الأمريكية اللبنانية", short:"LAU", region:"بيروت", type:"خاصة", rank:2, tuitionMin:14000, tuitionMax:22000, lang:"English", url:"https://www.lau.edu.lb", majors:["هندسة","أعمال","تمريض","فنون","علوم الحاسوب"], scholarships:true, acceptance:55, employRate:88, desc:"جامعة بحثية رائدة تأسست عام 1924 بروح أمريكية.", paths:["هندسة البرمجيات","إدارة الأعمال","التمريض","التصميم الإبداعي"] },
  { id:"usj", name:"جامعة القديس يوسف", short:"USJ", region:"بيروت", type:"خاصة", rank:3, tuitionMin:5000, tuitionMax:15000, lang:"Français", url:"https://www.usj.edu.lb", majors:["طب","قانون","هندسة","أعمال","صيدلة"], scholarships:true, acceptance:60, employRate:85, desc:"جامعة يسوعية فرنكوفونية تأسست عام 1875.", paths:["الطب","القانون","الصيدلة","إدارة الأعمال"] },
  { id:"ul", name:"الجامعة اللبنانية", short:"UL", region:"جبل لبنان", type:"رسمية", rank:4, tuitionMin:500, tuitionMax:2000, lang:"Arabic", url:"https://www.ul.edu.lb", majors:["هندسة","أعمال","تربية","فنون","علوم"], scholarships:false, acceptance:80, employRate:75, desc:"الجامعة الوطنية اللبنانية الوحيدة، تأسست عام 1951.", paths:["الهندسة","التربية","إدارة الأعمال","علم النبات"] },
  { id:"ndu", name:"جامعة سيدة اللويزة", short:"NDU", region:"جبل لبنان", type:"خاصة", rank:5, tuitionMin:8000, tuitionMax:14000, lang:"English", url:"https://www.ndu.edu.lb", majors:["هندسة","أعمال","معمار","علوم الحاسوب","تربية"], scholarships:true, acceptance:65, employRate:82, desc:"جامعة مارونية تأسست عام 1987 في كسروان.", paths:["الهندسة","هندسة البرمجيات","إدارة الأعمال","التربية"] },
  { id:"balamand", name:"جامعة البلمند", short:"UOB", region:"الشمال", type:"خاصة", rank:6, tuitionMin:6000, tuitionMax:12000, lang:"English", url:"https://www.balamand.edu.lb", majors:["طب","هندسة","أعمال","فنون","علوم صحية"], scholarships:true, acceptance:70, employRate:80, desc:"جامعة أرثوذكسية تأسست عام 1988 في الكورة.", paths:["الطب","الهندسة","إدارة الأعمال","الإعلام"] },
  { id:"haigazian", name:"جامعة هايكازيان", short:"HU", region:"بيروت", type:"خاصة", rank:7, tuitionMin:7000, tuitionMax:11000, lang:"English", url:"https://www.haigazian.edu.lb", majors:["أعمال","علوم الحاسوب","تربية","علوم اجتماعية"], scholarships:true, acceptance:75, employRate:78, desc:"جامعة أرمنية تأسست عام 1955 في بيروت.", paths:["إدارة الأعمال","هندسة البرمجيات","التربية","علم النبات"] },
  { id:"liu", name:"جامعة الجنان", short:"JU", region:"الشمال", type:"خاصة", rank:9, tuitionMin:3000, tuitionMax:7000, lang:"Arabic", url:"https://www.jinan.edu.lb", majors:["حقوق","أعمال","هندسة","تربية","إعلام"], scholarships:false, acceptance:85, employRate:72, desc:"جامعة إسلامية تأسست عام 1990 في طرابلس.", paths:["القانون","إدارة الأعمال","الإعلام","التربية"] },
  { id:"aust", name:"جامعة العلوم والتكنولوجيا", short:"AUST", region:"بيروت", type:"خاصة", rank:8, tuitionMin:5000, tuitionMax:10000, lang:"Arabic", url:"https://www.aust.edu.lb", majors:["هندسة","علوم الحاسوب","أعمال","تصميم"], scholarships:false, acceptance:78, employRate:76, desc:"جامعة تقنية متخصصة تأسست عام 2002.", paths:["هندسة البرمجيات","الذكاء الاصطناعي","الهندسة","التصميم الإبداعي"] },
  { id:"uls", name:"جامعة لبنان-السويسرية", short:"ULS", region:"البقاع", type:"خاصة", rank:10, tuitionMin:4000, tuitionMax:9000, lang:"Français", url:"https://www.uls.edu.lb", majors:["أعمال","سياحة","تمريض","هندسة"], scholarships:false, acceptance:80, employRate:70, desc:"جامعة فرنكوفونية في البقاع تأسست عام 1999.", paths:["إدارة الأعمال","التمريض","الهندسة","علم النبات"] },
  { id:"lgc", name:"كلية الآداب والعلوم", short:"LGC", region:"الجنوب", type:"خاصة", rank:11, tuitionMin:2000, tuitionMax:5000, lang:"Arabic", url:"https://www.lgc.edu.lb", majors:["آداب","علوم","تربية","أعمال"], scholarships:false, acceptance:90, employRate:65, desc:"كلية متخصصة في الآداب والعلوم الإنسانية.", paths:["التربية","إدارة الأعمال","القانون","الإعلام"] },
  { id:"mubs", name:"جامعة الشرق الأوسط الأمريكية", short:"MUBS", region:"بيروت", type:"خاصة", rank:12, tuitionMin:6000, tuitionMax:10000, lang:"English", url:"https://www.mubs.edu.lb", majors:["أعمال","تمويل","تسويق","إدارة"], scholarships:true, acceptance:72, employRate:80, desc:"كلية أعمال متخصصة ومعتمدة دولياً.", paths:["إدارة الأعمال","المحاسبة والمالية","التسويق","الريادة"] },
];

function getDNAMatch(uni: University, primaryPath?: string): number {
  if (!primaryPath) return 0;
  return uni.paths.some(p => p.includes(primaryPath) || primaryPath.includes(p)) ? 100 :
         uni.paths.some(p => p.split(" ").some(w => primaryPath.includes(w))) ? 60 : 30;
}

function Stars({ n }: { n: number }) {
  return <span className="text-yellow-400">{"★".repeat(n)}{"☆".repeat(5 - n)}</span>;
}

interface CompareTableProps {
  unis: University[];
  onClose: () => void;
}

function CompareTable({ unis, onClose }: CompareTableProps) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-x-auto max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="font-extrabold text-xl text-gray-900">مقارنة الجامعات</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-2xl font-bold">✕</button>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50">
              <td className="px-4 py-3 font-bold text-gray-600">المعيار</td>
              {unis.map(u => (
                <td key={u.id} className="px-4 py-3 font-bold text-center text-blue-700">{u.short}</td>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: "الاسم الكامل", fn: (u: University) => u.name },
              { label: "المنطقة", fn: (u: University) => u.region },
              { label: "النوع", fn: (u: University) => u.type },
              { label: "الترتيب", fn: (u: University) => `#${u.rank}` },
              { label: "الرسوم/سنة", fn: (u: University) => `$${u.tuitionMin.toLocaleString()} – $${u.tuitionMax.toLocaleString()}` },
              { label: "لغة التدريس", fn: (u: University) => u.lang },
              { label: "نسبة القبول", fn: (u: University) => `${u.acceptance}%` },
              { label: "معدل التوظيف", fn: (u: University) => `${u.employRate}%` },
              { label: "منح دراسية", fn: (u: University) => u.scholarships ? "✅ نعم" : "❌ لا" },
              { label: "التخصصات", fn: (u: University) => u.majors.join("، ") },
            ].map(row => (
              <tr key={row.label} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-semibold text-gray-600 bg-gray-50">{row.label}</td>
                {unis.map(u => (
                  <td key={u.id} className="px-4 py-3 text-center text-gray-700">{row.fn(u)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function UniversitiesPage() {
  const { careerDNA, savedUniversities, toggleSaveUniversity } = useStudentContext();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"الكل" | "خاصة" | "رسمية">("الكل");
  const [filterRegion, setFilterRegion] = useState("الكل");
  const [sort, setSort] = useState<"rank" | "tuition" | "employ">("rank");
  const [compareList, setCompareList] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const regions = ["الكل", ...Array.from(new Set(UNIVERSITIES.map(u => u.region)))];

  function toggleCompare(id: string) {
    setCompareList(prev =>
      prev.includes(id) ? prev.filter(x => x !== id)
      : prev.length < 3 ? [...prev, id] : prev
    );
  }

  const filtered = UNIVERSITIES
    .filter(u =>
      (filterType === "الكل" || u.type === filterType) &&
      (filterRegion === "الكل" || u.region === filterRegion) &&
      (u.name.includes(search) || u.short.toLowerCase().includes(search.toLowerCase()) || u.majors.some(m => m.includes(search)))
    )
    .sort((a, b) =>
      sort === "rank" ? a.rank - b.rank :
      sort === "tuition" ? a.tuitionMin - b.tuitionMin :
      b.employRate - a.employRate
    );

  const savedUnis = UNIVERSITIES.filter(u => savedUniversities?.includes(u.id));
  const compareUnis = UNIVERSITIES.filter(u => compareList.includes(u.id));

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 pb-24">
      {showCompare && compareUnis.length >= 2 && (
        <CompareTable unis={compareUnis} onClose={() => setShowCompare(false)} />
      )}

      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-blue-600 font-extrabold text-lg">مسارك</span>
          </Link>
          <h1 className="font-extrabold text-gray-800">🏛️ الجامعات اللبنانية</h1>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600">← داشبورد</Link>
        </div>
      </header>

      {careerDNA?.primaryPath && (
        <div className="bg-purple-50 border-b border-purple-100 py-2">
          <div className="max-w-5xl mx-auto px-4 text-xs text-purple-700 font-semibold">
            🧬 Career DNA: <strong>{careerDNA.primaryPath}</strong> — الجامعات المطابقة مميّزة بعلامة ✨
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Search & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن جامعة أو تخصص..."
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
          />
          <div className="flex flex-wrap gap-2">
            <div className="flex gap-1">
              {(["الكل", "خاصة", "رسمية"] as const).map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors ${filterType === t ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-blue-300"}`}>
                  {t}
                </button>
              ))}
            </div>
            <select value={filterRegion} onChange={e => setFilterRegion(e.target.value)}
              className="border-2 border-gray-200 rounded-full px-3 py-1.5 text-xs font-bold text-gray-600 focus:outline-none focus:border-blue-400">
              {regions.map(r => <option key={r}>{r}</option>)}
            </select>
            <div className="flex gap-1 mr-auto">
              {([["rank","الترتيب"],["tuition","الأرخص"],["employ","التوظيف"]] as const).map(([v,l]) => (
                <button key={v} onClick={() => setSort(v)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors ${sort === v ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Compare bar */}
        {compareList.length > 0 && (
          <div className="bg-blue-600 text-white rounded-2xl px-4 py-3 flex items-center justify-between">
            <span className="text-sm font-bold">{compareList.length} جامعات محددة للمقارنة</span>
            <div className="flex gap-2">
              <button onClick={() => setCompareList([])} className="text-blue-200 hover:text-white text-xs">مسح</button>
              <button onClick={() => setShowCompare(true)} disabled={compareList.length < 2}
                className="bg-white text-blue-600 font-bold px-4 py-1.5 rounded-full text-xs disabled:opacity-50">
                قارن الآن ←
              </button>
            </div>
          </div>
        )}

        {/* Universities grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(uni => {
            const match = getDNAMatch(uni, careerDNA?.primaryPath);
            const isSaved = savedUniversities?.includes(uni.id);
            const isComparing = compareList.includes(uni.id);
            return (
              <div key={uni.id}
                className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all ${isSaved ? "border-blue-300" : "border-gray-100"} ${match === 100 ? "ring-2 ring-purple-300" : ""}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-extrabold text-blue-600">{uni.short}</span>
                        {match === 100 && <span className="text-sm">✨</span>}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${uni.type === "رسمية" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"}`}>{uni.type}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{uni.name}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-xs font-bold text-gray-400">#{uni.rank}</span>
                      <button onClick={() => toggleSaveUniversity(uni.id)}
                        className={`text-lg transition-transform hover:scale-125 ${isSaved ? "text-blue-500" : "text-gray-300 hover:text-blue-400"}`}>
                        {isSaved ? "🔖" : "🔖"}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 leading-relaxed line-clamp-2">{uni.desc}</p>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                      <span className="text-gray-400">الرسوم/سنة</span>
                      <p className="font-bold text-gray-800">${uni.tuitionMin.toLocaleString()}+</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                      <span className="text-gray-400">التوظيف</span>
                      <p className="font-bold text-green-700">{uni.employRate}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                      <span className="text-gray-400">القبول</span>
                      <p className="font-bold text-gray-800">{uni.acceptance}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                      <span className="text-gray-400">المنح</span>
                      <p className="font-bold">{uni.scholarships ? "✅ متاح" : "❌ لا"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {uni.majors.slice(0, 3).map(m => (
                      <span key={m} className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{m}</span>
                    ))}
                    {uni.majors.length > 3 && <span className="text-xs text-gray-400">+{uni.majors.length - 3}</span>}
                  </div>

                  <div className="flex gap-2">
                    <a href={uni.url} target="_blank" rel="noopener noreferrer"
                      className="flex-1 text-center text-xs font-bold bg-blue-600 text-white py-2 rounded-xl hover:bg-blue-700 transition-colors">
                      الموقع الرسمي ↗
                    </a>
                    <button onClick={() => toggleCompare(uni.id)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border-2 transition-colors ${isComparing ? "border-orange-400 bg-orange-50 text-orange-700" : "border-gray-200 text-gray-500 hover:border-orange-300"}`}>
                      {isComparing ? "✓ قارن" : "+ قارن"}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Saved universities */}
        {savedUnis.length > 0 && (
          <div className="bg-white rounded-2xl border shadow-sm p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-extrabold text-gray-800">🔖 جامعاتي المحفوظة ({savedUnis.length})</h3>
              <button onClick={() => { setCompareList(savedUnis.slice(0, 3).map(u => u.id)); setShowCompare(true); }}
                className="text-xs font-bold text-blue-600 hover:underline">
                قارن جامعاتي المحفوظة ←
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedUnis.map(u => (
                <div key={u.id} className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-3 py-1.5">
                  <span className="text-xs font-bold text-blue-700">{u.short}</span>
                  <button onClick={() => toggleSaveUniversity(u.id)} className="text-blue-400 hover:text-red-500 text-xs">✕</button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
