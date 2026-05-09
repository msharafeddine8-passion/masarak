// src/app/manifest.ts
// PWA manifest

import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'مسارك — بوابة الطلاب اللبنانيين',
    short_name: 'مسارك',
    description:
      'منصة لبنانية للطلاب: اكتشف تخصصك، اختر جامعتك، احصل على منح دراسية، وابنِ سيرتك الذاتية.',
    start_url: '/',
    display: 'standalone',
    background_color: '#FFFFFF',
    theme_color: '#0F5D3D',
    lang: 'ar',
    dir: 'rtl',
    orientation: 'portrait',
    categories: ['education', 'lifestyle', 'productivity'],
    icons: [
      {
        src: '/icon',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
