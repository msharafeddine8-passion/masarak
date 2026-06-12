import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "قاموس المصطلحات الجامعية — مسارك",
  description: "تعرّف على ٣٠ مصطلح أساسي بالعربية: GPA, Credit Hour, IELTS, Major, Minor, Scholarship وأكتر. شرح بسيط ومثال لكل مصطلح.",
  path: "/glossary",
  keywords: ["مصطلحات جامعية", "قاموس", "GPA", "IELTS", "TOEFL", "ساعة معتمدة", "BAC لبنان"],
});

export default function GlossaryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
