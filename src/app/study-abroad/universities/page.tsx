// Masarak Global — Universities: pick a country (Server Component, SSR).
// Country-first browse: choose a country -> its universities -> a detail page each.
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "الجامعات حول العالم — تصفّح حسب الدولة | مسارك",
  description:
    "اختر الدولة وتصفّح أبرز جامعاتها — لبنان، الأردن، فرنسا، ألمانيا، بريطانيا، أمريكا وغيرها. تفاصيل كل جامعة وموقعها الرسمي للطلاب العرب.",
  path: "/study-abroad/universities",
  keywords: ["الجامعات", "جامعات حسب الدولة", "الدراسة في الخارج", "جامعات لبنان", "جامعات الأردن", "جامعات فرنسا"],
});

type Row = { country_code: string | null; countries: { name_ar: string; flag_emoji: string | null; slug: string } | null };
type CountryCard = { slug: string; name_ar: string; flag: string; count: number };

async function getCountries(): Promise<CountryCard[]> {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!u || !k) return [];
  const supabase = createClient(u, k);
  const { data, error } = await supabase
    .from("universities_global")
    .select("country_code, countries ( name_ar, flag_emoji, slug )")
    .neq("status", "draft");
  if (error) {
    console.warn("[study-abroad/universities]", error.message);
    return [];
  }
  const map = new Map<string, CountryCard>();
  for (const r of (data || []) as unknown as Row[]) {
    if (!r.countries) continue;
    const slug = r.countries.slug;
    const existing = map.get(slug);
    if (existing) existing.count += 1;
    else map.set(slug, { slug, name_ar: r.countries.name_ar, flag: r.countries.flag_emoji ?? "🏳️", count: 1 });
  }
  return [...map.values()].sort((a, b) => b.count - a.count || a.name_ar.localeCompare(b.name_ar, "ar"));
}

export default async function UniversitiesByCountry() {
  const countries = await getCountries();

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7faf9]">
      <section className="bg-gradient-to-br from-[#0F4A52] to-[#1A6F7C] text-white">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <span className="inline-block text-4xl mb-3">🎓</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">الجامعات حول العالم</h1>
          <p className="text-white/90 max-w-2xl mx-auto leading-relaxed">اختر دولة لتتصفّح أبرز جامعاتها وتفاصيلها.</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-lg font-extrabold text-gray-900 mb-5">🌍 اختر الدولة</h2>

        {countries.length === 0 ? (
          <div className="text-center py-16 text-gray-500"><div className="text-5xl mb-3">🔍</div><p>قريباً.</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {countries.map((c) => (
              <Link
                key={c.slug}
                href={`/study-abroad/universities/${c.slug}`}
                className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:border-[#0F4A52]/40 hover:shadow-md transition-all"
              >
                <div className="text-4xl mb-2">{c.flag}</div>
                <div className="text-sm font-extrabold text-gray-900">{c.name_ar}</div>
                <div className="text-xs text-gray-400 mt-1">{c.count} جامعة</div>
              </Link>
            ))}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          نضيف دولاً وجامعات باستمرار — التصنيفات والرسوم تُتحقَّق من المصدر الرسمي لكل جامعة.
        </p>
      </div>
    </main>
  );
}
