// المسار في مشروعك: src/lib/seo.ts
// إعدادات SEO المركزية — استدعها من أي صفحة
// =====================================================

export const SITE_CONFIG = {
  // عدّل هذا للدومين النهائي عند الإطلاق
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://masarak-khaki.vercel.app',
  name: 'مسارك',
  nameEn: 'Masarak',
  legalName: 'Masarak Lebanon',
  description:
    'منصة لبنانية للطلاب: اكتشف تخصصك، اختر جامعتك، احصل على منح دراسية، وابنِ سيرتك الذاتية. كل شيء في مكان واحد ومجاناً.',
  descriptionEn:
    'Lebanon\'s student platform: discover your major, choose your university, find scholarships, and build your CV — all in one place, for free.',
  locale: 'ar_LB',
  alternateLocales: ['en_US'],
  defaultOgImage: '/opengraph-image',
  twitter: '@masarak_lb',
  email: 'hello@masaraklb.com',
  phone: '+961-XX-XXXXXX',
  address: {
    streetAddress: '',
    addressLocality: 'بيروت',
    addressRegion: 'بيروت',
    addressCountry: 'LB',
  },
  social: {
    facebook: 'https://facebook.com/masaraklb',
    instagram: 'https://instagram.com/masaraklb',
    linkedin: 'https://linkedin.com/company/masaraklb',
    twitter: 'https://twitter.com/masarak_lb',
    youtube: 'https://youtube.com/@masaraklb',
    tiktok: 'https://tiktok.com/@masaraklb',
  },
  brandColors: {
    primary: '#0F5D3D',
    accent: '#E8D5A8',
    text: '#1F2937',
    bg: '#FFFFFF',
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
      : ['مسارك', 'طلاب لبنان', 'جامعات لبنان', 'منح دراسية', 'توجيه مهني'],
    metadataBase: new URL(SITE_CONFIG.url),
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
        : [
            {
              url: `${SITE_CONFIG.url}/opengraph-image`,
              width: 1200,
              height: 630,
              alt: fullTitle,
            },
          ],
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
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
          },
        },
    icons: {
      icon: '/icon',
      apple: '/apple-icon',
    },
    manifest: '/manifest.webmanifest',
  };
}
