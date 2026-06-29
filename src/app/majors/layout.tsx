// src/app/majors/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "دليل التخصصات الجامعية 2026 — رواتب، طلب، خارطة طريق",
  description:
    "دليل شامل للتخصصات الجامعية مع بيانات الطلب في السوق، الرواتب في العالم العربي والخليج، أفضل الجامعات لكل تخصص، ومسارات التطور المهني.",
  path: "/majors",
  keywords: [
    "تخصصات جامعية",
    "كيف أختار تخصصي",
    "تخصصات مطلوبة في لبنان",
    "رواتب التخصصات لبنان",
    "هندسة الحاسوب لبنان",
    "الطب لبنان",
    "إدارة أعمال",
    "تخصصات المستقبل",
  ],
});

export default function MajorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
