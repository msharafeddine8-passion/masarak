// src/app/universities/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "دليل الجامعات اللبنانية 2026 — مقارنة، رسوم، تخصصات",
  description:
    "قارن بين الجامعات اللبنانية: AUB، LAU، USJ، USEK، LIU، الجامعة اللبنانية. الرسوم، التخصصات، شروط القبول، ومعدلات التوظيف — كل المعلومات في مكان واحد.",
  path: "/universities",
  keywords: [
    "جامعات لبنان",
    "أفضل جامعة في لبنان",
    "AUB",
    "LAU",
    "USJ",
    "USEK",
    "LIU",
    "الجامعة اللبنانية",
    "رسوم الجامعات اللبنانية",
    "مقارنة جامعات لبنان",
    "قبول جامعات لبنان",
    "BAC لبناني",
  ],
});

export default function UniversitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
