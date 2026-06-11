// src/components/Breadcrumbs.tsx — Sprint 2.3
// Renders visible breadcrumb navigation + JSON-LD BreadcrumbList schema.
// Both signals together: visual nav for users, structured data for search.

import Link from 'next/link';
import { SITE_CONFIG } from '@/lib/seo';

export type Crumb = { label: string; href?: string };

type Props = {
  items: Crumb[];   // ordered; last item should NOT have href (current page)
  dir?: 'rtl' | 'ltr';
};

export default function Breadcrumbs({ items, dir = 'rtl' }: Props) {
  if (items.length === 0) return null;

  // Build BreadcrumbList JSON-LD.
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: `${SITE_CONFIG.url}${item.href}` } : {}),
    })),
  };

  const sep = dir === 'rtl' ? '←' : '→';

  return (
    <>
      <nav
        aria-label="مسار التنقل"
        className="text-sm text-ink-muted mb-4"
        dir={dir}
      >
        <ol className="flex items-center gap-1.5 flex-wrap">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-1.5">
              {item.href ? (
                <Link href={item.href} className="hover:text-primary hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span className="text-ink font-semibold" aria-current="page">
                  {item.label}
                </span>
              )}
              {i < items.length - 1 && <span className="text-ink-subtle text-xs">{sep}</span>}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    </>
  );
}
