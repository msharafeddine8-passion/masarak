// University detail (Server Component, SSG) — one indexable page per university
// for every non-Lebanon country, sourced from universities_global.
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

type Uni = {
  slug: string; name_ar: string; name_en: string; city_ar: string | null; type: string | null;
  website: string | null; qs_rank: number | null; the_rank: number | null; rank_year: number | null;
  founded_year: number | null; student_population: number | null; languages: string[] | null;
  description_short_ar: string | null; official_source: string | null; last_verified_at: string | null;
  country_code: string | null; countries: { name_ar: string; flag_emoji: string | null; slug: string } | null;
};

function client() {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return u && k ? createClient(u, k) : null;
}

const SELECT = `slug, name_ar, name_en, city_ar, type, website, qs_rank, the_rank, rank_year,
  founded_year, student_population, languages, description_short_ar, official_source, last_verified_at,
  country_code, countries ( name_ar, flag_emoji, slug )`;

async function getUni(slug: string): Promise<Uni | null> {
  const s = client();
  if (!s) return null;
  const { data } = await s.from("universities_global").select(SELECT).eq("slug", slug).maybeSingle();
  return (data as unknown as Uni) || null;
}

export async function generateStaticParams() {
  const s = client();
  if (!s) return [];
  const { data } = await s.from("universities_global").select("slug, countries ( slug )").neq("status", "draft").neq("country_code", "LB");
  return ((data || []) as unknown as { slug: string; countries: { slug: string } | null }[])
    .filter((r) => r.countries)
    .map((r) => ({ slug: r.countries!.slug, uni: r.slug }));
}

export async function generateMetadata({ params }: { params: { uni: string } }) {
  const u = await getUni(params.uni);
  if (!u) return buildMetadata({ title: "جامعة | مسارك", description: "", path: `/universities/country/x/${params.uni}` });
  const country = u.countries?.name_ar ?? "";
  return buildMetadata({
    title: `${u.name_ar} — ${country}${u.qs_rank ? ` (تصنيف QS #${u.qs_rank})` : ""} | مسارك`,
    description: (u.description_short_ar || `معلومات عن ${u.name_ar} في ${country}: التصنيف، المدينة، والموقع الرسمي.`).slice(0, 160),
    path: `/universities/country/${u.countries?.slug}/${u.slug}`,
    keywords: [u.name_ar, `الدراسة في ${country}`, "جامعة", "تصنيف QS"],
  });
}

function Fact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-3">
      <div className="text-xs text-gray-500 mb-0.5">{icon} {label}</div>
      <div className="text-sm font-bold text-gray-900">{value}</div>
    </div>
  );
}

export default async function UniversityDetail({ params }: { params: { slug: string; uni: string } }) {
  const u = await getUni(params.uni);
  if (!u) notFound();
  const site = u.website || u.official_source;
  const back = u.countries?.slug ?? params.slug;

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7faf9]">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Link href={`/universities/country/${back}`} className="text-sm text-[#1b3a6b] font-semibold hover:underline">
          ← جامعات {u.countries?.name_ar}
        </Link>

        <header className="mt-4 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-bold text-[#1b3a6b]">{u.countries?.flag_emoji} {u.countries?.name_ar}{u.city_ar ? ` · ${u.city_ar}` : ""}</span>
            {u.qs_rank && <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700">QS #{u.qs_rank}{u.rank_year ? ` (${u.rank_year})` : ""}</span>}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-snug">{u.name_ar}</h1>
          <p className="text-gray-400 text-sm mt-1">{u.name_en}</p>
          {u.description_short_ar && <p className="text-gray-600 mt-2 leading-relaxed">{u.description_short_ar}</p>}
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-6">
          {u.type && <Fact icon="🏛️" label="النوع" value={u.type === "private" ? "خاصة" : "حكومية"} />}
          {u.founded_year && <Fact icon="📅" label="سنة التأسيس" value={String(u.founded_year)} />}
          {u.qs_rank && <Fact icon="🏆" label="تصنيف QS" value={`#${u.qs_rank}`} />}
          {u.languages && u.languages.length > 0 && <Fact icon="🗣️" label="لغة الدراسة" value={u.languages.join("، ")} />}
          {u.student_population && <Fact icon="👥" label="عدد الطلاب" value={u.student_population.toLocaleString("ar")} />}
        </div>

        <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-5 mb-6">
          <p className="text-sm text-gray-600">
            💡 <span className="font-bold">الرسوم وشروط القبول</span> تختلف حسب التخصّص وتتغيّر سنوياً — راجعها من الموقع الرسمي للجامعة للحصول على أدقّ المعلومات.
          </p>
        </div>

        {site && (
          <a href={site} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-bold text-white bg-[#1b3a6b] hover:bg-[#16315c] px-5 py-2.5 rounded-xl">
            الموقع الرسمي للجامعة ↗
          </a>
        )}

        {u.last_verified_at && (
          <p className="text-xs text-gray-400 mt-6">آخر تحديث للبيانات: {new Date(u.last_verified_at).toLocaleDateString("ar")} — تصنيف QS مرجعي.</p>
        )}
      </div>
    </main>
  );
}
