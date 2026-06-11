// المسار في المشروع: src/lib/seo.ts
// إعدادات SEO المركزية لمنصة "مسارك"

export const SITE_CONFIG = {
  url: (() => {
    const envUrl = process.env.NEXT_PUBLIC_SITE_URL || '';
    // Sprint 1.5: canonical is www. If env var was set to non-www (legacy),
    // override it here so canonical/sitemap/og:url all stay aligned with the
    // 308 redirect in next.config.mjs.
    if (envUrl.includes('://masaraklb.com')) return 'https://www.masaraklb.com';
    return envUrl || 'https://www.masaraklb.com';
  })(),
  name: 'مسارك',
  nameEn: 'Masarak',
  legalName: 'مسارك',
  legalNameEn: 'Masarak',
  tagline: 'منصّة الطلاب لاختيار الجامعات والمنح الدراسية',
  description:
    'منصّة عربية للطلاب: اكتشف تخصّصك، اختر جامعتك، احصل على منح دراسية، وابنِ سيرتك الذاتية. كل شي بمكان واحد.',
  descriptionEn:
    'Arabic student platform: discover your major, choose your university, find scholarships, and build your CV — all in one place.',
  locale: 'ar',
  alternateLocales: ['en_US'],
  defaultOgImage: '/opengraph-image',
  twitter: '',                       // فاضي حتى نأكّد الـ handle
  email: 'support@masaraklb.com',
  phone: '',
  // الموقع: لبنان فقط (بدون مدينة محددة)
  countryCode: 'LB',
  countryName: 'Lebanon',
  organization: {
    name: 'مسارك',
    nameEn: 'Masarak',
    type: 'EducationalOrganization',
    description: 'منصّة عربية لخدمة الطلاب وتوجيههم في اختيار الجامعات والتخصصات والمنح الدراسية',
  },
  // قائمة الدول التي تخدمها المنصة (للـ JSON-LD)
  areaServed: ['LB'],
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    youtube: '',
    tiktok: '',
  },
  brandColors: {
    primary: '#0F4A52',
    primaryDark: '#093A41',
    primaryLight: '#1A6F7C',
    accent: '#F97316',
    mint: '#95D5C5',
    text: '#0F1B1F',
    textLight: '#6B7280',
    bg: '#FAFAF9',
    bgSoft: '#F3F4F6',
  },
} as const;

import type { Metadata } from 'next';

interface PageMetaArgs {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
  keywords?: string[];
}

export function buildMetadata({
  title,
  description,
  path = '/',
  image,
  noIndex = false,
  keywords = [],
}: PageMetaArgs): Metadata {
  const url = `${SITE_CONFIG.url}${path}`;
  const fullTitle = title.includes(SITE_CONFIG.name)
    ? title
    : `${title} | ${SITE_CONFIG.name}`;

  return {
    title: fullTitle,
    description,
    keywords: keywords.length
      ? keywords
      : ['مسارك', 'جامعات', 'منح دراسية', 'تخصصات', 'توجيه مهني', 'الطلاب العرب', 'بناء السيرة الذاتية', 'كلية'],
    metadataBase: new URL(SITE_CONFIG.url),
    applicationName: SITE_CONFIG.name,
    authors: [{ name: SITE_CONFIG.name }],
    publisher: SITE_CONFIG.name,
    alternates: {
      canonical: url,
      languages: {
        ar: url,
        'x-default': url,
      },
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type: 'website',
      images: image
        ? [{ url: image, width: 1200, height: 630, alt: fullTitle }]
        : [{ url: `${SITE_CONFIG.url}/opengraph-image`, width: 1200, height: 630, alt: fullTitle }],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: image ? [image] : [`${SITE_CONFIG.url}/opengraph-image`],
      ...(SITE_CONFIG.twitter ? { creator: SITE_CONFIG.twitter } : {}),
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
    icons: { icon: '/icon', apple: '/apple-icon' },
    manifest: '/manifest.webmanifest',
  };
}
