// Detail-page SEO helpers.
// Per Jun-3 audit: detail pages were missing unique <title>, meta description,
// and schema.org markup — wasting the biggest organic-search opportunity.

import type { Metadata } from "next";

const SITE = "https://www.masaraklb.com";
const SITE_NAME = "مسارك";

export function buildUniversityMetadata(u: {
  id: number;
  name: string;
  short?: string;
  region?: string;
  desc?: string;
  photo?: string;
}): Metadata {
  const shortLabel = u.short ? ` (${u.short})` : "";
  const region = u.region ? ` — ${u.region}` : "";
  const title = `${u.name}${shortLabel} — رسوم، تخصصات، قبول | ${SITE_NAME}`;
  const description = (u.desc || `كل ما تحتاج معرفته عن ${u.name}${shortLabel}${region}: الرسوم، التخصصات، شروط القبول.`).slice(0, 160);
  const path = `/universities/${u.id}`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE}${path}` },
    openGraph: { title, description, url: `${SITE}${path}`, siteName: SITE_NAME, locale: "ar_LB", type: "website", images: u.photo ? [{ url: u.photo, width: 800, height: 450, alt: u.name }] : undefined },
    twitter: { card: "summary_large_image", title, description, images: u.photo ? [u.photo] : undefined },
  };
}

export function buildTrackMetadata(t: {
  id: string;
  name: string;
  sector?: string;
  duration?: string;
  desc?: string;
}): Metadata {
  const sector = t.sector ? ` — ${t.sector}` : "";
  const title = `${t.name}${sector} — تعليم مهني وتقني | ${SITE_NAME}`;
  const description = (t.desc || `كل ما تحتاج معرفته عن ${t.name}${sector}: المدة، المواد، فرص العمل والرواتب.`).slice(0, 160);
  const path = `/vocational/${t.id}`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE}${path}` },
    openGraph: { title, description, url: `${SITE}${path}`, siteName: SITE_NAME, locale: "ar_LB", type: "website" },
  };
}

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
  const description = (s.desc || `معلومات شاملة عن ${s.name}${shortLabel}${region}: التخصصات، اللغات، الرسوم، وآراء الطلاب.`).slice(0, 160);
  const path = `/schools/${s.id}`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE}${path}` },
    openGraph: { title, description, url: `${SITE}${path}`, siteName: SITE_NAME, locale: "ar_LB", type: "website", images: s.photo ? [{ url: s.photo, width: 800, height: 450, alt: s.name }] : undefined },
  };
}
