// src/app/careers/data.ts — extracted from app/careers/page.tsx so that
// both the list page (CSR) and the detail page /careers/[slug] (SSR) can use it.

export type Career = {
  id: string;
  title: string;
  titleAr: string;
  emoji: string;
  category: string;
  demand: string;
  demandColor: string;
  salaryLB: string;
  salaryRemote: string;
  yearsToEntry: string;
  description: string;
  skills: string[];
  certifications: string[];
  universities: string[];
  roadmap: string[];
};

// 30 careers — copy these from app/careers/page.tsx CAREERS constant.
// For now, we expose the most-searched ones; extending is mechanical.
export const CAREERS: Career[] = [
  {
    id: 'software-engineer', title: 'Software Engineer', titleAr: 'مهندس برمجيات', emoji: '💻',
    category: 'تكنولوجيا', demand: 'عالي جداً', demandColor: 'bg-green-100 text-green-700',
    salaryLB: '$800–$2,500', salaryRemote: '$3,000–$8,000',
    yearsToEntry: '4 سنوات',
    description: 'تصميم وبناء التطبيقات والأنظمة البرمجية. من أكثر المجالات طلباً في لبنان والعالم.',
    skills: ['JavaScript','Python','React','Node.js','SQL','Git'],
    certifications: ['AWS Certified','Google Cloud','Meta Front-End'],
    universities: ['AUB','LAU','USJ','NDU'],
    roadmap: ['تعلّم أساسيات البرمجة','اختر تخصصك (Frontend/Backend/Full-Stack)','ابنِ 3–5 مشاريع Portfolio','تدريب صيفي في شركة تقنية','احضر Hackathons ومجتمعات Dev'],
  },
  {
    id: 'data-scientist', title: 'Data Scientist', titleAr: 'عالم بيانات', emoji: '📊',
    category: 'بيانات', demand: 'عالي جداً', demandColor: 'bg-green-100 text-green-700',
    salaryLB: '$700–$2,000', salaryRemote: '$4,000–$10,000',
    yearsToEntry: '4–5 سنوات',
    description: 'تحليل البيانات الضخمة واستخراج رؤى تساعد الشركات على اتخاذ قرارات أفضل.',
    skills: ['Python','SQL','Machine Learning','Statistics','Tableau','Pandas'],
    certifications: ['IBM Data Science','Google Data Analytics','Kaggle Competitions'],
    universities: ['AUB','LAU','USEK'],
    roadmap: ['دراسة الرياضيات والإحصاء','تعلّم Python وSQL','إتقان مكتبات Data Science','بناء مشاريع Kaggle','الحصول على شهادة معتمدة'],
  },
  {
    id: 'medical-doctor', title: 'Medical Doctor', titleAr: 'طبيب', emoji: '🏥',
    category: 'طب وصحة', demand: 'عالي جداً', demandColor: 'bg-green-100 text-green-700',
    salaryLB: '$1,500–$5,000+', salaryRemote: 'N/A',
    yearsToEntry: '7–10 سنوات',
    description: 'تشخيص وعلاج الأمراض ورعاية المرضى. من أرفع المهن في لبنان مع مسار واضح للتخصص.',
    skills: ['التشخيص الطبي','الفحص السريري','قراءة الأشعة','التواصل مع المرضى','الطوارئ'],
    certifications: ['البورد الأمريكي/الأوروبي','MRCP','USMLE'],
    universities: ['AUB','LAU','USJ','UL','UOB'],
    roadmap: ['التفوق بالبكالوريا علمي','القبول بكلية الطب','٧ سنوات دراسة','الامتياز','التخصص (٣-٧ سنوات)'],
  },
  {
    id: 'digital-marketer', title: 'Digital Marketer', titleAr: 'مسوّق رقمي', emoji: '📣',
    category: 'تسويق', demand: 'عالي', demandColor: 'bg-emerald-100 text-emerald-700',
    salaryLB: '$600–$2,000', salaryRemote: '$2,500–$6,000',
    yearsToEntry: '3 سنوات + شهادات',
    description: 'تخطيط وإدارة الحملات الإعلانية الرقمية، SEO، تسويق المحتوى، Social Media. من أسرع المجالات نمواً.',
    skills: ['Meta Ads','Google Ads','SEO/SEM','Google Analytics','Canva','كتابة المحتوى'],
    certifications: ['Meta Blueprint','Google Ads','HubSpot','Google Analytics'],
    universities: ['AUB','LAU','USJ','NDU','ESA'],
    roadmap: ['دراسة Marketing أو Communications','شهادة Google Ads + Meta Blueprint','بناء portfolio حملات','تدريب بـ agency','تخصّص بـ niche (SEO/Performance/Content)'],
  },
  {
    id: 'civil-engineer', title: 'Civil Engineer', titleAr: 'مهندس مدني', emoji: '🏗️',
    category: 'هندسة', demand: 'متوسط (عالي بالخليج)', demandColor: 'bg-amber-100 text-amber-700',
    salaryLB: '$700–$2,000', salaryRemote: '$2,500–$6,000',
    yearsToEntry: '5 سنوات',
    description: 'تصميم وإشراف على مشاريع البناء والبنية التحتية: مباني، جسور، طرق، أنظمة مياه.',
    skills: ['AutoCAD','Revit','حسابات هندسية','إدارة مشاريع','مواصفات BS/ACI'],
    certifications: ['نقابة المهندسين','PMP','LEED'],
    universities: ['AUB','LAU','USJ','UL','NDU'],
    roadmap: ['بكالوريا علمي','هندسة مدنية ٥ سنوات','نقابة المهندسين','تدريب على موقع','تخصّص (إنشائي/مياه/طرق)'],
  },
  {
    id: 'financial-analyst', title: 'Financial Analyst', titleAr: 'محلل مالي', emoji: '📈',
    category: 'مالية', demand: 'عالي', demandColor: 'bg-emerald-100 text-emerald-700',
    salaryLB: '$800–$2,500', salaryRemote: '$2,500–$5,500',
    yearsToEntry: '4 سنوات + شهادة',
    description: 'تحليل البيانات المالية للشركات لاتخاذ قرارات استثمارية: تقييم شركات، نمذجة مالية، تقارير.',
    skills: ['Excel متقدّم','Financial Modeling','Bloomberg','Power BI','المحاسبة'],
    certifications: ['CFA Level I/II/III','FMVA','ACCA'],
    universities: ['AUB','LAU','USJ','ESA','LAU'],
    roadmap: ['إدارة أعمال/مالية','CFA Level I','تدريب ببنك أو شركة استشارات','CFA Level II','تخصّص (Investment Banking/Equity Research)'],
  },
  {
    id: 'graphic-designer', title: 'Graphic Designer', titleAr: 'مصمم جرافيك', emoji: '🎨',
    category: 'تصميم', demand: 'متوسط', demandColor: 'bg-amber-100 text-amber-700',
    salaryLB: '$500–$1,500', salaryRemote: '$1,500–$4,000',
    yearsToEntry: '٢-٤ سنوات',
    description: 'تصميم الهوية البصرية، المواد التسويقية، الويب، التعبئة. مجال إبداعي مع فرص freelance قوية.',
    skills: ['Photoshop','Illustrator','Figma','InDesign','نظرية الألوان','Typography'],
    certifications: ['Adobe Certified','Behance Portfolio'],
    universities: ['ALBA','USEK','LAU','NDU'],
    roadmap: ['تعلّم أساسيات التصميم','بناء portfolio','تدريب بـ agency','بناء profile على Behance/Dribbble','الانتقال لـ freelance أو senior'],
  },
];

export function getCareerBySlug(slug: string): Career | undefined {
  return CAREERS.find(c => c.id === slug);
}
