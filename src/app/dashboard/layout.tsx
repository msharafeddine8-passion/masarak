// src/app/dashboard/layout.tsx
// FIX-11: mark all /dashboard/* routes as noindex so search engines
// don't try to crawl auth-gated pages (middleware already redirects bots,
// but an explicit meta tag is belt-and-suspenders).
import { buildMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata = buildMetadata({
  title: "لوحتي | مسارك",
  description: "لوحة تحكم الطالب على منصة مسارك.",
  path: "/dashboard",
  noIndex: true,
});

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
