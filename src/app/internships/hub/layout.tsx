// src/app/internships/hub/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "فرص تدريب صيفي 2026 في لبنان — مدفوعة وحقيقية",
  description:
    "تدريب صيفي مدفوع في أفضل الشركات اللبنانية. ابني CV احترافي قبل التخرج، اكسب خبرة عملية، وافتح أبواب الوظائف الحقيقية.",
  path: "/internships/hub",
  keywords: [
    "تدريب صيفي لبنان",
    "تدريب مدفوع",
    "internship Beirut",
    "تدريب طلاب لبنان",
    "وظائف للطلاب",
    "فرص عمل أولى",
  ],
});

export default function InternshipsHubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
