import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "للمدارس — شراكة مسارك مع مدرستك",
  description:
    "صفحة مخصصة لمدرستك على مسارك تساعد طلابك يكتشفوا تخصصاتهم، يبنوا CV، ويوصلوا للجامعات والمنح المناسبة. مجاناً للمدارس اللبنانية.",
  path: "/for-schools",
  keywords: ["مسارك للمدارس", "شراكة مدارس", "توجيه طلاب الثانوية", "مدارس لبنان"],
});

export default function ForSchoolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
