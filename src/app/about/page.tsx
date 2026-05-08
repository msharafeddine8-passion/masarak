import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "من نحن — مسارك",
  description: "مسارك منصة لبنانية رائدة تساعد الطلاب والمؤسسات التعليمية على اكتشاف الفرص الأكاديمية والمهنية.",
};

const TEAM = [
  { name: "محمد شرف الدين", role: "المؤسس والمدير التنفيذي", emoji: "👨‍💻", bio: "رائد أعمال لبناني متخصص في التكنولوجيا التعليمية وتطوير المنتجات الرقمية. يؤمن بأن كل طالب لبناني يستحق توجيهاً مهنياً حقيقياً." },
  { name: "فريق مسارك", role: "فريق التطوير والتصميم والمحتوى", emoji: "🚀", bio: "فريق متعدد التخصصات يجمع بين الهندسة والتصميم وعلم النفس التربوي، بهدف واحد: مساعدة الشباب اللبناني على بناء مستقبلهم." },
];

const VALUES = [
  { emoji: "🎯", title: "التوجيه الشخصي", desc: "كل طالب فريد — مسارك يخصص التوصيات بناءً على شخصيتك وأهدافك ومعدلك واهتماماتك الحقيقية." },
  { emoji: "🇱🇧", title: "لبناني بالكامل", desc: "نفهم السياق اللبناني: الجامعات، المناهج، سوق العمل، والتحديات الاقتصادية الخاصة بلبنان." },
  { emoji: "🌍", title: "متاح للجميع", desc: "نؤمن أن التوجيه المهني حق لكل طالب لبناني، بغض النظر عن خلفيته أو منطقته الجغرافية." },
  { emoji: "🔒", title: "خصوصية وأمان", desc: "بياناتك ملكك. لا نشاركها مع أحد ولا نستخدمها لأغراض إعلانية." },
  { emoji: "🤝", title: "شراكات حقيقية", desc: "نتعاون مع الجامعات والمؤسسات التعليمية لتقديم فرص منح وتدريب حقيقية للطلاب." },
  { emoji: "📊", title: "قرارات مبنية على البيانات", desc: "كل توصية مبنية على بيانات حقيقية وأبحاث سوق العمل اللبناني والعالمي." },
];

const STATS = [
  { num: "٥٠٠٠+", label: "طالب مسجّل" },
  { num: "٢٠+", label: "جامعة ومعهد" },
  { num: "٥٠+", label: "منحة دراسية" },
  { num: "١٢+", label: "أداة مهنية" },
];

const FAQ = [
  { q: "من يمكنه استخدام مسارك؟", a: "أي طالب لبناني في المرحلة الثانوية أو الجامعية، أو خريج يبحث عن توجيه مهني وفرص في سوق العمل." },
  { q: "كيف يعمل اختبار Career DNA؟", a: "يعتمد على نظرية RIASEC المعتمدة عالمياً، مع تعديلات خاصة بالسياق اللبناني وسوق العمل في المنطقة العربية." },
  { q: "هل المعلومات الواردة عن الجامعات دقيقة؟", a: "نسعى لتحديث البيانات باستمرار، لكن ننصح دائماً بمراجعة المواقع الرسمية للجامعات للحصول على أحدث المعلومات." },
  { q: "كيف يمكنني التواصل مع الفريق؟", a: "يمكنك التواصل معنا عبر البريد الإلكتروني: info@masaraklb.com أو عبر صفحات التواصل الاجتماعي." },
  { q: "هل يمكن للمؤسسات والمدارس الانضمام؟", a: "نعم، مسارك مفتوح للمؤسسات التعليمية والشركات التي تريد التواصل مع الطلاب وعرض فرصها على منصتنا." },
];

const FEATURES = [
  { emoji: "🧠", title: "اختبار Career DNA", desc: "اكتشف شخصيتك المهنية وتوجهاتك الحقيقية عبر اختبار علمي معتمد." },
  { emoji: "🏫", title: "دليل الجامعات", desc: "مقارنة شاملة لجميع الجامعات اللبنانية: الأقساط، التخصصات، التصنيفات." },
  { emoji: "💰", title: "متتبع المنح", desc: "أكثر من 50 منحة دراسية محلية وإقليمية مع تنبيهات المواعيد النهائية." },
  { emoji: "🛠️", title: "أدوات مهنية", desc: "بناء CV احترافي، رسائل تقديم، تحليل مهارات، وتحضير للمقابلات." },
  { emoji: "📚", title: "دليل التدريب", desc: "فرص تدريب وتطوع حقيقية من شركات ومؤسسات لبنانية ودولية." },
  { emoji: "🏆", title: "التحدي اليومي", desc: "أسئلة يومية تشحن معرفتك وتحفّزك على التقدم نحو هدفك." },
];

export default function AboutPage() {
  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-blue-600 font-extrabold text-lg">مسارك</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-gray-600">
            <Link href="/universities" className="hover:text-blue-600">الجامعات</Link>
            <Link href="/scholarships" className="hover:text-blue-600">المنح</Link>
            <Link href="/blog" className="hover:text-blue-600">المدونة</Link>
            <Link href="/auth/login" className="bg-blue-600 text-white px-4 py-1.5 rounded-full hover:bg-blue-700 font-semibold">دخول</Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-6xl mb-4">🇱🇧</div>
          <h1 className="text-4xl font-extrabold mb-4">نبني مستقبل الشباب اللبناني</h1>
          <p className="text-xl opacity-90 mb-6 leading-relaxed">
            مسارك منصة لبنانية رائدة تساعد الطلاب على اكتشاف مساراتهم الأكاديمية والمهنية
            بناءً على شخصياتهم وطموحاتهم وإمكاناتهم الحقيقية.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/onboarding" className="bg-white text-blue-700 font-bold px-6 py-3 rounded-full hover:bg-blue-50 transition-colors">
              ابدأ مسارك الآن ←
            </Link>
            <a href="mailto:info@masaraklb.com" className="border-2 border-white text-white font-bold px-6 py-3 rounded-full hover:bg-white/10 transition-colors">
              تواصل معنا
            </a>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b py-10">
        <div className="max-w-4xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <div className="text-3xl font-extrabold text-blue-600">{s.num}</div>
              <div className="text-sm text-gray-500 font-semibold mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 md:p-12">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-4">🎯 مهمتنا</h2>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            يعاني كثير من الطلاب اللبنانيين من غياب التوجيه الأكاديمي والمهني. يختارون تخصصاتهم
            بناءً على ضغط الأهل أو توجهات المجتمع، لا بناءً على فهم حقيقي لقدراتهم وطموحاتهم.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed mb-4">
            مسارك يسد هذه الفجوة بأدوات علمية وعملية: اختبارات شخصية، تحليل مهارات، مقارنات
            جامعات، ومتابعة منح دراسية — كل ذلك بعربية لبنانية واضحة ومحتوى مخصص لبيئتنا.
          </p>
          <p className="text-gray-700 text-lg leading-relaxed font-semibold">
            هدفنا بسيط: أن يتخذ كل طالب لبناني قراراته المستقبلية بثقة ووعي.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">ماذا تجد في مسارك؟</h2>
          <p className="text-gray-500 text-center mb-10">كل ما يحتاجه الطالب اللبناني في مكان واحد</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(f => (
              <div key={f.title} className="bg-gray-50 rounded-2xl p-5 hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100">
                <div className="text-3xl mb-3">{f.emoji}</div>
                <h3 className="font-extrabold text-gray-800 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">قيمنا</h2>
          <p className="text-gray-500 text-center mb-10">المبادئ التي تحكم كل قرار نتخذه</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map(v => (
              <div key={v.title} className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{v.emoji}</div>
                <h3 className="font-extrabold text-gray-800 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-white py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">الفريق</h2>
          <p className="text-gray-500 text-center mb-10">الأشخاص الذين يبنون مسارك</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {TEAM.map(m => (
              <div key={m.name} className="bg-gray-50 rounded-2xl border shadow-sm p-6 flex gap-4 items-start hover:bg-blue-50 transition-colors">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                  {m.emoji}
                </div>
                <div>
                  <h3 className="font-extrabold text-gray-900">{m.name}</h3>
                  <p className="text-sm text-blue-600 font-semibold mb-2">{m.role}</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{m.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-2 text-center">أسئلة شائعة</h2>
          <p className="text-gray-500 text-center mb-10">إجابات على أبرز تساؤلاتكم</p>
          <div className="space-y-4">
            {FAQ.map((f, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <h3 className="font-extrabold text-gray-800 mb-2">❓ {f.q}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-4">ابدأ مسارك اليوم 🚀</h2>
          <p className="text-white/90 mb-8">
            انضم لآلاف الطلاب والمؤسسات اللبنانية الذين يبنون مستقبلهم مع مسارك.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/onboarding"
              className="bg-white text-blue-700 font-extrabold px-8 py-4 rounded-2xl text-lg hover:bg-blue-50 transition-colors inline-block">
              أنشئ حسابك الآن ←
            </Link>
            <a href="mailto:info@masaraklb.com"
              className="border-2 border-white text-white font-extrabold px-8 py-4 rounded-2xl text-lg hover:bg-white/10 transition-colors inline-block">
              تواصل مع الفريق
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8 px-4">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold text-sm">م</span>
            </div>
            <span className="text-white font-extrabold">مسارك</span>
            <span className="text-xs">© 2026</span>
          </div>
          <div className="flex gap-4 text-sm">
            <Link href="/about" className="hover:text-white">من نحن</Link>
            <Link href="/blog" className="hover:text-white">المدونة</Link>
            <Link href="/universities" className="hover:text-white">الجامعات</Link>
            <Link href="/scholarships" className="hover:text-white">المنح</Link>
            <a href="mailto:info@masaraklb.com" className="hover:text-white">تواصل</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
