// src/app/terms/page.tsx
// Server component — preserves SEO metadata. Long-form legal content
// (bilingual) lives in TermsClient.tsx.

import { buildMetadata } from "@/lib/seo";
import TermsClient from "./TermsClient";

export const metadata = buildMetadata({
  title: "شروط الاستخدام",
  description: "الشروط والأحكام لاستخدام منصة مسارك.",
  path: "/terms",
});

export default function TermsPage() {
  return <TermsClient />;
}
