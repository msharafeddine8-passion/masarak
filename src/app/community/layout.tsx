import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "مجتمع مسارك — طلاب العرب بمكان واحد",
  description:
    "مجتمع الطلاب العرب: نقاشات، تجارب، أسئلة جامعية، تشارك معلومات عن المنح والتخصصات. مساحة آمنة وداعمة بالعربي.",
  path: "/community",
  keywords: ["مجتمع طلاب", "مسارك مجتمع", "نقاشات طلاب لبنان"],
});

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return children;
}
