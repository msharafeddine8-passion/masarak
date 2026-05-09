// src/app/tools/cv-builder/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "CV Builder — اصنع سيرتك الذاتية احترافية بالعربي والإنجليزي",
  description:
    "قوالب احترافية للـ CV. AI يحسّن نصوصك. Export PDF بضغطة. خاص للطلاب اللبنانيين.",
  path: "/tools/cv-builder",
  keywords: [
    "CV builder عربي",
    "سيرة ذاتية مجانية",
    "CV templates",
    "resume builder Lebanon",
    "بناء CV طلاب",
  ],
});

export default function CVBuilderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
