// src/app/for-students/page.tsx
// Server component — preserves SEO metadata. Visual content in ForStudentsClient.tsx.

import { buildMetadata } from "@/lib/seo";
import ForStudentsClient from "./ForStudentsClient";

export const metadata = buildMetadata({
  title: "للطلاب — مسارك يساعدك تختار وتنجح",
  description:
    "كل ما يحتاجه الطالب: اختيار التخصص، المنح، التدريب، CV احترافي. بالعربية وبسهولة.",
  path: "/for-students",
  keywords: ["مسارك للطلاب", "أدوات الطلاب", "مساعدة الطلاب", "إرشاد جامعي"],
});

export default function ForStudentsPage() {
  return <ForStudentsClient />;
}
