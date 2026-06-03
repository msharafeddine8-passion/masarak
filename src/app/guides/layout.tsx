// Per Jun-3 audit: /guides was inheriting the default homepage <title>.
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "أدلّة الطالب اللبناني — قبول، منح، تخصصات | مسارك",
  description:
    "أدلّة مكثّفة للطالب اللبناني وأهله: شرح خطوات القبول الجامعي، نموذج معادلة البكالوريا، اختيار التخصص، التحضير للـ SAT و TOEFL، والمنح المتاحة. كل دليل خطوة بخطوة.",
  path: "/guides",
  keywords: [
    "دليل الطالب",
    "القبول الجامعي لبنان",
    "كيف أختار تخصصي",
    "معادلة البكالوريا",
    "SAT TOEFL لبنان",
    "أدلة تعليمية",
    "نصائح للطلاب",
  ],
});

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
