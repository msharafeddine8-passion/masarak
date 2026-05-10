// src/app/vocational/data.ts
// Shared vocational data — used by listing AND detail pages

export type VocationalTrack = {
  id: string;
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

export type Institute = {
  id: number;
  name: string;
  region: string;
  type: "رسمي" | "خاص" | "مهني";
  specialties: string[];
  website?: string;
  emoji: string;
};

export const TRACKS: VocationalTrack[] = [
  // ── الكهرباء والإلكترونيات ────────────────────────────────────────────────
  { id:"lt-elec",  code:"LT",  name:"لافته كهرباء عامة",          duration:"3 سنوات (بعد ص9)", level:"LT",     sector:"كهرباء",           desc:"تأهيل في تمديدات كهربائية، تركيب وصيانة الأجهزة المنزلية والصناعية.",                               subjects:["كهرباء تطبيقية","دوائر كهربائية","أتمتة أساسية","سلامة كهربائية"],          salaryLB:"800–1200$",  salaryGulf:"1500–3000$",  demand:"عالٍ جداً",  uniEquiv:"قبول مشروط في بعض برامج LAU/UL", emoji:"⚡" },
  { id:"bt-elec",  code:"BT",  name:"بكالوريا تقنية — كهرباء",    duration:"2 سنوات (بعد ص9)", level:"BT",     sector:"كهرباء",           desc:"تعمّق في الدوائر الكهربائية والتحكم والصيانة الصناعية.",                                             subjects:["إلكترونيات تطبيقية","أتمتة صناعية","برمجة PLC","قياسات"],                    salaryLB:"1000–1800$", salaryGulf:"2000–4000$",  demand:"عالٍ جداً",  uniEquiv:"قبول في برامج هندسة UL وLAU", emoji:"🔌" },
  { id:"ts-elec",  code:"TS",  name:"تقني سامٍ — إلكترونيات",      duration:"2 سنوات (بعد BT)",level:"TS",     sector:"كهرباء",           desc:"الدرجة التقنية العليا في مجال الإلكترونيات والبرمجيات المضمّنة.",                                      subjects:["ميكروكونترولر","برمجة C++","أنظمة تضمين","اتصالات"],                         salaryLB:"1500–2500$", salaryGulf:"3000–6000$",  demand:"عالٍ جداً",  uniEquiv:"معادلة سنة جامعية أولى", emoji:"💻" },
  // ── ميكانيك ──────────────────────────────────────────────────────────────
  { id:"lt-mec",   code:"LT",  name:"لافته ميكانيك السيارات",      duration:"3 سنوات",          level:"LT",     sector:"ميكانيك",          desc:"صيانة وإصلاح السيارات، قراءة رسومات هندسية، تشخيص الأعطال.",                                          subjects:["محركات احتراق","ناقل الحركة","فرامل","تشخيص إلكتروني"],                      salaryLB:"700–1200$",  salaryGulf:"1500–2800$",  demand:"عالٍ",       uniEquiv:undefined, emoji:"🔧" },
  { id:"bt-mec",   code:"BT",  name:"بكالوريا تقنية — ميكانيك صناعي",duration:"2 سنوات",       level:"BT",     sector:"ميكانيك",          desc:"تقنيات التصنيع الصناعي، مخاريط CNC، الضخ والهيدروليك.",                                               subjects:["CNC","هيدروليك","ميكانيك طاقة","رسم تقني"],                                  salaryLB:"1000–1800$", salaryGulf:"2000–3500$",  demand:"عالٍ",       uniEquiv:"معادلة UL كلية هندسة", emoji:"⚙️" },
  // ── بناء وتشييد ──────────────────────────────────────────────────────────
  { id:"bt-civil", code:"BT",  name:"بكالوريا تقنية — بناء",        duration:"2 سنوات",         level:"BT",     sector:"بناء وعمارة",      desc:"تقنيات البناء والخرسانة، الأعمال المدنية، إشراف ميداني.",                                               subjects:["ميكانيك بناء","خرسانة مسلحة","مساحة","رسم هندسي"],                          salaryLB:"900–1600$",  salaryGulf:"2000–4000$",  demand:"عالٍ",       uniEquiv:"قبول جزئي UL هندسة مدنية", emoji:"🏗️" },
  { id:"ts-civil", code:"TS",  name:"تقني سامٍ — هندسة مدنية",      duration:"2 سنوات (بعد BT)",level:"TS",     sector:"بناء وعمارة",      desc:"الإشراف الكامل على المشاريع الإنشائية، إدارة الموقع والتصميم.",                                         subjects:["تصميم هيكلي","إدارة مشاريع","AutoCAD","تشييد متقدم"],                        salaryLB:"1500–2500$", salaryGulf:"3000–5500$",  demand:"عالٍ جداً",  uniEquiv:"معادلة سنة أولى NDU/UOB", emoji:"🏛️" },
  // ── تكنولوجيا المعلومات ───────────────────────────────────────────────────
  { id:"bt-it",    code:"BT",  name:"بكالوريا تقنية — معلوماتية",   duration:"2 سنوات",         level:"BT",     sector:"تكنولوجيا المعلومات",desc:"برمجة، تطوير مواقع، شبكات كمبيوتر، قواعد بيانات.",                                                  subjects:["Python","Java","شبكات","SQL","HTML/CSS"],                                    salaryLB:"1000–2000$", salaryGulf:"2500–5000$",  demand:"عالٍ جداً",  uniEquiv:"قبول LAU/LIU علوم حاسوب", emoji:"💻" },
  { id:"ts-it",    code:"TS",  name:"تقني سامٍ — علوم الحاسوب",     duration:"2 سنوات (بعد BT)",level:"TS",     sector:"تكنولوجيا المعلومات",desc:"تطوير برمجيات متقدمة، أمن المعلومات، ذكاء اصطناعي.",                                                 subjects:["Web Dev","Cybersecurity","AI أساسيات","DevOps","Cloud"],                     salaryLB:"1500–3000$", salaryGulf:"3500–7000$",  demand:"عالٍ جداً",  uniEquiv:"معادلة سنتين AUB/LAU", emoji:"🖥️" },
  // ── تمريض وصحة ───────────────────────────────────────────────────────────
  { id:"bt-nurs",  code:"BT",  name:"بكالوريا تقنية — مساعد تمريض", duration:"2 سنوات",        level:"BT",     sector:"صحة وطب",          desc:"رعاية المرضى، تطبيق الحقن والعلاجات، دعم الفرق الطبية.",                                               subjects:["تشريح","تمريض طبي","رعاية مرضى","أخلاقيات طبية"],                           salaryLB:"600–1200$",  salaryGulf:"1500–3000$",  demand:"عالٍ جداً",  uniEquiv:"قبول مشروط كليات تمريض", emoji:"🏥" },
  { id:"ts-nurs",  code:"TS",  name:"تقني سامٍ — تمريض",            duration:"3 سنوات",         level:"TS",     sector:"صحة وطب",          desc:"ممرض مؤهل يعمل في المشافي والعيادات، تخطيط رعاية صحية.",                                               subjects:["تمريض طبي-جراحي","أطفال","توليد","طوارئ","إدارة"],                          salaryLB:"1200–2000$", salaryGulf:"2500–5000$",  demand:"عالٍ جداً",  uniEquiv:"معادلة AUB/LAU تمريض", emoji:"💉" },
  // ── فندقة وسياحة ──────────────────────────────────────────────────────────
  { id:"bt-hotel", code:"BT",  name:"بكالوريا تقنية — فندقة",       duration:"2 سنوات",         level:"BT",     sector:"فندقة وسياحة",     desc:"إدارة الفنادق، الطهي الاحترافي، خدمة الضيوف.",                                                         subjects:["إدارة فندقية","طهي فرنسي","خدمة عملاء","محاسبة فندقية"],                    salaryLB:"700–1500$",  salaryGulf:"1500–3500$",  demand:"متوسط",      uniEquiv:"قبول كليات فندقة", emoji:"🏨" },
  // ── محاسبة وأعمال ─────────────────────────────────────────────────────────
  { id:"ts-biz",   code:"TS",  name:"تقني سامٍ — محاسبة وإدارة",    duration:"2 سنوات (بعد BT)",level:"TS",     sector:"أعمال ومال",       desc:"محاسبة متقدمة، إدارة مالية، مراجعة حسابات.",                                                           subjects:["محاسبة مالية","ضرائب","Excel/ERP","إدارة مشاريع"],                           salaryLB:"1000–2000$", salaryGulf:"2000–4500$",  demand:"عالٍ",       uniEquiv:"معادلة سنة ESA/AUB أعمال", emoji:"📊" },
  // ── تصميم وفنون ───────────────────────────────────────────────────────────
  { id:"ts-design",code:"TS",  name:"تقني سامٍ — تصميم غرافيكي",    duration:"2 سنوات",         level:"TS",     sector:"إعلام وتصميم",     desc:"تصميم الجرافيك، هوية بصرية، تصوير، ونشر رقمي.",                                                        subjects:["Photoshop","Illustrator","InDesign","Branding","Motion"],                    salaryLB:"800–1800$",  salaryGulf:"1500–3500$",  demand:"متوسط",      uniEquiv:"قبول ALBA/USEK فنون", emoji:"🎨" },
];

export const INSTITUTES: Institute[] = [
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

export function getTrackById(id: string): VocationalTrack | undefined {
  return TRACKS.find((t) => t.id === id);
}

export function getInstituteById(id: number): Institute | undefined {
  return INSTITUTES.find((i) => i.id === id);
}
