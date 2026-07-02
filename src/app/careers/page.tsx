"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

interface Career {
  id: string;
  title: string;
  titleAr: string;
  emoji: string;
  category: string;
  demand: "عالي جداً" | "عالي" | "متوسط";
  demandColor: string;
  salaryLB: string;
  salaryRemote: string;
  yearsToEntry: string;
  description: string;
  skills: string[];
  certifications: string[];
  universities: string[];
  roadmap: string[];
}

const CAREERS: Career[] = [
  {
    id: "software-engineer", title: "Software Engineer", titleAr: "مهندس برمجيات", emoji: "💻",
    category: "تكنولوجيا", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700",
    salaryLB: "$800–$2,500", salaryRemote: "$3,000–$8,000",
    yearsToEntry: "4 سنوات", description: "تصميم وبناء التطبيقات والأنظمة البرمجية. من أكثر المجالات طلباً في العالم العربي والعالم.",
    skills: ["JavaScript", "Python", "React", "Node.js", "SQL", "Git"],
    certifications: ["AWS Certified", "Google Cloud", "Meta Front-End"],
    universities: ["AUB", "LAU", "USJ", "NDU"],
    roadmap: ["تعلّم أساسيات البرمجة", "اختر تخصصك (Frontend/Backend/Full-Stack)", "ابنِ 3–5 مشاريع Portfolio", "تدريب صيفي في شركة تقنية", "احضر Hackathons ومجتمعات Dev"],
  },
  {
    id: "data-scientist", title: "Data Scientist", titleAr: "عالم بيانات", emoji: "📊",
    category: "بيانات", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700",
    salaryLB: "$700–$2,000", salaryRemote: "$4,000–$10,000",
    yearsToEntry: "4–5 سنوات", description: "تحليل البيانات الضخمة واستخراج رؤى تساعد الشركات على اتخاذ قرارات أفضل.",
    skills: ["Python", "SQL", "Machine Learning", "Statistics", "Tableau", "Pandas"],
    certifications: ["IBM Data Science", "Google Data Analytics", "Kaggle Competitions"],
    universities: ["AUB", "LAU", "USEK"],
    roadmap: ["دراسة الرياضيات والإحصاء", "تعلّم Python وSQL", "إتقان مكتبات Data Science", "بناء مشاريع Kaggle", "الحصول على شهادة معتمدة"],
  },
  {
    id: "doctor", title: "Medical Doctor", titleAr: "طبيب", emoji: "🏥",
    category: "طب وصحة", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700",
    salaryLB: "$1,500–$5,000+", salaryRemote: "N/A",
    yearsToEntry: "7–10 سنوات", description: "تشخيص وعلاج الأمراض ورعاية المرضى. من أرفع المهن في العالم العربي مع مسار واضح للتخصص.",
    skills: ["التشخيص الطبي", "الفحص السريري", "قراءة الأشعة", "التواصل مع المرضى", "الطوارئ"],
    certifications: ["شهادة طب بشري", "Board Certification", "تخصص بعد الدراسة"],
    universities: ["AUB Medicine", "USJ Médecine", "BAU Medicine", "UOB Medicine"],
    roadmap: ["دراسة العلوم في الثانوية بمعدل عالٍ", "الالتحاق بكلية الطب (6 سنوات)", "السنة الإقامية", "الحصول على ترخيص مزاولة المهنة", "اختيار التخصص"],
  },
  {
    id: "business-analyst", title: "Business Analyst", titleAr: "محلل أعمال", emoji: "📈",
    category: "إدارة أعمال", demand: "عالي", demandColor: "bg-blue-100 text-blue-700",
    salaryLB: "$600–$1,800", salaryRemote: "$2,000–$5,000",
    yearsToEntry: "4 سنوات", description: "تحليل عمليات الشركات وتحديد فرص التحسين والنمو من خلال البيانات والمنهجيات التحليلية.",
    skills: ["Excel", "Power BI", "SQL", "Process Mapping", "Stakeholder Management"],
    certifications: ["CBAP", "PMI-PBA", "Google Data Analytics"],
    universities: ["AUB", "LAU", "USJ", "NDU"],
    roadmap: ["دراسة إدارة الأعمال أو الهندسة الصناعية", "إتقان Excel وPower BI", "تعلّم منهجيات التحليل", "اكتساب خبرة في قطاع محدد", "الحصول على شهادة CBAP"],
  },
  {
    id: "graphic-designer", title: "Graphic Designer", titleAr: "مصمم جرافيك", emoji: "🎨",
    category: "إبداعي", demand: "عالي", demandColor: "bg-blue-100 text-blue-700",
    salaryLB: "$400–$1,200", salaryRemote: "$1,500–$4,000",
    yearsToEntry: "3–4 سنوات", description: "تصميم الهويات البصرية والمواد الإعلانية والمحتوى الرقمي للشركات والعلامات التجارية.",
    skills: ["Adobe Illustrator", "Photoshop", "Figma", "Typography", "Branding"],
    certifications: ["Adobe Certified", "Google UX Design"],
    universities: ["LAU Design", "LU Fine Arts", "NDU Graphic Design"],
    roadmap: ["بناء أساس قوي في أدوات Adobe", "دراسة نظرية التصميم والألوان", "بناء Portfolio متنوع", "تدريب في وكالة إعلانية", "التخصص في Brand Design أو Motion"],
  },
  {
    id: "digital-marketer", title: "Digital Marketer", titleAr: "مسوّق رقمي", emoji: "📱",
    category: "تسويق", demand: "عالي", demandColor: "bg-blue-100 text-blue-700",
    salaryLB: "$500–$1,500", salaryRemote: "$1,500–$4,000",
    yearsToEntry: "3–4 سنوات", description: "إدارة الحملات التسويقية الرقمية عبر منصات التواصل الاجتماعي والبحث والبريد الإلكتروني.",
    skills: ["Meta Ads", "Google Ads", "SEO", "Content Writing", "Analytics"],
    certifications: ["Meta Blueprint", "Google Digital Marketing", "HubSpot"],
    universities: ["AUB", "LAU", "NDU", "USEK"],
    roadmap: ["تعلّم أساسيات التسويق الرقمي", "احصل على شهادة Google/Meta", "أنشئ حملات تجريبية بميزانية صغيرة", "ابنِ Portfolio من نتائج حقيقية", "تخصّص في paid ads أو content"],
  },
  {
    id: "hr-manager", title: "HR Manager", titleAr: "مدير موارد بشرية", emoji: "👥",
    category: "إدارة", demand: "متوسط", demandColor: "bg-yellow-100 text-yellow-700",
    salaryLB: "$600–$2,000", salaryRemote: "$1,500–$4,000",
    yearsToEntry: "4–5 سنوات", description: "إدارة دورة حياة الموظفين من التوظيف والتطوير حتى الاحتفاظ بالمواهب وتطوير ثقافة الشركة.",
    skills: ["Recruitment", "Labor Law", "Performance Management", "Training & Dev", "HRIS"],
    certifications: ["SHRM-CP", "PHR", "CIPD"],
    universities: ["AUB", "LAU", "USJ", "NDU"],
    roadmap: ["دراسة إدارة الأعمال أو علم النفس", "تدريب في قسم HR", "إتقان أدوات HR التقنية", "دراسة قانون العمل اللبناني", "الحصول على شهادة SHRM"],
  },
  { id: "frontend-dev", title: "Frontend Developer", titleAr: "مطوّر واجهات", emoji: "🖥️", category: "تكنولوجيا", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700", salaryLB: "$700–$2,200", salaryRemote: "$2,500–$7,000", yearsToEntry: "3–4 سنوات", description: "بناء واجهات المواقع والتطبيقات. من أكثر الأدوار طلباً عالمياً ومناسب جداً للعمل remote.", skills: ["React", "Next.js", "TypeScript", "Tailwind", "Figma"], certifications: ["Meta Frontend", "freeCodeCamp", "Frontend Masters"], universities: ["AUB", "LAU", "AUST", "USEK"], roadmap: ["HTML + CSS + JS basics", "إطار React + Tailwind", "بناء 3-5 مشاريع portfolio", "تدريب صيفي", "تخصص بـ Next.js أو Mobile"] },
  { id: "backend-dev", title: "Backend Developer", titleAr: "مطوّر خلفية", emoji: "⚙️", category: "تكنولوجيا", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700", salaryLB: "$800–$2,400", salaryRemote: "$3,000–$8,500", yearsToEntry: "4 سنوات", description: "بناء الأنظمة والـ APIs اللي بتشغّل المنتجات. مطلوب جداً بالفنتك والصناعة السحابية.", skills: ["Node.js", "Python", "SQL", "PostgreSQL", "REST/GraphQL", "Docker"], certifications: ["AWS Solutions Architect", "Google Cloud", "MongoDB Dev"], universities: ["AUB", "LAU", "USJ", "AUST"], roadmap: ["تعلم لغة backend (Node/Python)", "قواعد بيانات SQL + NoSQL", "بناء API كامل", "Docker + Cloud basics", "Mentor مع senior dev"] },
  { id: "mobile-dev", title: "Mobile App Developer", titleAr: "مطوّر تطبيقات موبايل", emoji: "📱", category: "تكنولوجيا", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$700–$2,000", salaryRemote: "$2,500–$6,500", yearsToEntry: "3–4 سنوات", description: "بناء تطبيقات iOS و Android. الطلب بازدياد مع نمو الفنتك والـ super-apps بالمنطقة.", skills: ["Flutter", "Swift", "Kotlin", "Firebase", "REST APIs"], certifications: ["Google Mobile Dev", "Apple Developer"], universities: ["AUB", "LAU", "AUST", "USEK"], roadmap: ["اختر منصة (Flutter للسرعة)", "ابنِ تطبيق كامل ونزّله للـ store", "تعلم state management", "تدريب في شركة موبايل", "تخصص بـ AR/VR أو fintech"] },
  { id: "devops-engineer", title: "DevOps Engineer", titleAr: "مهندس DevOps", emoji: "🚀", category: "تكنولوجيا", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700", salaryLB: "$1,000–$2,800", salaryRemote: "$3,500–$9,500", yearsToEntry: "4–5 سنوات", description: "أتمتة عمليات النشر والبنية التحتية. راتبه من أعلى المواهب التقنية محلياً.", skills: ["Linux", "AWS/GCP", "Docker", "Kubernetes", "CI/CD", "Terraform"], certifications: ["AWS DevOps Pro", "CKA Kubernetes", "HashiCorp Terraform"], universities: ["AUB", "LAU", "AUST"], roadmap: ["إتقان Linux", "تعلم Docker + Kubernetes", "نشر مشروع كامل CI/CD", "AWS أو GCP cert", "خبرة 2-3 سنوات SRE"] },
  { id: "cybersecurity", title: "Cybersecurity Analyst", titleAr: "محلل أمن سيبراني", emoji: "🔒", category: "تكنولوجيا", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700", salaryLB: "$800–$2,500", salaryRemote: "$3,000–$8,000", yearsToEntry: "4 سنوات", description: "حماية الأنظمة والبيانات. الطلب بازدياد مع تنامي الهجمات السيبرانية بالمنطقة.", skills: ["Networks", "Penetration Testing", "SIEM", "Incident Response", "OWASP"], certifications: ["CompTIA Security+", "CEH", "OSCP", "CISSP"], universities: ["AUB", "LAU", "AUST", "USJ"], roadmap: ["أساسيات الشبكات", "Security+ certification", "ممارسة CTFs", "تدريب SOC", "OSCP للتقدم لـ Red Team"] },
  { id: "pharmacist", title: "Pharmacist", titleAr: "صيدلي", emoji: "💊", category: "طب وصحة", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$900–$2,500", salaryRemote: "N/A", yearsToEntry: "5 سنوات", description: "صرف الأدوية والإرشاد الدوائي. مهنة مستقرة جداً محلياً مع إمكانية فتح صيدلية خاصة.", skills: ["كيمياء دوائية", "صيدلة سريرية", "تواصل مع المرضى", "إدارة مخزون"], certifications: ["ترخيص نقابة الصيادلة", "PharmD", "BCPS"], universities: ["USJ", "LAU", "LIU", "BAU"], roadmap: ["دراسة الكيمياء بالثانوية", "كلية صيدلة 5 سنوات", "إقامة دوائية", "ترخيص النقابة", "تخصص (سريرية/صناعة/مستشفى)"] },
  { id: "dentist", title: "Dentist", titleAr: "طبيب أسنان", emoji: "🦷", category: "طب وصحة", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$1,200–$4,000", salaryRemote: "N/A", yearsToEntry: "5–7 سنوات", description: "علاج الأسنان والفم. عيادة خاصة بعد سنوات قليلة من الخبرة.", skills: ["فحص سريري", "حشوات وتقويم", "جراحة فم", "تواصل مع المرضى"], certifications: ["شهادة طب أسنان", "ترخيص نقابة", "تخصص تقويم/جراحة"], universities: ["USJ", "LU", "BAU"], roadmap: ["ثانوية علوم بمعدل عالٍ", "كلية طب أسنان 5 سنوات", "إقامة سريرية", "ترخيص نقابي", "اختيار تخصص"] },
  { id: "nurse", title: "Registered Nurse", titleAr: "ممرض/ة مسجّل", emoji: "💉", category: "طب وصحة", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700", salaryLB: "$500–$1,500", salaryRemote: "Gulf $3,000+", yearsToEntry: "3–4 سنوات", description: "رعاية المرضى في المستشفيات والعيادات. طلب عالي محلياً وفرص قوية للهجرة المهنية.", skills: ["رعاية مرضى", "إسعافات أولية", "إعطاء أدوية", "تواصل مع الفريق الطبي"], certifications: ["BSN", "ترخيص نقابة", "ACLS", "BLS"], universities: ["AUB FAFS", "LAU SoN", "USJ", "BAU"], roadmap: ["ثانوية علوم", "كلية تمريض 4 سنوات", "تدريب سريري", "ترخيص نقابي", "تخصص (طوارئ/عناية مركّزة/أطفال)"] },
  { id: "physical-therapist", title: "Physical Therapist", titleAr: "أخصائي علاج طبيعي", emoji: "🏋️", category: "طب وصحة", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$600–$1,800", salaryRemote: "Gulf $2,500+", yearsToEntry: "4–5 سنوات", description: "إعادة تأهيل المرضى بعد الإصابات والجراحات. طلب متنامي مع زيادة الوعي الصحي.", skills: ["تقييم حركي", "تمارين تأهيلية", "كينيزيولوجيا", "تواصل مع المرضى"], certifications: ["DPT", "ترخيص نقابة", "تخصص رياضي/عصبي"], universities: ["USJ", "AUB", "LAU"], roadmap: ["ثانوية علوم", "كلية علاج طبيعي 4-5 سنوات", "تدريب سريري", "ترخيص نقابي", "تخصص"] },
  { id: "med-lab-tech", title: "Medical Lab Technician", titleAr: "فنيّ مختبر طبي", emoji: "🔬", category: "طب وصحة", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$500–$1,400", salaryRemote: "Gulf $2,000+", yearsToEntry: "3–4 سنوات", description: "إجراء الفحوصات المخبرية وتحليل العيّنات. عمود فقري للتشخيص الطبي.", skills: ["تحاليل دم وبول", "ميكروبيولوجيا", "أدوات مخبرية", "تسجيل بيانات دقيق"], certifications: ["BMLS", "ترخيص نقابة", "ASCP"], universities: ["AUB", "USJ", "LAU", "BAU"], roadmap: ["ثانوية علوم", "بكالوريوس مختبر طبي 4 سنوات", "تدريب مستشفى", "ترخيص نقابي", "تخصص (أنسجة/أحياء جزيئي)"] },
  { id: "civil-engineer", title: "Civil Engineer", titleAr: "مهندس مدني", emoji: "🏗️", category: "هندسة", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$700–$2,200", salaryRemote: "Gulf $3,500+", yearsToEntry: "5 سنوات", description: "تصميم وتنفيذ المباني والبنى التحتية. فرص قوية بإعادة إعمار لبنان وأسواق الخليج.", skills: ["AutoCAD", "Revit", "إدارة مشاريع", "Structural Analysis", "Site Engineering"], certifications: ["ترخيص نقابة المهندسين", "PMP", "LEED"], universities: ["AUB", "LAU", "USJ ESIB", "LU Engineering", "UOB"], roadmap: ["ثانوية علوم", "كلية هندسة 5 سنوات", "تدريب موقع", "ترخيص نقابي", "تخصص (إنشائي/طرق/جسور)"] },
  { id: "electrical-engineer", title: "Electrical Engineer", titleAr: "مهندس كهرباء", emoji: "⚡", category: "هندسة", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$700–$2,200", salaryRemote: "Gulf $3,500+", yearsToEntry: "5 سنوات", description: "تصميم الأنظمة الكهربائية والطاقة. الطاقة الشمسية فتحت سوق جديد كبير بلبنان.", skills: ["تحليل دارات", "AutoCAD", "MATLAB", "PV Design", "PLC"], certifications: ["ترخيص نقابة", "PMP", "PVsyst"], universities: ["AUB", "LAU", "USJ ESIB", "LU", "BAU"], roadmap: ["ثانوية علوم", "كلية هندسة 5 سنوات", "تدريب صناعي", "ترخيص نقابي", "تخصص (طاقة/تحكم/اتصالات)"] },
  { id: "mech-engineer", title: "Mechanical Engineer", titleAr: "مهندس ميكانيك", emoji: "⚙️", category: "هندسة", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$700–$2,000", salaryRemote: "Gulf $3,500+", yearsToEntry: "5 سنوات", description: "تصميم وإنتاج الآلات والمعدات. فرص جيدة بالصناعة والتكييف والنفط الخليجي.", skills: ["SolidWorks", "Thermodynamics", "CAD/CAM", "Project Management"], certifications: ["ترخيص نقابة", "ASME", "PMP"], universities: ["AUB", "LAU", "USJ ESIB", "LU", "BAU"], roadmap: ["ثانوية علوم", "كلية هندسة 5 سنوات", "تدريب صناعي", "ترخيص نقابي", "تخصص (تصنيع/طاقة/HVAC)"] },
  { id: "petroleum-eng", title: "Petroleum Engineer", titleAr: "مهندس بترول", emoji: "⛽", category: "هندسة", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$1,500–$4,000", salaryRemote: "Gulf $6,000+", yearsToEntry: "5–6 سنوات", description: "استخراج النفط والغاز. أعلى الرواتب بالخليج للخريجين العرب.", skills: ["Reservoir Engineering", "Drilling", "Geology", "Python", "Petrel"], certifications: ["SPE", "PMP", "HSE"], universities: ["AUB Petroleum Studies", "LAU", "ESIB", "Texas A&M Qatar"], roadmap: ["ثانوية علوم بمعدل عالٍ", "كلية هندسة بترول/كيمياء 5 سنوات", "تدريب شركة نفط", "ماجستير اختصاصي", "العمل بالخليج/Aramco"] },
  { id: "architect", title: "Architect", titleAr: "مهندس معماري", emoji: "🏛️", category: "هندسة", demand: "متوسط", demandColor: "bg-yellow-100 text-yellow-700", salaryLB: "$500–$2,000", salaryRemote: "Gulf $3,000+", yearsToEntry: "5–6 سنوات", description: "تصميم المباني والمساحات. لبنان معروف عالمياً بمعمارييه الإبداعيين.", skills: ["AutoCAD", "Revit", "SketchUp", "3DS Max", "Design Thinking"], certifications: ["ترخيص نقابة", "LEED AP", "RIBA"], universities: ["ALBA", "AUB", "LAU SArD", "USEK", "NDU"], roadmap: ["ثانوية + Portfolio فني", "كلية عمارة 5 سنوات", "تدريب مكتب معماري", "ترخيص نقابي", "Portfolio احترافي + مشروع شخصي"] },
  { id: "accountant", title: "Accountant", titleAr: "محاسب", emoji: "🧾", category: "محاسبة ومالية", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$500–$1,800", salaryRemote: "$1,500–$4,000", yearsToEntry: "4 سنوات", description: "إدارة الحسابات المالية وإعداد التقارير. ثابت ومطلوب بكل قطاع.", skills: ["Excel متقدم", "QuickBooks", "IFRS", "Tax Lebanon", "VAT"], certifications: ["CPA", "ACCA", "CMA"], universities: ["AUB OSB", "LAU AdneirSoB", "USJ FGM", "BAU"], roadmap: ["دراسة محاسبة", "تدريب Big 4", "شهادة ACCA/CPA", "خبرة 3 سنوات", "تخصص (تدقيق/ضرائب/تقارير)"] },
  { id: "financial-analyst", title: "Financial Analyst", titleAr: "محلل مالي", emoji: "📊", category: "محاسبة ومالية", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$700–$2,200", salaryRemote: "$2,500–$6,000", yearsToEntry: "4–5 سنوات", description: "تحليل الأداء المالي وتقييم الاستثمارات. مسار قوي للبنوك والاستشارات.", skills: ["Excel financial modeling", "Power BI", "Valuation", "Bloomberg", "DCF"], certifications: ["CFA Level I-III", "FMVA", "CPA"], universities: ["AUB OSB", "LAU", "USJ FGM", "ESA"], roadmap: ["دراسة مالية أو اقتصاد", "CFA Level I", "تدريب بنك أو شركة استثمار", "CFA II + III", "تخصص (M&A / Equity Research)"] },
  { id: "auditor", title: "External Auditor", titleAr: "مدقّق حسابات", emoji: "🔍", category: "محاسبة ومالية", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$700–$2,500", salaryRemote: "Gulf $3,500+", yearsToEntry: "4–6 سنوات", description: "تدقيق القوائم المالية للشركات. Big 4 (EY/PwC/Deloitte/KPMG) أبواب مفتوحة لخريجي العالم العربي.", skills: ["IFRS", "Audit Procedures", "Excel", "Risk Assessment", "SAP"], certifications: ["ACCA", "CPA", "CIA"], universities: ["AUB", "LAU", "USJ", "ESA"], roadmap: ["محاسبة + GPA عالي", "تدريب Big 4 بالصيف", "Junior Auditor مباشر", "ACCA كاملة", "Manager خلال 5-7 سنوات"] },
  { id: "investment-banker", title: "Investment Banker", titleAr: "مصرفي استثماري", emoji: "💼", category: "محاسبة ومالية", demand: "متوسط", demandColor: "bg-yellow-100 text-yellow-700", salaryLB: "$1,000–$3,500", salaryRemote: "Gulf $5,000+", yearsToEntry: "5–7 سنوات", description: "M&A، IPOs، وتمويل الشركات. أعلى رواتب القطاع المالي بالخليج ولندن.", skills: ["Financial Modeling", "Valuation", "PowerPoint", "Pitch decks", "M&A"], certifications: ["CFA", "MBA", "ACCA"], universities: ["AUB OSB", "ESA", "LAU"], roadmap: ["GPA 90%+ في bachelor", "تدريب Summer Analyst", "Analyst program ببنك (2-3 سنوات)", "MBA من جامعة top-20", "Associate → VP"] },
  { id: "photographer", title: "Photographer / Videographer", titleAr: "مصور فوتو/فيديو", emoji: "📸", category: "إبداعي", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$400–$2,500 (مشاريع)", salaryRemote: "$1,500–$5,000", yearsToEntry: "2–3 سنوات", description: "تصوير حفلات، إعلانات، أفلام. مرن جداً وفيك تشتغل freelance من اول يوم.", skills: ["DSLR/Mirrorless", "Lightroom", "Premiere Pro", "Color Grading", "Composition"], certifications: ["Adobe Certified", "Color Grading Masterclass"], universities: ["USEK", "LAU Communication Arts", "ALBA"], roadmap: ["شراء كاميرا أساسية", "بناء Portfolio على Instagram", "تدريب مع فوتوغرافر", "تخصص (أعراس/إعلانات/film)", "بناء brand شخصي"] },
  { id: "content-creator", title: "Content Creator", titleAr: "صانع محتوى", emoji: "🎬", category: "إبداعي", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$300–$5,000+ (متفاوت)", salaryRemote: "Unlimited", yearsToEntry: "1–3 سنوات", description: "إنشاء محتوى TikTok/Instagram/YouTube. مهنة Gen Z الجديدة. الدخل غير محدود لو ضبطت Niche.", skills: ["كتابة سيناريو قصير", "تصوير موبايل", "مونتاج", "خوارزميات platforms"], certifications: ["YouTube Certified", "Meta Creator"], universities: ["أي تخصص — Portfolio أهم"], roadmap: ["اختر Niche محدد", "انشر يومياً 60 يوم", "تحليل الـ analytics", "ابني community 10K", "Monetize: ads/brand deals/products"] },
  { id: "journalist", title: "Journalist", titleAr: "صحفي/إعلامي", emoji: "📰", category: "إعلام", demand: "متوسط", demandColor: "bg-yellow-100 text-yellow-700", salaryLB: "$400–$1,500", salaryRemote: "$1,500–$4,000", yearsToEntry: "4 سنوات", description: "كتابة وتغطية الأخبار والتحقيقات. لبنان فيه مشهد إعلامي حر بالعربي.", skills: ["كتابة عربي + إنجليزي", "تحقيق صحفي", "تواصل اجتماعي", "موضوعية"], certifications: ["Reuters Training", "Poynter Institute"], universities: ["LAU", "AUB Media Studies", "USJ", "LU Info"], roadmap: ["دراسة إعلام/أدب", "نشر مقالات بمنصات طلابية", "تدريب جريدة/موقع", "تخصص (سياسي/اقتصادي/ثقافي)", "بناء سمعة شخصية"] },
  { id: "lawyer", title: "Lawyer", titleAr: "محامي", emoji: "⚖️", category: "قانون", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$800–$3,500", salaryRemote: "Gulf $3,500+", yearsToEntry: "5–7 سنوات", description: "تمثيل العملاء والاستشارات القانونية. مهنة محترمة جداً محلياً مع مسار واضح للنقابة.", skills: ["قانون مدني وتجاري", "كتابة مذكرات", "ترافع", "بحث قانوني", "تفاوض"], certifications: ["ترخيص نقابة المحامين", "LLM للتخصص"], universities: ["USJ Faculty of Law", "AUB", "LAU SoL", "BAU", "LU"], roadmap: ["كلية حقوق 4 سنوات", "تمرين 3 سنوات بمكتب محاماة", "امتحان النقابة", "ترخيص محامي عام", "تخصص (تجاري/جنائي/شركات)"] },
  { id: "translator", title: "Translator / Interpreter", titleAr: "مترجم", emoji: "🌐", category: "لغات", demand: "متوسط", demandColor: "bg-yellow-100 text-yellow-700", salaryLB: "$400–$1,800", salaryRemote: "$1,500–$5,000", yearsToEntry: "3–4 سنوات", description: "ترجمة بين اللغات، تخصص قانوني أو طبي يضاعف الراتب. شغل remote سهل.", skills: ["عربي + إنجليزي + فرنسي", "CAT tools (Trados)", "Localization", "ترجمة فورية"], certifications: ["ATA Certified", "DipTrans", "EMT"], universities: ["USJ ETIB", "ALBA", "LAU", "AUB"], roadmap: ["إتقان 3 لغات", "كلية ترجمة 4 سنوات", "تدريب وكالة ترجمة", "تخصص (قانوني/طبي/تقني)", "freelance + شهادة ATA"] },
  { id: "teacher", title: "Teacher", titleAr: "معلّم/ة", emoji: "👩‍🏫", category: "تربية", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$400–$1,500", salaryRemote: "Gulf $1,800+", yearsToEntry: "4 سنوات", description: "تعليم المراحل الابتدائية والثانوية. ثابت ومحترم اجتماعياً مع عطل صيفية.", skills: ["تخطيط دروس", "إدارة صف", "تواصل مع الأهل", "مادة تخصصية"], certifications: ["دبلوم تربية", "TEFL/TESOL", "IB Diploma"], universities: ["LU Faculty of Education", "AUB", "LAU", "Haigazian", "USJ"], roadmap: ["بكالوريوس تخصص أكاديمي", "دبلوم تربية", "تدريب صفي", "ترخيص تعليم", "تخصص (ابتدائي/ثانوي/IB)"] },
  { id: "psychologist", title: "Psychologist", titleAr: "أخصائي نفسي", emoji: "🧠", category: "تربية", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$500–$2,000", salaryRemote: "Online $1,500+", yearsToEntry: "5–7 سنوات", description: "علاج نفسي وإرشاد. الطلب يكبر بشكل سريع بعد الأزمات الأخيرة بلبنان.", skills: ["علاج معرفي سلوكي CBT", "مقابلات إكلينيكية", "اختبارات نفسية", "سرّية مهنية"], certifications: ["ماجستير علم نفس", "ترخيص نقابة", "CBT certification"], universities: ["AUB", "USJ", "LAU", "Haigazian", "LU"], roadmap: ["بكالوريوس علم نفس", "ماجستير سريري 2 سنة", "تدريب إكلينيكي", "ترخيص نقابي", "تخصص (أطفال/CBT/أزمات)"] },
  { id: "chef", title: "Chef", titleAr: "شيف", emoji: "👨‍🍳", category: "ضيافة", demand: "عالي", demandColor: "bg-blue-100 text-blue-700", salaryLB: "$500–$2,500", salaryRemote: "Gulf $2,500+", yearsToEntry: "3–5 سنوات", description: "ابتكار وإعداد الأطعمة. لبنان مشهور عالمياً بشيفاته ومطبخه، فرص قوية محلياً ودولياً.", skills: ["مهارات سكين", "إدارة مطبخ", "HACCP", "Plating", "إبداع وصفات"], certifications: ["Le Cordon Bleu", "USAID Culinary", "HACCP"], universities: ["USEK Hospitality", "AUL Culinary", "LIU"], roadmap: ["ثانوية أو مدرسة طهي", "دبلوم 2-3 سنوات", "تدريب مطبخ مطعم 5 نجوم", "خبرة sous-chef", "Head Chef أو افتح مطعمك"] },
  { id: "hotel-manager", title: "Hotel Manager", titleAr: "مدير فندق", emoji: "🏨", category: "ضيافة", demand: "متوسط", demandColor: "bg-yellow-100 text-yellow-700", salaryLB: "$800–$2,500", salaryRemote: "Gulf $3,000+", yearsToEntry: "4–6 سنوات", description: "إدارة عمليات الفنادق وخدمة الضيوف. الخليج فيه طلب دائم على الكفاءات العربية.", skills: ["خدمة عملاء VIP", "Opera PMS", "إدارة فرق", "F&B", "Revenue Management"], certifications: ["دبلوم إدارة فنادق", "AHLEI Hotel Management"], universities: ["USEK Hospitality", "AUL", "LIU"], roadmap: ["ثانوية + لغتين", "بكالوريوس إدارة فنادق 4 سنوات", "تدريب فندق 5 نجوم", "Supervisor 2-3 سنوات", "Department Head → GM"] },
  { id: "product-manager", title: "Product Manager", titleAr: "مدير منتج", emoji: "🎯", category: "تكنولوجيا", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700", salaryLB: "$1,200–$3,500", salaryRemote: "$4,000–$12,000", yearsToEntry: "4–6 سنوات", description: "إدارة منتجات تقنية من الفكرة للإطلاق. من أعلى الرواتب التقنية وأكثر دور تأثيراً بالستارت أب.", skills: ["User Research", "Roadmapping", "Agile/Scrum", "SQL basics", "Data analytics"], certifications: ["Pragmatic PM", "Reforge", "PSPO"], universities: ["AUB OSB", "LAU", "ESA MBA"], roadmap: ["خبرة 2-3 سنوات بـ UX/Eng/Analytics", "Associate PM ببنك أو ستارت أب", "Reforge programs", "بناء منتج كامل من الصفر", "Senior PM → Lead PM"] },
  { id: "ux-designer", title: "UX/UI Designer", titleAr: "مصمم تجربة المستخدم", emoji: "✨", category: "إبداعي", demand: "عالي جداً", demandColor: "bg-green-100 text-green-700", salaryLB: "$700–$2,200", salaryRemote: "$2,500–$7,000", yearsToEntry: "2–3 سنوات", description: "تصميم واجهات وتجارب رقمية. الطلب remote عالمي قوي، أسرع مسار لـ راتب دولاري.", skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Accessibility"], certifications: ["Google UX Design", "Nielsen Norman UX", "IDF"], universities: ["LAU Communication Design", "ALBA", "AUST", "USEK"], roadmap: ["تعلم Figma 3 أشهر", "إعادة تصميم تطبيقات شهيرة (case studies)", "Portfolio 5 مشاريع", "Freelance/Intern", "Junior UX → Senior بـ 3 سنوات"] },
];

const CATEGORIES = ["الكل", ...Array.from(new Set(CAREERS.map(c => c.category)))];
const DEMAND_FILTER = ["الكل", "عالي جداً", "عالي", "متوسط"];

export default function CareersPage() {
  const { t, dir } = useI18n();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("الكل");
  const [demand, setDemand] = useState("الكل");
  const [selected, setSelected] = useState<Career | null>(null);

  const filtered = useMemo(() => CAREERS.filter(c => {
    const matchSearch = !search || c.titleAr.includes(search) || c.title.toLowerCase().includes(search.toLowerCase()) || c.description.includes(search);
    const matchCat = category === "الكل" || c.category === category;
    const matchDemand = demand === "الكل" || c.demand === demand;
    return matchSearch && matchCat && matchDemand;
  }), [search, category, demand]);

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden" dir={dir}>
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none" />

      <main className="relative max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-hero rounded-4xl p-8 md:p-12 mb-8 text-white shadow-floaty relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/30 rounded-full blur-3xl" />
          <div className="absolute top-6 left-1/4 text-3xl animate-float opacity-50">💼</div>
          <div className="absolute bottom-8 right-1/4 text-3xl animate-float opacity-50" style={{ animationDelay: '1s' }}>🚀</div>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <span className="bg-surface/20 text-white/90 text-xs font-bold px-3 py-1 rounded-full">{t('car.badge')}</span>
              <h1 className="text-3xl md:text-4xl font-extrabold mt-3 mb-3">{t('car.hero.title')}</h1>
              <p className="text-white/80 text-lg leading-relaxed">
                {t('car.hero.subtitle')}
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <div className="bg-surface/15 rounded-xl px-3 py-2 text-sm">{t('car.chip.salary')}</div>
                <div className="bg-surface/15 rounded-xl px-3 py-2 text-sm">{t('car.chip.roadmap')}</div>
                <div className="bg-surface/15 rounded-xl px-3 py-2 text-sm">{t('car.chip.demand')}</div>
                <div className="bg-surface/15 rounded-xl px-3 py-2 text-sm">{t('car.chip.unis')}</div>
              </div>
            </div>
            <div className="text-8xl">🧭</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface rounded-2xl p-5 border border-line shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('car.filter.search')}
              className="flex-1 border-2 border-line focus:border-primary rounded-xl px-4 py-2.5 text-sm outline-none transition-colors"
            />
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setCategory(c)}
                  className={`px-3 py-2 rounded-full text-xs font-bold border transition-all ${category === c ? "bg-primary text-white border-primary" : "bg-surface text-text-sub border-line hover:border-primary"}`}>
                  {c === 'الكل' ? t('car.filter.all') : c}
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            <span className="text-xs text-text-sub font-semibold mt-1">{t('car.filter.demand_label')}</span>
            {DEMAND_FILTER.map(d => (
              <button key={d} onClick={() => setDemand(d)}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${demand === d ? "bg-accent text-white border-accent" : "bg-surface text-text-sub border-line hover:border-accent"}`}>
                {d === 'الكل' ? t('car.filter.all') : d}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Careers grid */}
          <div className={`${selected ? "hidden md:block md:w-2/5 lg:w-1/3" : "w-full"}`}>
            <p className="text-text-sub text-sm mb-4">{filtered.length} {t('car.count.label')}</p>
            <div className="space-y-3">
              {filtered.map(c => (
                <button
                  key={c.id}
                  onClick={() => setSelected(c)}
                  className={`w-full bg-surface rounded-xl p-4 border-2 text-right transition-all hover:shadow-md ${selected?.id === c.id ? "border-primary shadow-md" : "border-line hover:border-primary/40"}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{c.emoji}</span>
                      <div>
                        <div className="font-bold text-primary">{c.titleAr}</div>
                        <div className="text-text-sub text-xs">{c.title}</div>
                      </div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c.demandColor}`}>{c.demand}</span>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs bg-light-gold text-accent font-semibold px-2 py-0.5 rounded-full">💰 {c.salaryLB}{t('car.card.salary_month')}</span>
                    <span className="text-xs text-text-sub">{c.category}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Career detail */}
          {selected && (
            <div className="flex-1 md:sticky md:top-20 md:self-start">
              <div className="bg-surface rounded-2xl border border-line shadow-sm overflow-hidden">
                {/* Detail header */}
                <div className="bg-gradient-to-r from-primary to-[#1e4080] p-6 text-white">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <button onClick={() => setSelected(null)} className="text-white/60 hover:text-white text-sm mb-3 md:hidden flex items-center gap-1">
                        {t('car.detail.back')}
                      </button>
                      <div className="text-4xl mb-2">{selected.emoji}</div>
                      <h2 className="text-2xl font-extrabold">{selected.titleAr}</h2>
                      <p className="text-white/70 text-sm">{selected.title}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1 rounded-full bg-surface/20 text-white`}>
                      {t('car.detail.demand_prefix')} {selected.demand}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 mt-4">
                    <div className="bg-surface/15 rounded-xl p-3 text-center">
                      <div className="text-lg font-extrabold text-accent">{selected.salaryLB}</div>
                      <div className="text-white/60 text-xs mt-0.5">{t('car.detail.salary_lb')}</div>
                    </div>
                    <div className="bg-surface/15 rounded-xl p-3 text-center">
                      <div className="text-lg font-extrabold text-accent">{selected.salaryRemote}</div>
                      <div className="text-white/60 text-xs mt-0.5">{t('car.detail.salary_remote')}</div>
                    </div>
                    <div className="bg-surface/15 rounded-xl p-3 text-center">
                      <div className="text-lg font-extrabold">{selected.yearsToEntry}</div>
                      <div className="text-white/60 text-xs mt-0.5">{t('careers.years_to_entry')}</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Description */}
                  <p className="text-text-sub leading-relaxed">{selected.description}</p>

                  {/* Skills */}
                  <div>
                    <h3 className="font-bold text-primary mb-2">⚡ {t('careers.skills_heading')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.skills.map(s => (
                        <span key={s} className="bg-light text-text-main text-xs font-semibold px-3 py-1 rounded-full border border-line">{s}</span>
                      ))}
                    </div>
                  </div>

                  {/* Certifications */}
                  <div>
                    <h3 className="font-bold text-primary mb-2">🏅 {t('careers.certifications_heading')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.certifications.map(c => (
                        <span key={c} className="bg-light-gold text-accent text-xs font-bold px-3 py-1 rounded-full">{c}</span>
                      ))}
                    </div>
                  </div>

                  {/* Universities */}
                  <div>
                    <h3 className="font-bold text-primary mb-2">🏛️ {t('careers.universities_heading')}</h3>
                    <div className="flex flex-wrap gap-2">
                      {selected.universities.map(u => (
                        <Link key={u} href="/universities" className="bg-blue-50 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-blue-100 hover:bg-primary hover:text-white transition-all">{u}</Link>
                      ))}
                    </div>
                  </div>

                  {/* Roadmap */}
                  <div>
                    <h3 className="font-bold text-primary mb-3">🗺️ {t('careers.roadmap_heading')}</h3>
                    <div className="space-y-2">
                      {selected.roadmap.map((step, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</div>
                          <span className="text-sm text-text-main">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTAs */}
                  <div className="flex flex-wrap gap-3 pt-2">
                    <Link href="/tools/skill-gap" className="flex-1 bg-primary text-white font-bold py-2.5 rounded-xl text-sm text-center hover:bg-[#1e4080] transition-colors">
                      🎯 {t('careers.cta_skill_gap')}
                    </Link>
                    <Link href="/tools/cv-builder" className="flex-1 border-2 border-primary text-primary font-bold py-2.5 rounded-xl text-sm text-center hover:bg-primary hover:text-white transition-all">
                      📄 {t('careers.cta_cv_builder')}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {!selected && filtered.length === 0 && (
            <div className="flex-1 text-center py-20 text-text-sub">
              <div className="text-5xl mb-3">🔍</div>
              <p className="font-semibold">{t('careers.empty_state')}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
