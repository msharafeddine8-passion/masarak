"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Major = {
  id: number;
  name: string;
  category: string;
  emoji: string;
  years: number;
  lang: string;
  salaryMin: number;
  salaryMax: number;
  salaryGulfMin: number;
  salaryGulfMax: number;
  demandLB: "عالٍ جداً" | "عالٍ" | "متوسط" | "منخفض";
  demandGulf: "عالٍ جداً" | "عالٍ" | "متوسط" | "منخفض";
  difficulty: 1 | 2 | 3 | 4 | 5;
  careers: string[];
  desc: string;
  riasec: string;
  universities: string[];
  roadmap: string[];
  certifications?: string[];
  skills: string[];
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const MAJORS: Major[] = [
  // ── الطب والصحة ─────────────────────────────────────────────────────────────
  { id:1,  name:"طب بشري",          category:"الطب والصحة",           emoji:"🩺", years:6,  lang:"إنجليزي",       salaryMin:2000, salaryMax:8000,  salaryGulfMin:5000,  salaryGulfMax:15000, demandLB:"عالٍ جداً", demandGulf:"عالٍ جداً", difficulty:5, careers:["طبيب عام","طبيب متخصص","باحث طبي","طب طوارئ"],  desc:"أعرق التخصصات وأكثرها مكانةً. 6 سنوات دراسة + امتياز + تخصص. طلب لا ينتهي في لبنان والعالم.", riasec:"IS", universities:["AUB","LAU","USJ","UOB"],  roadmap:["العلوم الطبيعية (ص10-12)","BAC علوم","MCAT/Entrance Exam","طب عام (6 سنوات)","امتياز (سنة)","تخصص (3-7 سنوات)"], certifications:["USMLE","نقابة الأطباء","Board Certification"], skills:["تشريح","فيزيولوجيا","تشخيص سريري","بحث طبي","تواصل مع المرضى"] },
  { id:2,  name:"صيدلة",             category:"الطب والصحة",           emoji:"💊", years:5,  lang:"إنجليزي/فرنسي", salaryMin:1200, salaryMax:4000,  salaryGulfMin:2500,  salaryGulfMax:7000,  demandLB:"عالٍ",      demandGulf:"عالٍ جداً", difficulty:4, careers:["صيدلاني","باحث دوائي","مدير صيدلية","صيدلاني سريري"], desc:"علم الدواء وتأثيراته — طلب كبير في لبنان والخليج. فرص عمل في المستشفيات والشركات الدوائية الكبرى.", riasec:"IC", universities:["AUB","USJ","LAU","LIU"],  roadmap:["علوم (ص10-12)","BAC علوم","Pharmacy Entrance","5 سنوات صيدلة","تدريب سريري","PharmD اختياري"], certifications:["نقابة الصيادلة","PharmD"], skills:["كيمياء عضوية","بيوكيمياء","فارماكولوجيا","تفاعل الأدوية"] },
  { id:3,  name:"تمريض",             category:"الطب والصحة",           emoji:"🏥", years:4,  lang:"إنجليزي",       salaryMin:800,  salaryMax:3000,  salaryGulfMin:2000,  salaryGulfMax:5000,  demandLB:"عالٍ جداً", demandGulf:"عالٍ جداً", difficulty:3, careers:["ممرض","مشرف تمريض","ممرض ICU","مدير صحي"],       desc:"الطلب يتضاعف سنوياً — أعلى معدلات التوظيف. كندا وألمانيا والخليج يستقبلون ممرضين لبنانيين.", riasec:"SI", universities:["AUB","LAU","LIU","BAU"],  roadmap:["BAC علوم","Nursing Entrance","4 سنوات تمريض","تدريب مستشفى","NCLEX للهجرة"], certifications:["NCLEX-RN","BSN"], skills:["رعاية مرضى","إسعافات أولية","تواصل","تحمل ضغط"] },
  { id:4,  name:"طب أسنان",          category:"الطب والصحة",           emoji:"🦷", years:5,  lang:"إنجليزي/فرنسي", salaryMin:1500, salaryMax:6000,  salaryGulfMin:4000,  salaryGulfMax:10000, demandLB:"عالٍ",      demandGulf:"عالٍ",      difficulty:4, careers:["طبيب أسنان","جراح فك","أستاذ جامعي"],             desc:"تخصص يتيح العمل الحر المستقل. عيادات خاصة تبدأ أرباحها بسرعة.", riasec:"IR", universities:["USJ","LAU","BAU","LIU"],  roadmap:["علوم (ص10-12)","BAC علوم","Dentistry Entrance","5 سنوات دراسة","امتياز"],  certifications:["نقابة أطباء الأسنان"], skills:["دقة يدوية","تشريح الفك","تواصل مع المرضى"] },
  // ── الهندسة والتكنولوجيا ────────────────────────────────────────────────────
  { id:5,  name:"هندسة الحاسوب",     category:"الهندسة والتكنولوجيا", emoji:"💻", years:4,  lang:"إنجليزي",       salaryMin:1500, salaryMax:6000,  salaryGulfMin:3500,  salaryGulfMax:10000, demandLB:"عالٍ جداً", demandGulf:"عالٍ جداً", difficulty:4, careers:["مطور برمجيات","مهندس AI","مدير تقني","Cloud Engineer"], desc:"تخصص المستقبل — طلب هائل محلياً وعالمياً. الشركات التقنية تنافس على خريجي AUB وLAU.", riasec:"IR", universities:["AUB","LAU","AUT","LIU"],  roadmap:["رياضيات وفيزياء قوية","SAT/Entrance Exam","4 سنوات هندسة","تدريب صيفي","مشاريع GitHub","وظيفة أو ماستر"], certifications:["AWS Certified","Google Cloud","Microsoft Azure","Cisco CCNA"], skills:["Python","C++","Data Structures","System Design","SQL"] },
  { id:6,  name:"علوم الحاسوب",      category:"الهندسة والتكنولوجيا", emoji:"🖥️", years:4,  lang:"إنجليزي",       salaryMin:1500, salaryMax:6000,  salaryGulfMin:3000,  salaryGulfMax:9000,  demandLB:"عالٍ جداً", demandGulf:"عالٍ جداً", difficulty:4, careers:["مطور ويب","مهندس بيانات","خبير أمن","DevOps"],     desc:"أساس تخصصات التقنية — أكثر مرونة من الهندسة. تعلّم برمجة، AI، أمن معلومات.", riasec:"IC", universities:["AUB","LAU","AUT","LIU"],  roadmap:["رياضيات قوية","CS Entrance","4 سنوات CS","مشاريع عملية","شهادات احترافية"], certifications:["CompTIA Security+","AWS Solutions Architect","Google Data Analytics"], skills:["Python","JavaScript","Algorithms","Machine Learning","DevOps"] },
  { id:7,  name:"هندسة مدنية",       category:"الهندسة والتكنولوجيا", emoji:"🏗️", years:5,  lang:"إنجليزي/فرنسي", salaryMin:1200, salaryMax:4500,  salaryGulfMin:3000,  salaryGulfMax:8000,  demandLB:"متوسط",     demandGulf:"عالٍ جداً", difficulty:4, careers:["مهندس إنشاءات","مخطط مدن","مقاول","مشرف ميداني"],  desc:"البنية التحتية والمشاريع الكبرى. الخليج يبني ويحتاج مهندسين. نيوم وإكسبو دبي فتحا الطريق.", riasec:"RI", universities:["AUB","USJ","LAU","UOB"],  roadmap:["رياضيات وفيزياء","BAC","5 سنوات هندسة مدنية","PMP أو تخصص إنشائي","وظيفة خليج"], certifications:["PMP","PE License","LEED Green Associate"], skills:["AutoCAD","SAP2000","إدارة مشاريع","رسم هندسي","تحليل إنشائي"] },
  { id:8,  name:"هندسة كهربائية",    category:"الهندسة والتكنولوجيا", emoji:"⚡", years:5,  lang:"إنجليزي",       salaryMin:1200, salaryMax:5000,  salaryGulfMin:3000,  salaryGulfMax:9000,  demandLB:"عالٍ",      demandGulf:"عالٍ جداً", difficulty:4, careers:["مهندس طاقة","مهندس اتصالات","مهندس تحكم","Energy Consultant"], desc:"من الطاقة المتجددة للشبكات الذكية. الإمارات والسعودية تضخ مليارات في الطاقة الخضراء.", riasec:"RI", universities:["AUB","LAU","AUT","BAU"],  roadmap:["رياضيات وفيزياء","Entrance Exam","5 سنوات EE","تخصص طاقة/اتصالات","وظيفة"], certifications:["PE","PMP","Certified Energy Auditor"], skills:["MATLAB","SCADA","PLC","Circuit Analysis","Renewable Energy"] },
  { id:9,  name:"هندسة معمارية",     category:"الهندسة والتكنولوجيا", emoji:"🏛️", years:5,  lang:"إنجليزي/فرنسي", salaryMin:1000, salaryMax:4000,  salaryGulfMin:2500,  salaryGulfMax:7000,  demandLB:"متوسط",     demandGulf:"عالٍ",      difficulty:4, careers:["مهندس معماري","مصمم داخلي","مخطط عمراني","BIM Specialist"], desc:"الجمع بين الفن والعلم. لبنان مشهور عالمياً بمعمارييه — ALBA وAUB من أقوى البرامج.", riasec:"AR", universities:["AUB","USJ","ALBA","NDU"],  roadmap:["موهبة فنية وتقنية","Portfolio للقبول","5 سنوات عمارة","تدريب مكتب","Licensure"], certifications:["LEED AP","Autodesk Certified","BIM Professional"], skills:["AutoCAD","Revit","SketchUp","Rhino","Adobe CC","تصميم مستدام"] },
  // ── الأعمال والإدارة ────────────────────────────────────────────────────────
  { id:10, name:"إدارة أعمال",       category:"الأعمال والإدارة",      emoji:"💼", years:4,  lang:"إنجليزي/عربي",  salaryMin:800,  salaryMax:4000,  salaryGulfMin:2000,  salaryGulfMax:8000,  demandLB:"عالٍ",      demandGulf:"عالٍ جداً", difficulty:2, careers:["مدير تنفيذي","رائد أعمال","مستشار","مدير عمليات"],  desc:"أكثر التخصصات مرونةً. ESA وAUB تفتحان أبواب الشركات الكبرى.", riasec:"EC", universities:["AUB","LAU","ESA","LIU"],  roadmap:["BAC أي فرع","Entrance Exam","4 سنوات BBA","MBA بعد 5 سنوات عمل","Executive Track"], certifications:["PMP","MBA","CFA Level 1","Six Sigma"], skills:["Financial Analysis","PowerPoint","Excel","Leadership","Business Strategy"] },
  { id:11, name:"محاسبة وتمويل",     category:"الأعمال والإدارة",      emoji:"📊", years:4,  lang:"إنجليزي",       salaryMin:900,  salaryMax:4500,  salaryGulfMin:2500,  salaryGulfMax:8000,  demandLB:"عالٍ",      demandGulf:"عالٍ جداً", difficulty:3, careers:["محاسب قانوني CPA","محلل مالي","CFO","مراجع Big 4"], desc:"كل شركة تحتاج محاسباً — استقرار وظيفي عالٍ. Big 4 يوظفون كثيراً من خريجي لبنان.", riasec:"CE", universities:["AUB","LAU","LIU","BAU"],  roadmap:["رياضيات قوية","4 سنوات Accounting","CPA Exam","5 سنوات خبرة","ترقي لـCFO"], certifications:["CPA","CMA","CFA","ACCA"], skills:["Excel/Power BI","QuickBooks","IFRS","Financial Modeling","Audit"] },
  { id:12, name:"تسويق رقمي",        category:"الأعمال والإدارة",      emoji:"📱", years:4,  lang:"إنجليزي",       salaryMin:800,  salaryMax:3500,  salaryGulfMin:2000,  salaryGulfMax:6000,  demandLB:"عالٍ جداً", demandGulf:"عالٍ جداً", difficulty:2, careers:["مدير تسويق","خبير SEO/SEM","Growth Hacker","Brand Manager"], desc:"أسرع التخصصات نمواً في العصر الرقمي. كل شركة تحتاج Digital Marketer.", riasec:"EA", universities:["LAU","AUB","LIU","NDU"],  roadmap:["BAC أي فرع","4 سنوات Marketing","Google/Meta Certs","Portfolio مشاريع","Agency أو Brand"], certifications:["Google Ads","Meta Blueprint","HubSpot Marketing","SEMrush"], skills:["Google Analytics","Social Media","Content Strategy","SEO/SEM","Canva/Adobe"] },
  // ── الحقوق والعلوم السياسية ─────────────────────────────────────────────────
  { id:13, name:"حقوق",              category:"الحقوق والعلوم السياسية", emoji:"⚖️", years:4,  lang:"فرنسي/عربي",   salaryMin:1000, salaryMax:5000,  salaryGulfMin:2500,  salaryGulfMax:9000,  demandLB:"متوسط",     demandGulf:"متوسط",     difficulty:3, careers:["محامٍ","قاضٍ","مستشار قانوني","Corporate Lawyer"],  desc:"مهنة مرموقة تتطلب حدة التفكير. إمكانية الوصول لمراكز قيادية في الشركات والدولة.", riasec:"ES", universities:["USJ","LAU","AUB","UL"],   roadmap:["BAC","Entrance Exam","4 سنوات حقوق","امتحان نقابة المحامين","محاماة/قضاء"], certifications:["نقابة المحامين","LLM للتخصص"], skills:["كتابة قانونية","بحث قانوني","تفاوض","إقناع","تحليل نصوص"] },
  { id:14, name:"علوم سياسية",       category:"الحقوق والعلوم السياسية", emoji:"🌍", years:4,  lang:"إنجليزي/فرنسي", salaryMin:900,  salaryMax:4000,  salaryGulfMin:2000,  salaryGulfMax:6000,  demandLB:"متوسط",     demandGulf:"متوسط",     difficulty:2, careers:["دبلوماسي","محلل سياسي","UN Officer","صحفي دولي"],  desc:"فهم العالم وديناميكياته. ممتاز للعمل في المنظمات الدولية والسفارات.", riasec:"IS", universities:["AUB","LAU","USJ","NDU"],  roadmap:["BAC","4 سنوات Pol Science","Master in IR أو Diplomacy","Internship أممي","مسار دبلوماسي"], certifications:["UN Courses","IELTS/TOEFL"], skills:["تحليل سياسي","كتابة تقارير","دبلوماسية","لغات أجنبية","بحث"] },
  // ── الإعلام والفنون ─────────────────────────────────────────────────────────
  { id:15, name:"إعلام وصحافة",      category:"الإعلام والفنون",        emoji:"📰", years:4,  lang:"عربي/إنجليزي",  salaryMin:700,  salaryMax:3000,  salaryGulfMin:1800,  salaryGulfMax:5000,  demandLB:"متوسط",     demandGulf:"متوسط",     difficulty:2, careers:["صحفي","مذيع","مدير تحرير","Social Media Manager"], desc:"لبنان مركز إعلامي عربي رائد. الإعلام الرقمي والبودكاست فتحا فرصاً لا تعد.", riasec:"AE", universities:["LAU","AUB","USJ","NDU"],  roadmap:["BAC","4 سنوات صحافة","تدريب محطة/صحيفة","بناء Portfolio","Digital Media"], certifications:["Google Journalism","Reuters Journalism"], skills:["كتابة صحفية","تصوير","مونتاج","Adobe Premiere","SEO للمحتوى"] },
  { id:16, name:"تصميم غرافيكي",     category:"الإعلام والفنون",        emoji:"🎨", years:4,  lang:"إنجليزي",       salaryMin:700,  salaryMax:3500,  salaryGulfMin:2000,  salaryGulfMax:6000,  demandLB:"عالٍ",      demandGulf:"عالٍ",      difficulty:3, careers:["مصمم جرافيك","مصمم UX/UI","Motion Designer","Brand Identity"], desc:"إبداع بصري لا حدود له. الطلب متصاعد مع نمو الشركات الرقمية.", riasec:"AR", universities:["ALBA","LAU","NDU","USEK"],  roadmap:["Portfolio إبداعي","4 سنوات تصميم","Adobe CC احترافي","مشاريع حقيقية","Studio/Freelance"], certifications:["Adobe Certified","Google UX Design","Figma Professional"], skills:["Adobe Photoshop","Illustrator","Figma","Motion Graphics","Typography"] },
  // ── التربية ─────────────────────────────────────────────────────────────────
  { id:17, name:"تربية وتعليم",      category:"التربية",                emoji:"📚", years:4,  lang:"عربي/فرنسي",    salaryMin:600,  salaryMax:2500,  salaryGulfMin:1800,  salaryGulfMax:4000,  demandLB:"متوسط",     demandGulf:"عالٍ",      difficulty:2, careers:["معلم","مرشد تربوي","مدير مدرسة","Curriculum Developer"], desc:"من أنبل المهن. المدارس الدولية في الخليج تدفع رواتب مرتفعة للمعلمين المؤهلين.", riasec:"SA", universities:["LAU","LIU","NDU","UL"],   roadmap:["BAC","4 سنوات تربية","تدريب ميداني","شهادة تعليم دولية","IB/Cambridge"], certifications:["CELTA","IB Certificate","Cambridge CELTA"], skills:["إدارة صف","تخطيط دروس","تواصل","تكنولوجيا تعليمية","لغات"] },
  { id:18, name:"علم نفس",           category:"التربية",                emoji:"🧠", years:4,  lang:"إنجليزي/فرنسي", salaryMin:800,  salaryMax:3500,  salaryGulfMin:2000,  salaryGulfMax:5000,  demandLB:"عالٍ",      demandGulf:"عالٍ",      difficulty:3, careers:["معالج نفسي","مستشار HR","خبير تطوير","Psychologist"], desc:"الطلب يتزايد بشكل حاد. الاهتمام بالصحة النفسية ارتفع كثيراً.", riasec:"SI", universities:["USJ","LAU","AUB","NDU"],  roadmap:["BAC","4 سنوات علم نفس","Master إكلينيكي","تدريب سريري","ترخيص مزاولة"], certifications:["Board Certified Psychologist","CBT Certificate"], skills:["تقييم نفسي","علاج معرفي سلوكي","إحصاء","تواصل","بحث"] },
  // ── العلوم ──────────────────────────────────────────────────────────────────
  { id:19, name:"علوم بيئية",        category:"العلوم",                 emoji:"🌿", years:4,  lang:"إنجليزي",       salaryMin:900,  salaryMax:3500,  salaryGulfMin:2000,  salaryGulfMax:5000,  demandLB:"متوسط",     demandGulf:"عالٍ",      difficulty:3, careers:["خبير بيئي","مستشار طاقة متجددة","ESG Analyst","UN Expert"], desc:"مستقبل الكوكب. الإمارات والسعودية تضخ مليارات في الاستدامة والطاقة الخضراء.", riasec:"IR", universities:["AUB","LAU","UOB","NDU"],  roadmap:["علوم ورياضيات","4 سنوات بيئية","Master في Sustainability","شهادات بيئية","UN/NGO/Private Sector"], certifications:["LEED Green Associate","ISO 14001","ESG Analyst"], skills:["GIS/Remote Sensing","تقييم أثر بيئي","تحليل بيانات","Carbon Accounting"] },
  { id:20, name:"رياضيات وإحصاء",   category:"العلوم",                 emoji:"📐", years:4,  lang:"إنجليزي",       salaryMin:1000, salaryMax:5000,  salaryGulfMin:2500,  salaryGulfMax:8000,  demandLB:"متوسط",     demandGulf:"عالٍ جداً", difficulty:5, careers:["Data Scientist","Actuary","Quant Analyst","AI Researcher"], desc:"أساس الذكاء الاصطناعي وعلم البيانات. الشركات التقنية تدفع أعلى الرواتب لعلماء البيانات.", riasec:"IC", universities:["AUB","LAU","LIU","UL"],   roadmap:["رياضيات استثنائية","4 سنوات رياضيات","Master in Data Science/Stats","تدريب تقني","وظيفة FAANG"], certifications:["Google Data Analytics","Tableau Certified","Azure Data Scientist"], skills:["Python/R","Machine Learning","Statistics","Linear Algebra","Data Visualization"] },
];

const CATEGORIES = ["الكل", ...Array.from(new Set(MAJORS.map(m => m.category)))];

const DEMAND_COLORS = {
  "عالٍ جداً": { badge:"bg-green-100 text-green-700 border-green-300",  bar:"bg-green-500",  pct:100 },
  "عالٍ":      { badge:"bg-blue-100 text-blue-700 border-blue-300",    bar:"bg-blue-500",   pct:75  },
  "متوسط":     { badge:"bg-amber-100 text-amber-700 border-amber-300", bar:"bg-amber-400",  pct:50  },
  "منخفض":     { badge:"bg-gray-100 text-gray-600 border-gray-300",    bar:"bg-gray-400",   pct:25  },
};

function DifficultyDots({ n }: { n: number }) {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(i => (
        <div key={i} className={`w-2 h-2 rounded-full ${i <= n ? "bg-orange-500" : "bg-gray-200"}`} />
      ))}
    </div>
  );
}

export default function MajorsPage() {
  const [search, setSearch]   = useState("");
  const [cat, setCat]         = useState("الكل");
  const [sortBy, setSortBy]   = useState<"demand"|"salary"|"years">("demand");
  const [marketView, setMarketView] = useState<"lb"|"gulf">("lb");
  const [expanded, setExpanded] = useState<number|null>(null);
  const [activeTab, setActiveTab] = useState<"overview"|"roadmap"|"skills">("overview");

  const filtered = useMemo(() => {
    let list = MAJORS.filter(m =>
      (cat === "الكل" || m.category === cat) &&
      (!search || m.name.includes(search) || m.category.includes(search) || m.careers.some(c => c.includes(search)))
    );
    if (sortBy === "salary") list = [...list].sort((a, b) =>
      (marketView === "gulf" ? b.salaryGulfMax - a.salaryGulfMax : b.salaryMax - a.salaryMax));
    else if (sortBy === "years") list = [...list].sort((a, b) => a.years - b.years);
    else list = [...list].sort((a, b) => {
      const order: Record<string, number> = { "عالٍ جداً":4, "عالٍ":3, "متوسط":2, "منخفض":1 };
      const demandA = marketView === "gulf" ? a.demandGulf : a.demandLB;
      const demandB = marketView === "gulf" ? b.demandGulf : b.demandLB;
      return order[demandB] - order[demandA];
    });
    return list;
  }, [search, cat, sortBy, marketView]);

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
            <Link href="/majors" className="text-blue-600 font-bold">التخصصات</Link>
            <Link href="/scholarships" className="hover:text-blue-600">المنح</Link>
            <Link href="/careers" className="hover:text-blue-600">المسارات</Link>
          </nav>
          <Link href="/dashboard" className="bg-blue-600 text-white rounded-xl font-bold text-sm px-4 py-2">داشبورد</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 mb-8 text-white">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-bold mb-4">
                📚 دليل التخصصات الجامعية
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">اكتشف تخصصك المثالي</h1>
              <p className="text-blue-100 text-lg max-w-xl">
                {MAJORS.length} تخصص مع بيانات الطلب والرواتب ومسارات التطور — في لبنان والخليج
              </p>
            </div>
            <div className="text-6xl opacity-80">🎓</div>
          </div>

          {/* Market Toggle */}
          <div className="mt-6 flex gap-1 bg-white/20 rounded-xl p-1 w-fit">
            <button onClick={() => setMarketView("lb")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${marketView === "lb" ? "bg-white text-blue-700" : "text-white/80 hover:text-white"}`}>
              🇱🇧 سوق لبنان
            </button>
            <button onClick={() => setMarketView("gulf")}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${marketView === "gulf" ? "bg-white text-blue-700" : "text-white/80 hover:text-white"}`}>
              🌍 سوق الخليج
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-wrap gap-3 items-end mb-4">
            <div className="flex-1 min-w-56">
              <label className="text-xs font-bold text-gray-500 block mb-1">🔍 بحث</label>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="ابحث بالتخصص أو المسار المهني..."
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 block mb-1">الترتيب</label>
              <div className="flex gap-1">
                {[["demand","الطلب"],["salary","الراتب"],["years","المدة"]].map(([v,l]) => (
                  <button key={v} onClick={() => setSortBy(v as "demand"|"salary"|"years")}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${sortBy === v ? "bg-purple-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${cat === c ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-4"><strong>{filtered.length}</strong> تخصص</p>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(m => {
            const demand = marketView === "gulf" ? m.demandGulf : m.demandLB;
            const salMin = marketView === "gulf" ? m.salaryGulfMin : m.salaryMin;
            const salMax = marketView === "gulf" ? m.salaryGulfMax : m.salaryMax;
            const dc = DEMAND_COLORS[demand];
            const isExp = expanded === m.id;

            return (
              <div key={m.id} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${isExp ? "border-blue-400 ring-2 ring-blue-100" : "border-gray-100"}`}>
                <div className="p-5">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-4xl">{m.emoji}</span>
                      <div>
                        <h3 className="font-extrabold text-gray-800 leading-tight">{m.name}</h3>
                        <p className="text-xs text-gray-400 mt-0.5">{m.category} · {m.years} سنوات · {m.lang}</p>
                      </div>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${dc.badge}`}>{demand}</span>
                  </div>

                  <p className="text-xs text-gray-500 leading-relaxed mb-3">{m.desc}</p>

                  {/* Demand Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400 font-medium">الطلب في السوق</span>
                      <span className="font-bold text-gray-600">{demand}</span>
                    </div>
                    <div className="bg-gray-100 rounded-full h-2">
                      <div className={`${dc.bar} rounded-full h-2 transition-all`} style={{ width: `${dc.pct}%` }} />
                    </div>
                  </div>

                  {/* Salary */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-3 mb-3 flex items-center justify-between">
                    <span className="text-xs text-gray-500">{marketView === "gulf" ? "🌍 راتب الخليج" : "🇱🇧 راتب لبنان"}</span>
                    <span className="font-extrabold text-green-700 text-sm">${salMin.toLocaleString()}–${salMax.toLocaleString()}</span>
                  </div>

                  {/* Difficulty + Universities */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">الصعوبة:</span>
                      <DifficultyDots n={m.difficulty} />
                    </div>
                    <div className="flex gap-1 flex-wrap">
                      {m.universities.slice(0,3).map(u => (
                        <span key={u} className="text-[10px] bg-blue-50 text-blue-600 font-bold px-1.5 py-0.5 rounded">{u}</span>
                      ))}
                    </div>
                  </div>

                  {/* Careers */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {m.careers.slice(0,3).map(c => (
                      <span key={c} className="text-[11px] bg-gray-50 text-gray-600 font-medium px-2 py-0.5 rounded-full border border-gray-200">{c}</span>
                    ))}
                  </div>

                  {/* Expand Button */}
                  <button onClick={() => { setExpanded(isExp ? null : m.id); setActiveTab("overview"); }}
                    className={`w-full text-xs font-bold py-2 rounded-xl transition-colors ${isExp ? "bg-blue-600 text-white" : "bg-gray-50 text-gray-600 hover:bg-blue-50 hover:text-blue-600"}`}>
                    {isExp ? "▲ إخفاء" : "▼ تفاصيل + خارطة الطريق"}
                  </button>

                  {/* Expanded Detail */}
                  {isExp && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex gap-1 mb-4">
                        {(["overview","roadmap","skills"] as const).map(tab => (
                          <button key={tab} onClick={() => setActiveTab(tab)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold transition-colors ${activeTab === tab ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                            {tab === "overview" ? "نظرة عامة" : tab === "roadmap" ? "🗺️ الخارطة" : "🛠️ المهارات"}
                          </button>
                        ))}
                      </div>

                      {activeTab === "overview" && (
                        <div className="space-y-3">
                          <div>
                            <p className="text-xs font-bold text-gray-600 mb-1.5">🎯 كل المسارات المهنية:</p>
                            <div className="flex flex-wrap gap-1">
                              {m.careers.map(c => (
                                <span key={c} className="text-xs bg-blue-50 text-blue-700 font-semibold px-2.5 py-1 rounded-full">{c}</span>
                              ))}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div className="bg-gray-50 rounded-xl p-3">
                              <span className="text-gray-400 block mb-1">🇱🇧 لبنان</span>
                              <span className="font-bold text-green-700">${m.salaryMin.toLocaleString()}–${m.salaryMax.toLocaleString()}</span>
                            </div>
                            <div className="bg-amber-50 rounded-xl p-3">
                              <span className="text-gray-400 block mb-1">🌍 الخليج</span>
                              <span className="font-bold text-amber-700">${m.salaryGulfMin.toLocaleString()}–${m.salaryGulfMax.toLocaleString()}</span>
                            </div>
                          </div>
                          {m.certifications && (
                            <div>
                              <p className="text-xs font-bold text-gray-600 mb-1.5">📜 شهادات احترافية:</p>
                              <div className="flex flex-wrap gap-1">
                                {m.certifications.map(c => (
                                  <span key={c} className="text-xs bg-purple-50 text-purple-700 font-semibold px-2.5 py-1 rounded-full border border-purple-200">{c}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === "roadmap" && (
                        <div>
                          <p className="text-xs font-bold text-gray-600 mb-3">خارطة طريق النجاح في {m.name}:</p>
                          <div className="space-y-2">
                            {m.roadmap.map((step, i) => (
                              <div key={i} className="flex items-start gap-3">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i+1}</div>
                                <div className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700">{step}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {activeTab === "skills" && (
                        <div>
                          <p className="text-xs font-bold text-gray-600 mb-2">المهارات التي ستكتسبها:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {m.skills.map(s => (
                              <span key={s} className="text-xs bg-orange-50 text-orange-700 font-semibold px-2.5 py-1 rounded-full border border-orange-200">{s}</span>
                            ))}
                          </div>
                          <div className="mt-4 bg-blue-50 rounded-xl p-3 text-xs">
                            <span className="font-bold text-blue-700">🧬 RIASEC: </span>
                            <span className="text-blue-600">هذا التخصص يناسب شخصية {m.riasec} — </span>
                            <Link href="/career-dna" className="text-blue-700 font-bold underline">اختبر Career DNA →</Link>
                          </div>
                        </div>
                      )}

                      <div className="mt-4 flex gap-2">
                        <Link href="/universities" className="flex-1 text-center text-xs font-bold py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                          الجامعات المقبولة →
                        </Link>
                        <Link href="/scholarships" className="flex-1 text-center text-xs font-bold py-2 rounded-xl bg-amber-500 text-white hover:bg-amber-600">
                          منح لهذا التخصص →
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-blue-600 to-purple-700 rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-extrabold mb-3">🧬 لا تعرف أي التخصصات يناسبك؟</h2>
          <p className="text-blue-100 mb-6">اختبار Career DNA يحدد شخصيتك المهنية ويقترح التخصصات المثالية لك</p>
          <Link href="/career-dna"
            className="bg-white text-blue-700 font-extrabold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg">
            ابدأ الاختبار مجاناً ←
          </Link>
        </div>
      </main>
    </div>
  );
}
