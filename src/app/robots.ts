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
          /*
           * Faceted filters, not pages. The scholarships finder takes degree,
           * funding and host country from searchParams, which multiply into
           * thousands of distinct URLs that all show slices of one list — and
           * because the page reads searchParams at all, Next renders every one
           * of them fresh, so its `revalidate` never applies.
           *
           * A crawler that walks that space walks it forever. One did, in
           * August: 174,000 uncached renders in twelve hours, each hitting the
           * database, which drained most of a month's credit in under a week.
           * The unfiltered page stays crawlable; only the combinations do not.
           */
          '/study-abroad/scholarships?',
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
