import { buildMetadata } from "@/lib/seo";
import TeamClient from "./TeamClient";

export const metadata = buildMetadata({
  title: "الفريق — مسارك",
  description: "تعرّف على فريق مسارك، المنصة اللبنانية للتوجيه الجامعي والمهني. مشروع من مشاريع جمعية تكافل.",
  path: "/team",
});

export default function TeamPage() {
  return <TeamClient />;
}
