// University detail (Server Component, SSG) — mirrors the Lebanon detail layout
// (hero + breadcrumb + stats bar + overview + admissions sections), driven by the
// data available in universities_global. One indexable page per university.
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

type Uni = {
  slug: string; name_ar: string; name_en: string; city_ar: string | null; type: string | null;
  website: string | null; qs_rank: number | null; the_rank: number | null; rank_year: number | null;
  founded_year: number | null; student_population: number | null; intl_students_pct: number | null;
  acceptance_rate: number | null; languages: string[] | null;
  description_short_ar: string | null; official_source: string | null; last_verified_at: string | null;
  country_code: string | null; countries: { name_ar: string; flag_emoji: string | null; slug: string } | null;
};

function client() {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return u && k ? createClient(u, k) : null;
}

const SELECT = `slug, name_ar, name_en, city_ar, type, website, qs_rank, the_rank, rank_year,
  founded_year, student_population, intl_students_pct, acceptance_rate, languages,
  description_short_ar, official_source, last_verified_at,
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
    description: (u.description_short_ar || `معلومات عن ${u.name_ar} في ${country}: التصنيف العالمي، المدينة، نوع الجامعة، والموقع الرسمي للتقديم.`).slice(0, 160),
    path: `/universities/country/${u.countries?.slug}/${u.slug}`,
    keywords: [u.name_ar, `الدراسة في ${country}`, "جامعة", "تصنيف QS"],
  });
}

function typeAr(t: string | null) { return t === "private" ? "خاصة" : t === "public" ? "حكومية" : "—"; }

function describe(u: Uni): string {
  if (u.description_short_ar) return u.description_short_ar;
  const country = u.countries?.name_ar ?? "";
  let s = `${u.name_ar} هي جامعة ${typeAr(u.type)}`;
  if (u.city_ar) s += ` في مدينة ${u.city_ar}`;
  if (country) s += `، ${country}`;
  if (u.founded_year) s += `، تأسّست عام ${u.founded_year}`;
  s += ".";
  if (u.qs_rank) s += ` تحتل المرتبة #${u.qs_rank} عالمياً في تصنيف QS${u.rank_year ? ` لعام ${u.rank_year}` : ""}.`;
  return s;
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div><div className="text-2xl font-extrabold text-[#1b3a6b]">{value}</div><div className="text-xs text-gray-400 mt-1">{label}</div></div>;
}
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center bg-[#f7faf9] px-4 py-2.5 rounded-lg">
      <span className="text-gray-400 text-sm">{label}</span>
      <span className="font-semibold text-gray-900 text-sm">{value}</span>
    </div>
  );
}

export default async function UniversityDetail({ params }: { params: { slug: string; uni: string } }) {
  const u = await getUni(params.uni);
  if (!u) notFound();
  const site = u.website || u.official_source;
  const back = u.countries?.slug ?? params.slug;
  const country = u.countries?.name_ar ?? "";
  const langs = u.languages && u.languages.length > 0 ? u.languages.join("، ") : null;

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7faf9] pb-16">
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-[#1b3a6b] to-[#2d5391] text-white overflow-hidden">
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-[#5cc4b8] rounded-full blur-3xl opacity-20" />
        <div className="relative max-w-5xl mx-auto px-4 py-10">
          {/* Breadcrumb */}
          <nav className="text-xs text-white/70 mb-4 flex flex-wrap items-center gap-1">
            <Link href="/" className="hover:text-white">الرئيسية</Link><span>/</span>
            <Link href="/universities" className="hover:text-white">الجامعات</Link><span>/</span>
            <Link href={`/universities/country/${back}`} className="hover:text-white">{country}</Link><span>/</span>
            <span className="text-white/90">{u.name_ar}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="text-7xl">{u.countries?.flag_emoji ?? "🏛️"}</div>
            <div className="flex-1">
              <div className="text-sm opacity-85 mb-1">{country}{u.city_ar ? ` — ${u.city_ar}` : ""}</div>
              <h1 className="text-3xl md:text-4xl font-extrabold mb-1">{u.name_ar}</h1>
              <p className="text-white/70 text-sm mb-3">{u.name_en}</p>
              <div className="flex flex-wrap gap-2 text-sm">
                {u.type && <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">{typeAr(u.type)}</span>}
                {u.qs_rank && <span className="bg-amber-400/90 text-[#1b3a6b] px-3 py-1 rounded-full font-bold">🏆 تصنيف QS #{u.qs_rank}</span>}
                {u.founded_year && <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">منذ {u.founded_year}</span>}
                {langs && <span className="bg-white/15 backdrop-blur px-3 py-1 rounded-full">{langs}</span>}
              </div>
            </div>
            {site && (
              <a href={site} target="_blank" rel="noopener noreferrer"
                className="px-5 py-2.5 bg-white text-[#1b3a6b] rounded-lg font-bold text-sm text-center whitespace-nowrap">
                الموقع الرسمي ↗
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-5 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <Stat label="التصنيف العالمي (QS)" value={u.qs_rank ? `#${u.qs_rank}` : "—"} />
          <Stat label="سنة التأسيس" value={u.founded_year ? String(u.founded_year) : "—"} />
          <Stat label="النوع" value={typeAr(u.type)} />
          <Stat label={u.student_population ? "عدد الطلاب" : "المدينة"} value={u.student_population ? u.student_population.toLocaleString("ar") : (u.city_ar || "—")} />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6 space-y-5">
        {/* Overview */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="font-extrabold text-lg text-[#1b3a6b] mb-3">📋 نظرة عامة</h2>
          <p className="text-gray-600 leading-relaxed mb-5">{describe(u)}</p>
          <div className="grid md:grid-cols-2 gap-3">
            <InfoRow label="الدولة" value={country || "—"} />
            <InfoRow label="المدينة" value={u.city_ar || "—"} />
            <InfoRow label="النوع" value={typeAr(u.type)} />
            <InfoRow label="سنة التأسيس" value={u.founded_year ? String(u.founded_year) : "—"} />
            <InfoRow label="تصنيف QS العالمي" value={u.qs_rank ? `#${u.qs_rank}${u.rank_year ? ` (${u.rank_year})` : ""}` : "غير مصنّفة ضمن أعلى 700"} />
            {langs && <InfoRow label="لغة الدراسة" value={langs} />}
            {u.student_population && <InfoRow label="عدد الطلاب" value={u.student_population.toLocaleString("ar")} />}
            {u.intl_students_pct && <InfoRow label="نسبة الطلاب الدوليين" value={`${u.intl_students_pct}%`} />}
          </div>
        </section>

        {/* Admissions & fees */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="font-extrabold text-lg text-[#1b3a6b] mb-3">✅ القبول والرسوم</h2>
          {u.acceptance_rate && (
            <div className="mb-4"><InfoRow label="نسبة القبول" value={`${u.acceptance_rate}%`} /></div>
          )}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900 leading-relaxed mb-5">
            💡 الرسوم وشروط القبول تختلف حسب التخصّص والبرنامج وتتغيّر سنوياً — راجعها دائماً من <span className="font-bold">الموقع الرسمي للجامعة</span> للحصول على أدقّ وأحدث المعلومات.
          </div>
          <div className="flex flex-wrap gap-3">
            {site && (
              <a href={site} target="_blank" rel="noopener noreferrer"
                className="px-5 py-2.5 bg-[#1b3a6b] text-white rounded-lg font-bold text-sm">التقديم عبر الموقع الرسمي ↗</a>
            )}
            <Link href="/tools/cost-calculator" className="px-5 py-2.5 border-2 border-[#1b3a6b] text-[#1b3a6b] rounded-lg font-bold text-sm">حاسبة التكاليف</Link>
            <Link href="/study-abroad/scholarships" className="px-5 py-2.5 border-2 border-[#5cc4b8] text-[#1b3a6b] rounded-lg font-bold text-sm">المنح الدراسية</Link>
          </div>
        </section>

        {u.last_verified_at && (
          <p className="text-center text-xs text-gray-400">
            آخر تحديث للبيانات: {new Date(u.last_verified_at).toLocaleDateString("ar")} — التصنيف مرجعي من QS، والتفاصيل تُتحقَّق من المصدر الرسمي.
          </p>
        )}
      </div>
    </main>
  );
}
