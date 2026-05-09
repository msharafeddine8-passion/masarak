// المسار في المشروع: src/lib/seo.ts
// إعدادات SEO المركزية لمنصة "مسارك"
// =====================================================

export const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://masaraklb.com',
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
  twitter: '@masarak_app',
  email: 'info@masaraklb.com',
  phone: '',
  organization: {
    name: 'مسارك',
    nameEn: 'Masarak',
    type: 'EducationalOrganization',
    description: 'منصّة عربية لخدمة الطلاب وتوجيههم في اختيار الجامعات والتخصصات والمنح الدراسية',
  },
  areaServed: [
    'AE', 'SA', 'EG', 'JO', 'KW', 'QA', 'BH', 'OM', 'LB', 'PS', 'IQ', 'SY', 'YE', 'MA', 'TN', 'DZ', 'LY', 'SD',
  ],
  social: {
    facebook: '',
    instagram: '',
    linkedin: '',
    twitter: '',
    youtube: '',
    tiktok: '',
  },
  brandColors: {
    primary: '#1b3a6b',
    primaryDark: '#142d54',
    primaryLight: '#2d5391',
    accent: '#5cc4b8',
    text: '#1F2937',
    textLight: '#6B7280',
    bg: '#FFFFFF',
    bgSoft: '#F9FAFB',
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
      creator: SITE_CONFIG.twitter,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
    icons: { icon: '/icon', apple: '/apple-icon' },
    manifest: '/manifest.webmanifest',
  };
}
