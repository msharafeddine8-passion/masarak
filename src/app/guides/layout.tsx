import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "أدلّة الطالب اللبناني — قبول، منح، تخصصات | مسارك",
  description: "أدلّة عملية للطلاب: القبول الجامعي، معادلة البكالوريا، اختيار التخصص، المنح.",
  path: "/guides",
});
export default function L({ children }: { children: React.ReactNode }) { return children; }
