// Masarak Global — worldwide scholarships finder (Server Component, SSR).
// Filterable by degree level, funding type, and host country via searchParams.
// Reads the verified `scholarships_global` data. Arabic-first.
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

export const metadata = buildMetadata({
  title: "منح دراسية عالمية مموّلة بالكامل | مسارك",
  description:
    "ابحث في المنح الدراسية الدولية المموّلة بالكامل للبكالوريوس والماجستير والدكتوراه — DAAD، تشيفنينغ، المنح التركية، إيراسموس، فولبرايت، ومنحة اليابان. فلترة حسب الدرجة والدولة. بيانات موثّقة رسمية.",
  path: "/study-abroad/scholarships",
  keywords: ["منح دراسية", "منح ممولة بالكامل", "الدراسة في الخارج", "منح ماجستير", "منح بكالوريوس", "منح دكتوراه", "DAAD", "تشيفنينغ", "فولبرايت"],
});

type DegreeRow = { degree_levels: { name_ar: string; sort_order: number; code: string } | null };
type ScholarshipRow = {
  slug: string;
  name_ar: string;
  description_short_ar: string | null;
  funding_type: string;
  status: string;
  host_country: string | null;
  deadline_note: string | null;
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

const DEGREE_OPTIONS = [
  { code: "bachelor", ar: "بكالوريوس" },
  { code: "master", ar: "ماجستير" },
  { code: "phd", ar: "دكتوراه" },
];

type Filters = { degree?: string; funding?: string; host?: string };

async function getScholarships(): Promise<ScholarshipRow[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  const supabase = createClient(url, key);
  const { data, error } = await supabase
    .from("scholarships_global")
    .select(
      `slug, name_ar, description_short_ar, funding_type, status, host_country,
       deadline_note, last_verified_at, is_multi_country,
       countries ( name_ar, flag_emoji ),
       scholarship_degree_levels ( degree_levels ( name_ar, sort_order, code ) )`,
    )
    .neq("status", "draft")
    .order("id");
  if (error) {
    console.warn("[study-abroad/scholarships]", error.message);
    return [];
  }
  return (data || []) as unknown as ScholarshipRow[];
}

function chipUrl(current: Filters, key: keyof Filters, value?: string): string {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(current)) if (v) sp.set(k, v);
  if (value) sp.set(key, value);
  else sp.delete(key);
  const q = sp.toString();
  return "/study-abroad/scholarships" + (q ? `?${q}` : "");
}

function Chip({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors ${
        active
          ? "bg-[#0F4A52] text-white border-[#0F4A52]"
          : "bg-white text-gray-700 border-gray-200 hover:border-[#0F4A52]/40"
      }`}
    >
      {label}
    </Link>
  );
}

export default async function GlobalScholarshipsPage({ searchParams }: { searchParams: Filters }) {
  const all = await getScholarships();
  const f: Filters = {
    degree: searchParams.degree,
    funding: searchParams.funding,
    host: searchParams.host,
  };

  // Build the country filter options from the data (unique hosts + multi).
  const hostMap = new Map<string, { ar: string; flag: string }>();
  let hasMulti = false;
  for (const s of all) {
    if (s.is_multi_country) hasMulti = true;
    else if (s.host_country && s.countries) hostMap.set(s.host_country, { ar: s.countries.name_ar, flag: s.countries.flag_emoji ?? "" });
  }

  const scholarships = all.filter((s) => {
    if (f.funding && s.funding_type !== f.funding) return false;
    if (f.host) {
      if (f.host === "multi") { if (!s.is_multi_country) return false; }
      else if (s.host_country !== f.host) return false;
    }
    if (f.degree) {
      const codes = (s.scholarship_degree_levels || []).map((d) => d.degree_levels?.code);
      if (!codes.includes(f.degree)) return false;
    }
    return true;
  });

  const hasFilters = Boolean(f.degree || f.funding || f.host);

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

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Filter bar */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-6 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 ml-1">الدرجة:</span>
            <Chip href={chipUrl(f, "degree", undefined)} label="الكل" active={!f.degree} />
            {DEGREE_OPTIONS.map((d) => (
              <Chip key={d.code} href={chipUrl(f, "degree", d.code)} label={d.ar} active={f.degree === d.code} />
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 ml-1">التمويل:</span>
            <Chip href={chipUrl(f, "funding", undefined)} label="الكل" active={!f.funding} />
            <Chip href={chipUrl(f, "funding", "fully_funded")} label="💰 مموّلة بالكامل" active={f.funding === "fully_funded"} />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-500 ml-1">الدولة:</span>
            <Chip href={chipUrl(f, "host", undefined)} label="الكل" active={!f.host} />
            {[...hostMap.entries()].map(([code, c]) => (
              <Chip key={code} href={chipUrl(f, "host", code)} label={`${c.flag} ${c.ar}`} active={f.host === code} />
            ))}
            {hasMulti && <Chip href={chipUrl(f, "host", "multi")} label="🌍 متعدّد الدول" active={f.host === "multi"} />}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">{scholarships.length} منحة</p>
          {hasFilters && (
            <Link href="/study-abroad/scholarships" className="text-xs font-bold text-[#0F4A52] hover:underline">
              ✕ مسح الفلاتر
            </Link>
          )}
        </div>

        {scholarships.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <div className="text-5xl mb-3">🔍</div>
            <p>ما في منح تطابق هالفلاتر — جرّب تشيل بعضها.</p>
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
              return (
                <article key={s.slug} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-3">
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
                      <span key={d!.name_ar} className="text-xs font-medium px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700">{d!.name_ar}</span>
                    ))}
                  </div>
                  {s.deadline_note && (
                    <p className="text-xs text-gray-500">🗓️ <span className="font-semibold">الموعد:</span> {s.deadline_note}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    <Link href={`/study-abroad/scholarships/${s.slug}`} className="inline-flex items-center gap-1 text-sm font-bold text-white bg-[#0F4A52] hover:bg-[#0c3b42] px-4 py-2 rounded-xl transition-colors">
                      التفاصيل ←
                    </Link>
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
