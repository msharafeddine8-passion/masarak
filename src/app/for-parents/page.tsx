// src/app/for-parents/page.tsx
// Server component — preserves SEO metadata. Visual content in ForParentsClient.tsx.

import { buildMetadata } from "@/lib/seo";
import ForParentsClient from "./ForParentsClient";

export const metadata = buildMetadata({
  title: "للأهل — تابع مسيرة ابنك/ابنتك بثقة",
  description: "أدوات لمساعدة أبنائك في اختيار التخصص، الجامعة، والمنح. معلومات موثوقة بالعربية.",
  path: "/for-parents",
  keywords: ["نصائح للأهل", "كيف أساعد ابني بالجامعة", "تخصص الابن", "منح للأبناء"],
});

export default function ForParentsPage() {
  return <ForParentsClient />;
}
