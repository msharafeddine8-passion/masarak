// Masarak Global — a country's universities (SSR). One indexable page per country.
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { buildMetadata } from "@/lib/seo";

export const revalidate = 3600;

type Country = { code: string; name_ar: string; flag_emoji: string | null };
type Uni = { slug: string; name_ar: string; city_ar: string | null; type: string | null; qs_rank: number | null; founded_year: number | null };

function client() {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return u && k ? createClient(u, k) : null;
}

async function getCountry(slug: string): Promise<Country | null> {
  const s = client();
  if (!s) return null;
  const { data } = await s.from("countries").select("code, name_ar, flag_emoji").eq("slug", slug).eq("is_active", true).maybeSingle();
  return (data as Country) || null;
}

async function getUniversities(code: string): Promise<Uni[]> {
  const s = client();
  if (!s) return [];
  const { data } = await s
    .from("universities_global")
    .select("slug, name_ar, city_ar, type, qs_rank, founded_year")
    .eq("country_code", code).neq("status", "draft");
  return ((data || []) as Uni[]).sort((a, b) => (a.qs_rank ?? 9999) - (b.qs_rank ?? 9999));
}

export async function generateStaticParams() {
  const s = client();
  if (!s) return [];
  const { data } = await s.from("universities_global").select("countries ( slug )").neq("status", "draft");
  const slugs = new Set<string>();
  for (const r of (data || []) as unknown as { countries: { slug: string } | null }[]) if (r.countries) slugs.add(r.countries.slug);
  return [...slugs].map((slug) => ({ country: slug }));
}

export async function generateMetadata({ params }: { params: { country: string } }) {
  const c = await getCountry(params.country);
  if (!c) return buildMetadata({ title: "الجامعات | مسارك", description: "", path: `/study-abroad/universities/${params.country}` });
  return buildMetadata({
    title: `أفضل الجامعات في ${c.name_ar} — للطلاب العرب | مسارك`,
    description: `تصفّح أبرز جامعات ${c.name_ar}: التصنيف، المدينة، نوع الجامعة، والموقع الرسمي. دليل الطالب العربي للدراسة في ${c.name_ar}.`,
    path: `/study-abroad/universities/${params.country}`,
    keywords: [`جامعات ${c.name_ar}`, `أفضل جامعات ${c.name_ar}`, "الدراسة في الخارج", "تصنيف الجامعات"],
  });
}

export default async function CountryUniversities({ params }: { params: { country: string } }) {
  const c = await getCountry(params.country);
  if (!c) notFound();
  const universities = await getUniversities(c.code);

  return (
    <main dir="rtl" className="min-h-screen bg-[#f7faf9]">
      <section className="bg-gradient-to-br from-[#0F4A52] to-[#1A6F7C] text-white">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <div className="text-6xl mb-2">{c.flag_emoji}</div>
          <h1 className="text-3xl md:text-4xl font-extrabold">جامعات {c.name_ar}</h1>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link href="/study-abroad/universities" className="text-sm text-[#0F4A52] font-semibold hover:underline">← كل الدول</Link>
        <p className="text-sm text-gray-500 mt-3 mb-4">{universities.length} جامعة</p>

        {universities.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center text-gray-500">قريباً.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {universities.map((u) => (
              <Link key={u.slug} href={`/study-abroad/universities/${params.country}/${u.slug}`}
                className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-gray-400">{u.city_ar}</span>
                  {u.qs_rank && <span className="text-xs font-extrabold px-2 py-0.5 rounded-lg bg-amber-50 text-amber-700">QS #{u.qs_rank}</span>}
                </div>
                <h2 className="font-extrabold text-gray-900 leading-snug mb-1">{u.name_ar}</h2>
                <p className="text-xs text-gray-500">
                  {u.type ? (u.type === "private" ? "خاصة" : "حكومية") : ""}{u.founded_year ? ` · تأسّست ${u.founded_year}` : ""}
                </p>
              </Link>
            ))}
          </div>
        )}
        <p className="text-center text-xs text-gray-400 mt-10">الرسوم وشروط القبول تتغيّر — تأكّد من الموقع الرسمي لكل جامعة.</p>
      </div>
    </main>
  );
}
