"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

// ─── Types ─────────────────────────────────────────────────────────────────────
type Internship = {
  id: number;
  title: string;
  company: string;
  companyEmoji: string;
  sector: string;
  region: string;
  type: "مدفوع" | "غير مدفوع" | "تطوعي";
  duration: string;
  stipend: string;
  deadline: string;
  skills: string[];
  desc: string;
  requirements: string[];
  benefits: string[];
  tag: string;
  tagColor: string;
  featured: boolean;
  remote: boolean;
};

// ─── Data ─────────────────────────────────────────────────────────────────────
const INTERNSHIPS: Internship[] = [
  {
    id:1, title:"مطور تطبيقات Full Stack", company:"Exotel Lebanon", companyEmoji:"💻",
    sector:"تكنولوجيا", region:"بيروت", type:"مدفوع", duration:"3 أشهر صيف 2026",
    stipend:"600–900$ / شهر", deadline:"30 مايو 2026",
    skills:["React","Node.js","PostgreSQL","Git"],
    desc:"انضم لفريق التطوير لبناء تطبيقات ويب متكاملة. تجربة حقيقية مع عملاء دوليين.",
    requirements:["طالب هندسة حاسوب أو CS سنة 2+","معرفة بـ React أو Vue","مشاريع على GitHub"],
    benefits:["راتب مجزٍ","شهادة خبرة","فرصة توظيف","مرشد متخصص"],
    tag:"🔥 مطلوب الآن", tagColor:"bg-red-100 text-red-700", featured:true, remote:false,
  },
  {
    id:2, title:"محلل بيانات تسويقية", company:"Beirut Digital District", companyEmoji:"📊",
    sector:"تسويق رقمي", region:"بيروت", type:"مدفوع", duration:"2-3 أشهر",
    stipend:"400–600$ / شهر", deadline:"15 مايو 2026",
    skills:["Google Analytics","Excel","SQL","Python أساسي"],
    desc:"تحليل بيانات الحملات الرقمية لعملاء الشركة. تقارير أسبوعية وتوصيات تحسين.",
    requirements:["طالب تسويق أو بيانات","Excel احترافي","مهارات تحليلية"],
    benefits:["خبرة في بيئة ناشئة","شبكة علاقات في BDD","توصية مهنية"],
    tag:"✨ متميز", tagColor:"bg-purple-100 text-purple-700", featured:true, remote:false,
  },
  {
    id:3, title:"مساعد محاسب مالي", company:"Deloitte Lebanon", companyEmoji:"🏦",
    sector:"محاسبة ومالية", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"700–1000$ / شهر", deadline:"1 يونيو 2026",
    skills:["Excel","QuickBooks","محاسبة مالية","IFRS أساسيات"],
    desc:"تدريب في أحد أكبر شركات المراجعة في العالم. خبرة تحت إشراف مراجعين قانونيين.",
    requirements:["محاسبة أو مالية سنة 3+","GPA 80%+","إنجليزي مستوى B2"],
    benefits:["شهادة Deloitte","فرصة توظيف كبيرة","تدريب Big 4","مرجع مهني قوي"],
    tag:"⭐ Big 4", tagColor:"bg-blue-100 text-blue-700", featured:true, remote:false,
  },
  {
    id:4, title:"صحفي / منتج محتوى رقمي", company:"Annahar Digital", companyEmoji:"📰",
    sector:"إعلام وصحافة", region:"بيروت", type:"مدفوع", duration:"2 أشهر صيف",
    stipend:"300–500$ / شهر", deadline:"20 مايو 2026",
    skills:["كتابة عربية محترفة","تصوير","Adobe Premiere","Social Media"],
    desc:"إنتاج محتوى رقمي لمنصات النهار الرقمية. مقالات، فيديوهات قصيرة، وتغطيات.",
    requirements:["إعلام أو صحافة أو كتابة","عينات كتابة","حماس للإعلام الرقمي"],
    benefits:["نشر تحت اسمك","خبرة في مؤسسة إعلامية كبرى","شبكة صحفية"],
    tag:"✍️ إعلام", tagColor:"bg-amber-100 text-amber-700", featured:false, remote:false,
  },
  {
    id:5, title:"مهندس ميداني مدني", company:"Khatib & Alami", companyEmoji:"🏗️",
    sector:"هندسة مدنية", region:"المتن", type:"مدفوع", duration:"3 أشهر",
    stipend:"500–700$ / شهر", deadline:"10 يونيو 2026",
    skills:["AutoCAD","متابعة تنفيذ","قراءة مخططات","Excel"],
    desc:"تدريب ميداني على مشروع إنشائي حقيقي. مراقبة جودة، متابعة مقاولين، تقارير يومية.",
    requirements:["هندسة مدنية سنة 3+","رخصة قيادة","استعداد للعمل الميداني"],
    benefits:["خبرة مشروع حقيقي","شهادة مكتب هندسي مرموق","مرشد مهندس أول"],
    tag:"🏗️ ميداني", tagColor:"bg-green-100 text-green-700", featured:false, remote:false,
  },
  {
    id:6, title:"مدرّب / مرشد يوث", company:"منظمة Beyond — لبنان", companyEmoji:"🌍",
    sector:"عمل اجتماعي", region:"بيروت والجبل", type:"تطوعي", duration:"6 أشهر",
    stipend:"تطوعي + بدل نقل", deadline:"1 مايو 2026",
    skills:["تواصل مع الشباب","تصميم برامج","تربية","عمل جماعي"],
    desc:"إرشاد وتدريب طلاب ثانوي في المناطق المهمّشة. برامج مهارات حياتية وتوجيه مهني.",
    requirements:["شغف بالعمل الاجتماعي","تربية أو علم نفس أو مجال ذات صلة","تنقل مستقل"],
    benefits:["شهادة منظمة دولية","خبرة NGO","شبكة UN/NGO","تأثير حقيقي"],
    tag:"💚 NGO", tagColor:"bg-teal-100 text-teal-700", featured:false, remote:false,
  },
  {
    id:7, title:"مصمم UX/UI", company:"Tamatem Games", companyEmoji:"🎮",
    sector:"تصميم تكنولوجيا", region:"عن بعد", type:"مدفوع", duration:"3 أشهر",
    stipend:"500–800$ / شهر", deadline:"25 مايو 2026",
    skills:["Figma","Prototyping","User Research","UI Design"],
    desc:"تصميم تجربة المستخدم لألعاب موبايل مشهورة في الوطن العربي. فريق شاب وبيئة إبداعية.",
    requirements:["Portfolio تصاميم","Figma احترافي","فضول واهتمام بالألعاب"],
    benefits:["شهادة شركة ألعاب عالمية","راتب مجزٍ","عمل عن بعد","مشاريع حقيقية"],
    tag:"🎮 ريموت", tagColor:"bg-indigo-100 text-indigo-700", featured:true, remote:true,
  },
  {
    id:8, title:"ممرض متدرب — طوارئ", company:"مستشفى الجامعة الأمريكية AUH", companyEmoji:"🏥",
    sector:"صحة وطب", region:"بيروت", type:"غير مدفوع", duration:"شهر (إلزامي جامعي)",
    stipend:"تدريب جامعي إلزامي", deadline:"1 أكتوبر 2026",
    skills:["رعاية مرضى","إسعافات أولية","تواصل طاقم طبي","ACLS أساسيات"],
    desc:"تدريب سريري في أحد أفضل مستشفيات المنطقة. خبرة في قسم الطوارئ والعناية.",
    requirements:["طالب تمريض سنة 3+","توصية أكاديمية","خلو من السوابق"],
    benefits:["توصية AUH","خبرة مستشفى مرموق","تدريب سريري متقدم"],
    tag:"🏥 طبي", tagColor:"bg-rose-100 text-rose-700", featured:false, remote:false,
  },
  {
    id:9, title:"باحث مساعد — علوم بيئية", company:"AUB AREC", companyEmoji:"🌿",
    sector:"بيئة وعلوم", region:"بيروت", type:"مدفوع", duration:"صيف 2026",
    stipend:"400–600$ / شهر", deadline:"15 يونيو 2026",
    skills:["GIS","بحث علمي","Excel/R","كتابة تقارير"],
    desc:"مشاركة في أبحاث الزراعة والبيئة في مركز AUB للموارد الطبيعية.",
    requirements:["علوم بيئية أو زراعة أو بيولوجيا","GPA 78%+","شغف بالبحث"],
    benefits:["نشر علمي محتمل","خبرة مختبر جامعي","مرجع AUB"],
    tag:"🔬 بحثي", tagColor:"bg-emerald-100 text-emerald-700", featured:false, remote:false,
  },
  {
    id:10, title:"محامي متدرب", company:"Badri & Salim El-Meouchi Law Firm", companyEmoji:"⚖️",
    sector:"قانون", region:"بيروت", type:"مدفوع", duration:"3 أشهر صيف",
    stipend:"300–500$ / شهر", deadline:"1 مايو 2026",
    skills:["بحث قانوني","كتابة مذكرات","القانون اللبناني","محاضر اجتماعات"],
    desc:"تدريب في مكتب محاماة دولي متخصص بالقانون التجاري والتحكيم الدولي.",
    requirements:["حقوق سنة 3+","فرنسي/إنجليزي ممتاز","اهتمام بالقانون التجاري"],
    benefits:["خبرة في قضايا دولية","شبكة علاقات قانونية","توصية من محامي أول"],
    tag:"⚖️ قانون", tagColor:"bg-gray-100 text-gray-700", featured:false, remote:false,
  },

  // ─── شركات تكنولوجيا وستارت أبس لبنانية ────────────────────────────────
  {
    id:11, title:"مطوّر واجهات Front-End", company:"Berytech", companyEmoji:"🚀",
    sector:"تكنولوجيا", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"500–800$ / شهر", deadline:"15 يونيو 2026",
    skills:["React","TypeScript","Tailwind","Figma"],
    desc:"العمل مع ستارت-أبس داخل حاضنة Berytech على واجهات حديثة لمنتجات حقيقية.",
    requirements:["CS أو هندسة برمجيات سنة 3+","مشاريع React على GitHub","شغف بـ UI/UX"],
    benefits:["شبكة ستارت-أب لبنانية","فرصة توظيف بعد التدريب","Berytech Certificate"],
    tag:"🚀 ستارت-أب", tagColor:"bg-indigo-100 text-indigo-700", featured:true, remote:false,
  },
  {
    id:12, title:"DevOps Engineer Intern", company:"Murex Lebanon", companyEmoji:"💼",
    sector:"تكنولوجيا", region:"بيروت", type:"مدفوع", duration:"6 أشهر",
    stipend:"900–1,200$ / شهر", deadline:"30 أبريل 2026",
    skills:["Linux","Docker","Kubernetes","CI/CD","Python"],
    desc:"تدريب طويل في إحدى أكبر شركات البرمجة المالية بلبنان، فرص توظيف عالية.",
    requirements:["CS أو هندسة حاسوب سنة 4+","فهم Linux متقدم","إنجليزي ممتاز"],
    benefits:["راتب مرتفع","تأمين صحي","فرصة توظيف 80%","Murex Mentorship"],
    tag:"⭐ متميز", tagColor:"bg-purple-100 text-purple-700", featured:true, remote:false,
  },
  {
    id:13, title:"Data Engineer Intern", company:"Bookwhen", companyEmoji:"📊",
    sector:"تكنولوجيا", region:"عن بُعد", type:"مدفوع", duration:"3-6 أشهر",
    stipend:"600–900$ / شهر", deadline:"31 مايو 2026",
    skills:["SQL","Python","Airflow","BigQuery"],
    desc:"تدريب remote مع شركة بريطانية للبرمجة، التحويلات والإثراء على بيانات الإنتاج.",
    requirements:["CS أو علوم بيانات","SQL متقدم","Python على مستوى مشاريع"],
    benefits:["راتب بالدولار","شغل مرن","خبرة دولية","معدّات remote"],
    tag:"🌐 Remote", tagColor:"bg-cyan-100 text-cyan-700", featured:false, remote:true,
  },
  {
    id:14, title:"مطوّر تطبيقات موبايل Flutter", company:"AreebaTech", companyEmoji:"📱",
    sector:"تكنولوجيا", region:"بيروت", type:"مدفوع", duration:"3 أشهر صيف",
    stipend:"500–700$ / شهر", deadline:"15 مايو 2026",
    skills:["Flutter","Dart","Firebase","REST APIs"],
    desc:"بناء ميزات حقيقية في تطبيقات أريبا للدفع الإلكتروني والمدفوعات الرقمية.",
    requirements:["خبرة Flutter (متجر تطبيقات نقطة قوة)","سنة 3+","عمل مشروع كامل"],
    benefits:["إطلاق ميزة باسمك","شهادة","فرصة توظيف","فريق fintech"],
    tag:"💳 Fintech", tagColor:"bg-blue-100 text-blue-700", featured:false, remote:false,
  },
  {
    id:15, title:"مهندس ذكاء اصطناعي AI Intern", company:"InsightAI Lebanon", companyEmoji:"🤖",
    sector:"تكنولوجيا", region:"بيروت", type:"مدفوع", duration:"4 أشهر",
    stipend:"700–1,000$ / شهر", deadline:"20 يونيو 2026",
    skills:["Python","PyTorch","NLP","Vector DB"],
    desc:"بناء وتحسين نماذج LLM لتطبيقات عربية في خدمة العملاء والتحليل.",
    requirements:["CS أو علوم بيانات","مشاريع ML","عربي + إنجليزي"],
    benefits:["خبرة LLM متقدمة","مقال تقني باسمك","سفر لمؤتمر","فرصة توظيف"],
    tag:"🤖 AI", tagColor:"bg-purple-100 text-purple-700", featured:true, remote:false,
  },
  {
    id:16, title:"مصمم UI/UX", company:"Wakilni", companyEmoji:"🎨",
    sector:"تصميم وإبداع", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"400–600$ / شهر", deadline:"15 يونيو 2026",
    skills:["Figma","User Research","Prototyping","Design Systems"],
    desc:"تصميم تجربة المستخدم لتطبيق خدمات اللوجستيات الأكبر في لبنان.",
    requirements:["تصميم جرافيك أو HCI","Portfolio قوي","حس بحثي"],
    benefits:["العمل على منتج بمئات الآلاف","مرشد Lead Designer","فرصة توظيف"],
    tag:"🎨 تصميم", tagColor:"bg-pink-100 text-pink-700", featured:false, remote:false,
  },
  {
    id:17, title:"Cybersecurity Intern", company:"Potech Consulting", companyEmoji:"🔒",
    sector:"تكنولوجيا", region:"بيروت", type:"مدفوع", duration:"3-6 أشهر",
    stipend:"500–800$ / شهر", deadline:"30 أبريل 2026",
    skills:["Networks","Penetration Testing","SIEM","Linux"],
    desc:"تدريب على اختبار الاختراق والاستجابة للحوادث في شركة استشارات أمنية رائدة.",
    requirements:["هندسة شبكات أو CS","شغف بالأمن السيبراني","CompTIA Security+ مفضّل"],
    benefits:["شهادة Potech","مرور بـ Red Team و Blue Team","CTFs ممولة"],
    tag:"🛡️ أمن", tagColor:"bg-red-100 text-red-700", featured:false, remote:false,
  },

  // ─── بنوك ومالية ─────────────────────────────────────────────────────────
  {
    id:18, title:"محلل ائتمان متدرب", company:"Bank Audi", companyEmoji:"🏦",
    sector:"محاسبة ومالية", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"600–900$ / شهر", deadline:"30 مايو 2026",
    skills:["تحليل مالي","Excel","قراءة بيانات مالية","تقييم مخاطر"],
    desc:"تدريب في قسم الائتمان للشركات في أكبر بنك لبناني، مع مرور على فروع متعددة.",
    requirements:["مالية أو محاسبة سنة 3+","GPA 80%+","إنجليزي عمل"],
    benefits:["تدريب مصرفي معتمد","شبكة علاقات قوية","فرصة توظيف مرتفعة"],
    tag:"🏦 مصرفي", tagColor:"bg-blue-100 text-blue-700", featured:false, remote:false,
  },
  {
    id:19, title:"مدقّق حسابات متدرب", company:"EY Lebanon", companyEmoji:"📑",
    sector:"محاسبة ومالية", region:"بيروت", type:"مدفوع", duration:"3-4 أشهر",
    stipend:"700–1,000$ / شهر", deadline:"15 مايو 2026",
    skills:["IFRS","Excel متقدم","Audit Procedures","SAP"],
    desc:"تدريب في Big 4 على تدقيق شركات لبنانية ودولية، مع تدريبات صفية مكثفة.",
    requirements:["محاسبة سنة 3+","GPA 82%+","إنجليزي ممتاز"],
    benefits:["شهادة EY","فرصة توظيف 70%","تجربة Big 4 معترف بها عالمياً"],
    tag:"⭐ Big 4", tagColor:"bg-amber-100 text-amber-700", featured:true, remote:false,
  },
  {
    id:20, title:"مدقّق متدرّب — PwC", company:"PwC Lebanon", companyEmoji:"📊",
    sector:"محاسبة ومالية", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"700–1,000$ / شهر", deadline:"15 يونيو 2026",
    skills:["Audit","IFRS","Excel","Power BI"],
    desc:"برنامج PwC للمتدربين، تدريب فني وعملي في تدقيق وضرائب.",
    requirements:["محاسبة/مالية سنة 3+","GPA 80%+","إنجليزي ممتاز"],
    benefits:["شهادة PwC","فرصة توظيف","شبكة Big 4"],
    tag:"⭐ Big 4", tagColor:"bg-blue-100 text-blue-700", featured:true, remote:false,
  },
  {
    id:21, title:"متدرب — KPMG", company:"KPMG Lebanon", companyEmoji:"🔍",
    sector:"محاسبة ومالية", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"600–900$ / شهر", deadline:"31 مايو 2026",
    skills:["Tax","Audit","Excel","IFRS"],
    desc:"تدريب في قسم الضرائب أو التدقيق في KPMG لبنان، مع تدريبات داخلية معتمدة.",
    requirements:["محاسبة سنة 3+","GPA 80%+","إنجليزي عمل"],
    benefits:["شهادة KPMG","فرصة توظيف","Big 4 experience"],
    tag:"⭐ Big 4", tagColor:"bg-indigo-100 text-indigo-700", featured:false, remote:false,
  },
  {
    id:22, title:"محلل استثمار متدرب", company:"BLOM Bank", companyEmoji:"💹",
    sector:"محاسبة ومالية", region:"بيروت", type:"مدفوع", duration:"2-3 أشهر",
    stipend:"500–800$ / شهر", deadline:"10 يونيو 2026",
    skills:["تحليل الأسواق","Excel نمذجة","Bloomberg أساسيات","عرض تقديمي"],
    desc:"دعم فريق إدارة الأصول في تحليل فرص استثمارية محلية وإقليمية.",
    requirements:["مالية سنة 3+","شغف بالأسواق","GPA 80%+"],
    benefits:["تدريب استثمار حقيقي","رخصة استشارات مالية لبنانية إن أمكن","توصية مرجعية"],
    tag:"💹 استثمار", tagColor:"bg-green-100 text-green-700", featured:false, remote:false,
  },
  {
    id:23, title:"Insurance Underwriter Intern", company:"Bankers Assurance", companyEmoji:"🛡️",
    sector:"محاسبة ومالية", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"400–600$ / شهر", deadline:"31 مايو 2026",
    skills:["تقييم مخاطر","Excel","تحليل بوالص"],
    desc:"تدريب في قسم اكتتاب التأمين، تقييم وتسعير البوالص الجديدة.",
    requirements:["مالية أو رياضيات أكتوارية","تفكير تحليلي","GPA 75%+"],
    benefits:["تدريب أكتواري عملي","شبكة في قطاع التأمين","شهادة"],
    tag:"🛡️ تأمين", tagColor:"bg-cyan-100 text-cyan-700", featured:false, remote:false,
  },

  // ─── إعلام وتسويق ─────────────────────────────────────────────────────────
  {
    id:24, title:"مسؤول وسائل تواصل اجتماعي", company:"L'Orient-Le Jour", companyEmoji:"📰",
    sector:"إعلام وصحافة", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"300–500$ / شهر", deadline:"20 مايو 2026",
    skills:["Twitter/X","Instagram","Meta Business Suite","كتابة Hooks"],
    desc:"إدارة قنوات التواصل لجريدة L'Orient-Le Jour الفرنسية، نشر وتحرير وتفاعل.",
    requirements:["إعلام أو تسويق","فرنسي ممتاز","حس تحريري"],
    benefits:["نشر باسمك","خبرة في مؤسسة عريقة","شبكة صحفيين"],
    tag:"✍️ صحافة", tagColor:"bg-amber-100 text-amber-700", featured:false, remote:false,
  },
  {
    id:25, title:"منتج بودكاست", company:"Sowt Lebanon", companyEmoji:"🎙️",
    sector:"إعلام وصحافة", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"400–600$ / شهر", deadline:"15 يونيو 2026",
    skills:["Audacity","Adobe Audition","كتابة سيناريو","بحث صحفي"],
    desc:"المشاركة في إنتاج بودكاست عربي قصصي، من البحث للمونتاج للنشر.",
    requirements:["شغف بالصوت والقصص","نموذج عمل صوتي إن أمكن"],
    benefits:["كريديت إنتاج","تعلّم سرد قصصي","شبكة بودكاسترز عرب"],
    tag:"🎙️ بودكاست", tagColor:"bg-purple-100 text-purple-700", featured:false, remote:false,
  },
  {
    id:26, title:"مصور فوتوغراف / فيديو", company:"Megaphone News", companyEmoji:"📸",
    sector:"إعلام وصحافة", region:"بيروت", type:"مدفوع", duration:"3 أشهر صيف",
    stipend:"500–700$ / شهر", deadline:"30 أبريل 2026",
    skills:["DSLR","Premiere Pro","تصوير ميداني","لون"],
    desc:"تغطية بصرية لقصص اجتماعية وسياسية في منصة Megaphone المستقلة.",
    requirements:["Portfolio","استعداد للعمل الميداني","حس إخباري"],
    benefits:["تغطيات منشورة","معدّات مزوّدة","شبكة صحفية مستقلة"],
    tag:"📸 إعلام", tagColor:"bg-red-100 text-red-700", featured:false, remote:false,
  },
  {
    id:27, title:"كاتب محتوى تسويقي", company:"Cloud9 Agency", companyEmoji:"☁️",
    sector:"تسويق رقمي", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"400–600$ / شهر", deadline:"31 مايو 2026",
    skills:["Copywriting","SEO","عربي + إنجليزي","Brand Voice"],
    desc:"كتابة محتوى لحملات عملاء الوكالة (مطاعم، عقارات، تجزئة).",
    requirements:["شغف بالكتابة","عينات منشورة","سنة 2+"],
    benefits:["تنوع كبير في العملاء","نشر تحت brand كبيرة","فرصة توظيف"],
    tag:"✍️ كتابة", tagColor:"bg-orange-100 text-orange-700", featured:false, remote:false,
  },
  {
    id:28, title:"Performance Marketing Intern", company:"Born Interactive", companyEmoji:"📈",
    sector:"تسويق رقمي", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"500–700$ / شهر", deadline:"15 مايو 2026",
    skills:["Meta Ads","Google Ads","GA4","Excel"],
    desc:"إدارة حملات إعلانية لعملاء إقليميين بميزانيات حقيقية تحت إشراف Lead.",
    requirements:["تسويق أو بزنس","ميزة Google Ads Certification","GPA 78%+"],
    benefits:["إدارة ميزانيات حقيقية","شهادة وكالة معتمدة","شبكة marketing"],
    tag:"📈 إعلانات", tagColor:"bg-blue-100 text-blue-700", featured:true, remote:false,
  },
  {
    id:29, title:"Brand Manager Intern", company:"Pepsi Lebanon (PLG)", companyEmoji:"🥤",
    sector:"تسويق رقمي", region:"بيروت", type:"مدفوع", duration:"3 أشهر صيف",
    stipend:"800–1,200$ / شهر", deadline:"30 أبريل 2026",
    skills:["Brand Strategy","Excel","Market Research","Power BI"],
    desc:"تدريب صيفي مع فريق Marketing بشركة Pepsi، خبرة FMCG حقيقية.",
    requirements:["Marketing سنة 3+","GPA 82%+","إنجليزي ممتاز","قيادة في الجامعة"],
    benefits:["شهادة Pepsi","فرصة توظيف في PLG","تدريب FMCG معترف به"],
    tag:"🏆 شركة كبرى", tagColor:"bg-red-100 text-red-700", featured:true, remote:false,
  },

  // ─── هندسة ─────────────────────────────────────────────────────────────────
  {
    id:30, title:"مهندس كهرباء متدرب — توليد", company:"EDL Lebanon", companyEmoji:"⚡",
    sector:"هندسة كهربائية", region:"بيروت", type:"غير مدفوع", duration:"شهرين (جامعي)",
    stipend:"تدريب جامعي إلزامي", deadline:"30 يونيو 2026",
    skills:["لوحات كهربائية","قراءة مخططات","Safety","فرق ميدانية"],
    desc:"تدريب جامعي على محطات توليد وشبكات الكهرباء في مؤسسة كهرباء لبنان.",
    requirements:["هندسة كهرباء سنة 3+","معدات أمان شخصية","غير مدفوع"],
    benefits:["خبرة على شبكة وطنية حقيقية","توصية مؤسسة حكومية","شهادة تدريب"],
    tag:"⚡ ميداني", tagColor:"bg-yellow-100 text-yellow-700", featured:false, remote:false,
  },
  {
    id:31, title:"مهندس ميكانيكي متدرب", company:"Indevco Group", companyEmoji:"⚙️",
    sector:"هندسة ميكانيكية", region:"المتن", type:"مدفوع", duration:"3 أشهر",
    stipend:"500–700$ / شهر", deadline:"15 مايو 2026",
    skills:["SolidWorks","Lean Manufacturing","الإنتاج","فحص جودة"],
    desc:"تدريب في إحدى أكبر مجموعات التصنيع بالمنطقة، خط إنتاج حقيقي.",
    requirements:["هندسة ميكانيكية سنة 3+","SolidWorks/AutoCAD","استعداد ميداني"],
    benefits:["خبرة في FMCG manufacturing","فرص توظيف داخل المجموعة","تدريب Lean"],
    tag:"🏭 صناعة", tagColor:"bg-gray-100 text-gray-700", featured:false, remote:false,
  },
  {
    id:32, title:"مهندس معماري متدرب", company:"Bernard Khoury Studio", companyEmoji:"🏛️",
    sector:"هندسة معمارية", region:"بيروت", type:"مدفوع", duration:"3-6 أشهر",
    stipend:"400–700$ / شهر", deadline:"30 أبريل 2026",
    skills:["AutoCAD","Rhino","Revit","SketchUp","تصور 3D"],
    desc:"تدريب في أحد أشهر مكاتب العمارة في لبنان، مشاريع محلية ودولية.",
    requirements:["عمارة سنة 4+","Portfolio قوي","شغف بالتصميم المعاصر"],
    benefits:["مكتب معماري شهير","Portfolio فاخر","شبكة عمارة دولية"],
    tag:"🏛️ تصميم", tagColor:"bg-indigo-100 text-indigo-700", featured:true, remote:false,
  },
  {
    id:33, title:"مهندس بترول متدرّب", company:"Spectrum Geo Lebanon", companyEmoji:"⛽",
    sector:"هندسة بترول", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"600–900$ / شهر", deadline:"15 يونيو 2026",
    skills:["تحليل بيانات سيزمية","GIS","Python","تقارير فنية"],
    desc:"تدريب في تحليل البيانات الجيولوجية البحرية لمشاريع التنقيب اللبنانية.",
    requirements:["هندسة بترول/جيولوجيا","GPA 80%+","شغف بالطاقة"],
    benefits:["خبرة قطاع نفط فريد","شبكة دولية","رواتب أعلى من المعدل"],
    tag:"⛽ نفط", tagColor:"bg-amber-100 text-amber-700", featured:false, remote:false,
  },

  // ─── الصحة والطب ─────────────────────────────────────────────────────────
  {
    id:34, title:"صيدلي متدرب", company:"Mazen Pharmacy Group", companyEmoji:"💊",
    sector:"صحة وطب", region:"all", type:"مدفوع", duration:"شهرين",
    stipend:"400–600$ / شهر", deadline:"30 يونيو 2026",
    skills:["استشارات دوائية","مخزون","تسعير","تواصل مع المرضى"],
    desc:"تدريب صيدلي في سلسلة صيدليات منتشرة، خبرة في صيدلية المجتمع.",
    requirements:["صيدلة سنة 4+","ترخيص مزاولة قيد التحضير"],
    benefits:["خبرة فروع متعددة","ميزة قوية في الـ CV","شبكة صيادلة"],
    tag:"💊 صيدلة", tagColor:"bg-emerald-100 text-emerald-700", featured:false, remote:false,
  },
  {
    id:35, title:"باحث في الصحة العامة", company:"AUB FHS", companyEmoji:"🏥",
    sector:"صحة وطب", region:"بيروت", type:"مدفوع", duration:"صيف 2026",
    stipend:"500–700$ / شهر", deadline:"15 أبريل 2026",
    skills:["SPSS","Epi Info","كتابة علمية","بحث ميداني"],
    desc:"تدريب بحثي في كلية الصحة العامة بـ AUB على مشاريع وبائية.",
    requirements:["صحة عامة أو طب سنة 3+","شغف بالبحث","GPA 80%+"],
    benefits:["نشر علمي محتمل","شبكة باحثي AUB","تدريب على منهجيات بحث"],
    tag:"🔬 بحث صحي", tagColor:"bg-blue-100 text-blue-700", featured:false, remote:false,
  },
  {
    id:36, title:"طبيب أسنان متدرب", company:"Hopital du Sacré-Cœur", companyEmoji:"🦷",
    sector:"صحة وطب", region:"جبل لبنان", type:"غير مدفوع", duration:"شهر",
    stipend:"تدريب جامعي إلزامي", deadline:"31 يوليو 2026",
    skills:["تنظيف وحشوات","قراءة أشعة","تواصل مع المرضى"],
    desc:"تدريب جامعي على عيادات أسنان في مستشفى متخصص بإشراف اختصاصيين.",
    requirements:["طب أسنان سنة 4+","رسوم مهنية","ساعات إكلينيكية مطلوبة"],
    benefits:["ساعات معتمدة","توصية مستشفى","شبكة عيادات"],
    tag:"🦷 سريري", tagColor:"bg-rose-100 text-rose-700", featured:false, remote:false,
  },

  // ─── NGOs والقطاع الإنساني ─────────────────────────────────────────────
  {
    id:37, title:"مساعد برامج إنسانية", company:"UNICEF Lebanon", companyEmoji:"👶",
    sector:"عمل إنساني", region:"بيروت", type:"مدفوع", duration:"3-6 أشهر",
    stipend:"تدريب UN مدفوع جزئياً", deadline:"31 مارس 2026",
    skills:["تقارير","Excel","تواصل مع منظمات","عربي + إنجليزي ممتاز"],
    desc:"دعم برامج حماية الطفل والتعليم في يونيسف لبنان مع نزول ميداني.",
    requirements:["شؤون دولية أو تنمية","سنة 3+","تطوع سابق ميزة"],
    benefits:["شهادة UN","شبكة المنظمات الدولية","UN Internship Letter"],
    tag:"🇺🇳 أممي", tagColor:"bg-sky-100 text-sky-700", featured:true, remote:false,
  },
  {
    id:38, title:"باحث ميداني — الفقر والهجرة", company:"UNRWA Lebanon", companyEmoji:"🏚️",
    sector:"عمل إنساني", region:"all", type:"مدفوع", duration:"3 أشهر",
    stipend:"600–800$ / شهر", deadline:"30 أبريل 2026",
    skills:["مقابلات ميدانية","تقارير","Excel","عربي + إنجليزي"],
    desc:"بحث ميداني في مخيمات اللاجئين الفلسطينيين، تقارير ودراسات حالة.",
    requirements:["علوم اجتماعية أو شؤون دولية","استعداد ميداني","حس حقوقي"],
    benefits:["UN reference","خبرة ميدانية فريدة","نشر تقرير محتمل"],
    tag:"🇺🇳 أممي", tagColor:"bg-sky-100 text-sky-700", featured:false, remote:false,
  },
  {
    id:39, title:"منسق برامج تعليمية", company:"Jusoor NGO", companyEmoji:"🌉",
    sector:"عمل إنساني", region:"بيروت", type:"تطوعي", duration:"6 أشهر مرن",
    stipend:"تطوّع مع بدل مواصلات", deadline:"30 يونيو 2026",
    skills:["تخطيط دروس","إدارة صف","مهارات تواصل","عربي ممتاز"],
    desc:"تطوّع لتعليم أطفال اللاجئين السوريين في مراكز Jusoor عبر لبنان.",
    requirements:["تربية أو تخصص ذي صلة","ساعات أسبوعية محددة","التزام أخلاقي"],
    benefits:["تجربة إنسانية عميقة","شهادة NGO","شبكة ميدانية"],
    tag:"❤️ تطوّع", tagColor:"bg-red-100 text-red-700", featured:false, remote:false,
  },
  {
    id:40, title:"محلل سياسات", company:"LCPS — Lebanese Center for Policy Studies", companyEmoji:"📊",
    sector:"بحث وسياسات", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"500–800$ / شهر", deadline:"15 مايو 2026",
    skills:["بحث سياسات","كتابة أوراق","تحليل بيانات حكومية"],
    desc:"دعم باحثين في مركز LCPS لإصدار أوراق سياسات حول اللامركزية والاقتصاد.",
    requirements:["علوم سياسية أو اقتصاد","سنة 3+","عربي + إنجليزي ممتاز كتابة"],
    benefits:["نشر باسمك","شبكة سياسات لبنانية","مرجع باحث أول"],
    tag:"📊 سياسات", tagColor:"bg-purple-100 text-purple-700", featured:false, remote:false,
  },

  // ─── تدريبات remote ودولية ─────────────────────────────────────────────
  {
    id:41, title:"Software Engineer Intern", company:"Anghami", companyEmoji:"🎵",
    sector:"تكنولوجيا", region:"عن بُعد", type:"مدفوع", duration:"6 أشهر",
    stipend:"1,000–1,500$ / شهر", deadline:"20 أبريل 2026",
    skills:["Python","Go","Kubernetes","ML أساسيات"],
    desc:"تدريب مدفوع بالكامل remote في شركة الموسيقى الأكبر بالمنطقة (Nasdaq).",
    requirements:["CS سنة 3+","شغف بـ Backend أو ML","إنجليزي ممتاز"],
    benefits:["شركة مدرجة","شغل remote","فرصة توظيف دولية","معدات remote"],
    tag:"🌐 Remote", tagColor:"bg-cyan-100 text-cyan-700", featured:true, remote:true,
  },
  {
    id:42, title:"Customer Success Intern", company:"Notion (USA)", companyEmoji:"📒",
    sector:"تكنولوجيا", region:"عن بُعد", type:"مدفوع", duration:"3 أشهر",
    stipend:"1,500$ / شهر", deadline:"31 يناير 2026",
    skills:["English C1+","تواصل","حل مشاكل","SaaS"],
    desc:"تدريب remote مع Notion على دعم العملاء والـ Onboarding للحسابات.",
    requirements:["أي تخصص","إنجليزي ممتاز","تجربة على Notion","ساعات تتقاطع مع USA"],
    benefits:["شركة عالمية","راتب دولاري","شبكة عملاء دوليين","Stock options محتملة"],
    tag:"🌐 Remote", tagColor:"bg-cyan-100 text-cyan-700", featured:true, remote:true,
  },
  {
    id:43, title:"Translator Intern (AR↔EN)", company:"Welocalize", companyEmoji:"🌍",
    sector:"لغات", region:"عن بُعد", type:"مدفوع", duration:"مرن 3-6 أشهر",
    stipend:"15-25$ / ساعة", deadline:"31 يوليو 2026",
    skills:["ترجمة","CAT tools","Localization","عربي + إنجليزي"],
    desc:"تدريب مع شركة Localization كبرى، ترجمة تطبيقات ومواقع لشركات تكنولوجيا.",
    requirements:["ترجمة أو لغات","عينات ترجمة","ساعات مرنة"],
    benefits:["دفع بالساعة","شغل مرن","شهادة Localization","مشاريع متنوعة"],
    tag:"🌐 Remote", tagColor:"bg-pink-100 text-pink-700", featured:false, remote:true,
  },
  {
    id:44, title:"UN Volunteer — Online", company:"UNV", companyEmoji:"🇺🇳",
    sector:"عمل إنساني", region:"عن بُعد", type:"تطوعي", duration:"3-6 أشهر",
    stipend:"تطوّع شرفي", deadline:"مفتوح طوال السنة",
    skills:["مهارة متخصصة (تصميم/كتابة/ترجمة/IT)","عربي + إنجليزي"],
    desc:"التطوع مع منظمات أممية ضمن منصة UNV الإلكترونية، مرن وعن بُعد بالكامل.",
    requirements:["18+","حساب على onlinevolunteering.org","مهارة محددة"],
    benefits:["UN Certificate","CV قوي","تجربة دولية","شبكة عالمية"],
    tag:"🇺🇳 تطوّع", tagColor:"bg-sky-100 text-sky-700", featured:false, remote:true,
  },
  {
    id:45, title:"Marketing Fellow", company:"Google Career Certificates", companyEmoji:"🅖",
    sector:"تسويق رقمي", region:"عن بُعد", type:"مدفوع", duration:"3 أشهر",
    stipend:"تدريب + شهادة Google", deadline:"30 يونيو 2026",
    skills:["Google Ads","Analytics","SEO","شهادات Google"],
    desc:"برنامج Google Career Certificates مع تدريب عملي مدفوع جزئياً للمنطقة العربية.",
    requirements:["شغف بالتسويق الرقمي","إنجليزي عمل","عمل من أي مكان"],
    benefits:["شهادة Google معترف بها","شبكة Google Partners","فرصة توظيف لاحقة"],
    tag:"🎓 Google", tagColor:"bg-yellow-100 text-yellow-700", featured:true, remote:true,
  },
  {
    id:46, title:"Content Strategist Remote", company:"HubSpot", companyEmoji:"🟧",
    sector:"تسويق رقمي", region:"عن بُعد", type:"مدفوع", duration:"3-6 أشهر",
    stipend:"1,200–1,800$ / شهر", deadline:"15 أبريل 2026",
    skills:["Content Marketing","SEO","Inbound","HubSpot CMS"],
    desc:"إنتاج محتوى لمدوّنات HubSpot العالمية، شغل remote بالكامل من أي مكان.",
    requirements:["إنجليزي C1+","عينات كتابة منشورة","فهم Inbound Marketing"],
    benefits:["راتب دولاري","نشر تحت brand كبرى","HubSpot Certifications مجانية"],
    tag:"🌐 Remote", tagColor:"bg-orange-100 text-orange-700", featured:false, remote:true,
  },
  {
    id:47, title:"Research Assistant — World Bank", company:"World Bank Beirut", companyEmoji:"🌐",
    sector:"بحث وسياسات", region:"بيروت", type:"مدفوع", duration:"3-6 أشهر",
    stipend:"800–1,200$ / شهر", deadline:"31 مارس 2026",
    skills:["Stata/R","تحليل اقتصادي","تقارير","إنجليزي ممتاز"],
    desc:"تدريب في مكتب البنك الدولي ببيروت على دراسات اقتصادية عن لبنان والمنطقة.",
    requirements:["اقتصاد أو إحصاء","GPA 85%+","سنة 4+ أو ماجستير"],
    benefits:["شهادة World Bank","شبكة دولية","تدريب اقتصادي متقدم"],
    tag:"🏛️ دولية", tagColor:"bg-indigo-100 text-indigo-700", featured:true, remote:false,
  },
  {
    id:48, title:"Junior Consultant — McKinsey", company:"McKinsey Beirut", companyEmoji:"📐",
    sector:"استشارات", region:"بيروت", type:"مدفوع", duration:"10 أسابيع صيف",
    stipend:"3,000$+ / شهر", deadline:"30 سبتمبر 2025", // Note: very early deadline
    skills:["Problem Solving","Excel","PowerPoint","Case Interviews"],
    desc:"برنامج Summer Business Analyst في McKinsey، أعرق برنامج تدريب استشاري.",
    requirements:["GPA 90%+ أو ما يعادله","قيادة بارزة","مقابلات Case صعبة"],
    benefits:["راتب مرتفع جداً","شبكة McKinsey العالمية","ضمان تقريباً للعرض الكامل"],
    tag:"🏆 نخبوي", tagColor:"bg-purple-100 text-purple-700", featured:true, remote:false,
  },
  {
    id:49, title:"Strategy Intern — BCG", company:"BCG Beirut", companyEmoji:"📊",
    sector:"استشارات", region:"بيروت", type:"مدفوع", duration:"10 أسابيع",
    stipend:"3,000$+ / شهر", deadline:"15 أكتوبر 2025",
    skills:["Analytical Thinking","Excel","PPT","English"],
    desc:"تدريب صيفي مع Boston Consulting Group في مكتب بيروت على مشاريع إقليمية.",
    requirements:["GPA 88%+","شغف بالاستراتيجية","Case Interview Prep"],
    benefits:["شهادة BCG","شبكة استشارية","عرض كامل بنسبة عالية"],
    tag:"🏆 نخبوي", tagColor:"bg-purple-100 text-purple-700", featured:true, remote:false,
  },
  {
    id:50, title:"HR & Talent Intern", company:"Lazzo Group", companyEmoji:"👥",
    sector:"موارد بشرية", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"400–600$ / شهر", deadline:"31 مايو 2026",
    skills:["Recruitment","ATS","Excel","تواصل"],
    desc:"دعم فريق HR في الفلترة والمقابلات والـ Onboarding عبر مجموعة مطاعم وفنادق.",
    requirements:["HR أو إدارة أعمال","تواصل ممتاز","عربي + إنجليزي"],
    benefits:["شبكة HR لبنانية","ATS experience","شهادة"],
    tag:"👥 HR", tagColor:"bg-pink-100 text-pink-700", featured:false, remote:false,
  },
  {
    id:51, title:"Hospitality Management Intern", company:"Le Royal Hotel Lebanon", companyEmoji:"🏨",
    sector:"ضيافة وسياحة", region:"جبل لبنان", type:"مدفوع", duration:"6 أشهر",
    stipend:"500–700$ / شهر", deadline:"30 أبريل 2026",
    skills:["Customer Service","Opera PMS","فرنسي/إنجليزي","ضيافة"],
    desc:"تدريب شامل في فندق 5 نجوم: استقبال، مبيعات، أحداث، F&B، إدارة.",
    requirements:["إدارة فنادق سنة 3+","لغتين","مرونة شيفت"],
    benefits:["وجبات + سكن","شهادة فندق 5 نجوم","فرصة توظيف"],
    tag:"🏨 فندقي", tagColor:"bg-amber-100 text-amber-700", featured:false, remote:false,
  },
  {
    id:52, title:"Chef Intern", company:"Mayrig Restaurant", companyEmoji:"🍽️",
    sector:"ضيافة وسياحة", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"500–700$ / شهر", deadline:"31 مايو 2026",
    skills:["Knife Skills","HACCP","مطبخ شرقي","التزام بالنظافة"],
    desc:"تدريب طهي في مطعم أرمني مرموق ببيروت، تحت إشراف Executive Chef.",
    requirements:["كلية فنون الطهي","سنة 2+","استعداد لشيفت طويل"],
    benefits:["وجبات","توصية شيف","شبكة مطاعم","فرصة توظيف"],
    tag:"🍳 طبخ", tagColor:"bg-orange-100 text-orange-700", featured:false, remote:false,
  },
  {
    id:53, title:"Production Assistant — Film", company:"The Talkies Studio", companyEmoji:"🎬",
    sector:"إعلام وصحافة", region:"بيروت", type:"مدفوع", duration:"حسب المشروع",
    stipend:"500–900$ / شهر", deadline:"15 يونيو 2026",
    skills:["Production Coordination","Excel","لوجستيات","تواصل"],
    desc:"تدريب في استوديو إنتاج إعلانات وأفلام قصيرة، عمل بكواليس الإنتاج.",
    requirements:["إعلام أو سينما","مرونة بالساعات","لياقة بدنية"],
    benefits:["كريديت إنتاج","شبكة سينمائية","شهادة من ستوديو"],
    tag:"🎬 سينما", tagColor:"bg-red-100 text-red-700", featured:false, remote:false,
  },
  {
    id:54, title:"Junior Architect Remote", company:"Studio Other Spaces (Berlin)", companyEmoji:"🌍",
    sector:"هندسة معمارية", region:"عن بُعد", type:"مدفوع", duration:"3-6 أشهر",
    stipend:"1,000–1,500€ / شهر", deadline:"15 أبريل 2026",
    skills:["Rhino","Grasshopper","Architecture Theory","إنجليزي عمل"],
    desc:"تدريب remote مع استوديو Olafur Eliasson في برلين على مشاريع تركيبية فنية.",
    requirements:["عمارة سنة 5","Portfolio ممتاز","Rhino متقدم"],
    benefits:["استوديو فني عالمي","شغف معاصر","Portfolio دولي"],
    tag:"🌐 Remote", tagColor:"bg-indigo-100 text-indigo-700", featured:false, remote:true,
  },
  {
    id:55, title:"Junior Data Scientist — Kaggle Path", company:"Kaggle (Google)", companyEmoji:"📈",
    sector:"تكنولوجيا", region:"عن بُعد", type:"تطوعي", duration:"مرن",
    stipend:"تطوّع + جوائز مالية", deadline:"مفتوح طوال السنة",
    skills:["Python","ML","Pandas","Scikit-learn"],
    desc:"حلّ مسابقات Kaggle والمساهمة في مجتمعها، طريق لشهادات وتوظيف.",
    requirements:["شغف بـ Data Science","حساب Kaggle نشط"],
    benefits:["جوائز نقدية في المسابقات","Kaggle Tier (Expert/Master)","فرص توظيف دولية"],
    tag:"🌐 Remote", tagColor:"bg-cyan-100 text-cyan-700", featured:false, remote:true,
  },
  {
    id:56, title:"Trainee — IFC (World Bank Group)", company:"IFC Beirut", companyEmoji:"🌐",
    sector:"محاسبة ومالية", region:"بيروت", type:"مدفوع", duration:"3-6 أشهر",
    stipend:"900–1,300$ / شهر", deadline:"31 يناير 2026",
    skills:["Financial Modeling","M&A أساسيات","إنجليزي ممتاز","Excel"],
    desc:"تدريب في International Finance Corporation على مشاريع استثمار في القطاع الخاص.",
    requirements:["مالية أو اقتصاد سنة 4+","GPA 85%+","عينة من نمذجة مالية"],
    benefits:["شهادة IFC","شبكة WB دولية","فرصة توظيف خارجي"],
    tag:"🌐 دولية", tagColor:"bg-blue-100 text-blue-700", featured:true, remote:false,
  },
  {
    id:57, title:"Junior Auditor — Deloitte Remote", company:"Deloitte Global Delivery", companyEmoji:"🌐",
    sector:"محاسبة ومالية", region:"عن بُعد", type:"مدفوع", duration:"6 أشهر",
    stipend:"1,000–1,400$ / شهر", deadline:"30 أبريل 2026",
    skills:["IFRS","Audit Tools","Excel","Power Query"],
    desc:"تدريب remote في مركز Deloitte العالمي للخدمات على مهام تدقيق لعملاء أوروبيين.",
    requirements:["محاسبة سنة 3+","إنجليزي ممتاز","جهاز موثوق + إنترنت ثابت"],
    benefits:["راتب دولاري","شغل من البيت","Big 4","شهادة عالمية"],
    tag:"🌐 Remote", tagColor:"bg-blue-100 text-blue-700", featured:true, remote:true,
  },
  {
    id:58, title:"Civic Engagement Fellow", company:"Daleel Madani", companyEmoji:"🇱🇧",
    sector:"عمل إنساني", region:"بيروت", type:"مدفوع", duration:"6 أشهر",
    stipend:"500–700$ / شهر", deadline:"15 مايو 2026",
    skills:["كتابة أبحاث","تواصل","شبكات NGOs","عربي ممتاز"],
    desc:"تدريب في منصة Daleel Madani المرجع للمجتمع المدني اللبناني.",
    requirements:["شؤون عامة أو إعلام","شغف بالعمل المدني","سنة 3+"],
    benefits:["شبكة NGOs لبنانية","نشر تحليلات","تجربة قطاع مدني"],
    tag:"🇱🇧 مدني", tagColor:"bg-red-100 text-red-700", featured:false, remote:false,
  },
  {
    id:59, title:"Wine & Hospitality Intern", company:"IXSIR Winery", companyEmoji:"🍷",
    sector:"ضيافة وسياحة", region:"الشمال", type:"مدفوع", duration:"3 أشهر صيف",
    stipend:"500–700$ / شهر + سكن", deadline:"30 أبريل 2026",
    skills:["الضيافة","تذوّق","فرنسي/إنجليزي","مبيعات"],
    desc:"تدريب في كرم IXSIR الشهير، تعرّف على صناعة النبيذ من البداية للنهاية.",
    requirements:["ضيافة أو إدارة","21+","شغف بالنبيذ"],
    benefits:["سكن في الكرم","معرفة صناعة فاخرة","شبكة فنادق ومطاعم"],
    tag:"🍷 فاخر", tagColor:"bg-purple-100 text-purple-700", featured:false, remote:false,
  },
  {
    id:60, title:"Mobile App Tester (QA)", company:"Toters", companyEmoji:"🛵",
    sector:"تكنولوجيا", region:"بيروت", type:"مدفوع", duration:"3 أشهر",
    stipend:"400–600$ / شهر", deadline:"31 يوليو 2026",
    skills:["QA","Postman","Jira","Test Cases"],
    desc:"اختبار تطبيق Toters على أجهزة متعددة، إيجاد bugs وكتابة تقارير.",
    requirements:["CS أو هندسة","انتباه للتفاصيل","استخدام تطبيقات توصيل"],
    benefits:["تطبيق بمئات الآلاف","فرصة توظيف Junior QA","تدريب على ATS"],
    tag:"🐛 QA", tagColor:"bg-green-100 text-green-700", featured:false, remote:false,
  },
  {
    id:61, title:"Solar Energy Engineer Intern", company:"Phoenix Energy", companyEmoji:"☀️",
    sector:"هندسة كهربائية", region:"all", type:"مدفوع", duration:"3 أشهر",
    stipend:"500–700$ / شهر", deadline:"31 مايو 2026",
    skills:["PV Design","PVsyst","AutoCAD","ميدان"],
    desc:"تدريب على تصميم وتركيب أنظمة طاقة شمسية لمنازل ومؤسسات لبنانية.",
    requirements:["هندسة كهربائية سنة 3+","رخصة قيادة","استعداد ميداني"],
    benefits:["خبرة على مشاريع حقيقية","شبكة قطاع متنامي","فرصة توظيف"],
    tag:"☀️ طاقة", tagColor:"bg-yellow-100 text-yellow-700", featured:false, remote:false,
  },
  {
    id:62, title:"Junior Game Developer", company:"Game Cooks", companyEmoji:"🎮",
    sector:"تكنولوجيا", region:"بيروت", type:"مدفوع", duration:"3-6 أشهر",
    stipend:"500–800$ / شهر", deadline:"30 يونيو 2026",
    skills:["Unity","C#","Game Design","Blender"],
    desc:"تدريب في أحد أكبر استوديوهات الألعاب بالمنطقة، نشر على iOS و Android.",
    requirements:["CS أو game design","لعبة شخصية على store","شغف بالألعاب"],
    benefits:["إطلاق لعبة باسمك","شبكة gaming MENA","فرصة توظيف"],
    tag:"🎮 ألعاب", tagColor:"bg-purple-100 text-purple-700", featured:false, remote:false,
  },
  {
    id:63, title:"Junior Veterinarian Intern", company:"Animals Lebanon", companyEmoji:"🐾",
    sector:"صحة وطب", region:"جبل لبنان", type:"تطوعي", duration:"3 أشهر",
    stipend:"تطوّع + بدل مواصلات", deadline:"31 يوليو 2026",
    skills:["رعاية حيوانية","تطعيمات","تواصل","تعاطف"],
    desc:"تطوّع في ملجأ الحيوانات لمساعدة الأطباء البيطريين في الرعاية والعلاج.",
    requirements:["طب بيطري سنة 3+","تطعيمات سارية","لياقة بدنية"],
    benefits:["خبرة سريرية","شبكة بيطرية لبنانية","شهادة"],
    tag:"🐾 رفق", tagColor:"bg-emerald-100 text-emerald-700", featured:false, remote:false,
  },
];

const SECTORS = ["الكل", ...Array.from(new Set(INTERNSHIPS.map(i => i.sector)))];
const TYPES = ["الكل", "مدفوع", "غير مدفوع", "تطوعي"] as const;

// ─── Company Pages Data ────────────────────────────────────────────────────────
const COMPANIES = [
  { name:"Exotel Lebanon", emoji:"💻", sector:"تكنولوجيا", size:"50-200 موظف", desc:"شركة تقنية متخصصة في حلول الاتصالات السحابية للشرق الأوسط.", internships:3 },
  { name:"Deloitte Lebanon", emoji:"🏦", sector:"محاسبة", size:"+500 موظف", desc:"مكتب Big 4 الرائد في لبنان للمراجعة والاستشارات المالية.", internships:5 },
  { name:"Beirut Digital District", emoji:"🏢", sector:"ريادة أعمال", size:"حاضنة 100+ شركة", desc:"أكبر تجمع للشركات الرقمية والناشئة في لبنان والمنطقة العربية.", internships:8 },
  { name:"AUH — مستشفى الجامعة الأمريكية", emoji:"🏥", sector:"طب وصحة", size:"+1000 موظف", desc:"أرقى مستشفى في لبنان والمنطقة، مركز تدريب طبي عالمي.", internships:12 },
  { name:"Annahar Media", emoji:"📰", sector:"إعلام", size:"200+ موظف", desc:"أقدم وأشهر الصحف اللبنانية، رائدة في التحول الرقمي الإعلامي.", internships:4 },
  { name:"Khatib & Alami", emoji:"🏗️", sector:"هندسة", size:"+1000 موظف", desc:"أكبر مكتب هندسي في الشرق الأوسط وشمال أفريقيا.", internships:6 },
];

// ─── AI CV Tips ────────────────────────────────────────────────────────────────
const CV_TIPS = [
  { icon:"🎯", title:"خصّص سيرتك لكل وظيفة", tip:"اقرأ وصف الوظيفة بعناية وأضف الكلمات المفتاحية المطلوبة في سيرتك الذاتية. ليس نفس الـCV لكل فرصة." },
  { icon:"📊", title:"أرقام وإنجازات لا مهام", tip:"بدلاً من 'عملت في التسويق' اكتب 'رفعت engagement بنسبة 35% خلال 2 شهر'. الأرقام تتكلم." },
  { icon:"🔗", title:"LinkedIn + GitHub + Portfolio", tip:"أضف روابط قابلة للنقر في سيرتك. المجنّد سيضغط عليها. تأكد أنها محدّثة ومكتملة." },
  { icon:"⚡", title:"ابدأ بفعل قوي", tip:"كل نقطة في سيرتك تبدأ بفعل ماضٍ قوي: 'طوّرت'، 'أدرت'، 'حللت'، 'صممت'. تجنب 'مسؤول عن'." },
  { icon:"📏", title:"صفحة واحدة للطلاب", tip:"طالب جامعي = صفحة واحدة. لا حاجة للأهداف الشخصية الطويلة. المجنّد لديه 30 ثانية." },
];

export default function InternshipHubPage() {
  const { t, dir } = useI18n();
  const [activeTab, setActiveTab] = useState<"browse"|"companies"|"tips">("browse");
  const [search, setSearch] = useState("");
  const [filterSector, setFilterSector] = useState("الكل");
  const [filterType, setFilterType] = useState<"الكل"|"مدفوع"|"غير مدفوع"|"تطوعي">("الكل");
  const [filterRemote, setFilterRemote] = useState(false);
  const [expandedId, setExpandedId] = useState<number|null>(null);
  const [appliedIds, setAppliedIds] = useState<number[]>([]);

  const filtered = useMemo(() => {
    return INTERNSHIPS.filter(i => {
      const matchSearch = !search || i.title.includes(search) || i.company.includes(search) || i.sector.includes(search);
      const matchSector = filterSector === "الكل" || i.sector === filterSector;
      const matchType = filterType === "الكل" || i.type === filterType;
      const matchRemote = !filterRemote || i.remote;
      return matchSearch && matchSector && matchType && matchRemote;
    });
  }, [search, filterSector, filterType, filterRemote]);

  const featuredInternships = INTERNSHIPS.filter(i => i.featured);

  function toggleApplied(id: number) {
    setAppliedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  return (
    <div dir={dir} className="min-h-screen bg-bg">

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-hero rounded-4xl p-8 md:p-12 mb-8 text-white shadow-floaty relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/30 rounded-full blur-3xl" />
          <div className="absolute top-6 left-1/4 text-3xl animate-float opacity-50">💼</div>
          <div className="absolute bottom-8 right-1/4 text-3xl animate-float opacity-50" style={{ animationDelay: '1s' }}>🎯</div>
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-3 py-1 text-sm font-bold mb-4">
                {t('ins.badge')}
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-3">{t('ins.hero.title')}</h1>
              <p className="text-purple-100 text-lg max-w-xl">
                {INTERNSHIPS.length} {t('ins.hero.subtitle')}
              </p>
            </div>
            <div className="text-6xl opacity-80">🚀</div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            {[
              { n: INTERNSHIPS.filter(i=>i.type==="مدفوع").length, label: t('ins.stat.paid'),      emoji:"💰" },
              { n: INTERNSHIPS.filter(i=>i.featured).length,        label: t('ins.stat.featured'),  emoji:"⭐" },
              { n: INTERNSHIPS.filter(i=>i.remote).length,          label: t('ins.stat.remote'),    emoji:"🌐" },
              { n: COMPANIES.length,                                label: t('ins.stat.companies'), emoji:"🏢" },
            ].map(s => (
              <div key={s.label} className="bg-white/15 rounded-2xl p-4 text-center">
                <div className="text-2xl mb-1">{s.emoji}</div>
                <div className="text-2xl font-extrabold">{s.n}</div>
                <div className="text-xs text-purple-200">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 shadow-sm border border-gray-100 mb-6">
          {([
            ["browse",    t('ins.tab.browse')],
            ["companies", t('ins.tab.companies')],
            ["tips",      t('ins.tab.tips')],
          ] as const).map(([tab, label]) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-bold transition-colors ${activeTab === tab ? "bg-purple-600 text-white shadow" : "text-gray-600 hover:bg-gray-50"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Browse Tab ── */}
        {activeTab === "browse" && (
          <div>
            {/* Featured */}
            {featuredInternships.length > 0 && (
              <div className="mb-6">
                <h2 className="text-lg font-extrabold text-gray-800 mb-3">{t('ins.featured.title')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {featuredInternships.slice(0,4).map(i => (
                    <div key={i.id} className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-3xl">{i.companyEmoji}</span>
                        <div>
                          <h3 className="font-bold text-gray-800 text-sm">{i.title}</h3>
                          <p className="text-xs text-purple-600 font-semibold">{i.company}</p>
                        </div>
                        <span className={`mr-auto text-xs font-bold px-2 py-1 rounded-full ${i.tagColor}`}>{i.tag}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <span>💰 {i.stipend}</span>
                        <span>📍 {i.remote ? t('ins.remote.label') : i.region}</span>
                        <span>⏱️ {i.duration}</span>
                      </div>
                      <button onClick={() => setExpandedId(expandedId === i.id ? null : i.id)}
                        className="w-full text-xs font-bold py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700">
                        {t('ins.detail.cta')}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5">
              <div className="flex flex-wrap gap-3 mb-3">
                <div className="flex-1 min-w-48">
                  <input value={search} onChange={e => setSearch(e.target.value)}
                    placeholder={t('ins.filter.search')}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-purple-400" />
                </div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={filterRemote} onChange={e => setFilterRemote(e.target.checked)} className="rounded" />
                  {t('ins.filter.remote')}
                </label>
              </div>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {TYPES.map(ty => (
                  <button key={ty} onClick={() => setFilterType(ty)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filterType === ty ? "bg-purple-600 text-white border-purple-600" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-purple-300"}`}>
                    {ty === "مدفوع" ? t('ins.type.paid') : ty === "تطوعي" ? t('ins.type.volunteer') : ty === "غير مدفوع" ? t('ins.type.unpaid') : t('ins.type.all')}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {SECTORS.map(s => (
                  <button key={s} onClick={() => setFilterSector(s)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${filterSector === s ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 border-gray-200 text-gray-600 hover:border-blue-300"}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-sm text-gray-500 mb-4"><strong>{filtered.length}</strong> فرصة تدريب</p>

            {/* Internship Cards */}
            <div className="space-y-4">
              {filtered.map(i => {
                const isExp = expandedId === i.id;
                const isApplied = appliedIds.includes(i.id);
                return (
                  <div key={i.id}
                    className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${isExp ? "border-purple-400 ring-2 ring-purple-100" : "border-gray-100"}`}>
                    <div className="p-5">
                      <div className="flex items-start gap-4 flex-wrap">
                        <div className="text-4xl">{i.companyEmoji}</div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between flex-wrap gap-2">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${i.tagColor}`}>{i.tag}</span>
                                {i.remote && <span className="text-xs font-bold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full">🌐 عن بعد</span>}
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${i.type === "مدفوع" ? "bg-green-100 text-green-700" : i.type === "تطوعي" ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"}`}>{i.type}</span>
                              </div>
                              <h3 className="font-extrabold text-gray-800 text-base">{i.title}</h3>
                              <p className="text-sm text-purple-700 font-semibold">{i.company}</p>
                            </div>
                            <div className="text-left text-xs text-gray-500 space-y-1">
                              <div>💰 {i.stipend}</div>
                              <div>📍 {i.region}</div>
                              <div>⏱️ {i.duration}</div>
                            </div>
                          </div>

                          <p className="text-sm text-gray-600 mt-2 leading-relaxed">{i.desc}</p>

                          <div className="flex flex-wrap gap-1.5 mt-3">
                            {i.skills.map(s => (
                              <span key={s} className="text-xs bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded-full border border-purple-200">{s}</span>
                            ))}
                          </div>

                          <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                            <span className="font-semibold text-red-500">⏰ الموعد النهائي: {i.deadline}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2 mt-4 flex-wrap">
                        <button onClick={() => setExpandedId(isExp ? null : i.id)}
                          className="flex-1 text-xs font-bold py-2 rounded-xl bg-gray-100 text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                          {isExp ? "▲ إخفاء" : "▼ التفاصيل الكاملة"}
                        </button>
                        <button onClick={() => toggleApplied(i.id)}
                          className={`flex-1 text-xs font-bold py-2 rounded-xl transition-colors ${isApplied ? "bg-green-600 text-white" : "bg-purple-600 text-white hover:bg-purple-700"}`}>
                          {isApplied ? "✓ قدّمت طلبي" : "تقديم الآن ←"}
                        </button>
                      </div>

                      {isExp && (
                        <div className="mt-4 pt-4 border-t border-gray-100 grid md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs font-bold text-gray-700 mb-2">📋 المتطلبات:</p>
                            <ul className="space-y-1.5">
                              {i.requirements.map(r => (
                                <li key={r} className="flex items-start gap-2 text-xs text-gray-600">
                                  <span className="text-purple-500 mt-0.5">•</span>{r}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-700 mb-2">🎁 ما ستكسبه:</p>
                            <ul className="space-y-1.5">
                              {i.benefits.map(b => (
                                <li key={b} className="flex items-start gap-2 text-xs text-gray-600">
                                  <span className="text-green-500 mt-0.5">✓</span>{b}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-5xl mb-4">🔍</div>
                <p className="text-gray-500">لم يتم العثور على فرص</p>
              </div>
            )}

            {/* Applied Tracker */}
            {appliedIds.length > 0 && (
              <div className="mt-8 bg-green-50 border border-green-200 rounded-2xl p-5">
                <h3 className="font-bold text-gray-800 mb-3">✅ تتبع طلباتك ({appliedIds.length})</h3>
                <div className="flex flex-wrap gap-2">
                  {INTERNSHIPS.filter(i => appliedIds.includes(i.id)).map(i => (
                    <div key={i.id} className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-green-200 text-sm">
                      <span>{i.companyEmoji}</span>
                      <span className="font-semibold text-gray-700">{i.company}</span>
                      <span className="text-xs text-gray-400">— {i.title}</span>
                      <span className="text-xs bg-amber-100 text-amber-700 font-bold px-1.5 py-0.5 rounded-full">قيد المراجعة</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Companies Tab ── */}
        {activeTab === "companies" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {COMPANIES.map(c => (
              <div key={c.name} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-5">
                <div className="text-4xl mb-3">{c.emoji}</div>
                <h3 className="font-extrabold text-gray-800 mb-1">{c.name}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded-full">{c.sector}</span>
                  <span className="text-xs text-gray-500">{c.size}</span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed mb-3">{c.desc}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1.5 rounded-full">
                    {c.internships} فرصة متاحة
                  </span>
                  <button onClick={() => { setActiveTab("browse"); setSearch(c.name.split(" ")[0]); }}
                    className="text-xs font-bold text-blue-600 hover:underline">
                    عرض الفرص ←
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Tips Tab ── */}
        {activeTab === "tips" && (
          <div className="space-y-5">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-700 rounded-2xl p-6 text-white">
              <h2 className="text-xl font-extrabold mb-2">💡 دليل بناء CV احترافي للطلاب</h2>
              <p className="text-purple-100">نصائح عملية من مجنّدين في أكبر شركات لبنان والخليج</p>
            </div>

            {CV_TIPS.map((tip, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">{tip.icon}</div>
                  <div>
                    <h3 className="font-extrabold text-gray-800 mb-2">{tip.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{tip.tip}</p>
                  </div>
                </div>
              </div>
            ))}

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-extrabold text-gray-800 mb-3">🛠️ أدوات مسارك لبناء CV</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Link href="/tools/cv-builder"
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-400 hover:shadow-sm transition-all">
                  <span className="text-2xl">📄</span>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">CV Builder</div>
                    <div className="text-xs text-gray-500">قوالب احترافية باللغتين</div>
                  </div>
                  <span className="mr-auto text-blue-600">←</span>
                </Link>
                <Link href="/tools/cover-letter"
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-400 hover:shadow-sm transition-all">
                  <span className="text-2xl">✉️</span>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Cover Letter</div>
                    <div className="text-xs text-gray-500">رسالة تقديم مخصصة</div>
                  </div>
                  <span className="mr-auto text-blue-600">←</span>
                </Link>
                <Link href="/tools/interview"
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-400 hover:shadow-sm transition-all">
                  <span className="text-2xl">🎤</span>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">تحضير المقابلة</div>
                    <div className="text-xs text-gray-500">أسئلة وإجابات نموذجية</div>
                  </div>
                  <span className="mr-auto text-blue-600">←</span>
                </Link>
                <Link href="/tools/skill-gap"
                  className="flex items-center gap-3 bg-white rounded-xl p-4 border border-blue-200 hover:border-blue-400 hover:shadow-sm transition-all">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="font-bold text-gray-800 text-sm">Skill Gap Analyzer</div>
                    <div className="text-xs text-gray-500">اكتشف ما تحتاج تتعلمه</div>
                  </div>
                  <span className="mr-auto text-blue-600">←</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-3xl p-8 text-white text-center">
          <h2 className="text-2xl font-extrabold mb-3">🎯 جهّز ملفك للتدريب الآن</h2>
          <p className="text-purple-100 mb-6">أنشئ CV احترافي ورسالة تقديم قوية — مجاناً على مسارك</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link href="/tools/cv-builder"
              className="bg-white text-purple-700 font-bold px-6 py-3 rounded-xl hover:bg-purple-50 transition-colors">
              📄 ابنِ CV احترافي
            </Link>
            <Link href="/scholarships"
              className="bg-white/20 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/30 transition-colors border border-white/30">
              🏆 ابحث عن منح دراسية
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
