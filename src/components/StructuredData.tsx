// src/components/StructuredData.tsx
// JSON-LD structured data — يساعد Google يفهم محتوى الموقع
// ويمنحك Rich Results في نتائج البحث

import { SITE_CONFIG } from "@/lib/seo";

// ============= Organization Schema =============
export function OrganizationSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.nameEn,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/icon`,
    description: SITE_CONFIG.description,
    email: SITE_CONFIG.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: SITE_CONFIG.address.addressLocality,
      addressRegion: SITE_CONFIG.address.addressRegion,
      addressCountry: SITE_CONFIG.address.addressCountry,
    },
    sameAs: Object.values(SITE_CONFIG.social),
    areaServed: {
      "@type": "Country",
      name: "Lebanon",
    },
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ============= Website Schema with SearchAction =============
export function WebsiteSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    inLanguage: "ar-LB",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ============= Breadcrumb Schema =============
interface BreadcrumbItem {
  name: string;
  url: string;
}

export function BreadcrumbSchema({ items }: { items: BreadcrumbItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${SITE_CONFIG.url}${item.url}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ============= Course Schema =============
interface CourseProps {
  name: string;
  description: string;
  provider: string;
  duration: string;
  language?: string;
}

export function CourseSchema({ name, description, provider, duration, language = "ar" }: CourseProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    inLanguage: language,
    provider: {
      "@type": "Organization",
      name: provider,
    },
    timeRequired: duration,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ============= FAQ Schema =============
interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSchema({ items }: { items: FAQItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ============= Article Schema =============
interface ArticleProps {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  image?: string;
  url: string;
}

export function ArticleSchema({
  title,
  description,
  publishedAt,
  updatedAt,
  author,
  image,
  url,
}: ArticleProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    datePublished: publishedAt,
    dateModified: updatedAt || publishedAt,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.url}/icon`,
      },
    },
    image: image || `${SITE_CONFIG.url}/opengraph-image`,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
