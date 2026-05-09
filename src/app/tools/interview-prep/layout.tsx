// src/app/tools/interview-prep/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "تدريب المقابلات — Mock Interview Practice",
  description:
    "تدرّب على أسئلة المقابلات الشائعة. نصائح، توقيت، وأنواع متعددة (سلوكية، تقنية، شخصية).",
  path: "/tools/interview-prep",
  keywords: ["تدريب مقابلة", "أسئلة مقابلة عمل", "Mock Interview", "interview tips"],
});

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
