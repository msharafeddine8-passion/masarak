// src/lib/schools.ts
// Server-side data access for the country-based Schools directory.
// Country-first + extensible: everything is keyed by country_code / country slug
// so adding Jordan, KSA, UAE… later is data-only (insert rows with a new
// country_code + a `countries` row), no code changes.
import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

function serverClient() {
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return u && k ? createClient(u, k) : null;
}

export type SchoolCountry = {
  code: string;
  slug: string;
  name_ar: string;
  name_en: string | null;
  flag_emoji: string | null;
  count?: number;
};

export type SchoolRecord = {
  id: number;
  name: string;
  name_en: string | null;
  slug: string | null;
  country_code: string;
  // location
  region: string | null;
  area: string | null;
  governorate: string | null;
  district: string | null;
  city_or_area: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  // classification
  type: string | null;          // legacy Arabic label (خاصة/رسمية/…)
  school_type: string | null;   // normalized slug (private/official/…)
  gender_type: string | null;
  curriculum: string[];
  education_stages: string[];
  teaching_languages: string[];
  lang: string | null;          // legacy free-text language
  grades: string | null;
  // profile
  short_description: string | null;
  description: string | null;
  features: string[];
  images: string[];
  photo: string | null;
  logo_url: string | null;
  emoji: string | null;
  color: string | null;
  founded: number | null;
  students: number | null;
  rating: number | null;
  // fees / admission
  fees_min: number | null;
  fees_max: number | null;
  tuition_info: string | null;
  admission_info: string | null;
  requirements: string | null;
  application_deadline: string | null;
  accreditation: string | null;
  // contact
  phone: string | null;
  email: string | null;
  website: string | null;
  social_links: Record<string, string> | null;
  // trust / meta
  is_verified: boolean;
  is_claimed: boolean;
  profile_status: string;
  data_source: string | null;
  seo_index_status: string;
  last_updated_at: string | null;
};

// Canonical filter option values (labels are resolved via i18n in the UI).
export const SCHOOL_TYPES = ["official", "private", "international", "religious", "semi_private", "unrwa", "vocational"] as const;
export const EDUCATION_STAGES = ["kindergarten", "primary", "intermediate", "secondary"] as const;
export const TEACHING_LANGUAGES = ["Arabic", "English", "French"] as const;

// Map the legacy Arabic `type` → normalized school_type (used as a fallback when
// school_type is not set on a row).
export function normalizedType(s: Pick<SchoolRecord, "school_type" | "type">): string | null {
  if (s.school_type) return s.school_type;
  switch (s.type) {
    case "خاصة": return "private";
    case "رسمية": return "official";
    case "دولية": return "international";
    case "مهنية": return "vocational";
    default: return null;
  }
}

function arr(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === "string" && v.trim()) { try { const p = JSON.parse(v); return Array.isArray(p) ? p : [v]; } catch { return [v]; } }
  return [];
}

function fromRow(r: Record<string, unknown>): SchoolRecord {
  return {
    id: Number(r.id),
    name: String(r.name || ""),
    name_en: (r.name_en as string) ?? null,
    slug: (r.slug as string) ?? null,
    country_code: String(r.country_code || "LB"),
    region: (r.region as string) ?? null,
    area: (r.area as string) ?? null,
    governorate: (r.governorate as string) ?? (r.region as string) ?? null,
    district: (r.district as string) ?? null,
    city_or_area: (r.city_or_area as string) ?? (r.area as string) ?? null,
    address: (r.address as string) ?? null,
    latitude: (r.latitude as number) ?? null,
    longitude: (r.longitude as number) ?? null,
    type: (r.type as string) ?? null,
    school_type: (r.school_type as string) ?? null,
    gender_type: (r.gender_type as string) ?? null,
    curriculum: arr(r.curriculum),
    education_stages: arr(r.education_stages),
    teaching_languages: arr(r.teaching_languages),
    lang: (r.lang as string) ?? null,
    grades: (r.grades as string) ?? null,
    short_description: (r.short_description as string) ?? null,
    description: (r.description as string) ?? null,
    features: arr(r.features),
    images: arr(r.images),
    photo: (r.photo as string) ?? null,
    logo_url: (r.logo_url as string) ?? null,
    emoji: (r.emoji as string) ?? null,
    color: (r.color as string) ?? null,
    founded: (r.founded as number) ?? null,
    students: (r.students as number) ?? null,
    rating: (r.rating as number) ?? null,
    fees_min: (r.fees_min as number) ?? null,
    fees_max: (r.fees_max as number) ?? null,
    tuition_info: (r.tuition_info as string) ?? null,
    admission_info: (r.admission_info as string) ?? null,
    requirements: (r.requirements as string) ?? null,
    application_deadline: (r.application_deadline as string) ?? null,
    accreditation: (r.accreditation as string) ?? null,
    phone: (r.phone as string) ?? null,
    email: (r.email as string) ?? null,
    website: (r.website as string) ?? null,
    social_links: (r.social_links as Record<string, string>) ?? null,
    is_verified: Boolean(r.is_verified),
    is_claimed: Boolean(r.is_claimed),
    profile_status: String(r.profile_status || "basic"),
    data_source: (r.data_source as string) ?? null,
    seo_index_status: String(r.seo_index_status || "noindex"),
    last_updated_at: (r.last_updated_at as string) ?? (r.updated_at as string) ?? null,
  };
}

/** Countries that currently have at least one active school (drives /schools hub). */
export async function listSchoolCountries(): Promise<SchoolCountry[]> {
  const s = serverClient();
  if (!s) return [];
  const { data: rows } = await s.from("schools").select("country_code").eq("is_active", true);
  const counts = new Map<string, number>();
  for (const r of (rows || []) as { country_code: string }[]) {
    counts.set(r.country_code, (counts.get(r.country_code) || 0) + 1);
  }
  if (counts.size === 0) return [];
  const { data: cs } = await s
    .from("countries")
    .select("code, slug, name_ar, name_en, flag_emoji")
    .in("code", [...counts.keys()])
    .eq("is_active", true);
  return ((cs || []) as SchoolCountry[])
    .map((c) => ({ ...c, count: counts.get(c.code) || 0 }))
    .sort((a, b) => (b.count || 0) - (a.count || 0));
}

// cache(): dedupe the loader across generateMetadata + the page body in a single
// request (supabase-js calls, unlike fetch, are not auto-memoized by Next).
export const getSchoolCountry = cache(async (slug: string): Promise<SchoolCountry | null> => {
  const s = serverClient();
  if (!s) return null;
  const { data } = await s
    .from("countries")
    .select("code, slug, name_ar, name_en, flag_emoji")
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return (data as SchoolCountry) || null;
});

export async function getSchoolsByCountry(code: string): Promise<SchoolRecord[]> {
  const s = serverClient();
  if (!s) return [];
  const { data } = await s
    .from("schools")
    .select("*")
    .eq("country_code", code)
    .eq("is_active", true)
    .order("rating", { ascending: false, nullsFirst: false })
    .order("id");
  return ((data || []) as Record<string, unknown>[]).map(fromRow);
}

export const getSchoolBySlug = cache(async (code: string, slug: string): Promise<SchoolRecord | null> => {
  const s = serverClient();
  if (!s) return null;
  const { data } = await s
    .from("schools")
    .select("*")
    .eq("country_code", code)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  return data ? fromRow(data as Record<string, unknown>) : null;
});

/** Index-eligible {country, school} slug pairs — feeds generateStaticParams so
 *  the handful of indexable school profiles are prebuilt (rest stay on-demand). */
export async function indexableSchoolParams(): Promise<{ country: string; school: string }[]> {
  const s = serverClient();
  if (!s) return [];
  const [{ data: rows }, { data: cs }] = await Promise.all([
    s.from("schools").select("slug, country_code").eq("is_active", true).eq("seo_index_status", "index").not("slug", "is", null),
    s.from("countries").select("code, slug").eq("is_active", true),
  ]);
  const codeToSlug = new Map<string, string>();
  for (const c of (cs || []) as { code: string; slug: string }[]) codeToSlug.set(c.code, c.slug);
  const out: { country: string; school: string }[] = [];
  for (const r of (rows || []) as { slug: string; country_code: string }[]) {
    const cslug = codeToSlug.get(r.country_code);
    if (cslug && r.slug) out.push({ country: cslug, school: r.slug });
  }
  return out;
}

/** Legacy numeric-id lookup — used to 301 old /schools/{id} links to the slug URL. */
export async function getSchoolIdSlug(id: number): Promise<{ country_slug: string; slug: string } | null> {
  const s = serverClient();
  if (!s) return null;
  const { data } = await s.from("schools").select("slug, country_code").eq("id", id).maybeSingle();
  if (!data?.slug) return null;
  const c = await (async () => {
    const { data: cc } = await s.from("countries").select("slug").eq("code", (data as { country_code: string }).country_code).maybeSingle();
    return (cc as { slug: string } | null)?.slug || null;
  })();
  if (!c) return null;
  return { country_slug: c, slug: (data as { slug: string }).slug };
}

/**
 * SEO gate: only schools with genuinely useful content are indexable, so we
 * never flood the index with thin/empty profiles. Admin can force via
 * seo_index_status; otherwise we require a description + a couple of real facts.
 */
export function isSchoolIndexable(s: SchoolRecord): boolean {
  if (s.seo_index_status === "noindex") return false;
  if (s.seo_index_status === "index") return true;
  const hasDesc = !!(s.description && s.description.trim().length >= 40);
  const facts = [s.phone, s.website, s.address, s.curriculum.length > 0 ? "c" : null, s.teaching_languages.length > 0 ? "l" : null].filter(Boolean).length;
  return hasDesc && facts >= 2;
}
