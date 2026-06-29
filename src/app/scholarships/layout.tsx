// src/app/scholarships/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "منح دراسية في العالم العربي 2026 — منح عربية ودولية للطلاب",
  description:
    "اكتشف منح دراسية عربية ودولية: AUB، LAU، USJ، Hariri Foundation، DAAD. فلترة حسب معدلك وتخصصك وحاجتك المالية. تنبيهات بالمواعيد النهائية.",
  path: "/scholarships",
  keywords: [
    "منح دراسية لبنان",
    "منح AUB",
    "منح LAU",
    "منح USJ",
    "منح للطلاب اللبنانيين",
    "منحة الحريري",
    "منح خارج لبنان",
    "تمويل دراسة",
    "منح طلاب 2026",
  ],
});

export default function ScholarshipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
