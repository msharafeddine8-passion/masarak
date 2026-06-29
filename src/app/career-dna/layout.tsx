// src/app/career-dna/layout.tsx
// Metadata for /career-dna — used by WhatsApp, Twitter, Facebook, LinkedIn previews.
// Critical for the share button in the result page: every shared link shows a rich preview.
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Career DNA — اكتشف شخصيتك المهنية مجاناً",
  description:
    "اختبار Career DNA المبني على نموذج Holland RIASEC — 20 سؤال يكشف شخصيتك المهنية، أنسب التخصصات لك، وأقوى المسارات في سوق العمل. مجاناً بالعربي على مسارك.",
  path: "/career-dna",
  keywords: [
    "Career DNA",
    "اختبار الشخصية المهنية",
    "Holland RIASEC",
    "اختر تخصصك",
    "توجيه مهني",
    "اختبار توجيه دراسي",
    "تخصصات جامعية",
    "career test arabic",
  ],
});

export default function CareerDNALayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
