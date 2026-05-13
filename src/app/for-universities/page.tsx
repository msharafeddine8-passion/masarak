// src/app/for-universities/page.tsx
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "للجامعات — مسارك يجلبلك أفضل المرشّحين",
  description: "حلول B2B للجامعات: lead generation، تواجد بدليلنا، إعلانات منح، وتقارير سوق. اربط نفسك بالطلاب اللي يبحثون عنك.",
  path: "/for-universities",
  keywords: ["شراكات الجامعات", "تسويق جامعي", "lead generation للجامعات", "B2B تعليم"],
});

const SERVICES = [
  { emoji: "🎯", title: "Lead Generation", desc: "احصل على leads مؤهّلة من طلاب ينطبق عليهم متطلبات قبولك. طلابهم يدخلون معدّلهم وتخصصهم تلقائياً." },
  { emoji: "🌟", title: "Featured Profile", desc: "صفحة تفصيلية لجامعتك بمسارك مع photos، فيديوهات، شهادات خرّيجين، ومعلومات شاملة." },
  { emoji: "📢", title: "إعلان المنح والقبول", desc: "نشر مواعيد القبول والمنح المباشرة من جامعتك مع تنبيهات للطلاب المهتمّين." },
  { emoji: "📊", title: "تقارير السوق", desc: "بيانات إنانوميك عن اهتمامات الطلاب، التخصصات الأكثر طلباً، والمنافسة." },
  { emoji: "🎓", title: "Open Day Promotion", desc: "ادعو الطلاب لـ Open Days الخاصة بجامعتك — نضمن وصولك لشريحة مستهدفة." },
  { emoji: "🌍", title: "وصول للمغتربين", desc: "اوصل لملايين المغتربين العرب حول العالم الذين يبحثون عن جامعة لأبنائهم." },
];

export default function ForUniversitiesPage() {
  return (
    <main className="min-h-screen bg-bg py-12 px-4 relative overflow-hidden" dir="rtl">
      <div className="absolute top-20 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30 pointer-events-none" />
      <div className="absolute top-1/3 -left-20 w-80 h-80 bg-violet/40 rounded-full blur-3xl opacity-15 pointer-events-none" />

      <div className="relative container mx-auto max-w-5xl">
        {/* Partnership-only notice */}
        <div className="bg-accent-light border border-accent/40 rounded-2xl p-4 mb-6 flex items-start gap-3 max-w-2xl mx-auto">
          <span className="text-3xl flex-shrink-0">🤝</span>
          <div>
            <strong className="text-accent-dark">حسابات الجامعات بشراكة فقط</strong>
            <p className="text-ink text-sm mt-1">
              نختار شركاءنا بعناية لنوفر تجربة مميّزة للطلاب والجامعات على حدّ سواء. تواصل معنا لنناقش التفاصيل.
            </p>
          </div>
        </div>

        <div className="text-center mb-12">
          <span className="badge-primary mb-4">🏛️ للجامعات — B2B</span>
          <div className="text-7xl my-6 animate-bounce-soft">🏛️</div>
          <h1 className="h1 mb-4">
            اربط نفسك
            <br />
            <span className="text-gradient">بأفضل المرشّحين</span>
          </h1>
          <p className="lead max-w-3xl mx-auto mb-6">
            مسارك يجمع الطلاب الباحثين عن جامعة. نوصلهم إليك مباشرة، بمعلومات كاملة عن إنجازاتهم.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/contact?type=university-partnership" className="btn-primary text-lg px-8 py-4">
              🤝 تواصل معنا للشراكة ←
            </Link>
            <Link href="/universities" className="btn-outline text-lg px-8 py-4">
              شوف الجامعات الحالية
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-12">
          {[
            { stat: "نشط", label: "آلاف الطلاب على المنصة" },
            { stat: "20+", label: "جامعة مدرجة" },
            { stat: "200+", label: "منحة مُعلنة على المنصة" },
            { stat: "12", label: "مسار مهني مفصّل" },
          ].map((s, idx) => (
            <div key={idx} className="bg-white rounded-2xl border-2 border-gray-200 p-5 text-center">
              <div className="text-4xl font-extrabold text-primary">{s.stat}</div>
              <div className="text-sm text-gray-600 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-center mb-8">خدماتنا للجامعات</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {SERVICES.map((s, idx) => (
            <div key={idx} className="bg-white rounded-2xl border-2 border-gray-200 p-5">
              <div className="text-3xl mb-3">{s.emoji}</div>
              <h3 className="font-extrabold text-primary mb-2">{s.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border-2 border-purple-200 p-8">
          <h2 className="text-2xl font-extrabold text-purple-900 mb-3">💡 لماذا الشراكة معنا تستحق</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            مسارك بيوصلك مباشرة <strong>للطلاب المهتمين بتخصصاتك</strong>. بدل ما تعتمد على إعلانات عامة،
            بيوصلك طلاب مؤهّلين ومستهدفين. نتفق على تفاصيل الشراكة بحسب أهدافك.
          </p>
          <Link href="/contact?type=university-partnership" className="inline-block bg-primary text-white px-6 py-2.5 rounded-xl font-bold">
            احجز اجتماع لمناقشة شراكة ←
          </Link>
        </div>
      </div>
    </main>
  );
}
