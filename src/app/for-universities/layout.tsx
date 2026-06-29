import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "للجامعات — كن أمام آلاف الطلاب العرب",
  description:
    "اطلب صفحة موثّقة لجامعتك على مسارك. أعلن عن منحك، فعالياتك، إعلاناتك، وتفاصيل التقديم — وادخل عَ شبكة كل طالب يخطط لمستقبله في العالم العربي.",
  path: "/for-universities",
  keywords: ["مسارك للجامعات", "تسجيل جامعة", "موثّقة", "صفحة جامعة", "جامعات عربية"],
});

export default function ForUniversitiesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
