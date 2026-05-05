export interface University {
  id: number;
  slug: string;
  name: string;
  nameEn: string;
  abbr: string;
  region: string;
  type: string;
  rank: string;
  rankNum: number;
  tuition: string;
  lang: string;
  url: string;
  desc: string;
  programs: string[];
  established?: string;
  students?: string;
  emoji: string;
  color: string;
}

export const UNIVERSITIES: University[] = [
  { id:1,  slug:"aub",   name:"الجامعة الأمريكية في بيروت – AUB",         nameEn:"American University of Beirut",           abbr:"AUB",   region:"بيروت",          type:"خاصة",   rank:"⭐⭐⭐⭐⭐",rankNum:5, tuition:"16,000–22,000$", lang:"إنجليزي",        url:"https://www.aub.edu.lb",       established:"1866", students:"10,000+",  emoji:"🏛️", color:"#007A53", desc:"أعرق جامعة في لبنان والشرق الأوسط، تأسست 1866. تقدّم برامج بكالوريوس وماجستير ودكتوراه في كل التخصصات.", programs:["الطب والصحة","الهندسة والمعمار","إدارة الأعمال","العلوم والرياضيات","الآداب والفنون","القانون والعلوم السياسية","التربية","الصحة العامة"] },
  { id:2,  slug:"lau",   name:"الجامعة اللبنانية الأمريكية – LAU",         nameEn:"Lebanese American University",            abbr:"LAU",   region:"بيروت وبيبلوس", type:"خاصة",   rank:"⭐⭐⭐⭐⭐",rankNum:5, tuition:"12,000–18,000$", lang:"إنجليزي",        url:"https://www.lau.edu.lb",       established:"1924", students:"9,000+",   emoji:"🎓", color:"#C8102E", desc:"جامعة مرموقة بحرمين في بيروت وبيبلوس، متميزة في الأعمال والهندسة والصحة والعلوم الإنسانية.", programs:["الهندسة والتكنولوجيا","إدارة الأعمال","العلوم الطبية","الإعلام والاتصال","علوم الكمبيوتر","الصيدلة","الحقوق","الآداب"] },
  { id:3,  slug:"usj",   name:"جامعة القديس يوسف – USJ",                   nameEn:"Université Saint-Joseph",                 abbr:"USJ",   region:"بيروت وفروع",   type:"خاصة",   rank:"⭐⭐⭐⭐⭐",rankNum:5, tuition:"4,000–10,000$",  lang:"فرنسي/عربي",    url:"https://www.usj.edu.lb",       established:"1875", students:"11,000+",  emoji:"⚜️", color:"#003087", desc:"جامعة يسوعية تأسست 1875، رائدة في الطب والقانون والعلوم السياسية والآداب بالمنهج الفرنسي.", programs:["الطب والعلوم الصحية","القانون","العلوم السياسية","الآداب والإنسانيات","الهندسة","الصيدلة","طب الأسنان","الإعلام"] },
  { id:4,  slug:"ul",    name:"الجامعة اللبنانية – UL",                    nameEn:"Lebanese University",                     abbr:"UL",    region:"كل لبنان",      type:"حكومية", rank:"⭐⭐⭐⭐", rankNum:4, tuition:"مجانية/رمزية",   lang:"عربي/فرنسي",    url:"https://www.ul.edu.lb",        established:"1951", students:"80,000+",  emoji:"🇱🇧", color:"#CC0000", desc:"الجامعة الوطنية الحكومية الوحيدة، تضم أكثر من 80,000 طالب في فروع منتشرة في كل المناطق.", programs:["الحقوق","الهندسة","الآداب","العلوم","الطب","الصيدلة","الفنون الجميلة","التربية"] },
  { id:5,  slug:"usek",  name:"جامعة الروح القدس – USEK",                  nameEn:"Holy Spirit University of Kaslik",        abbr:"USEK",  region:"جبل لبنان",     type:"خاصة",   rank:"⭐⭐⭐⭐", rankNum:4, tuition:"5,000–9,000$",   lang:"فرنسي/عربي",    url:"https://www.usek.edu.lb",      established:"1938", students:"6,000+",   emoji:"✝️", color:"#6B2E8F", desc:"جامعة مارونية في الكسليك، متميزة في الفنون والموسيقى والعمارة والإعلام والعلوم.", programs:["الموسيقى والفنون الجميلة","العمارة والتصميم","الهندسة","الأعمال","الآداب","العلوم","الإعلام","اللاهوت"] },
  { id:6,  slug:"uob",   name:"جامعة البلمند – UOB",                        nameEn:"University of Balamand",                  abbr:"UOB",   region:"الشمال",        type:"خاصة",   rank:"⭐⭐⭐⭐", rankNum:4, tuition:"5,500–9,000$",   lang:"إنجليزي",        url:"https://www.balamand.edu.lb",  established:"1988", students:"5,000+",   emoji:"🕌", color:"#003366", desc:"جامعة أرثوذكسية في البلمند، قوية في الطب والهندسة والفنون المعمارية والعلوم الإنسانية.", programs:["الطب","الهندسة والمعمار","إدارة الأعمال","الآداب","الصحة","الفنون","التربية","علوم الكمبيوتر"] },
  { id:7,  slug:"ndu",   name:"جامعة سيدة اللويزة – NDU",                  nameEn:"Notre Dame University – Louaize",         abbr:"NDU",   region:"جبل لبنان",     type:"خاصة",   rank:"⭐⭐⭐⭐", rankNum:4, tuition:"5,000–8,500$",   lang:"إنجليزي",        url:"https://www.ndu.edu.lb",       established:"1987", students:"7,000+",   emoji:"🕊️", color:"#005BAA", desc:"جامعة مارونية في لويزة، متميزة في العلوم والهندسة والأعمال والإعلام والدراسات الدينية.", programs:["الهندسة","إدارة الأعمال","الإعلام والتصميم","العلوم","الآداب","علم النفس","التربية","القانون"] },
  { id:8,  slug:"esa",   name:"كلية إدارة الأعمال – ESA",                   nameEn:"École Supérieure des Affaires",           abbr:"ESA",   region:"بيروت",         type:"خاصة",   rank:"⭐⭐⭐⭐⭐",rankNum:5, tuition:"12,000–20,000$", lang:"فرنسي/إنجليزي",  url:"https://www.esa.edu.lb",       established:"1996", students:"1,500+",   emoji:"💼", color:"#003087", desc:"أفضل كلية إدارة أعمال في لبنان والشرق الأوسط، شراكة مع HEC Paris، برامج MBA بمستوى عالمي.", programs:["MBA","إدارة الأعمال","التسويق","المالية","إدارة المشاريع","ريادة الأعمال","الموارد البشرية"] },
  { id:9,  slug:"alba",  name:"الأكاديمية اللبنانية للفنون الجميلة – ALBA", nameEn:"Académie Libanaise des Beaux-Arts",        abbr:"ALBA",  region:"بيروت",         type:"خاصة",   rank:"⭐⭐⭐⭐", rankNum:4, tuition:"5,000–8,000$",   lang:"فرنسي",          url:"https://www.alba.edu.lb",      established:"1937", students:"2,000+",   emoji:"🎨", color:"#2C2C2C", desc:"مدرسة الفنون الجميلة الأرقى في لبنان، متخصصة في الفنون البصرية والعمارة والتصميم.", programs:["العمارة","الفنون البصرية","التصميم الغرافيكي","التصميم الداخلي","الرسم والنحت","الفوتوغرافيا"] },
  { id:10, slug:"liu",   name:"الجامعة اللبنانية الدولية – LIU",            nameEn:"Lebanese International University",       abbr:"LIU",   region:"بيروت وفروع",   type:"خاصة",   rank:"⭐⭐⭐",  rankNum:3, tuition:"3,000–6,000$",   lang:"عربي/إنجليزي",   url:"https://www.liu.edu.lb",       established:"2001", students:"15,000+",  emoji:"🌙", color:"#006633", desc:"جامعة إسلامية خاصة بفروع في أنحاء لبنان، تركّز على الطب والصيدلة والهندسة والتكنولوجيa.", programs:["الطب","الصيدلة","الهندسة","إدارة الأعمال","علوم الكمبيوتر","التربية","الحقوق","الإعلام"] },
  { id:11, slug:"iul",   name:"الجامعة الإسلامية في لبنان – IUL",          nameEn:"Islamic University of Lebanon",           abbr:"IUL",   region:"البقاع",        type:"خاصة",   rank:"⭐⭐⭐",  rankNum:3, tuition:"2,500–5,000$",   lang:"عربي",           url:"https://www.iul.edu.lb",       established:"1996", students:"8,000+",   emoji:"☪️", color:"#006400", desc:"جامعة إسلامية بفروع متعددة، تقدّم برامج في الشريعة والأعمال والتربية والعلوم الاجتماعية.", programs:["الشريعة والقانون","إدارة الأعمال","التربية","العلوم الاجتماعية","الهندسة","الطب"] },
  { id:12, slug:"ndu",   name:"جامعة هايكازيان – HU",                       nameEn:"Haigazian University",                    abbr:"HU",    region:"بيروت",         type:"خاصة",   rank:"⭐⭐⭐",  rankNum:3, tuition:"4,000–7,000$",   lang:"إنجليزي",        url:"https://www.haigazian.edu.lb", established:"1955", students:"1,200+",   emoji:"🔯", color:"#FF6600", desc:"جامعة أرمنية بروتستانتية في بيروت، متميزة في الآداب والعلوم الإنسانية والتربية.", programs:["الآداب والإنسانيات","علم النفس","إدارة الأعمال","التربية","العلوم الاجتماعية","علوم الكمبيوتر"] },
];

export function getUniversityBySlug(slug: string): University | undefined {
  return UNIVERSITIES.find(u => u.slug === slug);
}
