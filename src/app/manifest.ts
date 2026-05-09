// المسار في المشروع: src/app/manifest.ts
// PWA Manifest — اللون الكحلي + جمعية تكافل
// =====================================================

import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_CONFIG.name} — منصّة طلاب لبنان (${SITE_CONFIG.legalName})`,
    short_name: SITE_CONFIG.name,
    description: SITE_CONFIG.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#1b3a6b',
    lang: 'ar',
    dir: 'rtl',
    orientation: 'portrait',
    categories: ['education', 'productivity', 'lifestyle'],
    icons: [
      { src: '/icon', sizes: '32x32', type: 'image/png' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
