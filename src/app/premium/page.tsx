// src/app/premium/page.tsx
// Server component — preserves SEO metadata. Visual content in PremiumClient.tsx.

import { buildMetadata } from "@/lib/seo";
import PremiumClient from "./PremiumClient";

export const metadata = buildMetadata({
  title: "مسارك Premium — قريباً",
  description: "ميزات حصرية للطلاب الجادّين عن مستقبلهم. AI أعمق، تقارير شخصية، إرشاد بشري، وأكتر.",
  path: "/premium",
});

export default function PremiumPage() {
  return <PremiumClient />;
}
