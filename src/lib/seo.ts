// المسار في المشروع: src/lib/seo.ts
// إعدادات SEO المركزية — اللون الكحلي #1b3a6b + جمعية تكافل
// =====================================================

export const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://masarak-khaki.vercel.app',
  name: 'مسارك',
  nameEn: 'Masarak',
  legalName: 'جمعية تكافل',
  legalNameEn: 'Takaful Foundation',
  tagline: 'مشروع من جمعية تكافل لخدمة طلاب لبنان',
  description:
    'منصة لبنانية مجانية للطلاب من جمعية تكافل: اكتشف تخصصك، اختر جامعتك، احصل على منح دراسية، وابنِ سيرتك الذاتية. كل شيء في مكان واحد.',
  descriptionEn:
    'Free Lebanese student platform by Takaful Foundation: discover your major, choose your university, find scholarships, and build your CV — all in one place.',
  locale: 'ar_LB',
  alternateLocales: ['en_US'],
  defaultOgImage: '/opengraph-image',
  twitter: '@takaful_lb',
  email: 'info@takaful-lb.org',
  phone: '+961-XX-XXXXXX',
  address: {
    streetAddress: '',
    addressLocality: 'بيروت',
    addressRegion: 'بيروت',
    addressCountry: 'LB',
  },
  organization: {
    name: 'جمعية تكافل',
    nameEn: 'Takaful Foundation',
    type: 'NGO',
    description: 'جمعية لبنانية غير ربحية تعمل على دعم الطلاب وتمكينهم تعليمياً ومهنياً',
  },
  social: {
    facebook: 'https://facebook.com/takaful.lb',
    instagram: 'https://instagram.com/takaful.lb',
    linkedin: 'https://linkedin.com/company/takaful-lb',
    twitter: 'https://twitter.com/takaful_lb',
    youtube: 'https://youtube.com/@takaful_lb',
    tiktok: 'https://tiktok.com/@takaful.lb',
  },
  brandColors: {
    primary: '#1b3a6b',
    primaryDark: '#142d54',
    primaryLight: '#2d5391',
    accent: '#d4a574',
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
      : ['مسارك', 'جمعية تكافل', 'طلاب لبنان', 'جامعات لبنان', 'منح دراسية', 'توجيه مهني'],
    metadataBase: new URL(SITE_CONFIG.url),
    applicationName: SITE_CONFIG.name,
    authors: [{ name: SITE_CONFIG.legalName }],
    publisher: SITE_CONFIG.legalName,
    alternates: {
      canonical: url,
      languages: {
        'ar-LB': url,
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
