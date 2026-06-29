// src/app/careers/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "المسارات المهنية — رواتب، مهارات، خارطة طريق لكل مهنة",
  description:
    "مسارات مهنية مفصّلة: مهندس برمجيات، طبيب، عالم بيانات، مصمم. الرواتب الحقيقية في العالم العربي والخليج، المهارات المطلوبة، وخارطة طريق كاملة.",
  path: "/careers",
  keywords: [
    "مسارات مهنية",
    "مهن مطلوبة لبنان",
    "رواتب لبنان 2026",
    "مهندس برمجيات لبنان",
    "عالم بيانات راتب",
    "مهن المستقبل",
    "سوق العمل لبنان",
  ],
});

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
