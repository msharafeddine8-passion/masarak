// Masarak Global — public listing of worldwide scholarships (Server Component, SSR).
// Reads the verified `scholarships_global` data seeded in migration global01/02.
// Arabic-first; English fields exist in the data for a future /en route.
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600; // ISR — refresh hourly

export const metadata = buildMetadata({
  title: "منح دراسية عالمية مموّلة بالكامل | مسارك",
  description:
    "دليل المنح الدراسية الدولية المموّلة بالكامل للبكالوريوس والماجستير والدكتوراه — DAAD الألمانية، تشيفنينغ البريطانية، المنح التركية، إيراسموس، فولبرايت، ومنحة الحكومة اليابانية. بيانات موثّقة من المصادر الرسمية.",
  path: "/study-abroad/scholarships",
  keywords: ["منح دراسية", "منح ممولة بالكامل", "الدراسة في الخارج", "منح ماجستير", "منح بكالوريوس", "منح دكتوراه", "DAAD", "تشيفنينغ", "فولبرايت"],
});

type DegreeRow = { degree_levels: { name_ar: string; sort_order: number } | null };
type ScholarshipRow = {
  slug: string;
  name_ar: string;
  description_short_ar: string | null;
  funding_type: string;
  status: string;
  deadline_note: string | null;
  application_link: string | null;
  official_source: string | null;
  last_verified_at: string | null;
  is_multi_country: boolean;
  countries: { name_ar: string; flag_emoji: string | null } | null;
  scholarship_degree_levels: DegreeRow[] | null;
};

const STATUS_LABEL: Record<string, { ar: string; cls: string }> = {
  open: { ar: "مفتوحة الآن", cls: "bg-green-100 text-green-700" },
  upcoming: { ar: "قريباً", cls: "bg-blue-100 text-blue-700" },
  annual: { ar: "سنوية", cls: "bg-amber-100 text-amber-700" },
  closed: { ar: "مغلقة", cls: "bg-gray-100 text-gray-600" },
  unknown: { ar: "—", cls: "bg-gray-100 text-gray-600" },
};

async function getScholarships(): Promise<ScholarshipRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("scholarships_global")
    .select(
      `slug, name_ar, description_short_ar, funding_type, status, deadline_note,
       application_link, official_source, last_verified_at, is_multi_country,
       countries ( name_ar, flag_emoji ),
       scholarship_degree_levels ( degree_levels ( name_ar, sort_order ) )`,
    )
    .neq("status", "draft")
    .order("id");
  if (error) {
    console.warn("[study-abroad/scholarships]", error.message);
    return [];
  }
  return (data || []) as unknown as ScholarshipRow[];
}

export default async function GlobalScholarshipsPage() {
  const scholarships = await getScholarships();

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7faf9]">
      <section className="bg-gradient-to-br from-[#0F4A52] to-[#1A6F7C] text-white">
        <div className="max-w-5xl mx-auto px-4 py-14 text-center">
          <span className="inline-block text-4xl mb-3">🌍</span>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">منح دراسية عالمية مموّلة</h1>
          <p className="text-white/90 max-w-2xl mx-auto leading-relaxed">
            أشهر المنح الدولية المموّلة بالكامل — بيانات موثّقة من المصادر الرسمية، تُحدَّث باستمرار.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-10">
        {scholarships.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <div className="text-5xl mb-3">🔍</div>
            <p>لا توجد منح متاحة حالياً — تابعنا قريباً.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            {scholarships.map((s) => {
              const degrees = (s.scholarship_degree_levels || [])
                .map((d) => d.degree_levels)
                .filter(Boolean)
                .sort((a, b) => (a!.sort_order ?? 0) - (b!.sort_order ?? 0));
              const host = s.is_multi_country
                ? "🌍 متعدّد الدول"
                : `${s.countries?.flag_emoji ?? ""} ${s.countries?.name_ar ?? ""}`.trim();
              const st = STATUS_LABEL[s.status] || STATUS_LABEL.unknown;
              const applyHref = s.application_link || s.official_source || "#";
              return (
                <article
                  key={s.slug}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-bold text-[#0F4A52]">{host}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{st.ar}</span>
                  </div>

                  <h2 className="text-lg font-extrabold text-gray-900 leading-snug">{s.name_ar}</h2>

                  {s.description_short_ar && (
                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{s.description_short_ar}</p>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {s.funding_type === "fully_funded" && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700">💰 مموّلة بالكامل</span>
                    )}
                    {degrees.map((d) => (
                      <span key={d!.name_ar} className="text-xs font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                        {d!.name_ar}
                      </span>
                    ))}
                  </div>

                  {s.deadline_note && (
                    <p className="text-xs text-gray-500">🗓️ <span className="font-semibold">الموعد:</span> {s.deadline_note}</p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <a
                      href={applyHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm font-bold text-white bg-[#0F4A52] hover:bg-[#0c3b42] px-4 py-2 rounded-xl transition-colors"
                    >
                      تفاصيل وتقديم ↗
                    </a>
                    {s.last_verified_at && (
                      <span className="text-[11px] text-emerald-600 font-semibold" title="بيانات موثّقة من المصدر الرسمي">
                        ✅ موثّقة {new Date(s.last_verified_at).toLocaleDateString("ar")}
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <p className="text-center text-xs text-gray-400 mt-10">
          البيانات لأغراض إرشادية — تحقّق دائماً من الموعد والشروط من المصدر الرسمي قبل التقديم.
        </p>
      </div>
    </main>
  );
}
