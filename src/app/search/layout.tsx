import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "البحث — مسارك",
  description: "ابحث في جامعات العالم العربي، المدارس، المنح الدراسية، الأدوات والمدونة.",
  path: "/search",
  noIndex: true, // internal search results are low-value / near-duplicate — keep them out of the index
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
