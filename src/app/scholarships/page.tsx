"use client";
import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useStudentContext } from "@/context/StudentContext";
import { useI18n, type TranslationKey } from "@/lib/i18n";

interface Scholarship {
  id: number;
  name: string;
  org: string;
  amount: string;
  deadline: string;
  type: string;
  fields: string[];
  region: string;
  gpa: number;
  desc: string;
  link: string;
  emoji: string;
  tag: string;
  tagColor: string;
}

const STATIC_SCHOLARSHIPS: Scholarship[] = [
  {
    id: 1, name: "منحة الجامعة الأمريكية في بيروت AUB", org: "AUB",
    amount: "تغطية كاملة", deadline: "31 مارس 2026", type: "need",
    fields: ["جميع التخصصات"], region: "all", gpa: 80,
    desc: "منحة شاملة تغطي الرسوم الدراسية والإقامة لأبرز الطلاب المحتاجين مالياً",
    link: "https://www.aub.edu.lb", emoji: "🏛️", tag: "تغطية كاملة", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 2, name: "منحة الجامعة اللبنانية الأمريكية LAU", org: "LAU",
    amount: "50% من الرسوم", deadline: "15 أبريل 2026", type: "merit",
    fields: ["الهندسة","التجارة","الفنون"], region: "all", gpa: 85,
    desc: "منح الجدارة للطلاب المتميزين في الدراسة الثانوية",
    link: "https://www.lau.edu.lb", emoji: "🎓", tag: "جدارة", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 3, name: "منحة مؤسسة رفيق الحريري", org: "مؤسسة الحريري",
    amount: "2,500$ سنوياً", deadline: "28 فبراير 2026", type: "need",
    fields: ["الطب","الهندسة","العلوم"], region: "all", gpa: 75,
    desc: "دعم مالي للطلاب اللبنانيين المتفوقين من الأسر المحدودة الدخل",
    link: "#", emoji: "🌟", tag: "دعم مالي", tagColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 4, name: "منحة الجامعة اليسوعية USJ", org: "USJ",
    amount: "30% - 70%", deadline: "1 مايو 2026", type: "mixed",
    fields: ["الحقوق","الطب","الإنسانيات"], region: "all", gpa: 78,
    desc: "برنامج دعم متعدد المستويات للطلاب المتميزين والمحتاجين",
    link: "https://www.usj.edu.lb", emoji: "⚖️", tag: "متعدد المستويات", tagColor: "bg-purple-100 text-purple-700",
  },
  {
    id: 5, name: "منحة USEK الجامعة الروح القدس", org: "USEK",
    amount: "25% - 50%", deadline: "30 أبريل 2026", type: "merit",
    fields: ["الهندسة","العلوم","الآداب"], region: "الشمال", gpa: 80,
    desc: "منح الجدارة للطلاب المتميزين في الشمال والمناطق المجاورة",
    link: "https://www.usek.edu.lb", emoji: "📚", tag: "جدارة", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 6, name: "منحة البنك الدولي للتعليم في لبنان", org: "البنك الدولي",
    amount: "3,000$ سنوياً", deadline: "15 يونيو 2026", type: "need",
    fields: ["الاقتصاد","العلوم الاجتماعية","السياسات العامة"], region: "all", gpa: 70,
    desc: "منحة دولية تدعم التعليم العالي في لبنان للأسر المتضررة",
    link: "#", emoji: "🌍", tag: "دولية", tagColor: "bg-teal-100 text-teal-700",
  },
  {
    id: 7, name: "منحة الجامعة اللبنانية LU", org: "الجامعة اللبنانية",
    amount: "إعفاء كامل", deadline: "30 سبتمبر 2026", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 85,
    desc: "إعفاء كامل من الرسوم للطلاب الأوائل على الثانوية العامة",
    link: "https://www.ul.edu.lb", emoji: "🏅", tag: "إعفاء كامل", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 8, name: "منحة Teach For Lebanon", org: "TFL",
    amount: "1,500$ + تدريب", deadline: "31 مارس 2026", type: "program",
    fields: ["التربية والتعليم","العلوم الاجتماعية"], region: "all", gpa: 75,
    desc: "برنامج للطلاب المهتمين بالتعليم ودعم المجتمعات المحلية",
    link: "#", emoji: "📖", tag: "برنامج", tagColor: "bg-orange-100 text-orange-700",
  },

  // ─── جامعات لبنانية إضافية ──────────────────────────────────────────────
  {
    id: 9, name: "منحة جامعة نوتردام NDU", org: "NDU",
    amount: "25% - 100%", deadline: "30 أبريل 2026", type: "merit",
    fields: ["الهندسة","إدارة الأعمال","العلوم","الإعلام"], region: "جبل لبنان", gpa: 80,
    desc: "منح أكاديمية متدرّجة حسب المعدل، مع منح خاصة للرياضيين والفنانين والقادة في المجتمع.",
    link: "https://www.ndu.edu.lb", emoji: "🎓", tag: "جدارة", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 10, name: "منحة جامعة بيروت العربية BAU", org: "BAU",
    amount: "25% - 50%", deadline: "15 يوليو 2026", type: "merit",
    fields: ["الطب","الصيدلة","الهندسة","الحقوق"], region: "بيروت", gpa: 80,
    desc: "منح للطلاب المتفوّقين في الثانوية، مع رسوم منخفضة أصلاً مقارنة بالجامعات الخاصة.",
    link: "https://www.bau.edu.lb", emoji: "🏛️", tag: "جدارة", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 11, name: "منحة جامعة الحكمة La Sagesse", org: "ULS",
    amount: "20% - 60%", deadline: "31 مايو 2026", type: "mixed",
    fields: ["الحقوق","الفنون","العلوم السياسية"], region: "بيروت", gpa: 78,
    desc: "منح للطلاب الأوائل ولأبناء العائلات ذات الدخل المحدود، مع تركيز على الحقوق والفلسفة.",
    link: "https://www.uls.edu.lb", emoji: "⚖️", tag: "متعدد", tagColor: "bg-purple-100 text-purple-700",
  },
  {
    id: 12, name: "منحة جامعة الروح القدس الكسليك USEK Honors", org: "USEK",
    amount: "تغطية كاملة", deadline: "28 فبراير 2026", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 90,
    desc: "برنامج التميّز لأوائل الثانوية العامة (90%+) مع رفقة Honors Program ومرشد أكاديمي.",
    link: "https://www.usek.edu.lb", emoji: "🏆", tag: "Honors", tagColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 13, name: "منحة الجامعة الأنطونية UA", org: "UA",
    amount: "30% - 80%", deadline: "10 يونيو 2026", type: "mixed",
    fields: ["اللاهوت","الإعلام","العلوم الإنسانية","الفنون"], region: "جبل لبنان", gpa: 75,
    desc: "منح للطلاب المتفوّقين والمحتاجين، تشمل منحاً خاصة لطلاب اللاهوت والموسيقى.",
    link: "https://www.ua.edu.lb", emoji: "✝️", tag: "متعدد", tagColor: "bg-purple-100 text-purple-700",
  },
  {
    id: 14, name: "منحة جامعة الجنان", org: "Jinan University",
    amount: "20% - 50%", deadline: "15 يوليو 2026", type: "need",
    fields: ["الصيدلة","الإعلام","التربية"], region: "الشمال", gpa: 72,
    desc: "تخفيضات على الرسوم لطلاب الشمال وأبناء العاملين في القطاع التربوي.",
    link: "https://www.jinan.edu.lb", emoji: "📘", tag: "إقليمية", tagColor: "bg-teal-100 text-teal-700",
  },
  {
    id: 15, name: "منحة الجامعة الإسلامية في لبنان IUL", org: "IUL",
    amount: "إعفاء جزئي", deadline: "31 يوليو 2026", type: "need",
    fields: ["الإعلام","الحقوق","العلوم السياسية"], region: "البقاع", gpa: 70,
    desc: "إعفاءات للطلاب من المناطق الريفية والأسر ذات الدخل المحدود.",
    link: "https://www.iul.edu.lb", emoji: "🕌", tag: "إقليمية", tagColor: "bg-teal-100 text-teal-700",
  },
  {
    id: 16, name: "منحة Haigazian University", org: "Haigazian",
    amount: "30% - 70%", deadline: "20 مايو 2026", type: "merit",
    fields: ["العلوم الإنسانية","التربية","الأعمال"], region: "بيروت", gpa: 78,
    desc: "منح أكاديمية + منح للطلاب الأرمن وللعاملين في خدمة المجتمع.",
    link: "https://www.haigazian.edu.lb", emoji: "🎓", tag: "جدارة", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 17, name: "منحة جامعة AUST", org: "AUST",
    amount: "25% - 50%", deadline: "30 يونيو 2026", type: "merit",
    fields: ["الهندسة","تكنولوجيا المعلومات","إدارة الأعمال"], region: "all", gpa: 80,
    desc: "منح للطلاب الأوائل ولحاملي شهادات Bac II بمعدل 14+ ولطلاب التكنولوجيا.",
    link: "https://www.aust.edu.lb", emoji: "💻", tag: "جدارة", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 18, name: "منحة LIU الجامعة اللبنانية الدولية", org: "LIU",
    amount: "إعفاء جزئي", deadline: "31 أغسطس 2026", type: "mixed",
    fields: ["جميع التخصصات"], region: "all", gpa: 75,
    desc: "تخفيضات على الرسوم لأوائل الفروع، الإخوة، أبناء العاملين، والرياضيين.",
    link: "https://www.liu.edu.lb", emoji: "🌐", tag: "متعدد", tagColor: "bg-purple-100 text-purple-700",
  },
  {
    id: 19, name: "منحة جامعة MUBS", org: "MUBS",
    amount: "20% - 100%", deadline: "15 يوليو 2026", type: "merit",
    fields: ["إدارة الأعمال","المحاسبة","التسويق"], region: "all", gpa: 75,
    desc: "منح متدرّجة لطلاب البزنس والمحاسبة، مع منحة كاملة لأوائل البكالوريا.",
    link: "https://www.mubs.edu.lb", emoji: "📊", tag: "جدارة", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 20, name: "منحة جامعة الفنون والعلوم والتكنولوجيا AUL", org: "AUL",
    amount: "25% - 50%", deadline: "30 يونيو 2026", type: "need",
    fields: ["الفنون","التصميم","الإعلام"], region: "بيروت", gpa: 70,
    desc: "منح للطلاب المبدعين في الفنون والإعلام، مع مراعاة الوضع المادي.",
    link: "https://www.aul.edu.lb", emoji: "🎨", tag: "فنون", tagColor: "bg-pink-100 text-pink-700",
  },

  // ─── مؤسسات وجمعيات لبنانية ─────────────────────────────────────────────
  {
    id: 21, name: "منحة AMIDEAST Lebanon", org: "AMIDEAST",
    amount: "تغطية جزئية + تدريب", deadline: "31 يناير 2026", type: "program",
    fields: ["جميع التخصصات"], region: "all", gpa: 80,
    desc: "برامج تبادل ومنح للدراسة في الولايات المتحدة بدعم من السفارة الأميركية.",
    link: "https://www.amideast.org/lebanon", emoji: "🇺🇸", tag: "تبادل", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 22, name: "منحة مؤسسة الوليد للإنسانية", org: "Alwaleed Philanthropies",
    amount: "تغطية كاملة", deadline: "28 فبراير 2026", type: "need",
    fields: ["جميع التخصصات"], region: "all", gpa: 80,
    desc: "منح كاملة للطلاب اللبنانيين المتفوقين من ذوي الدخل المحدود في AUB وLAU.",
    link: "https://www.alwaleedphilanthropies.org", emoji: "🤲", tag: "تغطية كاملة", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 23, name: "منحة مؤسسة Diane Foundation", org: "Diane Foundation",
    amount: "5,000$ سنوياً", deadline: "31 مايو 2026", type: "need",
    fields: ["جميع التخصصات"], region: "all", gpa: 75,
    desc: "دعم سنوي للطالبات اللبنانيات من أسر متضرّرة مع تركيز على القيادة النسائية.",
    link: "#", emoji: "👩‍🎓", tag: "للنساء", tagColor: "bg-pink-100 text-pink-700",
  },
  {
    id: 24, name: "منحة مؤسسة الصفدي", org: "Safadi Foundation",
    amount: "2,000$ - 4,000$", deadline: "30 يونيو 2026", type: "need",
    fields: ["الطب","الهندسة","التربية"], region: "الشمال", gpa: 78,
    desc: "منح للطلاب من الشمال (طرابلس والمنية والضنية) في الجامعات الخاصة.",
    link: "#", emoji: "🌟", tag: "إقليمية", tagColor: "bg-teal-100 text-teal-700",
  },
  {
    id: 25, name: "منحة مؤسسة عصام فارس", org: "Issam Fares Foundation",
    amount: "حتى 6,000$", deadline: "15 أبريل 2026", type: "merit",
    fields: ["السياسات العامة","الاقتصاد","الإعلام"], region: "all", gpa: 82,
    desc: "منح للماجستير والدكتوراه في AUB ضمن معهد عصام فارس للسياسات العامة.",
    link: "https://www.aub.edu.lb/ifi", emoji: "🏛️", tag: "ماجستير", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 26, name: "منحة مؤسسة Hariri (HUSF)", org: "Hariri Foundation",
    amount: "تغطية الرسوم + مصاريف", deadline: "31 مارس 2026", type: "need",
    fields: ["الطب","الهندسة","التمريض","الصيدلة"], region: "all", gpa: 80,
    desc: "منح للطلاب اللبنانيين المتفوقين في التخصصات العلمية، تشمل القرض الحسن.",
    link: "https://www.hariri-foundation.org", emoji: "💚", tag: "علمية", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 27, name: "منحة مؤسسة ميشال المر", org: "Michel El Murr Foundation",
    amount: "2,500$ - 5,000$", deadline: "30 أبريل 2026", type: "merit",
    fields: ["الهندسة","الطب","الفنون"], region: "جبل لبنان", gpa: 80,
    desc: "منح سنوية لطلاب المتن والمناطق المجاورة في الجامعات الخاصة.",
    link: "#", emoji: "🏔️", tag: "إقليمية", tagColor: "bg-teal-100 text-teal-700",
  },
  {
    id: 28, name: "منحة Lebanese American University Honors", org: "LAU",
    amount: "تغطية كاملة", deadline: "15 فبراير 2026", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 90,
    desc: "برنامج Honors لأوائل الثانوية العامة، يشمل سكن جامعي ومرشد أكاديمي.",
    link: "https://www.lau.edu.lb", emoji: "🥇", tag: "Honors", tagColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 29, name: "منحة بنك بيروت BoB للتفوّق", org: "Bank of Beirut",
    amount: "3,000$ سنوياً", deadline: "31 يوليو 2026", type: "merit",
    fields: ["المالية","المحاسبة","الاقتصاد"], region: "all", gpa: 85,
    desc: "منحة سنوية لطلاب المالية والمصرفية مع فرصة تدريب صيفي مدفوع في البنك.",
    link: "#", emoji: "🏦", tag: "مصرفية", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 30, name: "منحة جمعية المصارف ABL", org: "ABL",
    amount: "2,000$ سنوياً", deadline: "30 سبتمبر 2026", type: "merit",
    fields: ["الاقتصاد","المالية","المحاسبة","البنوك"], region: "all", gpa: 82,
    desc: "منحة من جمعية مصارف لبنان لطلاب التخصصات المالية في الجامعات اللبنانية.",
    link: "https://www.abl.org.lb", emoji: "💰", tag: "مصرفية", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 31, name: "منحة كاريتاس لبنان", org: "Caritas Lebanon",
    amount: "حتى 2,000$", deadline: "15 سبتمبر 2026", type: "need",
    fields: ["العمل الاجتماعي","التمريض","التربية"], region: "all", gpa: 70,
    desc: "دعم للطلاب من الأسر المحتاجة مع تركيز على تخصصات الخدمة المجتمعية.",
    link: "https://www.caritas.org.lb", emoji: "❤️", tag: "إنساني", tagColor: "bg-red-100 text-red-700",
  },
  {
    id: 32, name: "منحة جمعية المقاصد الإسلامية", org: "Makassed",
    amount: "إعفاء جزئي", deadline: "31 أغسطس 2026", type: "need",
    fields: ["جميع التخصصات"], region: "بيروت", gpa: 72,
    desc: "منح لخريجي مدارس المقاصد ولأبناء الأسر البيروتية ذات الدخل المحدود.",
    link: "https://www.makassed.org.lb", emoji: "📚", tag: "خرّيجي مدارس", tagColor: "bg-orange-100 text-orange-700",
  },
  {
    id: 33, name: "منحة Asfari Foundation", org: "Asfari Foundation",
    amount: "حتى 8,000$", deadline: "31 يناير 2026", type: "merit",
    fields: ["السياسات العامة","الحقوق","العلوم الاجتماعية"], region: "all", gpa: 85,
    desc: "منحة للماجستير في AUB أو SOAS لندن، مع شرط العمل في القطاع العام المدني.",
    link: "https://asfarifoundation.org.uk", emoji: "🌐", tag: "ماجستير", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 34, name: "منحة وزارة التربية - أوائل البكالوريا", org: "وزارة التربية",
    amount: "إعفاء كامل LU", deadline: "30 سبتمبر 2026", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 18,
    desc: "إعفاء كامل من رسوم الجامعة اللبنانية للأوائل في كل فرع من فروع البكالوريا.",
    link: "https://www.mehe.gov.lb", emoji: "🏅", tag: "حكومية", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 35, name: "منحة Olayan School AUB", org: "AUB - Olayan",
    amount: "تغطية كاملة + مصاريف", deadline: "28 فبراير 2026", type: "merit",
    fields: ["إدارة الأعمال","المالية","التسويق"], region: "all", gpa: 88,
    desc: "منحة Olayan الكاملة لطلاب إدارة الأعمال في AUB، تشمل سكن وراتب شهري.",
    link: "https://www.aub.edu.lb/osb", emoji: "💼", tag: "تغطية كاملة", tagColor: "bg-green-100 text-green-700",
  },

  // ─── منح دولية للدراسة بالخارج ──────────────────────────────────────────
  {
    id: 36, name: "Erasmus+ Mundus Joint Masters", org: "EU",
    amount: "حتى 49,000€", deadline: "15 يناير 2026", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 80,
    desc: "منحة كاملة لماجستير مشترك بين جامعتين أوروبيتين على الأقل، تشمل سكن وسفر.",
    link: "https://erasmus-plus.ec.europa.eu", emoji: "🇪🇺", tag: "دولية", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 37, name: "منحة Fulbright Foreign Student", org: "U.S. State Department",
    amount: "تغطية كاملة + راتب", deadline: "31 مايو 2026", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 85,
    desc: "منحة Fulbright للدراسات العليا في الولايات المتحدة، تشمل الرسوم والمعيشة والتأمين.",
    link: "https://lb.usembassy.gov", emoji: "🇺🇸", tag: "تغطية كاملة", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 38, name: "Chevening Scholarship UK", org: "UK Government",
    amount: "تغطية كاملة", deadline: "5 نوفمبر 2025", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 85,
    desc: "منحة الحكومة البريطانية لماجستير لسنة واحدة في أي جامعة بريطانية معتمدة.",
    link: "https://www.chevening.org", emoji: "🇬🇧", tag: "تغطية كاملة", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 39, name: "منحة DAAD الألمانية", org: "DAAD",
    amount: "934€ شهرياً + رسوم", deadline: "31 أكتوبر 2025", type: "merit",
    fields: ["الهندسة","العلوم","العلوم الإنسانية"], region: "all", gpa: 82,
    desc: "منحة الحكومة الألمانية للماجستير والدكتوراه، تشمل دروس ألماني وتأمين صحي.",
    link: "https://www.daad.de", emoji: "🇩🇪", tag: "ألمانيا", tagColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 40, name: "Eiffel Excellence Scholarship", org: "France Ministry",
    amount: "1,181€ شهرياً", deadline: "10 يناير 2026", type: "merit",
    fields: ["الهندسة","الاقتصاد","الحقوق","العلوم السياسية"], region: "all", gpa: 85,
    desc: "منحة Eiffel للتميّز للماجستير والدكتوراه في فرنسا، عبر الجامعة الفرنسية المضيفة.",
    link: "https://www.campusfrance.org", emoji: "🇫🇷", tag: "فرنسا", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 41, name: "منحة AUF للجامعة الفرنكوفونية", org: "AUF",
    amount: "حتى 1,000€ شهرياً", deadline: "15 مارس 2026", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 80,
    desc: "منح للطلاب الفرنكوفونيين في برامج ماجستير ودكتوراه بدول AUF حول العالم.",
    link: "https://www.auf.org", emoji: "🌍", tag: "فرنكوفونية", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 42, name: "Türkiye Bursları (Türkiye Scholarships)", org: "Republic of Türkiye",
    amount: "تغطية كاملة + راتب", deadline: "20 فبراير 2026", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 80,
    desc: "منحة الحكومة التركية للبكالوريوس والماجستير، تشمل سكن وتذاكر سفر ودروس تركي.",
    link: "https://www.turkiyeburslari.gov.tr", emoji: "🇹🇷", tag: "تغطية كاملة", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 43, name: "Stipendium Hungaricum", org: "Hungarian Government",
    amount: "تغطية كاملة", deadline: "15 يناير 2026", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 78,
    desc: "منحة الحكومة المجرية للبكالوريوس والماجستير والدكتوراه في الجامعات المجرية.",
    link: "https://stipendiumhungaricum.hu", emoji: "🇭🇺", tag: "أوروبا", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 44, name: "Italian Government MAECI", org: "Italian Government",
    amount: "900€ شهرياً", deadline: "9 يونيو 2026", type: "merit",
    fields: ["الفنون","الموسيقى","الهندسة","الإيطالية"], region: "all", gpa: 80,
    desc: "منحة وزارة الخارجية الإيطالية للدراسات العليا والكورسات في إيطاليا.",
    link: "https://esteri.it", emoji: "🇮🇹", tag: "إيطاليا", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 45, name: "Swiss Government Excellence Scholarship", org: "Swiss Confederation",
    amount: "1,920 CHF شهرياً", deadline: "30 نوفمبر 2025", type: "merit",
    fields: ["البحث العلمي","الفنون"], region: "all", gpa: 85,
    desc: "منحة الحكومة السويسرية للأبحاث والدكتوراه والفنون في الجامعات السويسرية.",
    link: "https://www.sbfi.admin.ch", emoji: "🇨🇭", tag: "بحث", tagColor: "bg-red-100 text-red-700",
  },
  {
    id: 46, name: "Belgium ARES Scholarships", org: "ARES Belgium",
    amount: "1,290€ شهرياً", deadline: "5 مارس 2026", type: "merit",
    fields: ["الصحة العامة","التنمية","البيئة"], region: "all", gpa: 80,
    desc: "منحة الحكومة البلجيكية للماجستير والتدريبات المتخصصة في تخصصات التنمية.",
    link: "https://www.ares-ac.be", emoji: "🇧🇪", tag: "تنمية", tagColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 47, name: "Holland Scholarship NL", org: "Dutch Government",
    amount: "5,000€ سنة أولى", deadline: "1 مايو 2026", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 80,
    desc: "منحة هولندية للبكالوريوس والماجستير في الجامعات الهولندية المشاركة.",
    link: "https://www.studyinnl.org", emoji: "🇳🇱", tag: "أوروبا", tagColor: "bg-orange-100 text-orange-700",
  },
  {
    id: 48, name: "MEXT Scholarship Japan", org: "Japanese Government",
    amount: "تغطية كاملة + راتب", deadline: "31 مايو 2026", type: "merit",
    fields: ["الهندسة","العلوم","اللغة اليابانية"], region: "all", gpa: 80,
    desc: "منحة الحكومة اليابانية للبكالوريوس والماجستير والدكتوراه عبر السفارة في بيروت.",
    link: "https://www.mext.go.jp", emoji: "🇯🇵", tag: "اليابان", tagColor: "bg-red-100 text-red-700",
  },
  {
    id: 49, name: "Korean Government KGSP", org: "NIIED Korea",
    amount: "تغطية كاملة + 900,000₩", deadline: "31 مارس 2026", type: "merit",
    fields: ["الهندسة","تكنولوجيا المعلومات","الفنون","الكورية"], region: "all", gpa: 80,
    desc: "منحة الحكومة الكورية الجنوبية للبكالوريوس والدراسات العليا، تشمل سنة لغة كورية.",
    link: "https://www.studyinkorea.go.kr", emoji: "🇰🇷", tag: "كوريا", tagColor: "bg-blue-100 text-blue-700",
  },
  {
    id: 50, name: "Chinese Government CSC", org: "China Scholarship Council",
    amount: "تغطية كاملة + راتب", deadline: "31 مارس 2026", type: "merit",
    fields: ["الهندسة","الطب","الأعمال","اللغة الصينية"], region: "all", gpa: 78,
    desc: "منحة الحكومة الصينية للبكالوريوس والماجستير والدكتوراه، تشمل سكن وتأمين.",
    link: "https://www.campuschina.org", emoji: "🇨🇳", tag: "الصين", tagColor: "bg-red-100 text-red-700",
  },
  {
    id: 51, name: "Australia Awards Scholarships", org: "Australian Government",
    amount: "تغطية كاملة", deadline: "30 أبريل 2026", type: "merit",
    fields: ["التنمية","الصحة","الحوكمة","التعليم"], region: "all", gpa: 82,
    desc: "منحة الحكومة الأسترالية للماجستير والدكتوراه مع التزام بالعودة للخدمة في بلد الأصل.",
    link: "https://www.dfat.gov.au/australia-awards", emoji: "🇦🇺", tag: "تنمية", tagColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 52, name: "Vanier Canada Graduate Scholarship", org: "Government of Canada",
    amount: "50,000 CAD سنوياً", deadline: "1 نوفمبر 2025", type: "merit",
    fields: ["العلوم","الهندسة","العلوم الاجتماعية","الصحة"], region: "all", gpa: 88,
    desc: "منحة Vanier للدكتوراه في الجامعات الكندية، من أرقى المنح في كندا.",
    link: "https://vanier.gc.ca", emoji: "🇨🇦", tag: "دكتوراه", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 53, name: "Gates Cambridge Scholarship", org: "Bill & Melinda Gates",
    amount: "تغطية كاملة + راتب", deadline: "5 ديسمبر 2025", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 90,
    desc: "منحة Gates للماجستير والدكتوراه في كامبردج، للقادة المتفوقين الملتزمين بخدمة المجتمع.",
    link: "https://www.gatescambridge.org", emoji: "🎓", tag: "نخبوية", tagColor: "bg-purple-100 text-purple-700",
  },
  {
    id: 54, name: "Rhodes Scholarship", org: "Rhodes Trust",
    amount: "تغطية كاملة + 18,180£", deadline: "30 سبتمبر 2025", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 90,
    desc: "أعرق منحة في العالم: دراسات عليا في جامعة أوكسفورد، يشترط القيادة وخدمة المجتمع.",
    link: "https://www.rhodeshouse.ox.ac.uk", emoji: "🏆", tag: "نخبوية", tagColor: "bg-purple-100 text-purple-700",
  },
  {
    id: 55, name: "Schwarzman Scholars (Tsinghua)", org: "Schwarzman Scholars",
    amount: "تغطية كاملة", deadline: "20 سبتمبر 2025", type: "merit",
    fields: ["السياسات العامة","الاقتصاد","العلاقات الدولية"], region: "all", gpa: 88,
    desc: "ماجستير قيادة لمدة سنة في جامعة Tsinghua ببكين، يشمل سكن وسفر ومرشدين.",
    link: "https://www.schwarzmanscholars.org", emoji: "🐉", tag: "قيادة", tagColor: "bg-red-100 text-red-700",
  },
  {
    id: 56, name: "MasterCard Foundation Scholars", org: "MasterCard Foundation",
    amount: "تغطية كاملة", deadline: "31 يناير 2026", type: "mixed",
    fields: ["جميع التخصصات"], region: "all", gpa: 80,
    desc: "منحة لقادة شباب من الدول النامية للدراسة في جامعات شريكة حول العالم.",
    link: "https://mastercardfdn.org", emoji: "🌍", tag: "تنمية", tagColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 57, name: "OFID Scholarship", org: "OPEC Fund",
    amount: "50,000$ كحدّ أقصى", deadline: "30 أبريل 2026", type: "merit",
    fields: ["التنمية","الاقتصاد","البيئة","الهندسة"], region: "all", gpa: 82,
    desc: "منحة صندوق الأوبك للماجستير في أي جامعة معتمدة، مع التزام بالعمل في التنمية.",
    link: "https://opecfund.org", emoji: "🌐", tag: "ماجستير", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 58, name: "IsDB Scholarship Programme", org: "Islamic Development Bank",
    amount: "تغطية كاملة", deadline: "28 فبراير 2026", type: "merit",
    fields: ["الهندسة","الطب","العلوم","الزراعة"], region: "all", gpa: 80,
    desc: "منحة البنك الإسلامي للتنمية للبكالوريوس والماجستير والدكتوراه في الدول الأعضاء.",
    link: "https://www.isdb.org", emoji: "🕌", tag: "إسلامية", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 59, name: "Aga Khan Foundation ISP", org: "Aga Khan Foundation",
    amount: "تغطية + قرض 50%", deadline: "31 مارس 2026", type: "mixed",
    fields: ["جميع التخصصات"], region: "all", gpa: 82,
    desc: "منحة وقرض مزدوج للدراسات العليا في أي جامعة عالمية معتمدة (50% منحة + 50% قرض).",
    link: "https://www.akdn.org/akf-isp", emoji: "🌟", tag: "ماجستير", tagColor: "bg-indigo-100 text-indigo-700",
  },
  {
    id: 60, name: "Sheikh Mohammed bin Rashid Scholarship", org: "MBRSG",
    amount: "تغطية كاملة + راتب", deadline: "30 مايو 2026", type: "merit",
    fields: ["الإدارة الحكومية","السياسات العامة"], region: "all", gpa: 85,
    desc: "منحة كاملة للماجستير في كلية محمد بن راشد للإدارة الحكومية بدبي.",
    link: "https://www.mbrsg.ae", emoji: "🇦🇪", tag: "الإمارات", tagColor: "bg-amber-100 text-amber-700",
  },
  {
    id: 61, name: "King Abdullah Scholarship Program", org: "Saudi Arabia",
    amount: "تغطية كاملة + 1,500$", deadline: "30 يونيو 2026", type: "merit",
    fields: ["الطب","الهندسة","العلوم"], region: "all", gpa: 85,
    desc: "منحة الملك عبد الله للدراسات العليا في أرقى الجامعات العالمية، تشمل عائلة الطالب.",
    link: "https://moe.gov.sa", emoji: "🇸🇦", tag: "السعودية", tagColor: "bg-green-100 text-green-700",
  },
  {
    id: 62, name: "Qatar Foundation Scholarship", org: "Qatar Foundation",
    amount: "تغطية كاملة", deadline: "31 مارس 2026", type: "merit",
    fields: ["جميع التخصصات"], region: "all", gpa: 85,
    desc: "منح مؤسسة قطر للدراسة في جامعات Education City (Carnegie Mellon, Georgetown, NYU...).",
    link: "https://www.qf.org.qa", emoji: "🇶🇦", tag: "قطر", tagColor: "bg-purple-100 text-purple-700",
  },
  {
    id: 63, name: "Open Society Foundations OSF", org: "Open Society",
    amount: "تغطية كاملة", deadline: "31 يناير 2026", type: "merit",
    fields: ["الحقوق","الإعلام","السياسات العامة","حقوق الإنسان"], region: "all", gpa: 80,
    desc: "منحة OSF للماجستير في تخصصات حقوق الإنسان والصحافة والسياسات العامة.",
    link: "https://www.opensocietyfoundations.org", emoji: "🕊️", tag: "حقوق الإنسان", tagColor: "bg-pink-100 text-pink-700",
  },
];

const TYPE_LABEL_KEYS: Record<string, TranslationKey> = {
  all: "sch.type.all", need: "sch.type.need", merit: "sch.type.merit", mixed: "sch.type.mixed", program: "sch.type.program",
};

function mapRow(row: Record<string, unknown>): Scholarship {
  let fields: string[] = ["جميع التخصصات"];
  if (typeof row.fields === "string") {
    try { fields = JSON.parse(row.fields); } catch { fields = [row.fields]; }
  } else if (Array.isArray(row.fields)) {
    fields = row.fields as string[];
  }
  return {
    id:       Number(row.id),
    name:     String(row.name || ""),
    org:      String(row.org  || ""),
    amount:   String(row.amount || ""),
    deadline: String(row.deadline || ""),
    type:     String(row.type || "need"),
    fields,
    region:   String(row.region || "all"),
    gpa:      Number(row.min_gpa || row.gpa || 0),
    desc:     String(row.description || row.desc || ""),
    link:     String(row.url || row.link || "#"),
    emoji:    String(row.emoji || "🏆"),
    tag:      String(row.tag || "منحة"),
    tagColor: String(row.tag_color || "bg-blue-100 text-blue-700"),
  };
}

// ─── Deadline Countdown Helper ───────────────────────────────────────────────
function daysUntilDeadline(deadlineStr: string): number | null {
  // Parse Arabic month names
  const months: Record<string,number> = {
    "يناير":1,"فبراير":2,"مارس":3,"أبريل":4,"مايو":5,"يونيو":6,
    "يوليو":7,"أغسطس":8,"سبتمبر":9,"أكتوبر":10,"نوفمبر":11,"ديسمبر":12
  };
  const parts = deadlineStr.trim().split(" ");
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const month = months[parts[1]];
  const year = parseInt(parts[2]);
  if (!day || !month || !year) return null;
  const deadline = new Date(year, month - 1, day);
  const today = new Date();
  today.setHours(0,0,0,0);
  return Math.ceil((deadline.getTime() - today.getTime()) / 86400000);
}

function DeadlineBadge({ deadline }: { deadline: string }) {
  const { t } = useI18n();
  const days = daysUntilDeadline(deadline);
  if (days === null) return <span className="font-semibold text-red-600">{deadline}</span>;
  if (days < 0) return <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{t('sch.deadline.closed')}</span>;
  if (days === 0) return <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">{t('sch.deadline.today')}</span>;
  if (days <= 7) return <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">⚡ {days} {t('sch.deadline.days_left')}</span>;
  if (days <= 30) return <span className="text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">🕐 {days} {t('sch.deadline.day')}</span>;
  return <span className="text-xs font-semibold text-gray-500">{deadline}</span>;
}

export default function ScholarshipsPage() {
  const { t, dir } = useI18n();
  const { profile, savedScholarships, toggleSaveScholarship } = useStudentContext();

  // Eligibility wizard state
  const [showEligibility, setShowEligibility] = useState(false);
  const [eGpa, setEGpa] = useState(profile?.gpa || 75);
  const [eMajor, setEMajor] = useState("");
  const [eRegion, setERegion] = useState(profile?.region || "");
  const [eligibilityRun, setEligibilityRun] = useState(false);
  const [scholarships, setScholarships] = useState<Scholarship[]>(STATIC_SCHOLARSHIPS);
  const [search, setSearch]   = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [gpaFilter, setGpaFilter]   = useState(0);
  const [saved, setSaved]     = useState<number[]>([]);

  // Load from Supabase; keep static data as fallback
  useEffect(() => {
    supabase
      .from("scholarships")
      .select("*")
      .eq("active", true)
      .order("id", { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) setScholarships(data.map(mapRow));
      });
  }, []);

  const filtered = scholarships.filter(s => {
    const matchSearch = s.name.includes(search) || s.org.includes(search) || s.fields.some(f => f.includes(search));
    const matchType   = typeFilter === "all" || s.type === typeFilter;
    const matchGpa    = gpaFilter === 0 || s.gpa <= gpaFilter;
    return matchSearch && matchType && matchGpa;
  });

  function toggleSave(id: number) {
    toggleSaveScholarship(id);
  }


  const MAJOR_OPTIONS = [t('sch.major.all'),"الهندسة","الطب","الأعمال","الحقوق","الفنون","التربية","العلوم","الاقتصاد","الإعلام"];

  const eligibilityMatches = useMemo(() => {
    if (!eligibilityRun) return null;
    return scholarships.map(s => {
      let score = 0;
      if (s.gpa <= eGpa) score += 40;
      else if (s.gpa - eGpa <= 5) score += 20;
      if (eMajor === "جميع التخصصات" || s.fields.includes("جميع التخصصات") || s.fields.some(f => f.includes(eMajor) || eMajor.includes(f))) score += 30;
      if (s.region === "all" || s.region.includes(eRegion) || eRegion === "") score += 30;
      return { ...s, matchPct: Math.min(score, 100) };
    }).filter(s => s.matchPct >= 40).sort((a, b) => b.matchPct - a.matchPct);
  }, [eligibilityRun, eGpa, eMajor, eRegion, scholarships]);

  return (
    <div className="min-h-screen bg-bg relative overflow-hidden" dir={dir}>
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-25 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-accent rounded-full blur-3xl opacity-15 pointer-events-none" />

      <main className="relative max-w-5xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="bg-gradient-hero rounded-4xl p-8 md:p-10 mb-6 text-white shadow-floaty relative overflow-hidden">
          <div className="absolute inset-0 bg-pattern-dots opacity-15" style={{ backgroundSize: '20px 20px' }} />
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-mint/30 rounded-full blur-3xl" />
          <div className="absolute top-4 left-8 text-3xl animate-float opacity-50">🎓</div>

          <div className="relative flex items-center gap-5">
            <div className="text-7xl animate-bounce-soft drop-shadow-2xl">🏆</div>
            <div>
              <span className="inline-block bg-white/15 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-2">{t('sch.badge')}</span>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{t('sch.title.short')}</h1>
              <p className="text-white/90">{t('sch.subtitle.discover')} <strong className="text-mint">{scholarships.length}+</strong> {t('sch.subtitle.suffix')}</p>
            </div>
          </div>
        </div>

        {/* Eligibility Wizard */}
        <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-sm mb-6 overflow-hidden">
          <button onClick={() => setShowEligibility(!showEligibility)}
            className="w-full flex items-center justify-between p-5 text-right hover:bg-blue-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-bold text-gray-800">{t('sch.elig.title')}</p>
                <p className="text-sm text-gray-500">{t('sch.elig.subtitle')}</p>
              </div>
            </div>
            <span className="text-gray-400 text-xl">{showEligibility ? "▲" : "▼"}</span>
          </button>
          {showEligibility && (
            <div className="border-t border-blue-100 p-5 bg-blue-50">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="text-sm font-bold text-gray-600 block mb-2">{t('sch.elig.gpa')} <strong>{eGpa}%</strong></label>
                  <input type="range" min={40} max={100} value={eGpa} onChange={e => setEGpa(+e.target.value)}
                    className="w-full accent-blue-600" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-600 block mb-2">{t('sch.elig.major')}</label>
                  <select value={eMajor} onChange={e => setEMajor(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:border-blue-400 focus:outline-none">
                    {MAJOR_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-600 block mb-2">{t('sch.elig.region')}</label>
                  <select value={eRegion} onChange={e => setERegion(e.target.value)}
                    className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm bg-white focus:border-blue-400 focus:outline-none">
                    <option value="">{t('sch.elig.any_region')}</option>
                    {["بيروت","جبل لبنان","الشمال","الجنوب","البقاع"].map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <button onClick={() => { setEligibilityRun(true); setShowEligibility(false); }}
                className="bg-blue-600 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-blue-700 transition-colors">
                {t('sch.elig.run')}
              </button>
            </div>
          )}
        </div>

        {/* Eligibility Results */}
        {eligibilityRun && eligibilityMatches && (
          <div className="mb-6 bg-green-50 border-2 border-green-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-green-800 flex items-center gap-2">
                ✅ {t('sch.elig.found')} <span className="bg-green-600 text-white rounded-full px-2 py-0.5 text-sm">{eligibilityMatches.length}</span> {t('sch.elig.found.suffix')}
              </h3>
              <button onClick={() => setEligibilityRun(false)} className="text-sm text-gray-500 hover:text-gray-700">{t('sch.elig.close')}</button>
            </div>
            <div className="grid md:grid-cols-2 gap-3">
              {eligibilityMatches.slice(0, 4).map(s => (
                <div key={s.id} className="bg-white rounded-xl p-4 border border-green-100 flex items-center gap-3">
                  <span className="text-2xl">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 text-sm truncate">{s.name}</p>
                    <p className="text-xs text-gray-500">{s.amount} · {t('sch.elig.gpa_min')} {s.gpa}%+</p>
                  </div>
                  <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg whitespace-nowrap">{s.matchPct}% {t('sch.elig.match')}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input value={search} onChange={e => setSearch(e.target.value)}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
                placeholder={t('sch.search.detailed')} />
            </div>
            <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none bg-white min-w-[160px]">
              {Object.entries(TYPE_LABEL_KEYS).map(([k, vKey]) => <option key={k} value={k}>{t(vKey)}</option>)}
            </select>
            <select value={gpaFilter} onChange={e => setGpaFilter(Number(e.target.value))}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none bg-white min-w-[160px]">
              <option value={0}>{t('sch.gpa.any')}</option>
              <option value={70}>{t('sch.gpa.70')}</option>
              <option value={75}>{t('sch.gpa.75')}</option>
              <option value={80}>{t('sch.gpa.80')}</option>
              <option value={85}>{t('sch.gpa.85')}</option>
            </select>
          </div>

          <div className="flex items-center justify-between mt-3 text-sm text-text-sub">
            <span>{t('sch.showing')} <strong className="text-primary">{filtered.length}</strong> {t('sch.count.label')}</span>
            {saved.length > 0 && (
              <span className="text-accent font-semibold">⭐ {saved.length} {t('sch.count.label')}</span>
            )}
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="card text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-text-sub">{t('sch.empty.title')}</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {filtered.map(s => (
              <div key={s.id} className="card hover:shadow-lg transition-all hover:-translate-y-0.5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{s.emoji}</div>
                    <div>
                      <span className={`badge ${s.tagColor} text-xs mb-1 inline-block`}>{s.tag}</span>
                      <h3 className="font-bold text-primary text-sm leading-snug">{s.name}</h3>
                    </div>
                  </div>
                  <button onClick={() => toggleSave(s.id)}
                    className={`text-xl transition-transform hover:scale-110 ${saved.includes(s.id) ? "text-yellow-500" : "text-gray-300"}`}>
                    ⭐
                  </button>
                </div>

                <p className="text-text-sub text-sm mb-4 leading-relaxed">{s.desc}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-sub">{t('sch.card.amount')}</span>
                    <span className="font-bold text-success">{s.amount}</span>
                  </div>
                  <div className="flex justify-between text-sm items-center">
                    <span className="text-text-sub">{t('sch.card.deadline')}</span>
                    <DeadlineBadge deadline={s.deadline} />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-sub">{t('sch.card.required_gpa')}</span>
                    <span className="font-semibold text-primary">{s.gpa}{t('sch.card.gpa.suffix')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-sub">{t('sch.card.fields')}</span>
                    <span className="text-text-main text-xs">{s.fields.join("، ")}</span>
                  </div>
                </div>

                <a href={s.link} target="_blank" rel="noopener noreferrer"
                  className="w-full btn-primary py-2.5 rounded-xl text-sm text-center block">
                  {t('sch.card.apply')}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="card mt-8 bg-light border-2 border-accent/20">
          <h3 className="font-bold text-primary mb-3 flex items-center gap-2">
            <span>💡</span> {t('sch.tips.title')}
          </h3>
          <ul className="space-y-2 text-sm text-text-sub">
            {(['sch.tip.1','sch.tip.2','sch.tip.3','sch.tip.4','sch.tip.5'] as TranslationKey[]).map((tipKey, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-accent mt-0.5">✓</span>
                <span>{t(tipKey)}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
    </div>
  );
}
