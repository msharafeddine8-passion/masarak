import { buildMetadata } from "@/lib/seo";
export const metadata = buildMetadata({
  title: "تسجيل ولي أمر | مسارك",
  description: "أنشئ حسابك كولي أمر وتابع مسيرة ابنك/ابنتك على مسارك. مطلوب كود ولي الأمر من حساب الطالب.",
  path: "/auth/parent-signup",
});
export default function L({ children }: { children: React.ReactNode }) { return children; }
