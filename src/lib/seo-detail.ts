// ─── Detail-page SEO helpers ─────────────────────────────────────────────────
// Per Jun-3 audit: detail pages were missing unique <title>, meta description,
// and schema.org markup — wasting the biggest organic-search opportunity.

import type { Metadata } from "next";

const SITE = "https://www.masaraklb.com";
const SITE_NAME = "مسارك";

// ─── Universities ────────────────────────────────────────────────────────────
export function buildUniversityMetadata(u: {
  id: number;
  name: string;
  short?: string;
  region?: string;
  desc?: string;
  tuitionMin?: number;
  tuitionMax?: number;
  url?: string;
  photo?: string;
}): Metadata {
  const shortLabel = u.short ? ` (${u.short})` : "";
  const region = u.region ? ` — ${u.region}` : "";
  const title = `${u.name}${shortLabel} — رسوم، تخصصات، قبول | ${SITE_NAME}`;
  const description =
    u.desc ||
    `كل ما تحتاج معرفته عن ${u.name}${shortLabel}${region}: الرسوم، التخصصات، شروط القبول، والمنح المتاحة.`;
  const path = `/universities/${u.id}`;
  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical: `${SITE}${path}` },
    openGraph: {
      title,
      description: description.slice(0, 160),
      url: `${SITE}${path}`,
      siteName: SITE_NAME,
      locale: "ar_LB",
      type: "website",
      images: u.photo ? [{ url: u.photo, width: 800, height: 450, alt: u.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: description.slice(0, 160),
      images: u.photo ? [u.photo] : undefined,
    },
  };
}

export function buildUniversityJsonLd(u: {
  id: number;
  name: string;
  short?: string;
  region?: string;
  desc?: string;
  url?: string;
  photo?: string;
  founded?: number;
  students?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: u.name,
    alternateName: u.short,
    description: u.desc,
    url: u.url,
    sameAs: u.url ? [u.url] : undefined,
    image: u.photo,
    foundingDate: u.founded ? String(u.founded) : undefined,
    numberOfStudents: u.students,
    address: u.region
      ? { "@type": "PostalAddress", addressLocality: u.region, addressCountry: "LB" }
      : undefined,
    mainEntityOfPage: `${SITE}/universities/${u.id}`,
  };
}

// ─── Schools ─────────────────────────────────────────────────────────────────
export function buildSchoolMetadata(s: {
  id: number;
  name: string;
  short?: string;
  region?: string;
  desc?: string;
  photo?: string;
}): Metadata {
  const shortLabel = s.short ? ` (${s.short})` : "";
  const region = s.region ? ` — ${s.region}` : "";
  const title = `${s.name}${shortLabel} — مدرسة لبنانية${region} | ${SITE_NAME}`;
  const description =
    s.desc ||
    `معلومات شاملة عن ${s.name}${shortLabel}${region}: التخصصات، اللغات، الرسوم، وآراء الطلاب.`;
  const path = `/schools/${s.id}`;
  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical: `${SITE}${path}` },
    openGraph: {
      title,
      description: description.slice(0, 160),
      url: `${SITE}${path}`,
      siteName: SITE_NAME,
      locale: "ar_LB",
      type: "website",
      images: s.photo ? [{ url: s.photo, width: 800, height: 450, alt: s.name }] : undefined,
    },
  };
}

export function buildSchoolJsonLd(s: {
  id: number;
  name: string;
  short?: string;
  region?: string;
  desc?: string;
  url?: string;
  photo?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "School",
    name: s.name,
    alternateName: s.short,
    description: s.desc,
    url: s.url,
    image: s.photo,
    address: s.region
      ? { "@type": "PostalAddress", addressLocality: s.region, addressCountry: "LB" }
      : undefined,
    mainEntityOfPage: `${SITE}/schools/${s.id}`,
  };
}
