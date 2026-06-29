// Universities — pick a country (Server Component). Country-first browse:
// Lebanon keeps its original rich experience at /universities/lebanon (35 unis,
// old `universities` table); every other country is served from universities_global.
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "الجامعات — تصفّح حسب الدولة | مسارك",
  description:
    "اختر الدولة وتصفّح جامعاتها — لبنان (دليل كامل لـ 35 جامعة)، الأردن، مصر، السعودية، الإمارات، تركيا، فرنسا، بريطانيا، أمريكا وغيرها. تفاصيل كل جامعة للطلاب العرب.",
  path: "/universities",
  keywords: ["الجامعات", "جامعات حسب الدولة", "جامعات لبنان", "جامعات الأردن", "أفضل الجامعات", "الدراسة في الخارج"],
});

type Card = { href: string; name_ar: string; flag: string; count: number; featured?: boolean };

function client() {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return u && k ? createClient(u, k) : null;
}

async function getCountries(): Promise<Card[]> {
  const s = client();
  if (!s) return [];

  // Lebanon — featured, from the original detailed `universities` table.
  const { count: lbCount } = await s
    .from("universities")
    .select("id", { count: "exact", head: true })
    .eq("is_active", true);
  const cards: Card[] = [
    { href: "/universities/lebanon", name_ar: "لبنان", flag: "🇱🇧", count: lbCount ?? 0, featured: true },
  ];

  // Every other country — from universities_global (Lebanon excluded; it has its
  // own page). Done with TWO plain queries instead of a PostgREST embed: the
  // `countries(...)` embed was returning null (no declared relationship), which
  // silently dropped EVERY global country so only Lebanon showed.
  const [{ data: ug }, { data: cs }] = await Promise.all([
    s.from("universities_global").select("country_code").neq("status", "draft").neq("country_code", "LB"),
    s.from("countries").select("code, name_ar, flag_emoji, slug"),
  ]);
  const counts = new Map<string, number>();
  for (const r of (ug || []) as { country_code: string }[]) {
    if (!r.country_code) continue;
    counts.set(r.country_code, (counts.get(r.country_code) || 0) + 1);
  }
  const byCode = new Map<string, { name_ar: string; flag_emoji: string | null; slug: string }>();
  for (const c of (cs || []) as { code: string; name_ar: string; flag_emoji: string | null; slug: string }[]) {
    byCode.set(c.code, c);
  }
  const globalCards: Card[] = [];
  for (const [code, count] of counts) {
    const c = byCode.get(code);
    if (!c) continue;
    globalCards.push({ href: `/universities/country/${c.slug}`, name_ar: c.name_ar, flag: c.flag_emoji ?? "🏳️", count });
  }
  globalCards.sort((a, b) => b.count - a.count || a.name_ar.localeCompare(b.name_ar, "ar"));
  return [...cards, ...globalCards];
}

export default async function UniversitiesByCountry() {
  const countries = await getCountries();
  const total = countries.reduce((s, c) => s + c.count, 0);

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7faf9]">
      <section className="relative bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#5cc4b8] rounded-full blur-3xl opacity-20" />
        <div className="relative max-w-5xl mx-auto px-4 py-14 text-center">
          <span className="inline-block text-5xl mb-3">🎓</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">الجامعات حول العالم</h1>
          <p className="text-white/90 max-w-2xl mx-auto leading-relaxed">
            اختر دولة لتتصفّح جامعاتها وتفاصيلها — {total} جامعة وأكثر، بالعربية.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <h2 className="text-lg font-extrabold text-[#1b3a6b] mb-5">🌍 اختر الدولة</h2>

        {countries.length === 0 ? (
          <div className="text-center py-16 text-gray-500"><div className="text-5xl mb-3">🔍</div><p>قريباً.</p></div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {countries.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                className={`rounded-2xl border p-5 text-center transition-all hover:shadow-md ${
                  c.featured
                    ? "bg-[#1b3a6b] text-white border-[#1b3a6b] hover:bg-[#16315c]"
                    : "bg-white border-gray-100 hover:border-[#1b3a6b]/40"
                }`}
              >
                <div className="text-4xl mb-2">{c.flag}</div>
                <div className={`text-sm font-extrabold ${c.featured ? "text-white" : "text-gray-900"}`}>{c.name_ar}</div>
                <div className={`text-xs mt-1 ${c.featured ? "text-white/80" : "text-gray-400"}`}>
                  {c.count} جامعة{c.featured ? " · دليل كامل" : ""}
                </div>
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
