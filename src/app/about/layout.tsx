import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "عن مسارك — منصة الطلاب الأولى في لبنان",
  description:
    "مسارك منصة عربية لخدمة الطلاب اللبنانيين في اختيار الجامعات والتخصصات والمنح الدراسية. مجانية تماماً، مبنية بالحب في لبنان.",
  path: "/about",
  keywords: ["عن مسارك", "من نحن", "منصة الطلاب", "مسارك لبنان"],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
