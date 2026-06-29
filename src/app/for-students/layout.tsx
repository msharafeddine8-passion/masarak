import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "للطلاب — كل أدواتك بمكان واحد",
  description:
    "Career DNA، اختبارات يومية، CV احترافي، مئات الجامعات العربية، منح دراسية، تدريبات صيفية، ومسارات مهنية. كل شي بالعربي ومجاناً للطلاب العرب.",
  path: "/for-students",
  keywords: ["مسارك للطلاب", "أدوات الطلاب", "Career DNA", "بناء CV", "منح دراسية", "طلاب العالم العربي"],
});

export default function ForStudentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
