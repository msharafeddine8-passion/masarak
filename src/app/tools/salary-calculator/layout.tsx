// src/app/tools/salary-calculator/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "حاسبة الراتب المتوقّع — Salary Calculator العالم العربي والخليج",
  description:
    "احسب الراتب المتوقّع لوظيفتك الأولى في العالم العربي والخليج. مقارنة بالخبرة والتخصص + نصائح تفاوض.",
  path: "/tools/salary-calculator",
  keywords: ["راتب وظيفة", "Arab Salaries", "تفاوض راتب", "رواتب الخليج"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
