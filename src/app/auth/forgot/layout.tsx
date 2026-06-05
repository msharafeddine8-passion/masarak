import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "نسيت كلمة المرور | مسارك",
  description: "أعد تعيين كلمة مرورك بـ خطوة واحدة. أدخل بريدك ونرسلك رابط الإعادة.",
  path: "/auth/forgot",
});
export default function L({ children }: { children: React.ReactNode }) { return children; }
