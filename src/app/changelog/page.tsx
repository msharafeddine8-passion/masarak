// src/app/changelog/page.tsx
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "تحديثات الموقع — Changelog",
  description: "كل تحديثات وميزات مسارك الجديدة. شفّافية كاملة عن التطوير.",
  path: "/changelog",
});

const RELEASES = [
  {
    version: "v0.5.0",
    date: "9 أيار 2026",
    title: "Sprint 3 — Marketing & Growth",
    type: "major",
    items: [
      "✨ صفحات Landing مخصّصة (طلاب، أهل، مدارس، جامعات)",
      "🚀 4 صفحات Coming Soon (community، mentorship، jobs، courses)",
      "💎 صفحة Pricing شفّافة",
      "📞 صفحة Contact مع 4 قنوات تواصل",
      "❓ صفحة FAQ كاملة",
    ],
  },
  {
    version: "v0.4.0",
    date: "9 أيار 2026",
    title: "Sprint 2 — أدوات تفاعلية",
    type: "major",
    items: [
      "🧬 اختبار اكتشاف نقاط القوة",
      "💰 حاسبة تكلفة الجامعة",
      "🎓 معادلة البكالوريا اللبنانية",
      "📋 متتبّع الطلبات",
      "✉️ مولّد رسائل الدوافع",
      "🎤 تدريب المقابلات",
      "💵 حاسبة الراتب + نصائح تفاوض",
      "🛠️ صفحة Tools موحّدة",
    ],
  },
  {
    version: "v0.3.0",
    date: "9 أيار 2026",
    title: "Sprint 1 — البنية التحتية SEO",
    type: "major",
    items: [
      "🔍 SEO احترافي (sitemap، robots.txt، structured data)",
      "🖼️ Open Graph image ديناميكي",
      "📱 PWA Manifest",
      "🎨 Site Footer بكل الصفحات",
      "📄 Privacy Policy + Terms of Service",
      "🎯 Per-page metadata لـ 10 صفحات",
      "🐛 إصلاح bugs بـ login و layout و universities",
    ],
  },
  {
    version: "v0.2.0",
    date: "8 أيار 2026",
    title: "إطلاق الموقع التجريبي",
    type: "major",
    items: [
      "🏛️ دليل 22 جامعة لبنانية",
      "🏫 30 مدرسة",
      "🔧 14 مسار TVET",
      "🏆 Scholarship Finder",
      "💼 Internships Hub",
      "🤖 AI Career Advisor (تجريبي)",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
            ← العودة
          </Link>
          <h1 className="text-4xl font-extrabold text-primary">📝 Changelog</h1>
          <p className="text-gray-600 mt-3 text-lg">
            كل تحديثات مسارك بشفافية كاملة
          </p>
        </div>

        <div className="space-y-6">
          {RELEASES.map((r) => (
            <div key={r.version} className="bg-white rounded-2xl border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <span className="bg-primary text-white text-xs font-extrabold px-3 py-1 rounded-full">
                    {r.version}
                  </span>
                  <h2 className="font-extrabold text-lg">{r.title}</h2>
                </div>
                <span className="text-sm text-gray-500">{r.date}</span>
              </div>
              <ul className="space-y-2 text-sm">
                {r.items.map((item, idx) => (
                  <li key={idx} className="text-gray-700 leading-relaxed">{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-primary/5 rounded-2xl p-6 text-center">
          <h2 className="font-extrabold text-primary text-lg mb-2">عندك اقتراح للتحديث القادم؟</h2>
          <Link href="/contact" className="inline-block mt-2 bg-primary text-white px-6 py-2.5 rounded-xl font-bold">
            ابعتلنا فكرتك ←
          </Link>
        </div>
      </div>
    </main>
  );
}
