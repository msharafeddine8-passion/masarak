import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "نظام XP — كيف تكسب نقاط وتفتح ميزات | مسارك",
  description: "اكتشف كيف تكسب نقاط XP على مسارك: اختبار Career DNA، إكمال الـ CV، حفظ منح، ومتابعة streak يومي. وفتح قوالب CV حصرية وشارات.",
  path: "/xp",
});

export default function XPLayout({ children }: { children: React.ReactNode }) {
  return children;
}
