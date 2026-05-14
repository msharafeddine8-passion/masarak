// src/app/privacy/page.tsx
// Server component — preserves SEO metadata. Long-form legal content
// (bilingual) lives in PrivacyClient.tsx.

import { buildMetadata } from "@/lib/seo";
import PrivacyClient from "./PrivacyClient";

export const metadata = buildMetadata({
  title: "سياسة الخصوصية",
  description: "سياسة الخصوصية لمنصة مسارك — كيف نجمع، نستخدم، ونحمي بياناتك.",
  path: "/privacy",
});

export default function PrivacyPage() {
  return <PrivacyClient />;
}
