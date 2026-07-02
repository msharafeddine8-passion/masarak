// /schools — country hub. Lists the countries that currently have schools
// (Lebanon today) and is ready to grow: adding a country is data-only.
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import { listSchoolCountries } from "@/lib/schools";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "المدارس | دليل المدارس في العالم العربي - مسارك",
  description: "دليل المدارس على منصة مسارك — ابدأ بمدارس لبنان: خاصة، رسمية، دولية، ومهنية، حسب المحافظة، لغة التعليم، والمنهج. مدارس دول عربية أخرى قريباً.",
  path: "/schools",
  keywords: ["دليل المدارس", "مدارس لبنان", "مدارس العالم العربي", "مدارس خاصة", "مدارس رسمية"],
});

// Future countries we intend to add — shown as "coming soon" so the directory
// reads as a growing regional product, not a Lebanon-only page.
const COMING_SOON = ["الأردن", "السعودية", "الإمارات", "قطر", "الكويت", "مصر", "العراق", "سوريا", "فلسطين"];

export default async function SchoolsHubPage() {
  const countries = await listSchoolCountries();

  return (
    <main className="min-h-screen bg-bg pb-20" dir="rtl">
      <section className="relative bg-gradient-hero text-white pt-14 pb-16 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-mint rounded-full blur-3xl opacity-30" />
          <div className="absolute inset-0 bg-pattern-dots opacity-10" style={{ backgroundSize: "32px 32px" }} />
        </div>
        <div className="relative max-w-6xl mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-3">دليل المدارس</h1>
          <p className="text-white/90 text-lg max-w-2xl">
            اختر الدولة لاستكشاف مدارسها حسب المحافظة، نوع المدرسة، لغة التعليم، المنهج، والمراحل التعليمية.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 -mt-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {countries.map((c) => (
            <Link key={c.code} href={`/schools/${c.slug}`}
              className="bg-white rounded-2xl border border-gray-200 hover:border-primary hover:shadow-lg transition p-6 flex items-center gap-4 group">
              <div className="text-5xl">{c.flag_emoji || "🏳️"}</div>
              <div className="flex-1">
                <div className="font-extrabold text-lg text-primary group-hover:underline">{c.name_ar}</div>
                <div className="text-sm text-gray-500">{c.count} مدرسة</div>
              </div>
              <span className="text-primary font-bold">←</span>
            </Link>
          ))}
        </div>

        {countries.length === 0 && (
          <div className="text-center py-16 text-gray-400"><div className="text-6xl mb-3">🏫</div><p>لا توجد مدارس بعد.</p></div>
        )}

        <div className="mt-10">
          <h2 className="text-sm font-bold text-gray-500 mb-3">دول قادمة قريباً</h2>
          <div className="flex flex-wrap gap-2">
            {COMING_SOON.map((name) => (
              <span key={name} className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-400 text-sm font-semibold">{name}</span>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
