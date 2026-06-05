import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "تسجيل الدخول | مسارك",
  description: "سجّل دخولك لمسارك وتابع رحلتك التعليمية. ادخل بـ Google أو بالبريد.",
  path: "/auth/login",
});
export default function L({ children }: { children: React.ReactNode }) { return children; }
