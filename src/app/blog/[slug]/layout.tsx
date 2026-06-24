// src/app/blog/[slug]/layout.tsx
import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { getArticleBySlug } from "./articles";

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const slug = String(params?.slug || "");
  const article = getArticleBySlug(slug);
  if (!article) {
    return buildMetadata({
      title: "مدوّنة مسارك — نصائح وإرشادات للطلاب",
      description:
        "مقالات عن اختيار التخصص، المنح الدراسية، التحضير للجامعة، وسوق العمل العربي.",
      path: "/blog",
    });
  }
  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/blog/${article.slug}`,
    keywords: [article.cat, "مدونة مسارك", "نصائح للطلاب", "إرشاد مهني"],
  });
}

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
