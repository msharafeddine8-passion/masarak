// src/app/vocational/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "التعليم التقني والمهني (TVET) في لبنان — LT، BT، TS",
  description:
    "مسارات التعليم التقني في لبنان: LT، BT، TS. الكهرباء، الميكانيك، تكنولوجيا المعلومات، الفندقة. رواتب العالم العربي والخليج، ومعادلة جامعية.",
  path: "/vocational",
  keywords: [
    "BT تقني لبنان",
    "LT لبنان",
    "TS لبنان",
    "تعليم مهني لبنان",
    "TVET Lebanon",
    "بكالوريا تقنية",
    "معادلة BT",
    "كهرباء لبنان شهادة",
  ],
});

export default function VocationalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
