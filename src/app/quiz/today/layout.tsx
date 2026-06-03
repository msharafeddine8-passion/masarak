// Per Jun-3 audit: /quiz/today was inheriting the default homepage <title>.
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "اختبار اليوم — 5 أسئلة من المنهج اللبناني | مسارك",
  description:
    "تحدّى نفسك يومياً بـ 5 أسئلة من المنهج اللبناني (الرياضيات، العلوم، اللغة العربية). اجمع XP، حافظ على سلسلتك، وارتقِ بين طلاب مدرستك.",
  path: "/quiz/today",
  keywords: [
    "تحدي يومي",
    "اختبار البكالوريا",
    "أسئلة المنهج اللبناني",
    "تحدي طلاب",
    "مراجعة يومية",
    "اختبار بكالوريا 2026",
  ],
});

export default function QuizTodayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
