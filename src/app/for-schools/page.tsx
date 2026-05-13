// src/app/for-schools/page.tsx
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "للمدارس — مسارك شريكك بتوجيه طلابك",
  description: "حلول مسارك للمدارس اللبنانية: dashboard لمتابعة الطلاب، تقارير، ومحتوى توجيه. شراكات تعزّز إرشادك المهني.",
  path: "/for-schools",
  keywords: ["شراكات المدارس", "حلول B2B تعليمية", "إرشاد مهني للمدارس"],
});

const BENEFITS = [
  { emoji: "📊", title: "Dashboard للمدرسة", desc: "تابع تقدّم طلابك، نتائج اختباراتهم، وتطبيقاتهم على المنح والجامعات في مكان واحد" },
  { emoji: "🎯", title: "إرشاد منهجي", desc: "اختبارات Career DNA و Skill Strengths لكل طالب، مع تقارير قابلة للتصدير" },
  { emoji: "🏆", title: "متابعة المنح", desc: "إشعارات تلقائية للطلاب لما تفتح منحة تناسب معدّلاتهم وتخصصاتهم المرغوبة" },
  { emoji: "💼", title: "ربط بسوق العمل", desc: "اتصال طلابك بفرص تدريب صيفي حقيقية بأفضل الشركات اللبنانية" },
  { emoji: "📚", title: "محتوى تعليمي", desc: "ورش عمل، webinars، ومحتوى مخصّص للمعلمين والطلاب" },
  { emoji: "🤝", title: "علامة تجارية مشتركة", desc: "اعرض شعار مدرستك على ملفات طلابك وأدواتهم — يبني الثقة بمدرستك" },
];

const PARTNERSHIP_TIERS = [
  { name: "المدارس الصغيرة", students: "حتى 200 طالب", popular: false },
  { name: "المدارس المتوسطة", students: "200-800 طالب", popular: true },
  { name: "المدارس الكبيرة", students: "+800 طالب", popular: false },
];

export default function ForSchoolsPage() {
  return (
    <main className="min-h-screen bg-bg py-12 px-4 relative overflow-hidden" dir="rtl">
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-info rounded-full blur-3xl opacity-15 pointer-events-none" />

      <div className="relative container mx-auto max-w-5xl">
        {/* Partnership-only notice */}
        <div className="bg-accent-light border border-accent/40 rounded-2xl p-4 mb-6 flex items-start gap-3 max-w-2xl mx-auto">
          <span className="text-3xl flex-shrink-0">🤝</span>
          <div>
            <strong className="text-accent-dark">حسابات المدارس تنفتح بشراكة فقط</strong>
            <p className="text-ink text-sm mt-1">
              نتعاون مع المدارس بشكل مدروس لنضمن جودة الخدمة. تواصل معنا للاطلاع على شو بنقدّر نوفّره لمدرستك.
            </p>
          </div>
        </div>

        <div className="text-center mb-12">
          <span className="badge-mint mb-4">🏫 للمدارس</span>
          <div className="text-7xl my-6 animate-bounce-soft">🏫</div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
            ارفع جودة الإرشاد المهني بمدرستك
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            مسارك يعطيك الأدوات والمحتوى لتقدّم إرشاداً منهجياً ومتميّزاً لكل طلابك
          </p>
          <Link href="/contact?type=school-partnership" className="btn-primary text-lg px-8 py-4">
            🤝 تواصل معنا للشراكة ←
          </Link>
        </div>

        <h2 className="text-2xl font-bold text-center mb-8">شو بتحصل عليه مدرستك</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {BENEFITS.map((b, idx) => (
            <div key={idx} className="bg-white rounded-2xl border-2 border-gray-200 p-5">
              <div className="text-3xl mb-3">{b.emoji}</div>
              <h3 className="font-extrabold text-primary mb-2">{b.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-center mb-3">شراكات تناسب كل حجم</h2>
        <p className="text-center text-gray-600 mb-8">نتفق على التفاصيل والتسعيرة حسب احتياجات مدرستك</p>
        <div className="grid md:grid-cols-3 gap-4 mb-12">
          {PARTNERSHIP_TIERS.map((p) => (
            <div key={p.name} className={`bg-white rounded-2xl border-2 p-6 ${p.popular ? "border-primary ring-4 ring-primary/10" : "border-gray-200"}`}>
              {p.popular && (
                <div className="text-xs bg-primary text-white px-3 py-1 rounded-full inline-block mb-3 font-bold">⭐ الأكثر طلباً</div>
              )}
              <h3 className="font-extrabold text-xl mb-1">{p.name}</h3>
              <p className="text-sm text-gray-500 mb-4">{p.students}</p>
              <div className="text-2xl font-extrabold text-primary mb-4">📞 نتواصل معكم</div>
              <Link href="/contact?type=school-partnership" className={`block text-center py-2.5 rounded-xl font-bold ${p.popular ? "bg-primary text-white" : "border-2 border-primary text-primary"}`}>
                احجز اجتماع
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-primary/5 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-extrabold text-primary mb-3">جرّبها بعرض تجريبي</h2>
          <p className="text-gray-700 mb-6">شفلنا كيف بتحسّن إرشاد مدرستك بدون أي التزام</p>
          <Link href="/contact?type=school-partnership" className="inline-block bg-primary text-white px-8 py-3 rounded-xl font-bold">
            احجز demo معنا ←
          </Link>
        </div>
      </div>
    </main>
  );
}
