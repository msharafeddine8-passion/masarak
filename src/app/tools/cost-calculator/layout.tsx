// src/app/tools/cost-calculator/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "حاسبة تكلفة الجامعة في لبنان — Cost Calculator",
  description:
    "احسب التكلفة الإجمالية لدراستك الجامعية: الرسوم، الكتب، السكن، المواصلات. قارن بين الجامعات اللبنانية وخطّط لمستقبلك مالياً.",
  path: "/tools/cost-calculator",
  keywords: [
    "حاسبة تكلفة الجامعة",
    "تكلفة الدراسة في لبنان",
    "رسوم الجامعات اللبنانية",
    "ميزانية طالب",
    "تكلفة الجامعة AUB",
    "كلفة دراسة LAU",
  ],
});

export default function CostCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
