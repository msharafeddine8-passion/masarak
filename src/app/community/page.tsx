// src/app/community/page.tsx — Communities directory (social Phase 4).
import { buildMetadata } from "@/lib/seo";
import CommunityListClient from "./CommunityListClient";

export const metadata = buildMetadata({
  title: "مجتمع مسارك — مجتمعات الطلاب",
  description: "انضم لمجتمعات الطلاب حسب التخصص والوجهة والاهتمام. شارك، اسأل، وتعلّم من طلاب مثلك في العالم العربي.",
  path: "/community",
  keywords: ["مجتمع طلاب", "نقاشات طلابية", "منتدى طلاب", "مجتمعات دراسية"],
});

export default function CommunityPage() {
  return <CommunityListClient />;
}
