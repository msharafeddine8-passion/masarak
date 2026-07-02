// /schools/[country] — a country's schools directory (Server Component, ISR).
// Country-first & extensible: prebuilds every active country that has schools.
// Also 301-compat: /schools/{numericId} (old links) → /schools/{country}/{slug}.
import { notFound, redirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import {
  getSchoolCountry, getSchoolsByCountry, listSchoolCountries,
  getSchoolIdSlug, normalizedType,
} from "@/lib/schools";
import SchoolsCountryClient, { type SchoolCardData } from "./SchoolsCountryClient";

export const revalidate = 3600;

export async function generateStaticParams() {
  const countries = await listSchoolCountries();
  return countries.map((c) => ({ country: c.slug }));
}

export async function generateMetadata({ params }: { params: { country: string } }) {
  if (/^\d+$/.test(params.country)) {
    return buildMetadata({ title: "المدارس | مسارك", description: "", path: `/schools`, noIndex: true });
  }
  const c = await getSchoolCountry(params.country);
  if (!c) return buildMetadata({ title: "المدارس | مسارك", description: "", path: `/schools/${params.country}`, noIndex: true });
  const title = `مدارس ${c.name_ar} | دليل المدارس في ${c.name_ar}`;
  return buildMetadata({
    title,
    description: `اكتشف المدارس في ${c.name_ar} حسب المحافظة، المنطقة، نوع المدرسة، لغة التعليم، المنهج، والمراحل التعليمية عبر منصة مسارك.`,
    path: `/schools/${params.country}`,
    keywords: [`مدارس ${c.name_ar}`, `دليل المدارس في ${c.name_ar}`, "مدارس خاصة", "مدارس رسمية", "مدارس دولية", "مدارس مهنية"],
  });
}

export default async function CountrySchoolsPage({ params }: { params: { country: string } }) {
  // Backward-compat: old numeric detail links /schools/123 → new slug URL.
  if (/^\d+$/.test(params.country)) {
    const hit = await getSchoolIdSlug(Number(params.country));
    if (hit) redirect(`/schools/${hit.country_slug}/${hit.slug}`);
    notFound();
  }

  const country = await getSchoolCountry(params.country);
  if (!country) notFound();

  const records = await getSchoolsByCountry(country.code);
  if (records.length === 0) notFound();

  const schools: SchoolCardData[] = records.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    name_en: s.name_en,
    governorate: s.governorate,
    district: s.district,
    city_or_area: s.city_or_area,
    school_type: normalizedType(s),
    teaching_languages: s.teaching_languages,
    education_stages: s.education_stages,
    curriculum: s.curriculum,
    logo_url: s.logo_url,
    emoji: s.emoji,
    color: s.color,
    is_verified: s.is_verified,
    is_claimed: s.is_claimed,
  }));

  return (
    <main className="min-h-screen bg-bg pb-20">
      <SchoolsCountryClient
        country={{ slug: country.slug, name_ar: country.name_ar, name_en: country.name_en, flag: country.flag_emoji ?? "🏳️" }}
        schools={schools}
      />
    </main>
  );
}
