// Masarak Global — Study Abroad hub: a comprehensive, evergreen guide for Arab
// students (why, step-by-step process, funding, language tests, documents, FAQ)
// plus entry points to scholarships, the universities directory, and destinations.
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "دليل الدراسة في الخارج للطلاب العرب — خطوات، منح، تأشيرة | مسارك",
  description:
    "دليل شامل للدراسة في الخارج: خطوات التقديم خطوة بخطوة، أنواع المنح والتمويل، اختبارات اللغة (آيلتس/توفل)، المستندات المطلوبة، التأشيرة الدراسية، وأبرز وجهات الدراسة — كل المعلومات بالعربية.",
  path: "/study-abroad",
  keywords: ["الدراسة في الخارج", "كيف ادرس بالخارج", "خطوات الدراسة بالخارج", "منح دراسية", "التأشيرة الدراسية", "آيلتس توفل", "الدراسة في ألمانيا", "الدراسة في تركيا"],
});

type Country = { slug: string; name_ar: string; flag_emoji: string | null; region: string | null };

async function getDestinations(): Promise<Country[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);
  const { data } = await supabase
    .from("countries")
    .select("slug, name_ar, flag_emoji, region")
    .eq("is_destination", true)
    .eq("is_active", true)
    .order("name_ar");
  return (data || []) as Country[];
}

const STEPS: { t: string; d: string }[] = [
  { t: "حدّد الدولة والتخصّص", d: "اختر بناءً على تخصّصك المطلوب، ميزانيتك، لغة الدراسة، وفرص العمل بعد التخرّج. قارن بين عدّة دول قبل ما تقرّر." },
  { t: "اختر قائمة جامعات (٥–١٠)", d: "رتّب الجامعات حسب التصنيف، الرسوم، شروط القبول، وتوفّر المنح. خلّي خياراتك متنوّعة بين «طموحة» و«آمنة»." },
  { t: "تحقّق من شروط القبول", d: "كل جامعة تطلب: حدّ أدنى للمعدّل، شهادة لغة، وأحياناً اختبارات إضافية أو مقابلة أو ملف أعمال (للتخصّصات الفنية)." },
  { t: "جهّز اختبار اللغة", d: "الإنجليزية: آيلتس (IELTS) أو توفل (TOEFL). الألمانية: TestDaF أو DSH. الفرنسية: TCF أو DELF. ابدأ التحضير مبكراً — النتيجة صالحة سنتين عادةً." },
  { t: "جهّز المستندات وترجمتها", d: "الشهادات وكشوف العلامات تحتاج ترجمة معتمدة وتصديق. جهّز خطاب الدوافع وخطابات التوصية والسيرة الذاتية بعناية — هي يلي بتميّزك." },
  { t: "قدّم الطلبات", d: "إمّا مباشرةً عبر موقع الجامعة، أو عبر منصّات موحّدة: UCAS (بريطانيا)، Uni-Assist (ألمانيا)، Campus France (فرنسا)، أو منصّة المنحة نفسها." },
  { t: "بعد القبول: التأشيرة الدراسية", d: "بعد القبول النهائي، قدّم على التأشيرة الدراسية. غالباً تحتاج إثبات قبول، إثبات قدرة مالية، وتأمين صحّي. ابدأ مبكراً لأنها تأخذ وقت." },
  { t: "السكن والوصول", d: "رتّب السكن (جامعي أو خاص)، التأمين الصحّي، وتذكرة السفر. تواصل مع مكتب الطلاب الدوليين بالجامعة — بيساعدوك بالاستقبال والتوجيه." },
];

const FUNDING: { t: string; d: string }[] = [
  { t: "منحة مموّلة بالكامل", d: "تغطّي الرسوم الدراسية + بدل معيشة شهري، وأحياناً تذاكر السفر والتأمين. مثل DAAD، تشيفنينغ، المنحة التركية، إيراسموس+." },
  { t: "منحة جزئية", d: "إعفاء من جزء من الرسوم (مثلاً ٢٥٪–٥٠٪) أو منحة تفوّق. كثير جامعات تقدّمها تلقائياً للطلاب المتميّزين." },
  { t: "مساعدة بحثية / تدريس", d: "للدراسات العليا (ماجستير/دكتوراه): راتب مقابل العمل بمشروع بحثي أو مساعدة بالتدريس، وغالباً مع إعفاء من الرسوم." },
  { t: "تمويل ذاتي + عمل جزئي", d: "بعض الدول رسومها رمزية (مثل ألمانيا)، ومعظمها يسمح للطالب بالعمل بدوام جزئي محدود الساعات لتغطية جزء من المعيشة." },
];

const TESTS: { lang: string; items: string; note: string }[] = [
  { lang: "🇬🇧 الإنجليزية", items: "IELTS · TOEFL · Duolingo · PTE", note: "الأكثر طلباً عالمياً — حتى بدول غير ناطقة بالإنجليزية للبرامج الدولية." },
  { lang: "🇩🇪 الألمانية", items: "TestDaF · DSH · Goethe-Zertifikat", note: "للبرامج المُدرّسة بالألمانية؛ كثير برامج ماجستير بألمانيا بالإنجليزية." },
  { lang: "🇫🇷 الفرنسية", items: "TCF · DELF / DALF", note: "للبرامج بالفرنسية؛ بعض الجامعات تقبل آيلتس للبرامج الإنجليزية." },
  { lang: "🇹🇷 التركية", items: "TÖMER (+ اختبار YÖS للقبول)", note: "كثير برامج تركية بالإنجليزية أيضاً، وبعض المنح تشمل سنة لغة تحضيرية." },
];

const DOCS: string[] = [
  "جواز سفر ساري المفعول",
  "الشهادة الثانوية/الجامعية + كشف العلامات (مترجمة ومصدّقة)",
  "شهادة اختبار اللغة (آيلتس/توفل…)",
  "خطاب الدوافع (Statement of Purpose)",
  "خطابات توصية (من ١ إلى ٣)",
  "السيرة الذاتية (CV)",
  "إثبات القدرة المالية (للتأشيرة)",
  "صور شخصية بمواصفات رسمية",
];

const FAQ: { q: string; a: string }[] = [
  { q: "كم تكلفة الدراسة في الخارج؟", a: "تختلف كثيراً حسب الدولة: في دول بمنح كاملة أو رسوم رمزية (مثل ألمانيا والنرويج)، ودول مرتفعة التكلفة (مثل أمريكا وبريطانيا). أضف لها تكاليف المعيشة والسكن والتأمين. استخدم حاسبة التكاليف وقسم المنح لتقدير ميزانيتك." },
  { q: "هل أقدر اشتغل وأنا طالب؟", a: "معظم الدول تسمح للطلاب الدوليين بالعمل بدوام جزئي بعدد ساعات محدود أسبوعياً (يختلف حسب الدولة)، ما يساعد على تغطية جزء من المصاريف. تأكّد دائماً من قوانين التأشيرة في الدولة." },
  { q: "متى أبدأ التحضير؟", a: "ابدأ قبل ٨ إلى ١٢ شهراً من بداية الفصل الدراسي. اختبارات اللغة والمستندات والتأشيرة كلها تحتاج وقتاً، والمنح لها مواعيد إغلاق مبكرة." },
  { q: "هل يجب أن أتقن لغة الدولة؟", a: "ليس بالضرورة — هناك آلاف البرامج المُدرّسة بالإنجليزية في دول غير ناطقة بها (ألمانيا، تركيا، هولندا، اليابان…). لكن تعلّم لغة البلد يسهّل الحياة اليومية وفرص العمل." },
  { q: "كيف أحصل على منحة دراسية؟", a: "تصفّح قسم المنح في مسارك، قدّم مبكراً، حقّق شروط المعدّل واللغة، وجهّز خطاب دوافع قوياً وخطابات توصية مميّزة. التقديم على عدّة منح يرفع فرصك." },
  { q: "ما الفرق بين التقديم المباشر والمنصّات الموحّدة؟", a: "بعض الدول لها منصّة مركزية واحدة (UCAS لبريطانيا، Uni-Assist لألمانيا، Campus France لفرنسا) تقدّم من خلالها لعدّة جامعات، وأخرى تتطلّب التقديم مباشرةً عبر موقع كل جامعة." },
];

function Section({ id, icon, title, children }: { id?: string; icon: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mb-12">
      <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 mb-5 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h2>
      {children}
    </section>
  );
}

export default async function StudyAbroadHub() {
  const destinations = await getDestinations();

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7faf9]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, "\\u003c") }} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0F4A52] to-[#1A6F7C] text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <span className="inline-block text-5xl mb-4">🌍</span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">الدراسة في الخارج</h1>
          <p className="text-white/90 max-w-2xl mx-auto leading-relaxed text-lg">
            دليلك الكامل بالعربية: من اختيار الدولة والجامعة، إلى المنح والتأشيرة والوصول — خطوة بخطوة، من مصادر موثّقة.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <Link href="/study-abroad/scholarships" className="inline-flex items-center gap-2 bg-white text-[#0F4A52] font-extrabold px-6 py-3 rounded-2xl hover:bg-white/90 transition-colors">
              🎓 استكشف المنح المموّلة
            </Link>
            <Link href="/universities" className="inline-flex items-center gap-2 bg-white/15 text-white font-extrabold px-6 py-3 rounded-2xl ring-1 ring-white/40 hover:bg-white/25 transition-colors">
              🏛️ تصفّح الجامعات
            </Link>
          </div>
        </div>
      </section>

      {/* Quick nav */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex gap-4 overflow-x-auto text-sm font-semibold text-[#0F4A52]">
          {[["why", "ليش؟"], ["steps", "الخطوات"], ["funding", "التمويل"], ["tests", "اختبارات اللغة"], ["docs", "المستندات"], ["destinations", "الوجهات"], ["faq", "أسئلة شائعة"]].map(([id, label]) => (
            <a key={id} href={`#${id}`} className="whitespace-nowrap hover:underline">{label}</a>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Featured cards */}
        <div className="grid sm:grid-cols-2 gap-4 mb-12">
          <Link href="/study-abroad/scholarships" className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-2">💰</div>
            <h2 className="text-lg font-extrabold text-gray-900">المنح الدراسية العالمية</h2>
            <p className="text-sm text-gray-600 mt-1">DAAD · تشيفنينغ · المنحة التركية · إيراسموس · فولبرايت — مموّلة بالكامل وموثّقة.</p>
          </Link>
          <Link href="/universities" className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="text-4xl mb-2">🏛️</div>
            <h2 className="text-lg font-extrabold text-gray-900">دليل الجامعات حسب الدولة</h2>
            <p className="text-sm text-gray-600 mt-1">اختر الدولة وتصفّح جامعاتها بتفاصيلها وقارن بينها — لبنان، الأردن، مصر، تركيا، أوروبا وغيرها.</p>
          </Link>
        </div>

        {/* Why */}
        <Section id="why" icon="✨" title="ليش تدرس في الخارج؟">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ["🎓", "شهادة معترف بها عالمياً", "تفتح أبواب العمل والدراسات العليا في كل مكان."],
              ["🌐", "خبرة دولية", "تطوّر لغتك واستقلاليتك وشبكة علاقاتك العالمية."],
              ["🔬", "بحث وفرص أوسع", "وصول لمختبرات وأساتذة وبرامج غير متوفّرة محلياً."],
              ["💼", "فرص عمل أفضل", "خرّيجو الجامعات العالمية مطلوبون في سوق العمل."],
            ].map(([i, t, d]) => (
              <div key={t} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="text-3xl mb-2">{i}</div>
                <h3 className="font-extrabold text-gray-900 text-sm mb-1">{t}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{d}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* Steps */}
        <Section id="steps" icon="🗺️" title="خطوات الدراسة في الخارج — خطوة بخطوة">
          <ol className="space-y-3">
            {STEPS.map((s, i) => (
              <li key={s.t} className="bg-white rounded-2xl border border-gray-100 p-5 flex gap-4">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-[#0F4A52] text-white font-extrabold flex items-center justify-center">{i + 1}</div>
                <div>
                  <h3 className="font-extrabold text-gray-900">{s.t}</h3>
                  <p className="text-sm text-gray-600 mt-1 leading-relaxed">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Section>

        {/* Funding */}
        <Section id="funding" icon="💵" title="أنواع المنح والتمويل">
          <div className="grid sm:grid-cols-2 gap-3">
            {FUNDING.map((f) => (
              <div key={f.t} className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="font-extrabold text-[#0F4A52] mb-1">{f.t}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.d}</p>
              </div>
            ))}
          </div>
          <Link href="/study-abroad/scholarships" className="inline-block mt-4 text-sm font-bold text-[#0F4A52] hover:underline">← استكشف المنح المتاحة الآن</Link>
        </Section>

        {/* Language tests */}
        <Section id="tests" icon="🗣️" title="اختبارات اللغة المطلوبة">
          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            {TESTS.map((t, i) => (
              <div key={t.lang} className={`p-4 flex flex-col sm:flex-row sm:items-center gap-2 ${i ? "border-t border-gray-100" : ""}`}>
                <div className="font-extrabold text-gray-900 sm:w-40">{t.lang}</div>
                <div className="font-bold text-[#0F4A52] text-sm sm:w-56" dir="ltr">{t.items}</div>
                <div className="text-xs text-gray-500 flex-1">{t.note}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">💡 الحدّ الأدنى للدرجات يختلف بين الجامعات والتخصّصات — تأكّد دائماً من شروط كل جامعة. شهادة اللغة صالحة عادةً لسنتين.</p>
        </Section>

        {/* Documents */}
        <Section id="docs" icon="📑" title="المستندات المطلوبة عادةً">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
            {DOCS.map((d) => (
              <div key={d} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-[#0F4A52] font-bold mt-0.5">✓</span> {d}
              </div>
            ))}
          </div>
        </Section>

        {/* Destinations */}
        {destinations.length > 0 && (
          <Section id="destinations" icon="🧭" title="وجهات الدراسة الشعبية">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {destinations.map((c) => (
                <Link key={c.slug} href={`/study-abroad/${c.slug}`} className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:border-[#0F4A52]/40 hover:shadow-sm transition-all">
                  <div className="text-3xl mb-1">{c.flag_emoji}</div>
                  <div className="text-sm font-bold text-gray-800">{c.name_ar}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{c.region}</div>
                </Link>
              ))}
            </div>
          </Section>
        )}

        {/* FAQ */}
        <Section id="faq" icon="❓" title="أسئلة شائعة">
          <div className="space-y-3">
            {FAQ.map((f) => (
              <details key={f.q} className="bg-white rounded-2xl border border-gray-100 p-5 group">
                <summary className="font-extrabold text-gray-900 cursor-pointer list-none flex items-center justify-between">
                  {f.q}<span className="text-[#0F4A52] group-open:rotate-45 transition-transform">+</span>
                </summary>
                <p className="text-sm text-gray-600 mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
        </Section>

        {/* CTA */}
        <div className="bg-gradient-to-br from-[#0F4A52] to-[#1A6F7C] rounded-3xl text-white p-8 text-center">
          <h2 className="text-2xl font-extrabold mb-2">جاهز تبدأ رحلتك؟</h2>
          <p className="text-white/90 mb-5">ابدأ باستكشاف المنح المموّلة بالكامل أو تصفّح الجامعات حسب الدولة.</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/study-abroad/scholarships" className="bg-white text-[#0F4A52] font-extrabold px-6 py-3 rounded-2xl hover:bg-white/90 transition-colors">🎓 المنح المموّلة</Link>
            <Link href="/universities" className="bg-white/15 ring-1 ring-white/40 text-white font-extrabold px-6 py-3 rounded-2xl hover:bg-white/25 transition-colors">🏛️ الجامعات</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
