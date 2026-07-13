import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "اختبار اليوم — أسئلة تكيّفية بمختلف المواد والمهارات | مسارك",
  description: "تحدّى نفسك يومياً بأسئلة متنوّعة: مواد دراسية، ذكاء منطقي، ذاكرة وأنماط — تتطوّر مع مستواك. اجمع XP وحافظ على سلسلتك.",
  path: "/quiz/today",
});
export default function L({ children }: { children: React.ReactNode }) { return children; }
