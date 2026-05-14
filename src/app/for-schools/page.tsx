// src/app/for-schools/page.tsx
// Server component — preserves SEO metadata. Visual content in ForSchoolsClient.tsx.

import { buildMetadata } from "@/lib/seo";
import ForSchoolsClient from "./ForSchoolsClient";

export const metadata = buildMetadata({
  title: "للمدارس — مسارك شريكك بتوجيه طلابك",
  description: "حلول مسارك للمدارس اللبنانية: dashboard لمتابعة الطلاب، تقارير، ومحتوى توجيه. شراكات تعزّز إرشادك المهني.",
  path: "/for-schools",
  keywords: ["شراكات المدارس", "حلول B2B تعليمية", "إرشاد مهني للمدارس"],
});

export default function ForSchoolsPage() {
  return <ForSchoolsClient />;
}
