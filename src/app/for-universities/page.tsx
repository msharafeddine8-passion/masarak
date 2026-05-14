// src/app/for-universities/page.tsx
// Server component — preserves SEO metadata. Visual content in ForUniversitiesClient.tsx.

import { buildMetadata } from "@/lib/seo";
import ForUniversitiesClient from "./ForUniversitiesClient";

export const metadata = buildMetadata({
  title: "للجامعات — مسارك يجلبلك أفضل المرشّحين",
  description: "حلول B2B للجامعات: lead generation، تواجد بدليلنا، إعلانات منح، وتقارير سوق. اربط نفسك بالطلاب اللي يبحثون عنك.",
  path: "/for-universities",
  keywords: ["شراكات الجامعات", "تسويق جامعي", "lead generation للجامعات", "B2B تعليم"],
});

export default function ForUniversitiesPage() {
  return <ForUniversitiesClient />;
}
