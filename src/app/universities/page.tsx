"use client";
import { useState } from "react";
import Link from "next/link";

const UNIVERSITIES = [
  { id: 1,  name: "الجامعة الأمريكية في بيروت – AUB",         region: "بيروت",            type: "خاصة",   rank: "⭐⭐⭐⭐⭐", tuition: "16,000–22,000$", lang: "إنجليزي",       url: "https://www.aub.edu.lb",       desc: "أعرق جامعة في لبنان والشرق الأوسط، تأسست 1866. تقدّم برامج بكالوريوس وماجستير ودكتوراه في كل التخصصات." },
  { id: 2,  name: "الجامعة اللبنانية الأمريكية – LAU",         region: "بيروت وبيبلوس",   type: "خاصة",   rank: "⭐⭐⭐⭐⭐", tuition: "12,000–18,000$", lang: "إنجليزي",       url: "https://www.lau.edu.lb",       desc: "جامعة مرموقة بحرمين في بيروت وبيبلوس، متميزة في الأعمال والهندسة والصحة والعلوم الإنسانية." },
  { id: 3,  name: "جامعة القديس يوسف – USJ",                   region: "بيروت وفروع",     type: "خاصة",   rank: "⭐⭐⭐⭐⭐", tuition: "4,000–10,000$",  lang: "فرنسي/عربي",   url: "https://www.usj.edu.lb",       desc: "جامعة يسوعية تأسست 1875، رائدة في الطب والقانون والعلوم السياسية والآداب بالمنهج الفرنسي." },
  { id: 4,  name: "الجامعة اللبنانية – UL",                    region: "كل لبنان",         type: "حكومية", rank: "⭐⭐⭐⭐",  tuition: "مجانية/رمزية",   lang: "عربي/فرنسي",  url: "https://www.ul.edu.lb",        desc: "الجامعة الوطنية الحكومية الوحيدة، تضم أكثر من 80,000 طالب في فروع منتشرة في كل المناطق." },
  { id: 5,  name: "جامعة الروح القدس – USEK",                  region: "جبل لبنان",        type: "خاصة",   rank: "⭐⭐⭐⭐",  tuition: "5,000–9,000$",   lang: "فرنسي/عربي",  url: "https://www.usek.edu.lb",      desc: "جامعة مارونية في الكسليك، متميزة في الفنون والموسيقى والعمارة والإعلام والعلوم." },
  { id: 6,  name: "جامعة البلمند – UOB",                        region: "الشمال",           type: "خاصة",   rank: "⭐⭐⭐⭐",  tuition: "5,500–9,000$",   lang: "إنجليزي",       url: "https://www.balamand.edu.lb",  desc: "جامعة أرثوذكسية في البلمند، قوية في الطب والهندسة والفنون المعمارية والعلوم الإنسانية." },
  { id: 7,  name: "جامعة الآداب والعلوم الإنسانية – NDU",      region: "جبل لبنان",        type: "خاصة",   rank: "⭐⭐⭐⭐",  tuition: "5,000–8,500$",   lang: "إنجليزي",       url: "https://www.ndu.edu.lb",       desc: "جامعة مارونية في لويزة، متميزة في العلوم والهندسة والأعمال والإعلام والدراسات الدينية." },
  { id: 8,  name: "الجامعة الإسلامية في لبنان – IUL",          region: "البقاع",           type: "خاصة",   rank: "⭐⭐⭐",   tuition: "2,500–5,000$",   lang: "عربي",          url: "https://www.iul.edu.lb",       desc: "جامعة إسلامية بفروع متعددة، تقدّم برامج في الشريعة والأعمال والتربية والعلوم الاجتماعية." },
  { id: 9,  name: "الجامعة اللبنانية الدولية – LIU",            region: "بيروت وفروع",     type: "خاصة",   rank: "⭐⭐⭐",   tuition: "3,000–6,000$",   lang: "عربي/إنجليزي", url: "https://www.liu.edu.lb",       desc: "جامعة إسلامية خاصة بفروع في أنحاء لبنان، تركّز على الطب والصيدلة والهندسة والتكنولوجيا." },
  { id: 10, name: "الأكاديمية اللبنانية للفنون الجميلة – ALBA", region: "بيروت",            type: "خاصة",   rank: "⭐⭐⭐⭐",  tuition: "5,000–8,000$",   lang: "فرنسي",         url: "https://www.alba.edu.lb",      desc: "مدرسة الفنون الجميلة الأرقى في لبنان، متخصصة في الفنون البصرية والعمارة والتصميم." },
  { id: 11, name: "كلية إدارة الأعمال – ESA",                   region: "بيروت",            type: "خاصة",   rank: "⭐⭐⭐⭐⭐", tuition: "12,000–20,000$", lang: "فرنسي/إنجليزي", url: "https://www.esa.edu.lb",       desc: "أفضل كلية إدارة أعمال في لبنان والشرق الأوسط، شراكة مع HEC Paris، برامج MBA بمستوى عالمي." },
  { id: 12, name: "جامعة الأنطونية – UA",                       region: "بيروت وفروع",     type: "خاصة",   rank: "⭐⭐⭐",   tuition: "3,000–6,000$",   lang: "فرنسي/عربي",  url: "https://www.ua.edu.lb",        desc: "جامعة كاثوليكية أنطونية، متميزة في الطب والصيدلة والحقوق والعلوم الإنسانية." },
  { id: 13, name: "جامعة هايكازيان – HU",                       region: "بيروت",            type: "خاصة",   rank: "⭐⭐⭐",   tuition: "4,000–7,000$",   lang: "إنجليزي",       url: "https://www.haigazian.edu.lb", desc: "جامعة أرمنية بروتستانتية في بيروت، متميزة في الآداب والعلوم الإنسانية والتربية." },
  { id: 14, name: "جامعة المشرق – MFU",                         region: "جبل لبنان",        type: "خاصة",   rank: "⭐⭐⭐",   tuition: "3,500–7,000$",   lang: "فرنسي/عربي",  url: "https://www.mfu.edu.lb",       desc: "جامعة كاثوليكية في بكاسين، برامج طبية وهندسية وإنسانية بجودة جيدة." },
  { id: 15, name: "الجامعة المفتوحة في لبنان – OUL",            region: "بيروت",            type: "خاصة",   rank: "⭐⭐⭐",   tuition: "1,500–4,000$",   lang: "عربي",          url: "#",                            desc: "تعليم مفتوح وعن بُعد بتكاليف مخفضة، مناسبة للموظفين والطلاب من ذوي الإمكانيات المحدودة." },
  { id: 16, name: "معهد الدراسات المصرفية والمالية – IBF",      region: "بيروت",            type: "خاصة",   rank: "⭐⭐⭐",   tuition: "3,000–5,000$",   lang: "إنجليزي/عربي", url: "#",                            desc: "متخصص في التمويل والمصرفية والاقتصاد، يُعدّ الخريجين لسوق العمل المالي." },
  { id: 17, name: "الجامعة اللبنانية الدولية – LFU",            region: "بيروت",            type: "خاصة",   rank: "⭐⭐",    tuition: "2,500–5,000$",   lang: "فرنسي/عربي",  url: "#",                            desc: "بنظام تعليمي فرنسي، تخدم الطلاب الراغبين في مسار أكاديمي فرانكوفوني." },
  { id: 18, name: "جامعة الكفاءات اللبنانية – LCU",             region: "جبل لبنان",        type: "خاصة",   rank: "⭐⭐⭐",   tuition: "2,500–5,000$",   lang: "عربي/إنجليزي", url: "#",                            desc: "جامعة ناشئة تُقدّم برامج في الأعمال والإدارة والتكنولوجيا والدراسات الإنسانية." },
  { id: 19, name: "الجامعة العربية للعلوم والتكنولوجيا – AUST", region: "بيروت",            type: "خاصة",   rank: "⭐⭐⭐",   tuition: "3,500–6,500$",   lang: "عربي/إنجليزي", url: "#",                            desc: "تركّز على الهندسة والتكنولوجيا والعلوم التطبيقية، برامج معتمدة بتكاليف معقولة." },
  { id: 20, name: "الجامعة التكنولوجية اللبنانية – LTU",        region: "جبل لبنان",        type: "خاصة",   rank: "⭐⭐⭐",   tuition: "3,000–6,000$",   lang: "إنجليزي",       url: "#",                            desc: "تركّز على تكنولوجيا المعلومات والهندسة والعلوم التطبيقية." },
  { id: 21, name: "جامعة المنار – UM",                           region: "الشمال",           type: "خاصة",   rank: "⭐⭐⭐",   tuition: "2,500–5,000$",   lang: "عربي/فرنسي",  url: "#",                            desc: "جامعة في طرابلس تخدم شمال لبنان، برامج في الحقوق والأعمال والعلوم الاجتماعية." },
  { id: 22, name: "جامعة الأهلية – PAU",                         region: "بيروت",            type: "خاصة",   rank: "⭐⭐⭐",   tuition: "3,000–6,000$",   lang: "عربي/إنجليزي", url: "#",                            desc: "جامعة أهلية في بيروت، برامج في الأعمال والحقوق والعلوم والتربية." },
  { id: 23, name: "الجامعة الكاثوليكية في لبنان – UCL",          region: "بيروت",            type: "خاصة",   rank: "⭐⭐⭐",   tuition: "3,000–6,000$",   lang: "فرنسي/عربي",  url: "#",                            desc: "جامعة كاثوليكية بتراث ديني وأكاديمي راسخ، برامج في الآداب والعلوم والتربية." },
  { id: 24, name: "جامعة الحكمة – UW",                           region: "بيروت",            type: "خاصة",   rank: "⭐⭐⭐",   tuition: "3,000–6,000$",   lang: "فرنسي/عربي",  url: "#",                            desc: "جامعة مارونية في بيروت، برامج في الآداب والعلوم الإنسانية والأعمال والتربية." },
  { id: 25, name: "جامعة الرسالة – URF",                         region: "البقاع",           type: "خاصة",   rank: "⭐⭐",    tuition: "2,000–4,000$",   lang: "عربي",          url: "#",                            desc: "جامعة في البقاع تُقدّم برامج في الشريعة والأعمال والعلوم الاجتماعية." },
  { id: 26, name: "جامعة الصداقة – UF",                          region: "البقاع",           type: "خاصة",   rank: "⭐⭐",    tuition: "2,000–4,000$",   lang: "عربي/فرنسي",  url: "#",                            desc: "جامعة في زحلة، تخدم منطقة البقاع بتخصصات في الأعمال والتربية والعلوم." },
  { id: 27, name: "جامعة القاهرة – فرع بيروت",                   region: "بيروت",            type: "خاصة",   rank: "⭐⭐⭐",   tuition: "2,000–4,500$",   lang: "عربي",          url: "#",                            desc: "فرع جامعة القاهرة في بيروت، يمنح شهادات معتمدة من جامعة القاهرة المصرية." },
  { id: 28, name: "الجامعة اللبنانية – فرع الجنوب",              region: "الجنوب",           type: "حكومية", rank: "⭐⭐⭐",   tuition: "رمزية",          lang: "عربي/فرنسي",  url: "https://www.ul.edu.lb",        desc: "فرع الجامعة اللبنانية في الجنوب، يمنح درجات في الحقوق والعلوم الإنسانية." },
  { id: 29, name: "الجامعة العالمية للعلوم والتكنولوجيا – UISAT",region: "جبل لبنان",        type: "خاصة",   rank: "⭐⭐",    tuition: "2,000–4,500$",   lang: "إنجليزي",       url: "#",                            desc: "تُقدّم برامج في الهندسة والتكنولوجيا والأعمال والحوسبة بتكاليف معقولة." },
  { id: 30, name: "جامعة الأنبياء – UP",                          region: "البقاع",           type: "خاصة",   rank: "⭐⭐",    tuition: "2,000–4,500$",   lang: "عربي",          url: "#",                            desc: "جامعة في البقاع، برامج في الشريعة والعلوم الإنسانية والاجتماعية." },
];

const INSTITUTES = [
  { id: 1,  name: "معهد العلوم التطبيقية والتكنولوجيا – IST",    region: "بيروت",      type: "تقني",    tuition: "2,000–5,000$",  lang: "إنجليزي",       url: "#", desc: "معهد تقني متخصص في الهندسة التطبيقية والحوسبة وتقنية المعلومات بمسارات مهنية واضحة." },
  { id: 2,  name: "المعهد التقني اللبناني – LTI",                  region: "كل لبنان",  type: "تقني",    tuition: "1,500–3,500$",  lang: "عربي/فرنسي",  url: "#", desc: "معهد تقني حكومي منتشر في كل المناطق، يمنح دبلومات مهنية في مختلف التخصصات." },
  { id: 3,  name: "معهد الصحة العامة – IPH",                       region: "بيروت",      type: "صحي",     tuition: "2,500–5,000$",  lang: "فرنسي/عربي",  url: "#", desc: "معهد تابع لوزارة الصحة، متخصص في الصحة العامة والوبائيات والتغذية." },
  { id: 4,  name: "معهد الفنون والسينما – IESAV",                  region: "بيروت",      type: "فنون",    tuition: "3,000–6,000$",  lang: "فرنسي",        url: "#", desc: "تابع لجامعة القديس يوسف، متخصص في السينما والإذاعة والفنون البصرية." },
  { id: 5,  name: "المعهد الوطني للإدارة – INA",                   region: "بيروت",      type: "إداري",   tuition: "رمزية",         lang: "عربي/فرنسي",  url: "#", desc: "معهد حكومي لتدريب موظفي الدولة وتأهيل الكوادر الإدارية في القطاع العام." },
  { id: 6,  name: "معهد التمريض – IN/AUB",                          region: "بيروت",      type: "صحي",     tuition: "8,000–14,000$", lang: "إنجليزي",       url: "#", desc: "تابع لـ AUB، من أفضل برامج التمريض في المنطقة، معتمد دولياً." },
  { id: 7,  name: "معهد الدراسات المسرحية – IETA",                 region: "بيروت",      type: "فنون",    tuition: "2,500–5,000$",  lang: "عربي/فرنسي",  url: "#", desc: "متخصص في الفنون المسرحية والأداء، يُعدّ الطلاب للمسرح والتلفزيون والسينما." },
  { id: 8,  name: "المعهد التقني الزراعي – IAT",                   region: "البقاع",     type: "زراعي",   tuition: "1,000–3,000$",  lang: "عربي/فرنسي",  url: "#", desc: "متخصص في العلوم الزراعية والبيئية وتربية الماشية وتقنيات الإنتاج الغذائي." },
  { id: 9,  name: "معهد الصحافة والإعلام – IJM",                   region: "بيروت",      type: "إعلامي",  tuition: "2,500–5,000$",  lang: "عربي/إنجليزي", url: "#", desc: "يُعدّ الصحفيين والإعلاميين عبر برامج متخصصة في الصحافة الرقمية والإذاعة." },
  { id: 10, name: "المعهد العالي للموسيقى – HSM",                   region: "بيروت",      type: "موسيقي",  tuition: "3,000–6,000$",  lang: "فرنسي/إنجليزي", url: "#", desc: "برامج متكاملة في العزف الكلاسيكي والتأليف والنظريات الموسيقية." },
  { id: 11, name: "مدرسة اللغات الشرقية – ELOL/USJ",               region: "بيروت",      type: "لغوي",    tuition: "3,000–6,000$",  lang: "متعدد",         url: "#", desc: "تابع لجامعة القديس يوسف، متخصص في اللغة العربية وآدابها واللغات الشرقية." },
  { id: 12, name: "معهد السياحة – ITL",                             region: "بيروت",      type: "سياحي",   tuition: "2,000–4,000$",  lang: "فرنسي/عربي",  url: "#", desc: "متخصص في السياحة وإدارة الفنادق والطهي، يُعدّ الكفاءات لقطاع الضيافة." },
  { id: 13, name: "معهد الترجمة والتفسير – ITI",                    region: "بيروت",      type: "لغوي",    tuition: "3,000–5,500$",  lang: "متعدد",         url: "#", desc: "متخصص في الترجمة الفورية والتحريرية بين العربية والإنجليزية والفرنسية." },
  { id: 14, name: "معهد العمارة الداخلية – IAD",                    region: "جبل لبنان", type: "فنون",    tuition: "3,000–6,000$",  lang: "إنجليزي",       url: "#", desc: "برامج في التصميم الداخلي والديكور وهندسة البيئات المعمارية." },
  { id: 15, name: "معهد الدراسات الاجتماعية – ISHS",               region: "الشمال",     type: "إنساني",  tuition: "2,000–4,000$",  lang: "عربي/فرنسي",  url: "#", desc: "في طرابلس، يُقدّم دراسات في العلوم الاجتماعية والتنمية البشرية والعمل الاجتماعي." },
  { id: 16, name: "معهد العلوم القانونية – ILS",                    region: "بيروت",      type: "قانوني",  tuition: "2,500–5,000$",  lang: "فرنسي/عربي",  url: "#", desc: "يُقدّم دبلومات متخصصة في القانون اللبناني والمقارن والقانون الدولي." },
  { id: 17, name: "معهد الأعمال والتكنولوجيا – IBT",               region: "بيروت",      type: "تقني",    tuition: "2,000–4,500$",  lang: "إنجليزي",       url: "#", desc: "معهد خاص بتخصصات في إدارة الأعمال والتكنولوجيا والتسويق الرقمي." },
  { id: 18, name: "معهد الموسيقى الشرقية – IOM",                   region: "بيروت",      type: "موسيقي",  tuition: "2,000–4,000$",  lang: "عربي",          url: "#", desc: "متخصص في الموسيقى الشرقية والعزف على الآلات التراثية والتأليف الموسيقي." },
  { id: 19, name: "معهد العلوم الاجتماعية – ISS/USJ",              region: "بيروت",      type: "إنساني",  tuition: "3,000–6,000$",  lang: "فرنسي/عربي",  url: "#", desc: "تابع لجامعة القديس يوسف، يُقدّم دراسات متقدمة في علم الاجتماع وعلم النفس." },
  { id: 20, name: "مدرسة الآباء اليسوعيين للدراسات العليا",        region: "بيروت",      type: "ديني",    tuition: "2,000–4,000$",  lang: "فرنسي/عربي",  url: "#", desc: "برامج دكتوراه وماجستير في الفلسفة واللاهوت والدراسات الدينية المقارنة." },
];

const SCHOOLS = [
  { id: 1,  name: "مدرسة راهبات البيار – بيروت",                  region: "بيروت",      type: "خاصة",   system: "فرنسي Bac",     levels: ["ابتدائي","متوسط","ثانوي"], lang: "فرنسي/عربي",   desc: "من أرقى المدارس الكاثوليكية في بيروت، تُقدّم تعليماً فرنسياً راقياً." },
  { id: 2,  name: "مدارس المقاصد الإسلامية",                      region: "بيروت",      type: "خاصة",   system: "رسمي لبناني",   levels: ["ابتدائي","متوسط","ثانوي"], lang: "عربي/إنجليزي", desc: "شبكة مدارس إسلامية بجودة عالية في بيروت وضواحيها." },
  { id: 3,  name: "ليسيه عبد القادر",                              region: "بيروت",      type: "خاصة",   system: "فرنسي Bac",     levels: ["ابتدائي","متوسط","ثانوي"], lang: "فرنسي/عربي",   desc: "مدرسة فرنكوفونية عريقة تمنح شهادة البكالوريا الفرنسية." },
  { id: 4,  name: "الكلية الإنجيلية – IC",                        region: "جبل لبنان", type: "خاصة",   system: "أمريكي SAT",    levels: ["ابتدائي","متوسط","ثانوي"], lang: "إنجليزي/عربي", desc: "مدرسة بروتستانتية بمنهج أمريكي ومستوى أكاديمي مرتفع." },
  { id: 5,  name: "المدرسة العالمية في لبنان",                    region: "بيروت",      type: "خاصة",   system: "IB دولي",       levels: ["ابتدائي","متوسط","ثانوي"], lang: "إنجليزي",       desc: "تمنح شهادة الباكالوريا الدولية IB المعترف بها عالمياً." },
  { id: 6,  name: "مدرسة برومانا العالية",                        region: "جبل لبنان", type: "خاصة",   system: "بريطاني IGCSE",  levels: ["ابتدائي","متوسط","ثانوي"], lang: "إنجليزي/عربي", desc: "مدرسة كويكرية تأسست 1873، تمنح شهادات IGCSE وA-Level البريطانية." },
  { id: 7,  name: "إيستوود كوليج",                                region: "جبل لبنان", type: "خاصة",   system: "أمريكي SAT",    levels: ["ابتدائي","متوسط","ثانوي"], lang: "إنجليزي/عربي", desc: "مدرسة راقية في حلتا، برامج إنجليزية مع نشاطات متميزة." },
  { id: 8,  name: "مدارس صبيس – الشويفات",                       region: "جبل لبنان", type: "خاصة",   system: "دولي SABIS",    levels: ["ابتدائي","متوسط","ثانوي"], lang: "إنجليزي/عربي", desc: "نظام تعليمي دولي SABIS الشهير، فروع في عدة مناطق لبنانية." },
  { id: 9,  name: "كوليج دو لا ساجيس – الأشرفية",               region: "بيروت",      type: "خاصة",   system: "فرنسي Bac",     levels: ["ابتدائي","متوسط","ثانوي"], lang: "فرنسي/عربي",   desc: "مدرسة كاثوليكية في الأشرفية بمستوى فرنسي راقٍ وتقاليد عريقة." },
  { id: 10, name: "كوليج دي لا سال – الإخوة المسيحيون",         region: "بيروت",      type: "خاصة",   system: "فرنسي Bac",     levels: ["ابتدائي","متوسط","ثانوي"], lang: "فرنسي/عربي",   desc: "مدارس الإخوة المسيحيين المنتشرة في بيروت وعدة مناطق." },
  { id: 11, name: "كوليج نوتردام دو جمهور",                      region: "جبل لبنان", type: "خاصة",   system: "فرنسي Bac",     levels: ["ابتدائي","متوسط","ثانوي"], lang: "فرنسي/عربي",   desc: "من أعرق المدارس اليسوعية في لبنان، بيئة أكاديمية رفيعة في بعبدا." },
  { id: 12, name: "الليسيه الفرنكو-لبناني",                      region: "بيروت",      type: "خاصة",   system: "فرنسي Bac",     levels: ["ابتدائي","متوسط","ثانوي"], lang: "فرنسي/عربي",   desc: "ليسيه فرنسي رسمي يمنح شهادة البكالوريا الفرنسية." },
  { id: 13, name: "مدرسة الكوليج الأمريكية للبنات – ACS",        region: "بيروت",      type: "خاصة",   system: "أمريكي SAT",    levels: ["ابتدائي","متوسط","ثانوي"], lang: "إنجليزي/عربي", desc: "مدرسة بروتستانتية راقية للبنات في بيروت بمنهج أمريكي." },
  { id: 14, name: "مدرسة الكوليج اللبناني الإنجليزي – LCIS",     region: "جبل لبنان", type: "خاصة",   system: "بريطاني IGCSE",  levels: ["ابتدائي","متوسط","ثانوي"], lang: "إنجليزي/عربي", desc: "تعليم بريطاني الطابع مع شهادات IGCSE وA-Level معتمدة دولياً." },
  { id: 15, name: "ثانوية الحكمة – بكركي",                       region: "جبل لبنان", type: "خاصة",   system: "رسمي لبناني",   levels: ["متوسط","ثانوي"],           lang: "فرنسي/عربي",   desc: "من أرقى الثانويات المارونية، تخريج النخب اللبنانية منذ عقود." },
  { id: 16, name: "مدارس هولي فاميلي – بكفيا",                   region: "جبل لبنان", type: "خاصة",   system: "رسمي لبناني",   levels: ["ابتدائي","متوسط","ثانوي"], lang: "فرنسي/عربي",   desc: "مدرسة كاثوليكية متميزة في جبل لبنان بتربية شاملة وروح مجتمعية." },
  { id: 17, name: "مدرسة راهبات العائلة المقدسة",                 region: "جبل لبنان", type: "خاصة",   system: "رسمي لبناني",   levels: ["ابتدائي","متوسط","ثانوي"], lang: "فرنسي/عربي",   desc: "مدرسة كاثوليكية تتميز بتربيتها الشاملة وبيئتها الآمنة." },
  { id: 18, name: "المدارس الرسمية اللبنانية",                   region: "كل لبنان",  type: "حكومية", system: "رسمي لبناني",   levels: ["ابتدائي","متوسط","ثانوي"], lang: "عربي/فرنسي",   desc: "شبكة المدارس الحكومية المجانية المنتشرة في كل المناطق." },
  { id: 19, name: "مدرسة كلية التراث – طرابلس",                  region: "الشمال",    type: "خاصة",   system: "رسمي لبناني",   levels: ["ابتدائي","متوسط","ثانوي"], lang: "عربي/فرنسي",   desc: "مدرسة أرثوذكسية في طرابلس بتراث أكاديمي عريق." },
  { id: 20, name: "مدرسة راهبات البيار – طرابلس",                region: "الشمال",    type: "خاصة",   system: "فرنسي Bac",     levels: ["ابتدائي","متوسط","ثانوي"], lang: "فرنسي/عربي",   desc: "مدرسة كاثوليكية راقية في طرابلس بتراث تعليمي فرنسي." },
  { id: 21, name: "ثانوية الحكمة – طرابلس",                      region: "الشمال",    type: "خاصة",   system: "رسمي لبناني",   levels: ["متوسط","ثانوي"],           lang: "فرنسي/عربي",   desc: "فرع ثانوية الحكمة في طرابلس، من أبرز الثانويات في الشمال." },
  { id: 22, name: "مدارس الفرير – طرابلس",                       region: "الشمال",    type: "خاصة",   system: "فرنسي Bac",     levels: ["ابتدائي","متوسط","ثانوي"], lang: "فرنسي/عربي",   desc: "مدارس الإخوة المسيحيين في طرابلس، تعليم فرنسي بجودة مرتفعة." },
  { id: 23, name: "مدرسة العزيزية – صيدا",                       region: "الجنوب",    type: "خاصة",   system: "رسمي لبناني",   levels: ["ابتدائي","متوسط","ثانوي"], lang: "عربي/فرنسي",   desc: "من أبرز مدارس صيدا، بمناهج متوازنة ومستوى أكاديمي جيد." },
  { id: 24, name: "مدارس الفرير – صيدا",                         region: "الجنوب",    type: "خاصة",   system: "فرنسي Bac",     levels: ["ابتدائي","متوسط","ثانوي"], lang: "فرنسي/عربي",   desc: "مدرسة الإخوة المسيحيين في صيدا، تعليم فرنسي راقٍ في الجنوب." },
  { id: 25, name: "مدارس المهدي – الجنوب",                       region: "الجنوب",    type: "خاصة",   system: "رسمي لبناني",   levels: ["ابتدائي","متوسط","ثانوي"], lang: "عربي/إنجليزي", desc: "شبكة مدارس إسلامية في الجنوب، تُقدّم تعليماً متكاملاً بمستوى جيد." },
  { id: 26, name: "مدرسة شحيم الثانوية الرسمية",                 region: "الجنوب",    type: "حكومية", system: "رسمي لبناني",   levels: ["متوسط","ثانوي"],           lang: "عربي/فرنسي",   desc: "مدرسة رسمية في الجنوب بنتائج جيدة في الامتحانات الرسمية." },
  { id: 27, name: "مدرسة الكرمة – زحلة",                         region: "البقاع",    type: "خاصة",   system: "رسمي لبناني",   levels: ["ابتدائي","متوسط","ثانوي"], lang: "عربي/فرنسي",   desc: "من أبرز مدارس زحلة، تُعدّ طلابها لامتحانات البكالوريا بنتائج متميزة." },
  { id: 28, name: "مدارس اليسوعيين – زحلة",                      region: "البقاع",    type: "خاصة",   system: "فرنسي Bac",     levels: ["ابتدائي","متوسط","ثانوي"], lang: "فرنسي/عربي",   desc: "مدارس يسوعية في زحلة والبقاع، تعليم فرنسي راقٍ وبيئة أكاديمية منضبطة." },
  { id: 29, name: "مدرسة المستقبل – طرابلس",                     region: "الشمال",    type: "خاصة",   system: "رسمي لبناني",   levels: ["ابتدائي","متوسط","ثانوي"], lang: "عربي/إنجليزي", desc: "مدرسة حديثة في طرابلس، برامج متكاملة تجمع بين الأصالة والحداثة." },
  { id: 30, name: "مدارس الرسالة الإسلامية",                     region: "الشمال",    type: "خاصة",   system: "رسمي لبناني",   levels: ["ابتدائي","متوسط","ثانوي"], lang: "عربي/إنجليزي", desc: "مدارس إسلامية في طرابلس والشمال، بتعليم ديني وأكاديمي متوازن." },
  { id: 31, name: "ثانوية الهمزة – بعلبك",                       region: "البقاع",    type: "خاصة",   system: "رسمي لبناني",   levels: ["متوسط","ثانوي"],           lang: "عربي/فرنسي",   desc: "من أبرز ثانويات بعلبك والبقاع الشمالي، نتائج امتحانية متميزة." },
  { id: 32, name: "مدرسة الإيمان – بيروت",                       region: "بيروت",     type: "خاصة",   system: "رسمي لبناني",   levels: ["ابتدائي","متوسط","ثانوي"], lang: "عربي/إنجليزي", desc: "مدرسة إسلامية في بيروت بمنهج متوازن ونشاطات لا منهجية متعددة." },
  { id: 33, name: "المدرسة الأمريكية المجتمعية – ACS بيروت",     region: "بيروت",     type: "خاصة",   system: "أمريكي SAT",    levels: ["ابتدائي","متوسط","ثانوي"], lang: "إنجليزي",       desc: "مدرسة أمريكية كاملة المنهج تخدم المجتمعين الأجنبي واللبناني في بيروت." },
  { id: 34, name: "مدرسة سيدة الجمهور",                          region: "جبل لبنان", type: "خاصة",   system: "فرنسي Bac",     levels: ["ابتدائي","متوسط","ثانوي"], lang: "فرنسي/عربي",   desc: "مدرسة مارونية راقية في المتن، فرنسية المنهج بتربية دينية أصيلة." },
  { id: 35, name: "مدرسة الجمهور الثانوية الرسمية",              region: "جبل لبنان", type: "حكومية", system: "رسمي لبناني",   levels: ["متوسط","ثانوي"],           lang: "عربي/فرنسي",   desc: "ثانوية رسمية حكومية في المتن بنتائج جيدة في البكالوريا اللبنانية." },
];

type Tab = "universities" | "institutes" | "schools";

interface University { id: number; name: string; region: string; type: string; rank: string; tuition: string; lang: string; url: string; desc: string; }
interface Institute  { id: number; name: string; region: string; type: string; tuition: string; lang: string; url: string; desc: string; }
interface School     { id: number; name: string; region: string; type: string; system: string; levels: string[]; lang: string; desc: string; }

// Map abbreviation → slug for universities with detail pages
const UNI_SLUGS: Record<string, string> = {
  AUB: "aub", LAU: "lau", USJ: "usj", UL: "ul", USEK: "usek",
  UOB: "uob", NDU: "ndu", ESA: "esa", ALBA: "alba", LIU: "liu",
  IUL: "iul", HU: "ndu",
};
function getSlug(name: string): string | null {
  const m = name.match(/–\s*([A-Z]+)\s*$/);
  return m ? (UNI_SLUGS[m[1]] ?? null) : null;
}

export default function EducationPage() {
  const [tab, setTab]             = useState<Tab>("universities");
  const [search, setSearch]       = useState("");
  const [regionFilter, setRegion] = useState("الكل");
  const [typeFilter, setType]     = useState("الكل");
  const [expanded, setExpanded]   = useState<number | null>(null);

  function switchTab(t: Tab) {
    setTab(t); setSearch(""); setRegion("الكل"); setType("الكل"); setExpanded(null);
  }

  const regions =
    tab === "universities" ? ["الكل","بيروت","جبل لبنان","الشمال","الجنوب","البقاع","كل لبنان","بيروت وبيبلوس","بيروت وفروع"] :
    tab === "institutes"   ? ["الكل","بيروت","جبل لبنان","الشمال","البقاع","كل لبنان"] :
                             ["الكل","بيروت","جبل لبنان","الشمال","الجنوب","البقاع","كل لبنان"];

  const types =
    tab === "universities" ? ["الكل","خاصة","حكومية"] :
    tab === "institutes"   ? ["الكل","تقني","صحي","فنون","إداري","إنساني","ديني","إعلامي","زراعي","موسيقي","لغوي","سياحي","قانوني"] :
                             ["الكل","خاصة","حكومية"];

  const rawList: (University | Institute | School)[] =
    tab === "universities" ? UNIVERSITIES :
    tab === "institutes"   ? INSTITUTES   : SCHOOLS;

  const filtered = rawList.filter((item) => {
    const q = search.trim().toLowerCase();
    const matchS = !q || item.name.toLowerCase().includes(q) || item.desc.toLowerCase().includes(q);
    const matchR = regionFilter === "الكل" || item.region === regionFilter;
    const matchT = typeFilter   === "الكل" || item.type   === typeFilter;
    return matchS && matchR && matchT;
  });

  const TABS = [
    { id: "universities" as Tab, label: "الجامعات", emoji: "🏛️", count: UNIVERSITIES.length },
    { id: "institutes"   as Tab, label: "المعاهد",  emoji: "🔬", count: INSTITUTES.length   },
    { id: "schools"      as Tab, label: "المدارس",  emoji: "🏫", count: SCHOOLS.length      },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* NAV */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">مسارك</Link>
          <div className="hidden md:flex gap-6 text-sm font-medium text-gray-600">
            <Link href="/majors" className="hover:text-blue-600">التخصصات</Link>
            <Link href="/universities" className="text-blue-600 font-bold">المؤسسات</Link>
            <Link href="/scholarships" className="hover:text-blue-600">المنح</Link>
            <Link href="/tools" className="hover:text-blue-600">أدوات</Link>
            <Link href="/blog" className="hover:text-blue-600">المدونة</Link>
          </div>
          <Link href="/tools" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            ابدأ رحلتك
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-gradient-to-br from-blue-700 to-blue-500 text-white py-14 px-4 text-center">
        <h1 className="text-4xl font-bold mb-3">اكتشف المؤسسات التعليمية في لبنان</h1>
        <p className="text-blue-100 text-lg max-w-2xl mx-auto">
          دليلك الشامل للجامعات والمعاهد والمدارس — معلومات دقيقة تساعدك على الاختيار الصحيح
        </p>
        <div className="mt-8 flex justify-center gap-6 flex-wrap">
          {TABS.map((t) => (
            <div key={t.id} className="bg-white/20 rounded-xl px-5 py-3 text-center backdrop-blur">
              <div className="text-2xl">{t.emoji}</div>
              <div className="text-xl font-bold">{t.count}</div>
              <div className="text-blue-100 text-sm">{t.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* TABS */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1.5 shadow-sm border border-gray-200 w-fit flex-wrap">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => switchTab(t.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === t.id ? "bg-blue-600 text-white shadow" : "text-gray-600 hover:bg-gray-100"}`}>
              <span>{t.emoji}</span><span>{t.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? "bg-white/25" : "bg-gray-100"}`}>{t.count}</span>
            </button>
          ))}
        </div>

        {/* FILTERS */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-wrap gap-3 items-center">
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="🔍  ابحث باسم المؤسسة..."
            className="flex-1 min-w-48 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={regionFilter} onChange={(e) => setRegion(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {regions.map((r) => <option key={r}>{r}</option>)}
          </select>
          <select value={typeFilter} onChange={(e) => setType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            {types.map((t) => <option key={t}>{t}</option>)}
          </select>
          <span className="text-sm text-gray-500">{filtered.length} نتيجة</span>
        </div>

        {/* GRID */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg">لا توجد نتائج — جرّب كلمة بحث مختلفة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const isExp = expanded === item.id;
              const uni = item as University;
              const sch = item as School;
              return (
                <div key={item.id} onClick={() => setExpanded(isExp ? null : item.id)}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer">
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="font-bold text-gray-800 text-base leading-snug">{item.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap shrink-0 ${item.type === "حكومية" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {item.type}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500 mb-3">
                      <span>📍 {item.region}</span>
                      {"tuition" in item && <span>💰 {uni.tuition}</span>}
                      <span>🗣 {item.lang}</span>
                    </div>
                    {"rank" in item && <div className="text-sm mb-2">{uni.rank}</div>}
                    {"system" in item && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">{sch.system}</span>
                        {sch.levels.map((l) => (
                          <span key={l} className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{l}</span>
                        ))}
                      </div>
                    )}
                    <p className={`text-sm text-gray-600 leading-relaxed ${isExp ? "" : "line-clamp-2"}`}>{item.desc}</p>
                    <button className="mt-3 text-xs text-blue-500 font-medium hover:text-blue-700">
                      {isExp ? "عرض أقل ▲" : "عرض المزيد ▼"}
                    </button>
                  </div>
                  {isExp && (
                    <div className="border-t border-gray-100 px-5 py-3 flex items-center gap-4 flex-wrap">
                      {"url" in item && (item as University).url !== "#" && (
                        <a href={(item as University).url} target="_blank" rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()} className="text-sm text-blue-600 hover:underline font-medium">
                          🔗 زيارة الموقع الرسمي
                        </a>
                      )}
                      {getSlug(item.name) && (
                        <Link href={`/universities/${getSlug(item.name)}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                          عرض الصفحة الكاملة ←
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-3">مش عارف تختار؟ خلّينا نساعد