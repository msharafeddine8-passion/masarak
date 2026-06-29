import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "عن مسارك — منصة الطلاب الأولى في العالم العربي",
  description:
    "مسارك منصة عربية لخدمة الطلاب العرب في اختيار الجامعات والتخصصات والمنح الدراسية. مجانية تماماً، مبنية بالحب للعالم العربي.",
  path: "/about",
  keywords: ["عن مسارك", "من نحن", "منصة الطلاب", "مسارك العالم العربي"],
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
