import Link from 'next/link';

const FEATURES = [
  { href: '/universities', icon: '🏛️', t: 'الجامعات', d: 'استعرض الجامعات ورسومها وتخصّصاتها' },
  { href: '/majors', icon: '📚', t: 'التخصصات', d: 'اكتشف التخصصات وارتباطها بسوق العمل' },
  { href: '/scholarships', icon: '🎓', t: 'المنح الدراسية', d: 'منح متاحة للطلاب داخل البلد وخارجه' },
  { href: '/careers', icon: '💼', t: 'المسارات المهنية', d: 'تعرّف على المسارات المهنية المتاحة' },
  { href: '/schools', icon: '🏫', t: 'المدارس', d: 'دليل المدارس الثانوية' },
  { href: '/vocational', icon: '🛠️', t: 'التعليم المهني', d: 'برامج وشهادات التعليم المهني والتقني' },
  { href: '/onboarding', icon: '🧭', t: 'بدء الرحلة', d: 'مرشد تفاعلي يساعدك تحدّد وجهتك' },
  { href: '/tools/cost-calculator', icon: '💰', t: 'حاسبة التكلفة', d: 'احسب كلفة الجامعة سنوياً' },
  { href: '/tools/skill-strengths', icon: '🎯', t: 'اختبار المهارات', d: 'اكتشف نقاط قوّتك ومجالات تطوّرك' },
  { href: '/tools/cover-letter', icon: '✉️', t: 'خطاب التغطية', d: 'مساعد لكتابة خطاب تغطية مهني' },
  { href: '/tools/interview-prep', icon: '🎤', t: 'محاكاة المقابلة', d: 'تدرّب على مقابلات العمل والقبول' },
  { href: '/tools/career-ai', icon: '🤖', t: 'مستشار الذكاء', d: 'مستشار مهني بالذكاء الاصطناعي' },
];

const AUDIENCES = [
  { icon: '🎓', t: 'للطلاب', d: 'كل ما تحتاجه لاتخاذ قرار دراستك الجامعية بثقة', href: '/for-students' },
  { icon: '👪', t: 'للأهل', d: 'مرجع شامل لمتابعة قرارات أبنائكم الأكاديمية', href: '/for-parents' },
  { icon: '🏫', t: 'للمدارس', d: 'أدوات لإرشاد طلابكم في رحلتهم الجامعية', href: '/for-schools' },
  { icon: '🏛️', t: 'للجامعات', d: 'منصّة للوصول إلى الطلاب وعرض برامجكم', href: '/for-universities' },
];

const WHY = [
  { icon: '✨', t: 'محتوى مدروس', d: 'بيانات ومعلومات مدقّقة ومحدّثة باستمرار' },
  { icon: '🤝', t: 'مبادرة مجتمعية', d: 'مبادرة لدعم الطلاب في رحلتهم التعليمية' },
  { icon: '🔒', t: 'خصوصية محفوظة', d: 'بياناتك الشخصية مشفّرة ومحميّة' },
  { icon: '🌐', t: 'متاح أونلاين', d: 'استخدم المنصّة من أي مكان وأي جهاز' },
  { icon: '🎯', t: 'إرشاد عملي', d: 'أدوات تساعدك في كل خطوة من رحلتك' },
  { icon: '💚', t: 'بنية على القيم', d: 'نضع المتعلّم وأسرته في مركز كل قرار' },
];

function Stat({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-sm font-semibold text-white/90">{label}</div>
    </div>
  );
}

export default function Home() {
  return (
    <main className="bg-white" dir="rtl">
      {/* HERO */}
      <section className="relative bg-gradient-to-br from-[#1b3a6b] via-[#1b3a6b] to-[#0f2240] text-white pt-16 pb-20">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            مسارك يبدأ من هنا
          </h1>
          <p className="text-lg md:text-xl text-white/85 max-w-2xl mx-auto mb-10">
            منصّة تساعدك تكتشف تخصّصك، تختار جامعتك، تلاقي منح دراسية، وتبني سيرتك الذاتية – كل شي بمكان واحد.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-[#5cc4b8] text-[#1b3a6b] rounded-xl font-bold hover:bg-[#4dafa3] transition"
            >
              ابدأ الآن
            </Link>
            <Link
              href="/tools/career-ai"
              className="px-8 py-3 border-2 border-white/30 rounded-xl font-bold hover:bg-white/10 transition"
            >
              جرّب المرشد المهني
            </Link>
          </div>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center max-w-2xl mx-auto">
            <Stat icon="⚡" label="متاح 24/7" />
            <Stat icon="🔒" label="خصوصية محفوظة" />
            <Stat icon="🎯" label="إرشاد عملي" />
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1b3a6b] mb-3">
            كل شي بمكان واحد
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
            أدوات وموارد تساعدك في رحلتك التعليمية
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f) => (
              <Link
                key={f.href}
                href={f.href}
                className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-1 transition border border-gray-100"
              >
                <div className="text-4xl mb-3">{f.icon}</div>
                <h3 className="text-lg font-bold text-[#1b3a6b] mb-1">{f.t}</h3>
                <p className="text-sm text-gray-600">{f.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* AUDIENCES */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1b3a6b] mb-3">
            مَن يستفيد من مسارك؟
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
            موارد مخصّصة لكل فئة في رحلة التعليم الجامعي
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AUDIENCES.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="bg-gradient-to-br from-[#1b3a6b]/5 to-[#5cc4b8]/10 p-6 rounded-2xl border border-[#1b3a6b]/10 hover:border-[#5cc4b8]/40 hover:shadow-md transition"
              >
                <div className="text-4xl mb-3">{a.icon}</div>
                <h3 className="text-lg font-bold text-[#1b3a6b] mb-1">{a.t}</h3>
                <p className="text-sm text-gray-600">{a.d}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* WHY */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-[#1b3a6b] mb-3">
            لماذا مسارك؟
          </h2>
          <p className="text-center text-gray-600 mb-12 max-w-xl mx-auto">
            قيم وأسس بُنيت عليها المنصّة
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WHY.map((w) => (
              <div
                key={w.t}
                className="bg-white p-6 rounded-2xl border border-gray-100"
              >
                <div className="text-4xl mb-3">{w.icon}</div>
                <h3 className="text-lg font-bold text-[#1b3a6b] mb-1">{w.t}</h3>
                <p className="text-sm text-gray-600">{w.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-[#1b3a6b] text-white">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">جاهز تبدأ رحلتك؟</h2>
          <p className="text-lg text-white/85 mb-8">
            سجّل مجاناً وابدأ بالاستفادة من كل أدوات مسارك
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/auth/register"
              className="px-8 py-3 bg-[#5cc4b8] text-[#1b3a6b] rounded-xl font-bold hover:bg-[#4dafa3] transition"
            >
              ابدأ الآن
            </Link>
            <Link
              href="/about"
              className="px-8 py-3 border-2 border-white/30 rounded-xl font-bold hover:bg-white/10 transition"
            >
              تعرّف علينا أكثر
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
