import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "اختبار اليوم — 5 أسئلة من المنهج اللبناني | مسارك",
  description: "تحدّى نفسك يومياً بـ 5 أسئلة من المنهج اللبناني. اجمع XP وحافظ على سلسلتك.",
  path: "/quiz/today",
});
export default function L({ children }: { children: React.ReactNode }) { return children; }
