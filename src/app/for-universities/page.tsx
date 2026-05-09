// src/app/for-universities/page.tsx
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "للجامعات — مسارك يجلبلك أفضل المرشّحين",
  description: "حلول B2B للجامعات اللبنانية: lead generation، تواجد بدليلنا، إعلانات منح، وتقارير سوق. اربط نفسك بالطلاب اللي يبحثون عنك.",
  path: "/for-universities",
  keywords: ["شراكات جامعات لبنان", "تسويق جامعي", "lead generation للجامعات", "B2B تعليم"],
});

const SERVICES = [
  { emoji: "🎯", title: "Lead Generation", desc: "احصل على leads مؤهّلة من طلاب ينطبق عليهم متطلبات قبولك. طلابهم يدخلون معدّلهم وتخصصهم تلقائياً." },
  { emoji: "🌟", title: "Featured Profile", desc: "صفحة تفصيلية لجامعتك بمسارك مع photos، فيديوهات، شهادات خرّيجين، ومعلومات شاملة." },
  { emoji: "📢", title: "إعلان المنح والقبول", desc: "نشر مواعيد القبول والمنح المباشرة من جامعتك مع تنبيهات للطلاب المهتمّين." },
  { emoji: "📊", title: "تقارير السوق", desc: "بيانات إنانوميك عن اهتمامات الطلاب اللبنانيين، التخصصات الأكثر طلباً، والمنافسة." },
  { emoji: "🎓", title: "Open Day Promotion", desc: "ادعو الطلاب لـ Open Days الخاصة بجامعتك — نضمن وصولك لشريحة مستهدفة." },
  { emoji: "🌍", title: "وصول للمغتربين", desc: "اوصل لـ 7 مليون مغترب لبناني عالمياً يبحثون عن جامعة لأبنائهم في لبنان." },
];

export default function ForUniversitiesPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-5xl">
        <div className="text-center mb-12">
          <div className="inline-block px-4 py-1 bg-purple-100 text-purple-800 text-sm font-bold rounded-full mb-4">
            🏛️ للجامعات
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary mb-4">
            اربط نفسك بأفضل المرشّحين اللبنانيين
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            مسارك يجمع الطلاب اللبنانيين الباحثين عن جامعة. نوصلهم إليك مباشرة، بمعلومات كاملة عن إنجازاتهم.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
            <Link href="/contact" className="bg-primary text-white px-8 py-3 rounded-xl font-bold">
              تواصل معنا للشراكة ←
            </Link>
            <Link href="/universities" className="border-2 border-primary text-primary px-8 py-3 rounded-xl font-bold">
              شوف الجامعات الحالية
            </Link>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mb-12">
          {[
            { stat: "5,000+", label: "طالب لبناني نشط شهرياً" },
            { stat: "22", label: "جامعة لبنانية مدرجة" },
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
          <h2 className="text-2xl font-extrabold text-purple-900 mb-3">💡 كيف نحسب الـ ROI</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            متوسط رسوم سنة دراسية بجامعة لبنانية = <strong>$5,000 - $16,000</strong>. لو جذبنا لك <strong>10 طلاب جدد سنوياً</strong>، الـ ROI بيتعدّى 50x.
          </p>
          <Link href="/contact" className="inline-block bg-primary text-white px-6 py-2.5 rounded-xl font-bold">
            احجز اجتماع لمناقشة شراكة ←
          </Link>
        </div>
      </div>
    </main>
  );
}
