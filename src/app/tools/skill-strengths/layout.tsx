// src/app/tools/skill-strengths/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "اختبار اكتشاف نقاط قوّتك — Skill Strengths Quiz",
  description:
    "اختبار سريع 10 أسئلة لاكتشاف نقاط قوّتك الأكاديمية. للطلاب المتوسط والثانوي. نتائج فورية مع اقتراح مسارات.",
  path: "/tools/skill-strengths",
  keywords: ["اختبار نقاط القوة", "اكتشاف الموهبة", "Skill quiz", "اختيار التخصص"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
