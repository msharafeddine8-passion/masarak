// A country's universities (Server Component, SSG → feeds a client list with
// filters/sort, mirroring the Lebanon experience). Non-Lebanon countries are
// served from universities_global; /universities/country/lebanon redirects to the
// original detailed Lebanon experience at /universities/lebanon.
import { notFound, redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { buildMetadata } from "@/lib/seo";
import CountryUnisClient, { type GUni } from "./CountryUnisClient";

export const revalidate = 3600;

type Country = { code: string; name_ar: string; flag_emoji: string | null };

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

async function getUniversities(code: string): Promise<GUni[]> {
  const s = client();
  if (!s) return [];
  const { data } = await s
    .from("universities_global")
    .select("slug, name_ar, name_en, city_ar, type, qs_rank, founded_year, student_population, intl_students_pct, languages")
    .eq("country_code", code).neq("status", "draft");
  return ((data || []) as GUni[]).sort((a, b) => (a.qs_rank ?? 9999) - (b.qs_rank ?? 9999));
}

export async function generateStaticParams() {
  const s = client();
  if (!s) return [];
  // Resolve via two plain queries (the countries(...) embed returns null — no
  // declared relationship — which left this empty and un-prebuilt).
  const [{ data: ug }, { data: cs }] = await Promise.all([
    s.from("universities_global").select("country_code").neq("status", "draft").neq("country_code", "LB"),
    s.from("countries").select("code, slug"),
  ]);
  const codeToSlug = new Map<string, string>();
  for (const c of (cs || []) as { code: string; slug: string }[]) codeToSlug.set(c.code, c.slug);
  const slugs = new Set<string>();
  for (const r of (ug || []) as { country_code: string }[]) {
    const sl = codeToSlug.get(r.country_code);
    if (sl) slugs.add(sl);
  }
  return [...slugs].map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const c = await getCountry(params.slug);
  if (!c) return buildMetadata({ title: "الجامعات | مسارك", description: "", path: `/universities/country/${params.slug}` });
  return buildMetadata({
    title: `أفضل الجامعات في ${c.name_ar} — للطلاب العرب | مسارك`,
    description: `تصفّح أبرز جامعات ${c.name_ar}: التصنيف، المدينة، نوع الجامعة، والموقع الرسمي. دليل الطالب العربي للدراسة في ${c.name_ar}.`,
    path: `/universities/country/${params.slug}`,
    keywords: [`جامعات ${c.name_ar}`, `أفضل جامعات ${c.name_ar}`, "الدراسة في الخارج", "تصنيف الجامعات"],
  });
}

export default async function CountryUniversities({ params }: { params: { slug: string } }) {
  if (params.slug === "lebanon") redirect("/universities/lebanon");
  const c = await getCountry(params.slug);
  if (!c) notFound();
  const universities = await getUniversities(c.code);

  return (
    <CountryUnisClient
      countryNameAr={c.name_ar}
      flag={c.flag_emoji ?? "🏳️"}
      slug={params.slug}
      unis={universities}
    />
  );
}
