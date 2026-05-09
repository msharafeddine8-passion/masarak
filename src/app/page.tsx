// المسار في المشروع: src/app/page.tsx
// الصفحة الرئيسية المنظّفة — بدون أرقام كاذبة، بدون testimonials مختلقة
// لون كحلي #1b3a6b + جمعية تكافل
// =====================================================

import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      {/* ============================== */}
      {/* HERO — بدون أرقام كاذبة */}
      {/* ============================== */}
      <section className="relative bg-gradient-to-br from-[#1b3a6b] via-[#2d5391] to-[#1b3a6b] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#d4a574] rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="text-center">
            {/* شارة جمعية تكافل */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6 text-sm font-semibold border border-white/20">
              🤝 مشروع من جمعية تكافل اللبنانية
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
              مسارك يبدأ من هنا
            </h1>

            <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto opacity-95 leading-relaxed">
              منصّة لبنانية مجانية تساعدك تكتشف تخصصك، تختار جامعتك،
              تلاقي منح دراسية، وتبني سيرتك الذاتية — كل شي بمكان واحد.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <Link
                href="/auth/register"
                className="px-8 py-4 bg-white text-[#1b3a6b] rounded-xl font-bold text-lg hover:bg-slate-50 transition shadow-lg"
              >
                ابدأ مجاناً
              </Link>
              <Link
                href="/tools/career-ai"
                className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition"
              >
                جرّب المرشد المهني
              </Link>
            </div>

            {/* قيم بدلاً من أرقام كاذبة */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto pt-8 border-t border-white/20">
              {[
                { icon: '🎓', label: 'مجاني تماماً' },
                { icon: '🇱🇧', label: 'مخصص للبنان' },
                { icon: '🔒', label: 'خصوصية محفوظة' },
                { icon: '⚡', label: 'متاح 24/7' },
              ].map((item) => (
                <div key={item.label} className="text-center">
                  <div className="text-3xl mb-1">{item.icon}</div>
                  <div className="text-sm opacity-90 font-semibold">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* المميّزات — كل ما يقدّمه مسارك */}
      {/* ============================== */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#1b3a6b]">
              كل اللي تحتاجه برحلتك التعليمية
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              من اختيار التخصص إلى بناء السيرة الذاتية — مسارك معك بكل خطوة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { href: '/universities', icon: '🏛️', title: 'الجامعات', desc: 'قارن بين الجامعات اللبنانية والدولية واكتشف المناسبة لك' },
              { href: '/majors', icon: '📚', title: 'التخصصات', desc: 'استكشف التخصصات الأكاديمية وآفاقها المهنية' },
              { href: '/scholarships', icon: '🏆', title: 'المنح الدراسية', desc: 'منح متاحة للطلاب اللبنانيين — محلية ودولية' },
              { href: '/careers', icon: '💼', title: 'المسارات المهنية', desc: 'اعرف وين بيوصلك كل تخصص بسوق العمل' },
              { href: '/schools', icon: '🏫', title: 'المدارس الثانوية', desc: 'دليل شامل للمدارس في كل المحافظات' },
              { href: '/vocational', icon: '🔧', title: 'التعليم المهني', desc: 'بدائل احترافية للتعليم الجامعي التقليدي' },
              { href: '/tools/career-ai', icon: '🤖', title: 'المرشد المهني الذكي', desc: 'اسأل أي سؤال عن مستقبلك التعليمي والمهني' },
              { href: '/tools/cv-builder', icon: '📄', title: 'باني السيرة الذاتية', desc: 'سيرة ذاتية احترافية بدقائق' },
              { href: '/tools/cost-calculator', icon: '💰', title: 'حاسبة كلفة الدراسة', desc: 'احسب كلفة الجامعة بدقة' },
              { href: '/tools/skill-strengths', icon: '🧠', title: 'اختبار نقاط القوة', desc: '10 أسئلة تكشف ميولك وقدراتك' },
              { href: '/tools/bac-equivalence', icon: '📊', title: 'معادلة البكالوريا', desc: 'حوّل علاماتك إلى GPA و SAT' },
              { href: '/blog', icon: '✍️', title: 'المدوّنة', desc: 'مقالات وإرشادات تعليمية' },
            ].map((feature) => (
              <Link
                key={feature.href}
                href={feature.href}
                className="bg-white p-6 rounded-2xl border border-slate-100 hover:border-[#1b3a6b]/30 hover:shadow-lg transition group"
              >
                <div className="text-4xl mb-3">{feature.icon}</div>
                <h3 className="font-bold text-xl mb-2 text-[#1b3a6b] group-hover:text-[#2d5391]">
                  {feature.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
                <div className="mt-4 text-[#1b3a6b] text-sm font-semibold">
                  استكشف ←
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* لمن مسارك؟ */}
      {/* ============================== */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#1b3a6b]">
              مسارك لكل أفراد المنظومة التعليمية
            </h2>
            <p className="text-lg text-slate-600">
              سواء كنت طالباً، ولي أمر، مدرسة، أو جامعة — في صفحة مخصّصة إلك
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { href: '/for-students', icon: '🎓', title: 'للطلاب', desc: 'اكتشف، خطّط، انجح' },
              { href: '/for-parents', icon: '👨‍👩‍👧', title: 'للأهل', desc: 'وجّه ابنك بثقة' },
              { href: '/for-schools', icon: '🏫', title: 'للمدارس', desc: 'أدوات إرشاد طلابك' },
              { href: '/for-universities', icon: '🏛️', title: 'للجامعات', desc: 'تواصل مع الطلاب' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white p-8 rounded-2xl hover:shadow-2xl transition group text-center"
              >
                <div className="text-5xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-2xl mb-2">{item.title}</h3>
                <p className="opacity-90">{item.desc}</p>
                <div className="mt-4 text-sm font-semibold opacity-95">
                  ادخل ←
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* ليش مسارك (بدلاً من testimonials) */}
      {/* ============================== */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-14">
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#1b3a6b]">
              ليش مسارك؟
            </h2>
            <p className="text-lg text-slate-600">
              منصّة بنيت بحبّ من جمعية تكافل لخدمة طلاب لبنان
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '🤲',
                title: 'مجاني بالكامل',
                desc: 'كل الأدوات والمعلومات مجانية — لا اشتراكات ولا رسوم. نحن جمعية غير ربحية.',
              },
              {
                icon: '🇱🇧',
                title: 'مخصّص للبنان',
                desc: 'كل المحتوى مبنيّ على الواقع اللبناني — البكالوريا، الجامعات المحلية، أسعار البلد.',
              },
              {
                icon: '🔒',
                title: 'خصوصيتك أولاً',
                desc: 'بياناتك ملك لك. لا نبيعها ولا نشاركها مع أي جهة. شفافيّة كاملة.',
              },
              {
                icon: '⚖️',
                title: 'محايد ومستقلّ',
                desc: 'لا نمثّل أي جامعة أو جهة معيّنة. نقدّم المعلومة بحياد كامل.',
              },
              {
                icon: '🔄',
                title: 'يتطوّر باستمرار',
                desc: 'نضيف مزايا جديدة بشكل دوري ونحدّث المحتوى بناءً على ملاحظاتكم.',
              },
              {
                icon: '🌐',
                title: 'متاح للجميع',
                desc: 'متاح 24/7 من أي مكان — كل الطلاب اللبنانيين على قدم المساواة.',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-6 rounded-2xl border border-slate-100 hover:shadow-md transition"
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-lg mb-2 text-[#1b3a6b]">{item.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================== */}
      {/* CTA النهائي */}
      {/* ============================== */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#1b3a6b] via-[#2d5391] to-[#1b3a6b] text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            جاهز تبلّش رحلتك؟
          </h2>
          <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
            سجّل مجاناً وادخل لكل أدوات مسارك — بدون التزام، بدون رسوم
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/auth/register"
              className="px-8 py-4 bg-white text-[#1b3a6b] rounded-xl font-bold text-lg hover:bg-slate-50 transition shadow-lg"
            >
              سجّل مجاناً الآن
            </Link>
            <Link
              href="/about"
              className="px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/20 transition"
            >
              عن جمعية تكافل
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
