"use client";
import { useState } from "react";
import Link from "next/link";

interface School {
  id: number;
  name: string;
  type: "ثانوي رسمي" | "ثانوي خاص" | "مهني رسمي" | "مهني خاص" | "تقني";
  region: string;
  city: string;
  tracks: string[];
  certs: string[];
  phone?: string;
  website?: string;
  featured?: boolean;
  emoji: string;
  desc: string;
}

const SCHOOLS: School[] = [
  { id:1,  name:"ثانوية الشهيد رفيق الحريري الرسمية", type:"ثانوي رسمي", region:"بيروت", city:"بيروت", emoji:"🏫", tracks:["علوم عامة","علوم الحياة","آداب وإنسانيات","اقتصاد وعلوم اجتماعية"], certs:["البكالوريا اللبنانية"], desc:"من أبرز الثانويات الرسمية في بيروت، تضم آلاف الطلاب وتقدم جميع مسارات البكالوريا.", featured:true },
  { id:2,  name:"ثانوية المتن الرسمية", type:"ثانوي رسمي", region:"جبل لبنان", city:"المتن", emoji:"🏫", tracks:["علوم عامة","علوم الحياة","آداب وإنسانيات"], certs:["البكالوريا اللبنانية"], desc:"ثانوية رسمية رائدة في منطقة المتن تتميز بمستوى أكاديمي متميز." },
  { id:3,  name:"ثانوية طرابلس الرسمية للبنين", type:"ثانوي رسمي", region:"الشمال", city:"طرابلس", emoji:"🏫", tracks:["علوم عامة","علوم الحياة","اقتصاد وعلوم اجتماعية"], certs:["البكالوريا اللبنانية"], desc:"أبرز الثانويات الرسمية في شمال لبنان بتاريخ تعليمي عريق." },
  { id:4,  name:"ثانوية صيدا الرسمية للبنات", type:"ثانوي رسمي", region:"الجنوب", city:"صيدا", emoji:"🏫", tracks:["علوم عامة","علوم الحياة","آداب وإنسانيات"], certs:["البكالوريا اللبنانية"], desc:"ثانوية رسمية متميزة في مدينة صيدا." },
  { id:5,  name:"ثانوية زحلة الرسمية المختلطة", type:"ثانوي رسمي", region:"البقاع", city:"زحلة", emoji:"🏫", tracks:["علوم عامة","علوم الحياة","اقتصاد وعلوم اجتماعية","آداب وإنسانيات"], certs:["البكالوريا اللبنانية"], desc:"ثانوية رسمية مرجعية في البقاع تخدم المنطقة بكاملها." },
  { id:6,  name:"الكلية العلمانية اللبنانية (LSC)", type:"ثانوي خاص", region:"بيروت", city:"رأس بيروت", emoji:"🎓", tracks:["البكالوريا الفرنسية","البكالوريا اللبنانية","IGCSE"], certs:["Baccalauréat Français","البكالوريا اللبنانية"], website:"lsc.edu.lb", featured:true, desc:"مدرسة فرانكوفونية عريقة تأسست 1909، تجمع بين البكالوريا الفرنسية واللبنانية." },
  { id:7,  name:"مدرسة الإيمان الإسلامية", type:"ثانوي خاص", region:"بيروت", city:"طريق الجديدة", emoji:"🎓", tracks:["علوم عامة","علوم الحياة","آداب وإنسانيات"], certs:["البكالوريا اللبنانية"], desc:"من أبرز المدارس الخاصة الإسلامية في بيروت." },
  { id:8,  name:"مدرسة الجمهور الثانوية (Lycée de Jounieh)", type:"ثانوي خاص", region:"جبل لبنان", city:"جونية", emoji:"🎓", tracks:["البكالوريا الفرنسية","البكالوريا اللبنانية"], certs:["Baccalauréat Français","البكالوريا اللبنانية"], desc:"ثانوية خاصة رائدة في كسروان تقدم البرنامج الفرنسي واللبناني." },
  { id:9,  name:"مدرسة راهبات العائلة المقدسة — المشرف", type:"ثانوي خاص", region:"الشمال", city:"طرابلس", emoji:"🎓", tracks:["علوم عامة","علوم الحياة","آداب وإنسانيات"], certs:["البكالوريا اللبنانية"], desc:"مدرسة كاثوليكية متميزة في طرابلس بمستوى أكاديمي عالٍ." },
  { id:10, name:"مدرسة الغسانية الثانوية", type:"ثانوي خاص", region:"الجنوب", city:"النبطية", emoji:"🎓", tracks:["علوم عامة","علوم الحياة","اقتصاد وعلوم اجتماعية"], certs:["البكالوريا اللبنانية"], desc:"من المدارس الخاصة الرائدة في الجنوب." },
  { id:11, name:"ثانوية الفنون والمهن الرسمية — برج حمود", type:"مهني رسمي", region:"بيروت", city:"برج حمود", emoji:"⚙️", tracks:["الميكانيك والكهرباء","النجارة والخشب","التبريد والتكييف","الحلاقة والتجميل"], certs:["شهادة مهنية وسطى","شهادة مهنية عليا (Bac Tech)"], featured:true, desc:"من أبرز المدارس المهنية الرسمية، تقدم تدريباً متميزاً في الحرف والمهن التقنية." },
  { id:12, name:"معهد الفنون والمهن — طرابلس (IFTG)", type:"مهني رسمي", region:"الشمال", city:"طرابلس", emoji:"⚙️", tracks:["الميكانيك الصناعي","الكهروميكانيك","إلكترونيات","الطباعة والنشر"], certs:["شهادة مهنية وسطى","Bac Tech"], desc:"معهد مهني حكومي رائد في الشمال يؤمّن تدريباً مهنياً وتقنياً متطوراً." },
  { id:13, name:"مركز التدريب المهني — النبطية", type:"مهني رسمي", region:"الجنوب", city:"النبطية", emoji:"⚙️", tracks:["الكهرباء العامة","السباكة","البناء والتشييد","الحلاقة"], certs:["شهادة مهنية وسطى"], desc:"مركز مهني تابع للدولة يخدم منطقة الجنوب وجبل عامل." },
  { id:14, name:"معهد الفنون والمهن — زحلة", type:"مهني رسمي", region:"البقاع", city:"زحلة", emoji:"⚙️", tracks:["الميكانيك والكهرباء","الخياطة والأزياء","الطهي والضيافة"], certs:["شهادة مهنية وسطى","Bac Tech"], desc:"معهد مهني متكامل يخدم منطقة البقاع بتخصصات متعددة." },
  { id:15, name:"مدرسة الصناعات اللبنانية (SIL)", type:"مهني خاص", region:"بيروت", city:"الكرنتينا", emoji:"🔧", tracks:["الميكانيك الصناعي","اللحام والحدادة","الكهرباء الصناعية","تقنية المعلومات"], certs:["Bac Tech","شهادة مهنية عليا"], featured:true, desc:"من أقدم وأعرق المدارس الصناعية في لبنان، تؤهل الطلاب لسوق العمل الصناعي." },
  { id:16, name:"مدرسة دون بوسكو المهنية", type:"مهني خاص", region:"بيروت", city:"بيروت", emoji:"🔧", tracks:["الميكانيك","الكهرباء والإلكترونيات","الطباعة","تقنية المعلومات"], certs:["Bac Tech","شهادة مهنية"], website:"donbosco.edu.lb", desc:"مدرسة مهنية كاثوليكية بخبرة طويلة في التعليم المهني والتقني." },
  { id:17, name:"مدرسة اللجنة الأمريكية للتعليم المهني (AMVETS)", type:"مهني خاص", region:"جبل لبنان", city:"بيت مري", emoji:"🔧", tracks:["النجارة والأثاث","البناء والمعمار","الكهرباء","الطهي"], certs:["شهادة مهنية","Bac Tech"], desc:"مدرسة مهنية متخصصة بالتعاون مع جمعيات دولية." },
  { id:18, name:"مركز التدريب المهني الإسلامي", type:"مهني خاص", region:"الشمال", city:"طرابلس", emoji:"🔧", tracks:["الخياطة والتطريز","الحلاقة والتجميل","الطهي","الكمبيوتر"], certs:["شهادة مهنية وسطى"], desc:"مركز تدريب مهني يخدم أبناء الشمال ويؤهلهم للعمل." },
  { id:19, name:"المعهد التقني الوطني اللبناني (LTI)", type:"تقني", region:"بيروت", city:"بيروت", emoji:"💡", tracks:["هندسة الحاسوب","الإلكترونيات والاتصالات","الميكانيك التطبيقي","إدارة الأعمال التقنية"], certs:["دبلوم تقني (TS)","Bac Tech"], website:"lti.edu.lb", featured:true, desc:"معهد تقني متقدم يمنح شهادات تقنية معترفاً بها دولياً في مجالات الهندسة والتكنولوجيا." },
  { id:20, name:"معهد الإدارة والأعمال التقني (AUST-T)", type:"تقني", region:"بيروت", city:"الأشرفية", emoji:"💡", tracks:["إدارة الأعمال","التسويق الرقمي","المحاسبة التطبيقية","السياحة والضيافة"], certs:["دبلوم تقني عالي (BTS)","Bac Tech"], desc:"معهد تقني في الأعمال والإدارة بمنهج حديث يواكب سوق العمل." },
  { id:21, name:"المعهد التقني للسياحة والفندقة", type:"تقني", region:"جبل لبنان", city:"جونية", emoji:"💡", tracks:["الطهي الاحترافي","إدارة الفنادق","الخدمات السياحية","إدارة المطاعم"], certs:["دبلوم في السياحة والضيافة","Bac Tech"], desc:"معهد متخصص في تأهيل الكوادر السياحية والفندقية في لبنان." },
  { id:22, name:"معهد الصحة والتمريض التقني", type:"تقني", region:"الجنوب", city:"صور", emoji:"💡", tracks:["التمريض التطبيقي","التقنيات الطبية المخبرية","العلاج الطبيعي المساعد"], certs:["دبلوم تقني طبي"], desc:"معهد تقني صحي يؤهل الكوادر الطبية المساعدة في جنوب لبنان." },
];

const TYPES   = ["الكل","ثانوي رسمي","ثانوي خاص","مهني رسمي","مهني خاص","تقني"];
const REGIONS = ["الكل","بيروت","جبل لبنان","الشمال","الجنوب","البقاع"];

const TYPE_COLORS: Record<string, string> = {
  "ثانوي رسمي": "bg-blue-50 text-blue-700",
  "ثانوي خاص":  "bg-indigo-50 text-indigo-700",
  "مهني رسمي":  "bg-orange-50 text-orange-700",
  "مهني خاص":   "bg-amber-50 text-amber-700",
  "تقني":       "bg-teal-50 text-teal-700",
};

export default function SchoolsPage() {
  const [type, setType]     = useState("الكل");
  const [region, setRegion] = useState("الكل");
  const [search, setSearch] = useState("");

  const filtered = SCHOOLS.filter(s =>
    (type   === "الكل" || s.type   === type) &&
    (region === "الكل" || s.region === region) &&
    (s.name.includes(search) || s.desc.includes(search) || s.city.includes(search))
  );

  const featured = SCHOOLS.filter(s => s.featured);

  return (
    <div className="min-h-screen bg-light" dir="rtl">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-primary font-extrabold text-lg">مسارك</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold">
            <Link href="/majors"       className="text-text-sub hover:text-primary">التخصصات</Link>
            <Link href="/universities" className="text-text-sub hover:text-primary">الجامعات</Link>
            <Link href="/schools"      className="text-primary border-b-2 border-primary pb-0.5">المدارس</Link>
            <Link href="/scholarships" className="text-text-sub hover:text-primary">المنح</Link>
            <Link href="/blog"         className="text-text-sub hover:text-primary">مقالات</Link>
          </nav>
          <Link href="/dashboard" className="text-text-sub text-sm hover:text-primary">← الداشبورد</Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-gradient-to-br from-[#1e3a5f] to-primary rounded-2xl p-6 md:p-10 mb-8 text-white">
          <div className="text-5xl mb-3">🏫</div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">المدارس والمعاهد المهنية</h1>
          <p className="text-white/80 text-lg">دليل شامل للثانويات والمعاهد المهنية والتقنية في لبنان</p>
          <div className="mt-5 max-w-lg">
            <input value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white/20 border-2 border-white/30 rounded-xl px-4 py-3 text-white placeholder:text-white/60 focus:outline-none focus:border-accent text-sm"
              placeholder="🔍 ابحث عن مدرسة أو مدينة..." />
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
          {[{n:"22+",l:"مؤسسة تعليمية"},{n:"5",l:"مناطق لبنانية"},{n:"40+",l:"تخصص متاح"},{n:"3",l:"أنواع شهادات"},{n:"مجاني",l:"المدارس الرسمية"}].map((s,i)=>(
            <div key={i} className="card text-center py-4">
              <div className="text-2xl font-extrabold text-primary">{s.n}</div>
              <div className="text-xs text-text-sub mt-1">{s.l}</div>
            </div>
          ))}
        </div>

        {!search && type === "الكل" && region === "الكل" && (
          <div className="mb-8">
            <h2 className="font-extrabold text-primary text-xl mb-4">⭐ مؤسسات بارزة</h2>
            <div className="grid md:grid-cols-3 gap-5">
              {featured.map(s => (
                <div key={s.id} className="card hover:shadow-xl transition-all hover:-translate-y-1 border-2 border-transparent hover:border-primary/20">
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl h-28 flex items-center justify-center text-5xl mb-4">{s.emoji}</div>
                  <span className={`badge text-xs mb-2 inline-block ${TYPE_COLORS[s.type]}`}>{s.type}</span>
                  <h3 className="font-extrabold text-primary text-sm leading-snug mb-1">{s.name}</h3>
                  <p className="text-xs text-text-sub mb-2">📍 {s.city}، {s.region}</p>
                  <p className="text-xs text-text-sub leading-relaxed line-clamp-2">{s.desc}</p>
                  <div className="mt-3 flex flex-wrap gap-1">
                    {s.certs.map(c=><span key={c} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c}</span>)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card mb-6 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <p className="text-xs text-text-sub mb-2 font-semibold">نوع المؤسسة</p>
              <div className="flex flex-wrap gap-2">
                {TYPES.map(t=>(
                  <button key={t} onClick={()=>setType(t)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 whitespace-nowrap transition-all ${type===t?"bg-primary text-white border-primary":"bg-white border-gray-200 text-text-sub hover:border-primary"}`}>{t}</button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <p className="text-xs text-text-sub mb-2 font-semibold">المنطقة</p>
              <div className="flex flex-wrap gap-2">
                {REGIONS.map(r=>(
                  <button key={r} onClick={()=>setRegion(r)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 whitespace-nowrap transition-all ${region===r?"bg-primary text-white border-primary":"bg-white border-gray-200 text-text-sub hover:border-primary"}`}>{r}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <p className="text-sm text-text-sub mb-4">يعرض <strong className="text-primary">{filtered.length}</strong> مؤسسة تعليمية</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(s => (
            <div key={s.id} className="card hover:shadow-lg transition-all hover:-translate-y-0.5 group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-primary/10 to-accent/10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{s.emoji}</div>
                <div className="flex-1 min-w-0">
                  <span className={`badge text-xs mb-1 inline-block ${TYPE_COLORS[s.type]}`}>{s.type}</span>
                  <h3 className="font-bold text-primary text-sm leading-snug group-hover:text-accent transition-colors">{s.name}</h3>
                  <p className="text-xs text-text-sub mt-0.5">📍 {s.city}، {s.region}</p>
                </div>
              </div>
              <p className="text-text-sub text-xs leading-relaxed mb-3 line-clamp-2">{s.desc}</p>
              <div className="mb-3">
                <p className="text-xs font-semibold text-primary mb-1.5">المسارات / التخصصات</p>
                <div className="flex flex-wrap gap-1">
                  {s.tracks.slice(0,3).map(t=><span key={t} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{t}</span>)}
                  {s.tracks.length>3&&<span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">+{s.tracks.length-3}</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {s.certs.map(c=><span key={c} className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">{c}</span>)}
              </div>
              {s.website&&<p className="text-xs text-accent mt-1">🌐 {s.website}</p>}
            </div>
          ))}
        </div>

        {filtered.length===0&&(
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-text-sub">لم يتم العثور على نتائج. جرب تعديل الفلاتر.</p>
          </div>
        )}

        <div className="card mt-10 bg-blue-50 border border-blue-100">
          <h3 className="font-extrabold text-primary text-lg mb-3">📋 معلومات مفيدة عن التعليم المهني في لبنان</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-text-sub">
            <div>
              <p className="font-semibold text-primary mb-1">🏫 التعليم الثانوي</p>
              <p>يمتد 3 سنوات بعد المتوسطة، ويؤدي إلى البكالوريا اللبنانية في مسارات: علوم عامة، علوم الحياة، آداب وإنسانيات، واقتصاد وعلوم اجتماعية.</p>
            </div>
            <div>
              <p className="font-semibold text-primary mb-1">⚙️ التعليم المهني والتقني</p>
              <p>يتيح الحصول على شهادة مهنية وسطى (3 سنوات) أو البكالوريا التقنية (Bac Tech) أو الدبلوم التقني العالي (BTS/TS).</p>
            </div>
            <div>
              <p className="font-semibold text-primary mb-1">💰 التكاليف</p>
              <p>المدارس الرسمية مجانية أو برسوم رمزية. المدارس الخاصة تتراوح من 2,000 إلى 15,000 دولار سنوياً حسب المدرسة والمنهج.</p>
            </div>
            <div>
              <p className="font-semibold text-primary mb-1">🎓 الانتقال للجامعة</p>
              <p>حاملو البكالوريا اللبنانية والتقنية يحق لهم التقدم لجميع الجامعات اللبنانية والعربية وبعض الجامعات الأجنبية.</p>
            </div>
          </div>
        </div>

        <div className="card mt-6 bg-gradient-to-r from-primary to-[#1e3a5f] text-white text-center py-8 rounded-2xl">
          <div className="text-4xl mb-3">🧭</div>
          <h3 className="font-extrabold text-xl mb-2">لا تعرف أي مسار يناسبك؟</h3>
          <p className="text-white/80 mb-5">اكتشف تخصصاتك المثالية عبر اختبار Career DNA المجاني</p>
          <Link href="/career-dna" className="bg-accent text-white font-bold px-8 py-3 rounded-xl hover:bg-accent/90 transition-colors inline-block">
            ابدأ اختبار Career DNA ←
          </Link>
        </div>
      </main>
    </div>
  );
                                                                                                                  }
