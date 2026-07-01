// src/components/StructuredData.tsx
// JSON-LD structured data — يساعد Google يفهم محتوى الموقع

import { SITE_CONFIG } from "@/lib/seo";

// ============= Organization Schema =============
export function OrganizationSchema() {
  const sameAs = Object.values(SITE_CONFIG.social).filter(Boolean);
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.nameEn,
    url: SITE_CONFIG.url,
    logo: `${SITE_CONFIG.url}/icon`,
    description: SITE_CONFIG.description,
    audience: {
      "@type": "EducationalAudience",
      educationalRole: "student",
    },
    areaServed: SITE_CONFIG.areaServed.map((countryCode) => ({
      "@type": "Country",
      identifier: countryCode,
    })),
  };

  if (SITE_CONFIG.email) data.email = SITE_CONFIG.email;
  if (sameAs.length) data.sameAs = sameAs;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ============= Website Schema =============
export function WebsiteSchema() {
  const data = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_CONFIG.name,
    url: SITE_CONFIG.url,
    inLanguage: "ar",
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

// ============= Scholarship Schema =============
interface ScholarshipProps {
  name: string;
  description: string;
  provider: string;
  url?: string;
  hostCountry?: string;
  language?: string;
}

// EducationalOccupationalProgram is the closest schema.org type for a funded
// study opportunity. `<` is escaped so DB-sourced text can't break out of the
// JSON-LD <script> block (audit #6).
export function ScholarshipSchema({ name, description, provider, url, hostCountry, language = "ar" }: ScholarshipProps) {
  const data = {
    "@context": "https://schema.org",
    "@type": "EducationalOccupationalProgram",
    name,
    description,
    inLanguage: language,
    provider: { "@type": "Organization", name: provider },
    ...(url ? { url } : {}),
    ...(hostCountry ? { educationalProgramMode: "full-time", occupationalCategory: hostCountry } : {}),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
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

// ============= CollegeOrUniversity Schema (Sprint 2.5) =============
type UniversityProps = {
  name: string;
  short?: string;
  url?: string;        // official website
  address?: string;
  region?: string;
  foundingDate?: number | string;
  detailPath: string;  // e.g. "/universities/1"
  photo?: string;
  description?: string;
};

export function CollegeOrUniversitySchema(u: UniversityProps) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "CollegeOrUniversity",
    name: u.name,
    url: `${SITE_CONFIG.url}${u.detailPath}`,
  };
  if (u.short) data.alternateName = u.short;
  if (u.description) data.description = u.description;
  if (u.photo) data.image = u.photo;
  if (u.foundingDate) data.foundingDate = String(u.foundingDate);
  if (u.url) data.sameAs = [u.url];
  if (u.address || u.region) {
    data.address = {
      "@type": "PostalAddress",
      addressCountry: "LB",
      ...(u.region ? { addressRegion: u.region } : {}),
      ...(u.address ? { streetAddress: u.address } : {}),
    };
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// Course schema: see existing CourseSchema above (kept original).

// ============= BlogPosting Schema (Sprint 2.5) =============
type BlogPostingProps = {
  title: string;
  excerpt: string;
  slug: string;
  datePublished: string;
  dateModified?: string;
  author?: string;
  image?: string;
};

export function BlogPostingSchema(p: BlogPostingProps) {
  const url = `${SITE_CONFIG.url}/blog/${p.slug}`;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: p.title,
    description: p.excerpt,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    datePublished: p.datePublished,
    dateModified: p.dateModified || p.datePublished,
    author: {
      "@type": p.author ? "Person" : "Organization",
      name: p.author || SITE_CONFIG.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      logo: { "@type": "ImageObject", url: `${SITE_CONFIG.url}/icon` },
    },
  };
  if (p.image) data.image = p.image;
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

// ============= FAQPage Schema (Sprint 2.5) =============
type FAQPageItem = { question: string; answer: string };

export function FAQPageSchema({ items }: { items: FAQPageItem[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(i => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
