// src/app/schools/data.ts
// Shared schools data — used by listing AND detail pages

export type School = {
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

export const SCHOOLS: School[] = [
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
  // ─── مدارس دولية بارزة إضافية ─────────────────────────────────────────────
  { id:26, name:"Lebanese American University School",   region:"بيروت", area:"بيروت",      type:"دولية",   curriculum:["American","AP"],        lang:"إنجليزي",      feesMin:7000, feesMax:12000, grades:"KG-12", founded:2000, students:900,  rating:5, features:["AP","SAT","Model UN","STEM"],              desc:"مدرسة LAU النموذجية بمنهج أمريكي متكامل.",     emoji:"🎓", color:"from-red-700 to-red-900" },
  { id:27, name:"Brummana High School",                  region:"جبل لبنان",area:"برمانا",    type:"خاصة",    curriculum:["IB","لبناني"],          lang:"إنجليزي/عربي", feesMin:5000, feesMax:9500,  grades:"KG-12", founded:1876, students:1100, rating:5, features:["IB Diploma","كوياكر","تعليم سلام","فنون"],  desc:"مدرسة كوياكر عريقة، رائدة بالـIB في لبنان.",   emoji:"🌿", color:"from-emerald-600 to-emerald-800" },
  { id:28, name:"Hariri High School — Saida",            region:"الجنوب", area:"صيدا",       type:"خاصة",    curriculum:["لبناني"],               lang:"عربي/إنجليزي", feesMin:1500, feesMax:3500,  grades:"KG-12", founded:1994, students:2000, rating:4, features:["تكنولوجيا","منح","مختبرات حديثة"],         desc:"من مدارس مؤسسة الحريري في الجنوب.",            emoji:"🌺", color:"from-blue-500 to-blue-700" },
  { id:29, name:"Deir El Ahmar School (LT)",             region:"البقاع", area:"دير الأحمر", type:"مهنية",   curriculum:["LT تقني"],              lang:"عربي",         feesMin:500,  feesMax:2000,  grades:"7-12",  founded:1972, students:600,  rating:3, features:["تعليم تقني","مهن يدوية","لحام","كهرباء"], desc:"مدرسة تقنية مهنية في البقاع الشمالي.",         emoji:"🔧", color:"from-orange-500 to-orange-700" },
  { id:30, name:"مدرسة الكفاءة التقنية — بيروت",        region:"بيروت", area:"الكرنتينا",   type:"مهنية",   curriculum:["BT تقني","TS"],         lang:"عربي/فرنسي",   feesMin:1000, feesMax:3000,  grades:"10-14", founded:1980, students:800,  rating:4, features:["BT/TS","كهرباء","ميكانيك","تكنولوجيا"],   desc:"مدرسة تقنية متخصصة في الكرنتينا.",            emoji:"⚙️", color:"from-gray-500 to-gray-700" },
];

export function getSchoolById(id: number): School | undefined {
  return SCHOOLS.find((s) => s.id === id);
}
