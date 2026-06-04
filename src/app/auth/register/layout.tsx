import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "تسجيل مجاني — ابدأ رحلتك مع مسارك",
  description: "أنشئ حسابك المجاني خلال 30 ثانية واكتشف الجامعات والمنح والـ Career DNA.",
  path: "/auth/register",
});
export default function L({ children }: { children: React.ReactNode }) { return children; }
