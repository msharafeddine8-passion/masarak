import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "خريطة الجامعات اللبنانية — مسارك",
  description: "خريطة تفاعلية لكل الجامعات اللبنانية. اعرف موقع كل جامعة، رسومها التقريبية، ورابط لصفحتها التفصيلية.",
  path: "/universities/map",
});

export default function MapLayout({ children }: { children: React.ReactNode }) {
  return children;
}
