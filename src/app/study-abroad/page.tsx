// Masarak Global — Study Abroad hub (entry point to the global education content).
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "الدراسة في الخارج — منح ووجهات عالمية | مسارك",
  description:
    "مركز مسارك للدراسة في الخارج: المنح الدولية المموّلة بالكامل وأبرز وجهات الدراسة حول العالم — ألمانيا، بريطانيا، تركيا، اليابان، أمريكا وغيرها. كل ما يحتاجه الطالب العربي للدراسة بالخارج.",
  path: "/study-abroad",
  keywords: ["الدراسة في الخارج", "منح دراسية", "وجهات الدراسة", "الدراسة في ألمانيا", "الدراسة في تركيا", "منح ممولة"],
});

type Country = { slug: string; name_ar: string; flag_emoji: string | null; region: string | null };

async function getDestinations(): Promise<Country[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);
  const { data } = await supabase
    .from("countries")
    .select("slug, name_ar, flag_emoji, region")
    .eq("is_destination", true)
    .eq("is_active", true)
    .order("name_ar");
  return (data || []) as Country[];
}

export default async function StudyAbroadHub() {
  const destinations = await getDestinations();

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7faf9]">
      <section className="bg-gradient-to-br from-[#0F4A52] to-[#1A6F7C] text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <span className="inline-block text-5xl mb-4">🌍</span>
          <h1 className="text-3xl md:text-5xl font-extrabold mb-4">الدراسة في الخارج</h1>
          <p className="text-white/90 max-w-2xl mx-auto leading-relaxed text-lg">
            بوّابتك للمنح الدولية المموّلة بالكامل وأبرز وجهات الدراسة حول العالم — كل المعلومات بالعربية، من مصادر موثّقة.
          </p>
          <Link
            href="/study-abroad/scholarships"
            className="inline-flex items-center gap-2 mt-7 bg-white text-[#0F4A52] font-extrabold px-6 py-3 rounded-2xl hover:bg-white/90 transition-colors"
          >
            🎓 استكشف المنح المموّلة
          </Link>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* Featured: scholarships */}
        <Link
          href="/study-abroad/scholarships"
          className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-10 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="text-4xl">💰</div>
            <div className="flex-1">
              <h2 className="text-xl font-extrabold text-gray-900">المنح الدراسية العالمية</h2>
              <p className="text-sm text-gray-600 mt-1">
                DAAD الألمانية · تشيفنينغ · المنح التركية · إيراسموس · فولبرايت · منحة اليابان — مموّلة بالكامل وموثّقة.
              </p>
            </div>
            <div className="text-[#0F4A52] font-bold">←</div>
          </div>
        </Link>

        {/* Destinations */}
        {destinations.length > 0 && (
          <>
            <h2 className="text-xl font-extrabold text-gray-900 mb-4">🧭 وجهات الدراسة الشعبية</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {destinations.map((c) => (
                <Link
                  key={c.slug}
                  href="/study-abroad/scholarships"
                  className="bg-white rounded-xl border border-gray-100 p-4 text-center hover:border-[#0F4A52]/40 hover:shadow-sm transition-all"
                >
                  <div className="text-3xl mb-1">{c.flag_emoji}</div>
                  <div className="text-sm font-bold text-gray-800">{c.name_ar}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">{c.region}</div>
                </Link>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-6">
              📚 أدلّة الدول التفصيلية (تكاليف، تأشيرة، سكن، فرص عمل) — قريباً.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
