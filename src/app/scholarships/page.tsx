"use client";
import { useState } from "react";
import Link from "next/link";
import { useStudentContext } from "@/context/StudentContext";

interface Scholarship {
  id: string;
  name: string;
  org: string;
  amount: string;
  deadline: string;
  type: string;
  fields: string[];
  region: string;
  minGpa: number;
  desc: string;
  link: string;
  emoji: string;
  tag: string;
  tagColor: string;
}

const SCHOLARSHIPS: Scholarship[] = [
  { id:"aub-need", name:"منحة الحاجة المالية - AUB", org:"الجامعة الأمريكية في بيروت", amount:"حتى $28,000/سنة", deadline:"2026-02-01", type:"جامعية", fields:["كل التخصصات"], region:"بيروت", minGpa:75, desc:"تغطي كامل الرسوم الجامعية للطلاب المحتاجين.", link:"https://www.aub.edu.lb/registrar/Pages/financial-aid.aspx", emoji:"🏛️", tag:"مالية", tagColor:"blue" },
  { id:"lau-merit", name:"منحة التميز الأكاديمي - LAU", org:"الجامعة الأمريكية اللبنانية", amount:"حتى $22,000/سنة", deadline:"2026-03-15", type:"جامعية", fields:["هندسة","أعمال","علوم الحاسوب"], region:"بيروت", minGpa:85, desc:"للطلاب المتميزين أكاديمياً في التخصصات العلمية.", link:"https://www.lau.edu.lb/admissions/aid/", emoji:"🏆", tag:"تميز", tagColor:"yellow" },
  { id:"moe-lb", name:"منحة وزارة التربية اللبنانية", org:"وزارة التربية والتعليم العالي", amount:"$2,000/سنة", deadline:"2026-05-30", type:"حكومية", fields:["كل التخصصات"], region:"كل لبنان", minGpa:70, desc:"منح للطلاب اللبنانيين في الجامعات الوطنية.", link:"https://www.mehe.gov.lb", emoji:"🇱🇧", tag:"حكومية", tagColor:"green" },
  { id:"usaid-stem", name:"منحة USAID للعلوم والتكنولوجيا", org:"USAID Lebanon", amount:"$5,000", deadline:"2026-04-01", type:"دولية", fields:["هندسة","علوم الحاسوب","طب","رياضيات"], region:"كل لبنان", minGpa:80, desc:"دعم الطلاب اللبنانيين في مجالات STEM.", link:"https://www.usaid.gov/lebanon", emoji:"🌍", tag:"STEM", tagColor:"purple" },
  { id:"rfk-human", name:"منحة RFK لحقوق الإنسان", org:"Robert F. Kennedy Human Rights", amount:"$3,000", deadline:"2026-06-15", type:"دولية", fields:["قانون","علوم سياسية","حقوق الإنسان"], region:"كل لبنان", minGpa:75, desc:"للطلاب العاملين في مجال حقوق الإنسان.", link:"https://rfkhumanrights.org", emoji:"⚖️", tag:"حقوق", tagColor:"red" },
  { id:"arab-fund", name:"منحة الصندوق العربي للإنماء", org:"الصندوق العربي للإنماء الاقتصادي", amount:"$4,500/سنة", deadline:"2026-03-01", type:"عربية", fields:["اقتصاد","هندسة","علوم","أعمال"], region:"كل لبنان", minGpa:78, desc:"منح للطلاب العرب في مجالات التنمية.", link:"https://www.arabfund.org", emoji:"🌙", tag:"عربية", tagColor:"orange" },
  { id:"cedre-tech", name:"برنامج CEDRE للبحث العلمي", org:"Campus France / الحكومة الفرنسية", amount:"€6,000", deadline:"2026-09-30", type:"دولية", fields:["هندسة","علوم","بيئة","طب"], region:"كل لبنان", minGpa:82, desc:"تبادل علمي بين لبنان وفرنسا للبحث العلمي.", link:"https://www.campusfrance.org/fr/liban", emoji:"🇫🇷", tag:"فرنسية", tagColor:"blue" },
  { id:"ndu-art", name:"منحة الفنون والإبداع - NDU", org:"جامعة سيدة اللويزة", amount:"$8,000/سنة", deadline:"2026-02-28", type:"جامعية", fields:["فنون","معمار","تصميم","إعلام"], region:"جبل لبنان", minGpa:72, desc:"دعم الطلاب المبدعين في مجالات الفن والتصميم.", link:"https://www.ndu.edu.lb/admissions", emoji:"🎨", tag:"إبداع", tagColor:"pink" },
  { id:"wlf-women", name:"منحة تمكين المرأة", org:"Women's Leadership Foundation", amount:"$3,500", deadline:"2026-07-01", type:"دولية", fields:["كل التخصصات"], region:"كل لبنان", minGpa:70, desc:"حصرياً للطالبات اللبنانيات في كل التخصصات.", link:"https://www.wlf.org", emoji:"👩‍🎓", tag:"تمكين", tagColor:"purple" },
  { id:"bader-agri", name:"منحة بادر للزراعة والبيئة", org:"Bader Philanthropies", amount:"$2,500", deadline:"2026-08-15", type:"مؤسسية", fields:["زراعة","بيئة","تغذية","علوم الأرض"], region:"كل لبنان", minGpa:68, desc:"دعم الطلاب في مجالات الزراعة المستدامة.", link:"https://bader.org", emoji:"🌿", tag:"بيئة", tagColor:"green" },
  { id:"olam-biz", name:"منحة ريادة الأعمال - Olayan", org:"Olayan Charitable Trust", amount:"$5,000", deadline:"2026-04-30", type:"مؤسسية", fields:["أعمال","ريادة","تسويق","مالية"], region:"بيروت", minGpa:76, desc:"لدعم رواد الأعمال الشباب والطلاب في الأعمال.", link:"https://www.olayangroup.com", emoji:"💼", tag:"ريادة", tagColor:"yellow" },
  { id:"hariri-full", name:"مؤسسة رفيق الحريري - منحة كاملة", org:"مؤسسة رفيق الحريري", amount:"كاملة + معيشة", deadline:"2026-01-15", type:"لبنانية", fields:["طب","هندسة","أعمال","قانون","علوم سياسية"], region:"كل لبنان", minGpa:88, desc:"أرفع منحة لبنانية — تغطي كل شيء للمتميزين.", link:"https://www.hrf.org.lb", emoji:"⭐", tag:"مميزة", tagColor:"red" },
];

const TAG_COLORS: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700",
  yellow: "bg-yellow-100 text-yellow-700",
  green: "bg-green-100 text-green-700",
  purple: "bg-purple-100 text-purple-700",
  red: "bg-red-100 text-red-700",
  orange: "bg-orange-100 text-orange-700",
  pink: "bg-pink-100 text-pink-700",
};

function daysUntil(dateStr: string): number {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

export default function ScholarshipsPage() {
  const { profile, careerDNA, savedScholarships, toggleSaveScholarship } = useStudentContext();

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("الكل");
  const [showEligible, setShowEligible] = useState(false);
  const [sortBy, setSortBy] = useState<"deadline" | "amount" | "match">("deadline");

  const types = ["الكل", ...Array.from(new Set(SCHOLARSHIPS.map(s => s.type)))];

  function eligibilityScore(s: Scholarship): number {
    let score = 0;
    if (profile?.gpa && profile.gpa >= s.minGpa) score += 40;
    if (s.region === "كل لبنان" || s.region === profile?.region) score += 20;
    if (s.fields.includes("كل التخصصات")) score += 20;
    else if (careerDNA?.primaryPath && s.fields.some(f => careerDNA.primaryPath!.includes(f) || f.includes(careerDNA.primaryPath!.split(" ")[0]))) score += 20;
    if (profile?.interests?.some(i => s.fields.some(f => f.includes(i.split(" ")[0]) || i.includes(f)))) score += 20;
    return score;
  }

  function isEligible(s: Scholarship): boolean {
    if (!profile?.gpa) return true;
    return profile.gpa >= s.minGpa;
  }

  const filtered = SCHOLARSHIPS
    .filter(s =>
      (filterType === "الكل" || s.type === filterType) &&
      (!showEligible || isEligible(s)) &&
      (s.name.includes(search) || s.org.includes(search) || s.fields.some(f => f.includes(search)))
    )
    .sort((a, b) => {
      if (sortBy === "deadline") return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (sortBy === "match") return eligibilityScore(b) - eligibilityScore(a);
      return 0;
    });

  const savedList = SCHOLARSHIPS.filter(s => savedScholarships?.includes(s.id));

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-blue-600 font-extrabold text-lg">مسارك</span>
          </Link>
          <h1 className="font-extrabold text-gray-800">🎓 المنح الدراسية</h1>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600">← داشبورد</Link>
        </div>
      </header>

      {profile?.gpa && (
        <div className="bg-green-50 border-b border-green-100 py-2">
          <div className="max-w-5xl mx-auto px-4 text-xs text-green-700 font-semibold flex items-center gap-2 flex-wrap">
            <span>✅ ملفك مكتمل:</span>
            {profile.grade && <span className="bg-green-100 px-2 py-0.5 rounded-full">{profile.grade}</span>}
            {profile.gpa && <span className="bg-green-100 px-2 py-0.5 rounded-full">معدل {profile.gpa}%</span>}
            {profile.region && <span className="bg-green-100 px-2 py-0.5 rounded-full">{profile.region}</span>}
            {careerDNA?.primaryPath && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">🧬 {careerDNA.primaryPath}</span>}
            <span className="font-bold text-green-700 mr-auto">
              {SCHOLARSHIPS.filter(s => eligibilityScore(s) >= 60).length} منحة تناسبك
            </span>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-4 space-y-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ابحث عن منحة أو مؤسسة..."
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400"
          />
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex flex-wrap gap-1">
              {types.map(t => (
                <button key={t} onClick={() => setFilterType(t)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors ${filterType === t ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-500 hover:border-blue-300"}`}>
                  {t}
                </button>
              ))}
            </div>
            <div className="flex gap-1 mr-auto">
              <button onClick={() => setShowEligible(!showEligible)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors ${showEligible ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500 hover:border-green-300"}`}>
                {showEligible ? "✅ المنح المناسبة فقط" : "🎯 فلتر حسب معدلي"}
              </button>
            </div>
          </div>
          <div className="flex gap-1">
            <span className="text-xs text-gray-500 font-semibold self-center">ترتيب:</span>
            {([["deadline","الأقرب موعداً"],["match","الأنسب لي"]] as const).map(([v,l]) => (
              <button key={v} onClick={() => setSortBy(v)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-colors ${sortBy === v ? "border-purple-500 bg-purple-50 text-purple-700" : "border-gray-200 text-gray-500 hover:border-purple-300"}`}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Scholarships grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(s => {
            const days = daysUntil(s.deadline);
            const isSaved = savedScholarships?.includes(s.id);
            const score = eligibilityScore(s);
            const eligible = isEligible(s);
            return (
              <div key={s.id}
                className={`bg-white rounded-2xl border-2 shadow-sm hover:shadow-md transition-all ${isSaved ? "border-blue-300" : "border-gray-100"} ${score >= 80 ? "ring-2 ring-green-200" : ""}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{s.emoji}</span>
                      <div>
                        <p className="font-extrabold text-gray-800 text-sm leading-tight">{s.name}</p>
                        <p className="text-xs text-gray-400">{s.org}</p>
                      </div>
                    </div>
                    <button onClick={() => toggleSaveScholarship(s.id)}
                      className={`text-lg transition-transform hover:scale-125 ${isSaved ? "text-blue-500" : "text-gray-300 hover:text-blue-400"}`}>
                      {isSaved ? "🔖" : "🔖"}
                    </button>
                  </div>

                  <p className="text-xs text-gray-600 mb-3 leading-relaxed">{s.desc}</p>

                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                      <span className="text-gray-400">القيمة</span>
                      <p className="font-bold text-green-700">{s.amount}</p>
                    </div>
                    <div className={`rounded-lg px-2 py-1.5 ${days <= 30 ? "bg-red-50" : days <= 60 ? "bg-yellow-50" : "bg-gray-50"}`}>
                      <span className="text-gray-400">الموعد النهائي</span>
                      <p className={`font-bold ${days <= 30 ? "text-red-600" : days <= 60 ? "text-yellow-600" : "text-gray-700"}`}>
                        {days > 0 ? `${days} يوم` : "انتهى"} — {s.deadline}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                      <span className="text-gray-400">أدنى معدل</span>
                      <p className={`font-bold ${eligible ? "text-green-700" : "text-red-500"}`}>
                        {s.minGpa}% {eligible ? "✅" : "❌"}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg px-2 py-1.5">
                      <span className="text-gray-400">مطابقة</span>
                      <p className={`font-bold ${score >= 80 ? "text-green-700" : score >= 60 ? "text-blue-600" : "text-gray-500"}`}>
                        {score}%
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${TAG_COLORS[s.tagColor] || "bg-gray-100 text-gray-700"}`}>{s.tag}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-semibold">{s.type}</span>
                    {s.fields.slice(0,2).map(f => (
                      <span key={f} className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">{f}</span>
                    ))}
                  </div>

                  <a href={s.link} target="_blank" rel="noopener noreferrer"
                    className="block w-full text-center text-xs font-bold bg-blue-600 text-white py-2.5 rounded-xl hover:bg-blue-700 transition-colors">
                    تقدّم للمنحة ↗
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Saved scholarships */}
        {savedList.length > 0 && (
          <div className="bg-white rounded-2xl border shadow-sm p-4">
            <h3 className="font-extrabold text-gray-800 mb-3">🔖 منحي المحفوظة ({savedList.length})</h3>
            <div className="space-y-2">
              {savedList.map(s => {
                const days = daysUntil(s.deadline);
                return (
                  <div key={s.id} className="flex items-center justify-between bg-blue-50 rounded-xl px-3 py-2">
                    <div className="flex items-center gap-2">
                      <span>{s.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-gray-800">{s.name}</p>
                        <p className={`text-xs ${days <= 30 ? "text-red-600 font-bold" : "text-gray-500"}`}>
                          {days > 0 ? `باقي ${days} يوم` : "انتهى الموعد"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={s.link} target="_blank" rel="noopener noreferrer"
                        className="text-xs font-bold text-blue-600 hover:underline">تقدّم ↗</a>
                      <button onClick={() => toggleSaveScholarship(s.id)} className="text-gray-400 hover:text-red-500 text-xs">✕</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-500 font-semibold">لم نجد منحاً تطابق بحثك</p>
            <p className="text-gray-400 text-sm">جرّب تغيير الفلاتر أو ابحث بكلمات مختلفة</p>
          </div>
        )}
      </div>
    </div>
  );
}
