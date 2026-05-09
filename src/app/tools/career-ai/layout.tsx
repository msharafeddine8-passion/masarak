// src/app/tools/career-ai/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "مستشار مهني ذكي — AI Career Advisor للطلاب اللبنانيين",
  description:
    "استشر مساعدنا الذكي عن التخصصات، الجامعات، المنح، وسوق العمل اللبناني. ردود فورية مخصصة لك بالعربية.",
  path: "/tools/career-ai",
  keywords: [
    "AI career advisor",
    "مستشار مهني ذكاء اصطناعي",
    "توجيه مهني AI",
    "مستشار طلاب",
  ],
});

export default function CareerAILayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
