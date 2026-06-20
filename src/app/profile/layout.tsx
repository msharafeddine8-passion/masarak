// src/app/profile/layout.tsx
// FIX-11: mark all /profile/* routes as noindex — personal data pages
// should never appear in search results.
import { buildMetadata } from "@/lib/seo";
import type { ReactNode } from "react";

export const metadata = buildMetadata({
  title: "ملفي الشخصي | مسارك",
  description: "ملفك الشخصي الأكاديمي على منصة مسارك.",
  path: "/profile",
  noIndex: true,
});

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
