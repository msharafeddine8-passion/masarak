// src/app/robots.ts
// robots.txt ديناميكي
// =====================================================

import type { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/auth/',
          '/admin/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'GPTBot',
        allow: '/',
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
      },
      {
        userAgent: 'ClaudeBot',
        allow: '/',
      },
      {
        userAgent: 'PerplexityBot',
        allow: '/',
      },
      {
        userAgent: 'Google-Extended',
        allow: '/',
      },
    ],
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
    // `host` expects a bare hostname (no protocol), else it's ignored/invalid.
    host: SITE_CONFIG.url.replace(/^https?:\/\//, ''),
  };
}
