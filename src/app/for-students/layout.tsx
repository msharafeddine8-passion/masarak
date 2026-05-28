import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "للطلاب — كل أدواتك بمكان واحد",
  description:
    "Career DNA، اختبارات يومية، CV احترافي، 35 جامعة لبنانية، 60+ منحة دراسية، تدريبات صيفية، ومسارات مهنية. كل شي بالعربي ومجاناً للطلاب اللبنانيين.",
  path: "/for-students",
  keywords: ["مسارك للطلاب", "أدوات الطلاب", "Career DNA", "بناء CV", "منح دراسية", "طلاب لبنان"],
});

export default function ForStudentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
