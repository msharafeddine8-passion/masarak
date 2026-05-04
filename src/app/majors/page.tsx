"use client";
import { useState } from "react";
import Link from "next/link";

const MAJORS = [
  // الطب والصحة
  { id:1,  name:"طب بشري",                    category:"الطب والصحة",      emoji:"🩺", years:6,  lang:"إنجليزي",       salaryMin:2000, salaryMax:8000,  demand:"عالي جداً",  careers:["طبيب عام","طبيب متخصص","باحث طبي"],         desc:"دراسة العلوم الطبية وتشخيص وعلاج الأمراض. من أعرق التخصصات وأكثرها مكانةً.",       riasec:"IS", universities:["AUB","LAU","USJ","USEK"] },
  { id:2,  name:"صيدلة",                       category:"الطب والصحة",      emoji:"💊", years:5,  lang:"إنجليزي/فرنسي", salaryMin:1200, salaryMax:4000,  demand:"عالي",        careers:["صيدلاني","باحث دوائي","مدير صيدلية"],        desc:"علم تحضير الأدوية وتأثيرها على جسم الإنسان. طلب مرتفع في لبنان والخليج.",           riasec:"IC", universities:["AUB","USJ","LAU","USEK"] },
  { id:3,  name:"تمريض",                       category:"الطب والصحة",      emoji:"🏥", years:4,  lang:"إنجليزي",       salaryMin:800,  salaryMax:3000,  demand:"عالي جداً",  careers:["ممرض","مشرف تمريض","مدير صحي"],              desc:"رعاية المرضى وتقديم الدعم الطبي. فرص واسعة في لبنان والمهجر.",                      riasec:"SI", universities:["AUB","LAU","LIU","BAU"] },
  { id:4,  name:"طب أسنان",                    category:"الطب والصحة",      emoji:"🦷", years:5,  lang:"إنجليزي/فرنسي", salaryMin:1500, salaryMax:6000,  demand:"عالي",        careers:["طبيب أسنان","جراح فك","أستاذ جامعي"],        desc:"تخصص رفيع المستوى مع إمكانية العمل الحر والمستقل.",                                  riasec:"IR", universities:["USJ","LAU","BAU","USEK"] },
  // الهندسة والتكنولوجيا
  { id:5,  name:"هندسة الحاسوب",               category:"الهندسة والتكنولوجيا", emoji:"💻", years:4, lang:"إنجليزي",      salaryMin:1500, salaryMax:6000,  demand:"عالي جداً",  careers:["مطور برمجيات","مهندس AI","مدير تقني"],       desc:"تخصص المستقبل. يجمع البرمجة والهندسة والذكاء الاصطناعي.",                           riasec:"IR", universities:["AUB","LAU","AUT","LIU"] },
  { id:6,  name:"هندسة مدنية",                 category:"الهندسة والتكنولوجيا", emoji:"🏗️", years:5, lang:"إنجليزي/فرنسي",salaryMin:1200, salaryMax:4500,  demand:"متوسط",       careers:["مهندس إنشاءات","مخطط مدن","مقاول"],          desc:"تصميم وبناء المنشآت والبنية التحتية. طلب مستمر في لبنان وأفريقيا.",                  riasec:"RI", universities:["AUB","USJ","LAU","UOB"] },
  { id:7,  name:"هندسة كهربائية",              category:"الهندسة والتكنولوجيا", emoji:"⚡", years:5, lang:"إنجليزي",       salaryMin:1200, salaryMax:5000,  demand:"عالي",        careers:["مهندس طاقة","مهندس اتصالات","باحث"],         desc:"من الطاقة المتجددة للشبكات الذكية — مستقبل واعد جداً.",                              riasec:"RI", universities:["AUB","LAU","AUT","BAU"] },
  { id:8,  name:"هندسة معمارية",               category:"الهندسة والتكنولوجيا", emoji:"🏛️", years:5, lang:"إنجليزي/فرنسي",salaryMin:1000, salaryMax:4000,  demand:"متوسط",       careers:["مهندس معماري","مصمم داخلي","مخطط عمراني"],   desc:"الجمع بين الفن والعلم في تصميم الفضاءات. لبنان مشهور بمعمارييه.",                   riasec:"AR", universities:["AUB","USJ","ALBA","NDU"] },
  { id:9,  name:"علوم الحاسوب",                category:"الهندسة والتكنولوجيا", emoji:"🖥️", years:4, lang:"إنجليزي",       salaryMin:1500, salaryMax:6000,  demand:"عالي جداً",  careers:["مطور ويب","مهندس بيانات","خبير أمن"],        desc:"أساس تخصصات التقنية — من الخوارزميات للذكاء الاصطناعي.",                            riasec:"IC", universities:["AUB","LAU","AUT","LIU"] },
  // الأعمال والإدارة
  { id:10, name:"إدارة أعمال",                 category:"الأعمال والإدارة",  emoji:"💼", years:4,  lang:"إنجليزي/عربي",  salaryMin:800,  salaryMax:4000,  demand:"عالي",        careers:["مدير تنفيذي","رائد أعمال","مستشار"],          desc:"تعلّم إدارة المنظمات والشركات في بيئة أعمال عالمية متغيرة.",                        riasec:"EC", universities:["AUB","LAU","ESA","LIU"] },
  { id:11, name:"محاسبة وتمويل",               category:"الأعمال والإدارة",  emoji:"📊", years:4,  lang:"إنجليزي/عربي",  salaryMin:900,  salaryMax:4500,  demand:"عالي",        careers:["محاسب قانوني","محلل مالي","مدير مالي"],       desc:"ركيزة كل مؤسسة. شهادات CPA وCFA تفتح أبواب العالم.",                                riasec:"CE", universities:["AUB","LAU","LIU","BAU"] },
  { id:12, name:"تسويق رقمي",                  category:"الأعمال والإدارة",  emoji:"📱", years:4,  lang:"إنجليزي",       salaryMin:800,  salaryMax:3500,  demand:"عالي جداً",  careers:["مدير تسويق","خبير SEO","محلل بيانات"],        desc:"أسرع التخصصات نمواً في العصر الرقمي. الإبداع والبيانات معاً.",                      riasec:"EA", universities:["LAU","AUB","LIU","NDU"] },
  // الحقوق والعلوم السياسية
  { id:13, name:"حقوق",                        category:"الحقوق والعلوم السياسية", emoji:"⚖️", years:4, lang:"فرنسي/عربي", salaryMin:1000, salaryMax:5000,  demand:"متوسط",       careers:["محامي","قاضي","مستشار قانوني"],               desc:"فهم القانون والدفاع عن الحقوق. مهنة مرموقة تتطلب حدة التفكير.",                     riasec:"ES", universities:["USJ","LAU","AUB","UL"] },
  { id:14, name:"علوم سياسية وعلاقات دولية",  category:"الحقوق والعلوم السياسية", emoji:"🌍", years:4, lang:"إنجليزي/فرنسي",salaryMin:900,  salaryMax:4000,  demand:"متوسط",       careers:["دبلوماسي","محلل سياسي","صحفي دولي"],          desc:"فهم العالم وديناميكياته السياسية. ممتاز للعمل في المنظمات الدولية.",                 riasec:"IS", universities:["AUB","LAU","USJ","NDU"] },
  // الإعلام والفنون
  { id:15, name:"إعلام وصحافة",                category:"الإعلام والفنون",   emoji:"📰", years:4,  lang:"عربي/إنجليزي",  salaryMin:700,  salaryMax:3000,  demand:"متوسط",       careers:["صحفي","مذيع","مدير تحرير"],                   desc:"صوت المجتمع والحقيقة. لبنان مركز إعلامي عربي رائد.",                                riasec:"AE", universities:["LAU","AUB","USJ","NDU"] },
  { id:16, name:"تصميم غرافيك",                category:"الإعلام والفنون",   emoji:"🎨", years:4,  lang:"إنجليزي",       salaryMin:700,  salaryMax:3500,  demand:"عالي",        careers:["مصمم جرافيك","مدير فني","مصمم UX/UI"],        desc:"إبداع بصري لا حدود له. الطلب متزايد في العصر الرقمي.",                              riasec:"AR", universities:["ALBA","LAU","NDU","USEK"] },
  { id:17, name:"سينما وإنتاج مرئي",           category:"الإعلام والفنون",   emoji:"🎬", years:4,  lang:"عربي/إنجليزي",  salaryMin:700,  salaryMax:4000,  demand:"متوسط",       careers:["مخرج","منتج","محرر مرئي"],                    desc:"لبنان له تاريخ سينمائي فريد. منصات البث تفتح آفاقاً جديدة.",                        riasec:"AE", universities:["ALBA","LAU","NDU","USJ"] },
  // التربية
  { id:18, name:"تربية وتعليم",                category:"التربية",           emoji:"📚", years:4,  lang:"عربي/فرنسي",    salaryMin:600,  salaryMax:2500,  demand:"متوسط",       careers:["معلم","مرشد تربوي","مدير مدرسة"],             desc:"من أنبل المهن. بناء الأجيال ونقل المعرفة.",                                          riasec:"SA", universities:["LAU","LIU","NDU","UL"] },
  { id:19, name:"علم نفس",                     category:"التربية",           emoji:"🧠", years:4,  lang:"إنجليزي/فرنسي", salaryMin:800,  salaryMax:3500,  demand:"عالي",        careers:["معالج نفسي","مستشار","باحث"],                  desc:"فهم السلوك الإنساني. الطلب يتزايد بعد الأحداث الاجتماعية.",                         riasec:"SI", universities:["USJ","LAU","AUB","NDU"] },
  // العلوم
  { id:20, name:"علوم بيئية",                  category:"العلوم",            emoji:"🌿", years:4,  lang:"إنجليزي",       salaryMin:900,  salaryMax:3500,  demand:"متوسط",       careers:["خبير بيئي","باحث مناخي","مستشار طاقة"],       desc:"مستقبل الكوكب في يد هؤلاء. قطاع الطاقة المتجددة ينتظركم.",                          riasec:"IR", universities:["AUB","LAU","UOB","NDU"] },
];

const CATEGORIES = ["الكل", ...Array.from(new Set(MAJORS.map(m => m.category)))];
const DEMAND_COLORS: Record<string, string> = {
  "عالي جداً": "bg-green-100 text-green-700",
  "عالي":       "bg-blue-100 text-blue-700",
  "متوسط":      "bg-amber-100 text-amber-700",
};

export default function MajorsPage() {
  const [search, setSearch]   = useState("");
  const [cat, setCat]         = useState("الكل");
  const [expanded, setExpanded] = useState<number|null>(null);

  const filtered = MAJORS.filter(m =>
    (cat === "الكل" || m.category === cat) &&
    (m.name.includes(search) || m.category.includes(search))
  );

  return (
    <div className="min-h-screen bg-light">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">مسارك</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href="/majors" className="text-primary border-b-2 border-primary pb-0.5">التخصصات</Link>
            <Link href="/universities" className="text-text-sub hover:text-primary">الجامعات</Link>
            <Link href="/scholarships" className="text-text-sub hover:text-primary">المنح</Link>
            <Link href="/blog" className="text-text-sub hover:text-primary">مقالات</Link>
            <Link href="/tools" className="text-text-sub hover:text-primary">أدوات مهنية</Link>
          </nav>
          <Link href="/dashboard" className="text-text-sub text-sm hover:text-primary">← الداشبورد</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">

        {/* Hero */}
        <div className="bg-gradient-to-br from-primary to-[#1e4080] rounded-2xl p-6 md:p-10 mb-8 text-white text-center">
          <div className="text-5xl mb-3">📚</div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">التخصصات الجامعية</h1>
          <p className="text-white/80 text-lg mb-6">اكتشف التخصصات المتاحة، متطلبات القبول، آفاق العمل، والرواتب المتوقعة</p>
          <div className="flex flex-wrap justify-center gap-4">
            {[["📖", MAJORS.length+"", "تخصص"], ["💰","$600–$8,000","رواتب شهرية"], ["🏛️","15+","جامعة معتمدة"], ["🎯","4 سنوات","متوسط المدة"]].map(([e,v,l]) => (
              <div key={l} className="bg-white/15 rounded-xl px-5 py-3 text-center">
                <div className="text-xl mb-0.5">{e}</div>
                <div className="font-extrabold text-accent text-lg">{v}</div>
                <div className="text-white/70 text-xs">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="flex-1 border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-primary focus:outline-none"
              placeholder="🔍 ابحث عن تخصص..." />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 whitespace-nowrap transition-all ${
                  cat === c ? "bg-primary text-white border-primary" : "bg-white border-gray-200 text-text-sub hover:border-primary"
                }`}>{c}</button>
            ))}
          </div>
        </div>

        <p className="text-sm text-text-sub mb-4">يعرض <strong className="text-primary">{filtered.length}</strong> تخصص</p>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(m => (
            <div key={m.id}
              className="card hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer border-2 border-transparent hover:border-primary/20"
              onClick={() => setExpanded(expanded === m.id ? null : m.id)}>

              {/* Top */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-14 h-14 bg-gradient-to-br from-primary to-[#1e4080] rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                  {m.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-primary text-base leading-snug">{m.name}</h3>
                  <div className="flex flex-wrap gap-1 mt-1">
                    <span className="badge bg-primary/10 text-primary text-xs">{m.category}</span>
                    <span className={`badge text-xs ${DEMAND_COLORS[m.demand]}`}>🔥 {m.demand}</span>
                  </div>
                </div>
              </div>

              <p className="text-text-sub text-sm leading-relaxed mb-4 line-clamp-2">{m.desc}</p>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="bg-gray-50 rounded-xl p-2 text-center">
                  <div className="font-extrabold text-primary text-sm">{m.years} سنوات</div>
                  <div className="text-text-sub text-xs">المدة</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 text-center">
                  <div className="font-extrabold text-green-600 text-xs">${m.salaryMin.toLocaleString()}+</div>
                  <div className="text-text-sub text-xs">راتب/شهر</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-2 text-center">
                  <div className="font-extrabold text-primary text-xs">{m.lang}</div>
                  <div className="text-text-sub text-xs">اللغة</div>
                </div>
              </div>

              {/* Expanded */}
              {expanded === m.id && (
                <div className="border-t border-gray-100 pt-4 mt-1 space-y-3">
                  <div>
                    <p className="text-xs font-bold text-primary mb-2">🎯 المسارات الوظيفية:</p>
                    <div className="flex flex-wrap gap-1">
                      {m.careers.map(c => <span key={c} className="badge bg-accent/10 text-accent text-xs">{c}</span>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-primary mb-2">🏛️ الجامعات التي تقدمه:</p>
                    <div className="flex flex-wrap gap-1">
                      {m.universities.map(u => <span key={u} className="badge bg-blue-50 text-blue-700 text-xs font-bold">{u}</span>)}
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-green-700 mb-1">💰 نطاق الراتب الشهري</p>
                    <p className="text-green-800 font-extrabold">${m.salaryMin.toLocaleString()} – ${m.salaryMax.toLocaleString()}</p>
                  </div>
                  <Link href="/career-dna"
                    className="btn-primary text-xs py-2 rounded-xl text-center block"
                    onClick={e => e.stopPropagation()}>
                    🧬 هل يناسبني هذا التخصص؟ — اعمل Career DNA
                  </Link>
                </div>
              )}

              <div className="flex justify-end mt-2">
                <span className="text-text-sub text-xs">{expanded === m.id ? "أقل ↑" : "تفاصيل ↓"}</span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="card mt-10 bg-gradient-to-r from-primary/5 to-accent/5 border-2 border-primary/10 text-center py-10">
          <h3 className="font-extrabold text-primary text-2xl mb-2">مش عارف أي تخصص يناسبك؟</h3>
          <p className="text-text-sub mb-6">اختبار Career DNA يكشف لك تخصصاتك المثالية في 10 دقائق</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/career-dna" className="btn-primary px-8 py-3 rounded-xl text-base">🧬 ابدأ Career DNA مجاناً</Link>
            <Link href="/universities" className="border-2 border-primary text-primary font-bold px-8 py-3 rounded-xl hover:bg-light transition-colors">🏛️ استكشف الجامعات</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
