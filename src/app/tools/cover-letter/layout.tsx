// src/app/tools/cover-letter/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "مولّد رسائل الدوافع — Cover Letter Generator",
  description:
    "أنشئ رسالة دوافع احترافية للمنح، التدريب، والوظائف. قوالب جاهزة بالعربي والإنجليزي.",
  path: "/tools/cover-letter",
  keywords: ["رسالة دوافع", "Cover Letter عربي", "motivation letter", "رسالة منحة"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
