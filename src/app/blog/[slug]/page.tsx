import Link from "next/link";
import { notFound } from "next/navigation";

const CAT_COLORS: Record<string, string> = {
  "الجامعات":          "bg-blue-50 text-blue-700",
  "سوق العمل":        "bg-green-50 text-green-700",
  "التوظيف الدولي":   "bg-purple-50 text-purple-700",
  "مهن المستقبل":     "bg-orange-50 text-orange-700",
  "المنح الدراسية":   "bg-amber-50 text-amber-700",
  "اختبارات المهنية": "bg-teal-50 text-teal-700",
  "نصائح مهنية":      "bg-rose-50 text-rose-700",
  "مقارنات":          "bg-indigo-50 text-indigo-700",
  "الطب والصحة":      "bg-red-50 text-red-700",
  "ريادة الأعمال":    "bg-emerald-50 text-emerald-700",
  "التعليم الدولي":   "bg-sky-50 text-sky-700",
};

type Section = { h2?: string; p?: string; ul?: string[]; tip?: string };

interface ArticleData {
  title: string; cat: string; emoji: string; date: string;
  readTime: string; excerpt: string; sections: Section[];
}

const ARTICLES: Record<string, ArticleData> = {
  "university-comparison": {
    title: "الجامعات اللبنانية: مقارنة شاملة لمساعدتك في الاختيار",
    cat: "الجامعات", emoji: "🏛️", date: "17 أبريل 2026", readTime: "8 دقائق",
    excerpt: "كيف تختار الجامعة المناسبة في لبنان؟ مقارنة معمّقة بين أبرز الجامعات اللبنانية من حيث الجودة والتكلفة والتخصصات.",
    sections: [
      { h2: "لماذا قرار الجامعة مصيري؟", p: "اختيار الجامعة لا يعني فقط اختيار مكان للدراسة — بل يعني اختيار بيئتك الاجتماعية، شبكة معارفك المهنية، وأسلوب تفكيرك للسنوات القادمة. في لبنان، التفاوت بين الجامعات كبير جداً من حيث الجودة الأكاديمية، الرسوم، وفرص التوظيف." },
      { h2: "أبرز الجامعات اللبنانية", ul: ["الجامعة الأمريكية في بيروت (AUB) — الأعلى تصنيفاً، رسومها مرتفعة لكن منحها وفيرة.", "جامعة القديس يوسف (USJ) — قوية جداً في الطب والقانون والعلوم الاجتماعية.", "الجامعة اللبنانية الأمريكية (LAU) — خيار ممتاز للأعمال والهندسة بتكلفة أقل من AUB.", "الجامعة اللبنانية (UL) — الأكثر انتشاراً وبتكلفة منخفضة جداً في كل المحافظات.", "جامعة البلمند — قوية في الطب والعلوم الصحية.", "الجامعة اللبنانية الدولية (LIU) — تدريس بالإنجليزية وأسعار معقولة."] },
      { h2: "معيار الجودة الأكاديمية", p: "التصنيفات الدولية مهمة لكنها ليست كل شيء. ابحث عن نسبة التوظيف لخريجي التخصص الذي تريده، وعدد الأبحاث المنشورة في مجالك، واعتماد البرامج من هيئات دولية." },
      { h2: "التكلفة والمنح الدراسية", p: "لا تقرر بناءً على الرسوم الظاهرة فقط. AUB مثلاً رسومها مرتفعة لكن 60% من طلابها يحصلون على مساعدة مالية. قارن التكلفة الفعلية بعد المنح." },
      { tip: "💡 نصيحة: قبل التسجيل، تحدث مع طلاب في السنة الثالثة والرابعة في التخصص الذي تريده." },
      { h2: "كيف تختار الجامعة المناسبة لك؟", ul: ["حدد أولويتك: هل تريد شهادة معترفاً بها دولياً، أم تكلفة منخفضة، أم قرباً جغرافياً؟", "قارن التخصص الذي تريده تحديداً في كل جامعة.", "زر الحرم الجامعي وتحدث مع الطلاب قبل اتخاذ قرارك.", "ابحث عن نادي أو مجتمع طلابي في مجالك."] },
    ],
  },
  "prepare-job-market": {
    title: "كيف تستعد لسوق العمل منذ السنة الأولى في الجامعة؟",
    cat: "سوق العمل", emoji: "💼", date: "17 أبريل 2026", readTime: "6 دقائق",
    excerpt: "لا تنتظر حتى السنة الرابعة. إليك كيف تبدأ بناء مسيرتك المهنية من اليوم الأول في الجامعة.",
    sections: [
      { h2: "الخطأ الأكبر الذي يرتكبه الطلاب", p: "أغلب الطلاب يعتقدون أن سوق العمل يبدأ بعد التخرج. الحقيقة أن الشركات الكبرى تبدأ بتتبع المواهب من السنة الثانية الجامعية." },
      { h2: "ما يمكنك فعله في السنة الأولى", ul: ["أنشئ حساب LinkedIn واملأه بشكل احترافي.", "انضم إلى نادٍ طلابي في مجالك.", "تواصل مع أساتذتك خارج الصف واسألهم عن أبحاثهم.", "ابدأ بمشروع شخصي صغير في مجالك."] },
      { h2: "التدريب الصيفي — أهميته ووقته المناسب", p: "التدريب الصيفي الأول يجب أن يكون في السنة الثانية على الأقل. ابحث عن تدريبات مدفوعة أو تطوعية في مجالك." },
      { h2: "المهارات التي يبحث عنها أصحاب العمل", ul: ["مهارات تقنية في مجالك", "مهارات التواصل والعرض التقديمي", "العمل ضمن فريق وحل المشكلات", "اللغة الإنجليزية كتابةً وتحدثاً", "معرفة أساسية بالذكاء الاصطناعي وأدواته"] },
      { tip: "💡 نصيحة: أنشئ محفظة أعمال رقمية حتى لو احتوت على مشاريع جامعية فقط." },
    ],
  },
  "remote-work-lebanon": {
    title: "العمل عن بُعد وفرص التوظيف الدولي للشباب اللبناني",
    cat: "التوظيف الدولي", emoji: "🌍", date: "17 أبريل 2026", readTime: "7 دقائق",
    excerpt: "كيف يستفيد الشباب اللبناني من العمل من بُعد للحصول على رواتب دولية؟",
    sections: [
      { h2: "لماذا العمل عن بُعد فرصة ذهبية للشباب اللبناني؟", p: "في ظل الأزمة الاقتصادية، العمل مع شركات أجنبية وتحصيل راتب بالدولار أصبح حلماً حقيقياً. مئات الشباب اللبناني يعملون اليوم مع شركات في أمريكا وأوروبا دون مغادرة لبنان." },
      { h2: "التخصصات الأكثر طلباً عالمياً", ul: ["تطوير البرمجيات وهندسة البرمجيات", "تصميم UX/UI وتصميم الجرافيك", "تسويق رقمي وإدارة وسائل التواصل الاجتماعي", "كتابة المحتوى والترجمة العربي-الإنجليزي", "تحليل البيانات والذكاء الاصطناعي"] },
      { h2: "كيف تبدأ البحث عن عمل عن بُعد؟", ul: ["أنشئ ملفاً احترافياً على Upwork وLinkedIn وToptal.", "ابدأ بمشاريع صغيرة لبناء التقييمات والسمعة.", "ركز على سوق محدد في البداية."] },
      { h2: "التحديات والحلول", p: "العقبة الأكبر هي الدفع الإلكتروني. استخدم Wise أو PayPal أو حساب بنكي خارجي لاستقبال الدفعات." },
      { tip: "💡 نصيحة: ابنِ تخصصاً محدداً بدلاً من أن تكون جنرالياً. 'مطور React للشركات الناشئة' أفضل بكثير من 'مطور ويب عام'." },
    ],
  },
  "future-careers-2030": {
    title: "مهن المستقبل في لبنان والمنطقة العربية 2025-2030",
    cat: "مهن المستقبل", emoji: "🚀", date: "15 أبريل 2026", readTime: "10 دقائق",
    excerpt: "ثورة الذكاء الاصطناعي تعيد رسم خريطة المهن. اكتشف المهن التي ستنتعش وتلك التي ستتراجع.",
    sections: [
      { h2: "الذكاء الاصطناعي: تهديد أم فرصة؟", p: "الإجابة: كلاهما. الذكاء الاصطناعي سيُلغي بعض الوظائف، لكنه سيخلق وظائف جديدة لم تكن موجودة من قبل." },
      { h2: "المهن الأكثر نمواً حتى 2030", ul: ["مهندس الذكاء الاصطناعي ومطور نماذج اللغة", "محلل بيانات وعالم بيانات", "مختص الأمن السيبراني", "مصمم تجربة المستخدم UX", "مستشار التحول الرقمي", "أخصائي الطاقة المتجددة", "ممرض ومختص رعاية صحية"] },
      { h2: "المهن التي ستتراجع", ul: ["المحاسبة الروتينية", "ترجمة النصوص البسيطة", "المهن الإدارية المتكررة", "بعض أدوار خدمة العملاء الأساسية"] },
      { tip: "💡 أدوات مثل ChatGPT وClaude وCopilot ليست بديلاً عنك — بل تجعلك أكثر إنتاجية. تعلمها الآن." },
    ],
  },
  "scholarships-guide": {
    title: "دليلك الكامل للحصول على منحة دراسية من AUB وLAU",
    cat: "المنح الدراسية", emoji: "🏆", date: "12 أبريل 2026", readTime: "9 دقائق",
    excerpt: "خطوات عملية للتقدم على أبرز المنح الدراسية في لبنان مع نصائح حصرية.",
    sections: [
      { h2: "أنواع المنح الدراسية في لبنان", ul: ["منح على أساس التفوق الأكاديمي (Merit-based)", "منح على أساس الحاجة المالية (Need-based)", "منح التميز الشامل (Merit + Need)", "منح منظمات خارجية مثل USAID والأغا خان"] },
      { h2: "متطلبات منحة AUB", p: "المعدل المطلوب 85%+ لمنح التفوق. يجب تقديم إثبات دخل الأسرة لمنح الحاجة. الطلب يُقدم مع ملف القبول أو في الشهر الأول من التسجيل." },
      { h2: "نصائح لكتابة رسالة دافع قوية", ul: ["اربط قصتك الشخصية بهدفك المهني.", "اذكر تحديات حقيقية واجهتها وكيف تغلبت عليها.", "أظهر كيف ستستفيد الجامعة منك.", "اجعلها قصيرة ومؤثرة — لا تتجاوز صفحة واحدة."] },
      { h2: "المنح الخارجية للطلاب اللبنانيين", ul: ["منحة Fulbright — للدراسة في أمريكا", "منح DAAD الألمانية", "منح الحكومة الفرنسية", "برنامج Chevening البريطاني"] },
      { tip: "💡 التقدم على المنحة لا يكلفك شيئاً سوى الوقت. كثير من الطلاب لا يتقدمون لأنهم يعتقدون أنهم غير مؤهلين." },
    ],
  },
  "riasec-explained": {
    title: "ما هو اختبار RIASEC وكيف يحدد مسارك المهني؟",
    cat: "اختبارات المهنية", emoji: "🧬", date: "10 أبريل 2026", readTime: "5 دقائق",
    excerpt: "شرح مبسط لنظرية RIASEC وكيف تستخدمها لاختيار تخصصك وجامعتك بثقة.",
    sections: [
      { h2: "ما هو اختبار RIASEC؟", p: "RIASEC هو نموذج طوّره عالم النفس الأمريكي جون هولاند، ويصنف الشخصيات إلى ستة أنواع." },
      { h2: "الأنواع الستة وما تعنيه", ul: ["R — العملي: يحب العمل بيديه. مناسب للهندسة.", "I — الاستقصائي: يحب التحليل والبحث. مناسب للعلوم والطب.", "A — الفني: يحب الإبداع. مناسب للتصميم والأدب.", "S — الاجتماعي: يحب مساعدة الناس. مناسب للتعليم والطب.", "E — الريادي: يحب القيادة. مناسب للأعمال.", "C — التقليدي: يحب النظام والدقة. مناسب للمحاسبة."] },
      { h2: "كيف تستخدم نتيجتك في اختيار التخصص؟", p: "نتيجتك RIASEC أداة لفهم نفسك أفضل وليست حكماً نهائياً. استخدمها مع معطيات أخرى لاتخاذ قرارك." },
      { tip: "💡 جرّب اختبار RIASEC المجاني على مسارك الآن!" },
    ],
  },
  "cv-tips-fresh-graduate": {
    title: "10 أخطاء تدمر سيرتك الذاتية — تجنبها الآن",
    cat: "نصائح مهنية", emoji: "📄", date: "8 أبريل 2026", readTime: "6 دقائق",
    excerpt: "المسؤولون عن التوظيف يكشفون أكثر الأخطاء شيوعاً في السير الذاتية للخريجين الجدد.",
    sections: [
      { h2: "الخطأ 1-3: أخطاء الشكل والتنسيق", ul: ["استخدام خطوط كثيرة ومختلفة.", "الصفحات الطويلة — للخريجين الجدد، صفحة واحدة كافية.", "صورة غير احترافية."] },
      { h2: "الخطأ 4-6: أخطاء المحتوى", ul: ["وصف المهام بدلاً من الإنجازات.", "وضع معلومات غير ذات صلة.", "أهداف مهنية عامة جداً."] },
      { h2: "الخطأ 7-10: أخطاء التقديم", ul: ["إرسال نفس السيرة لكل الوظائف.", "عدم استخدام كلمات مفتاحية من إعلان الوظيفة.", "ترك أخطاء إملائية أو نحوية.", "عدم وضع روابط LinkedIn أو Portfolio."] },
      { tip: "💡 استخدم منشئ السيرة الذاتية في مسارك للحصول على سيرة احترافية جاهزة بدقائق!" },
    ],
  },
  "engineering-vs-cs": {
    title: "هندسة الحاسوب أم علوم الحاسوب؟ الفرق الحقيقي والأجدر لك",
    cat: "مقارنات", emoji: "⚖️", date: "5 أبريل 2026", readTime: "7 دقائق",
    excerpt: "مقارنة شاملة بين التخصصين الأكثر طلباً لمساعدتك في اتخاذ القرار الصحيح.",
    sections: [
      { h2: "الفرق الجوهري", p: "هندسة الحاسوب تجمع البرمجة والأجهزة (Hardware). علوم الحاسوب تركز على النظرية والخوارزميات." },
      { h2: "هندسة الحاسوب — لمن هي؟", ul: ["لمن يحب العمل مع الأجهزة والأنظمة المدمجة.", "مسارات: هندسة الأجهزة، IoT، تصميم الشرائح.", "رواتبها مرتفعة في Intel وQualcomm."] },
      { h2: "علوم الحاسوب — لمن هي؟", ul: ["لمن يحب البرمجة والخوارزميات وحل المشكلات.", "مسارات: تطوير البرمجيات، الذكاء الاصطناعي، أمن المعلومات.", "أكثر مرونة وأوسع في فرص العمل."] },
      { tip: "💡 انظر إلى إعلانات الوظائف في LinkedIn للشركات التي تريد العمل فيها." },
    ],
  },
  "medicine-lebanon-guide": {
    title: "دراسة الطب في لبنان: كل ما تحتاج معرفته قبل التسجيل",
    cat: "الطب والصحة", emoji: "🩺", date: "2 أبريل 2026", readTime: "11 دقائق",
    excerpt: "من التكاليف للقبول للمسار المهني — دليل شامل لكل من يحلم بدراسة الطب في لبنان.",
    sections: [
      { h2: "شروط القبول في كليات الطب اللبنانية", ul: ["AUB: معدل 90%+ وامتحان خاص.", "USJ: امتحان concours تنافسي جداً.", "LAU: معدل مرتفع + مقابلة + خطاب دافع.", "جامعة البلمند: معدل 85%+."] },
      { h2: "مدة الدراسة والتكاليف", p: "الطب في لبنان 7 سنوات. التكاليف السنوية 12,000$-20,000$. مع المنح يمكن تخفيضها بشكل كبير." },
      { h2: "الاختصاصات الأكثر طلباً", ul: ["طب الطوارئ والرعاية الحرجة", "الطب النفسي", "جراحة عامة", "طب الأطفال"] },
      { tip: "💡 قبل أن تقرر دراسة الطب، تطوع في مستشفى لفترة — الطب مهنة متطلبة جداً." },
    ],
  },
  "startup-culture-lebanon": {
    title: "كيف تبدأ مشروعك الخاص بعد التخرج في لبنان؟",
    cat: "ريادة الأعمال", emoji: "💡", date: "28 مارس 2026", readTime: "8 دقائق",
    excerpt: "البيئة الريادية في لبنان ليست سهلة لكنها ممكنة. إليك الخطوات والموارد المتاحة.",
    sections: [
      { h2: "الواقع الريادي في لبنان اليوم", p: "رغم الأزمة الاقتصادية، ظهرت شركات ناشئة نجحت في لبنان. المفتاح هو التركيز على النموذج الذي يحل مشكلة حقيقية بموارد محدودة." },
      { h2: "الخطوات الأولى لبدء مشروعك", ul: ["حدد مشكلة حقيقية تعرفها جيداً.", "ابنِ نسخة MVP بسيطة واختبرها مع عملاء.", "ابحث عن مرشد في مجالك.", "سجّل شركتك قانونياً مبكراً."] },
      { h2: "موارد دعم رواد الأعمال في لبنان", ul: ["Berytech — حاضنة أعمال في AUB", "Speed @ BDD — مسرّع أعمال", "Flat6Labs Beirut — يستثمر في الشركات التقنية"] },
      { tip: "💡 ابدأ مشروعك كـ side project قبل مغادرة وظيفتك." },
    ],
  },
  "interview-prep-guide": {
    title: "كيف تتحضر لمقابلة العمل وتترك انطباعاً لا يُنسى",
    cat: "نصائح مهنية", emoji: "🎤", date: "25 مارس 2026", readTime: "7 دقائق",
    excerpt: "من أسئلة STAR للثقة بالنفس — تقنيات مثبتة للنجاح في مقابلة العمل.",
    sections: [
      { h2: "التحضير قبل يوم المقابلة", ul: ["ابحث عن الشركة: رسالتها، منتجاتها، منافسيها.", "راجع وصف الوظيفة واستعد لإثبات كل مهارة.", "جهّز 3-5 قصص نجاح من تجربتك.", "جهّز أسئلة جيدة لتطرحها على المحاور."] },
      { h2: "تقنية STAR للإجابة على الأسئلة السلوكية", p: "STAR: Situation، Task، Action، Result. استخدمها لتقديم قصة محددة وقابلة للقياس عند الإجابة على الأسئلة السلوكية." },
      { h2: "أسئلة يجب أن تكون مستعداً لها", ul: ["'حدثني عن نفسك' — جهّز 2 دقيقة احترافية.", "'ما نقاط ضعفك؟' — اذكر نقطة حقيقية مع خطة التحسين.", "'لماذا تريد العمل معنا؟' — كن محدداً."] },
      { tip: "💡 تمرّن على الإجابة بصوت عالٍ أمام المرآة — الثقة مهارة تُبنى بالتكرار." },
    ],
  },
  "study-abroad-lebanon": {
    title: "الدراسة في الخارج: هل تستحق؟ وكيف تمولها؟",
    cat: "التعليم الدولي", emoji: "✈️", date: "20 مارس 2026", readTime: "9 دقائق",
    excerpt: "تحليل حقيقي لتجربة الدراسة في الخارج مقارنةً بلبنان من حيث التكلفة والعائد.",
    sections: [
      { h2: "متى تستحق الدراسة في الخارج؟", p: "تستحق إذا كان هدفك الإقامة والعمل في ذلك البلد، أو إذا كان التخصص غير متوفر بجودة عالية في لبنان." },
      { h2: "أفضل وجهات للطلاب اللبنانيين", ul: ["كندا — سهولة الهجرة وجودة تعليم عالية", "ألمانيا — تعليم مجاني للطلاب الأجانب في الجامعات الحكومية", "فرنسا — سهولة الوصول للناطقين بالفرنسية", "الإمارات وقطر — قرب جغرافي ورواتب مرتفعة"] },
      { h2: "كيف تمول دراستك في الخارج؟", ul: ["المنح الحكومية الثنائية", "منح الجامعات الدولية", "برامج Fulbright وChevening وERASMUS", "العمل بدوام جزئي خلال الدراسة"] },
      { tip: "💡 ابدأ التحضير للمنح قبل سنة على الأقل من موعد التقديم." },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(ARTICLES).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }) {
  const a = ARTICLES[params.slug];
  if (!a) return { title: "مقال غير موجود — مسارك" };
  return { title: `${a.title} — مسارك`, description: a.excerpt };
}

export default function BlogArticlePage({ params }: { params: { slug: string } }) {
  const article = ARTICLES[params.slug];
  if (!article) notFound();

  const otherArticles = Object.entries(ARTICLES)
    .filter(([slug]) => slug !== params.slug)
    .slice(0, 3);

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
            <Link href="/majors" className="text-text-sub hover:text-primary">التخصصات</Link>
            <Link href="/universities" className="text-text-sub hover:text-primary">الجامعات</Link>
            <Link href="/scholarships" className="text-text-sub hover:text-primary">المنح</Link>
            <Link href="/blog" className="text-primary border-b-2 border-primary pb-0.5">مقالات</Link>
            <Link href="/tools" className="text-text-sub hover:text-primary">أدوات مهنية</Link>
          </nav>
          <Link href="/blog" className="text-text-sub text-sm hover:text-primary">← العودة للمدونة</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 text-xs text-text-sub mb-6">
          <Link href="/" className="hover:text-primary">الرئيسية</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-primary">مقالات</Link>
          <span>/</span>
          <span className="text-primary truncate max-w-xs">{article.title}</span>
        </div>

        <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl h-48 flex items-center justify-center text-8xl mb-6">
          {article.emoji}
        </div>

        <span className={`badge text-xs mb-3 inline-block ${CAT_COLORS[article.cat] || "bg-gray-100 text-gray-600"}`}>
          {article.cat}
        </span>
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary leading-tight mb-4">{article.title}</h1>
        <p className="text-text-sub text-base leading-relaxed mb-4">{article.excerpt}</p>

        <div className="flex items-center gap-4 text-sm text-text-sub border-t border-b border-gray-100 py-3 mb-8">
          <span>📅 {article.date}</span>
          <span>⏱️ {article.readTime}</span>
          <span>✍️ فريق مسارك</span>
        </div>

        <div className="space-y-6">
          {article.sections.map((section, i) => (
            <div key={i}>
              {section.h2 && <h2 className="text-xl font-extrabold text-primary mt-8 mb-3">{section.h2}</h2>}
              {section.p && <p className="text-text leading-relaxed text-base">{section.p}</p>}
              {section.ul && (
                <ul className="space-y-2 mt-2">
                  {section.ul.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-base text-text leading-relaxed">
                      <span className="text-primary mt-1 flex-shrink-0">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.tip && (
                <div className="bg-accent/10 border border-accent/20 rounded-xl p-4 mt-4">
                  <p className="text-text font-medium text-sm">{section.tip}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-gradient-to-r from-primary to-[#1e4080] text-white rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="font-extrabold text-xl mb-2">اكتشف مسارك المهني</h3>
          <p className="text-white/80 mb-5 text-sm">اختبر شخصيتك المهنية واحصل على توصيات مخصصة لك</p>
          <Link href="/career-dna" className="bg-white text-primary font-bold px-8 py-3 rounded-xl hover:bg-gray-100 transition-colors inline-block">
            ابدأ اختبار Career DNA ←
          </Link>
        </div>

        {otherArticles.length > 0 && (
          <div className="mt-12">
            <h3 className="font-extrabold text-primary text-xl mb-5">📌 مقالات قد تهمك</h3>
            <div className="grid md:grid-cols-3 gap-4">
              {otherArticles.map(([slug, a]) => (
                <Link key={slug} href={`/blog/${slug}`}
                  className="card block hover:shadow-lg transition-all hover:-translate-y-0.5 group">
                  <div className="text-3xl mb-3">{a.emoji}</div>
                  <span className={`badge text-xs mb-2 inline-block ${CAT_COLORS[a.cat] || "bg-gray-100 text-gray-600"}`}>{a.cat}</span>
                  <h4 className="font-bold text-primary text-sm leading-snug group-hover:text-accent transition-colors line-clamp-2">{a.title}</h4>
                  <p className="text-xs text-text-sub mt-1">⏱️ {a.readTime}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <Link href="/blog" className="btn-outline px-8 py-3 rounded-xl font-semibold text-sm inline-block">
            ← العودة لجميع المقالات
          </Link>
        </div>
      </main>
    </div>
  );
       }
