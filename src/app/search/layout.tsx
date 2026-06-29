import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "البحث — مسارك",
  description: "ابحث في جامعات العالم العربي، المدارس، المنح الدراسية، الأدوات والمدونة.",
  path: "/search",
});

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
