// src/app/tools/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "أدوات مسارك — Career Tools للطلاب اللبنانيين",
  description:
    "مجموعة أدوات تفاعلية: AI Career Advisor، CV Builder، حاسبة تكلفة الجامعة، معادلة البكالوريا، متتبع الطلبات.",
  path: "/tools",
  keywords: ["أدوات الطلاب", "حاسبات تعليمية", "CV Builder عربي", "أدوات مهنية"],
});

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
