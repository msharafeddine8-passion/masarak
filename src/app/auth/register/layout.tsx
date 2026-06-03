// Per Jun-3 audit: /auth/register was inheriting the default homepage <title>.
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "تسجيل مجاني — ابدأ رحلتك مع مسارك",
  description:
    "أنشئ حسابك المجاني على مسارك في أقل من 30 ثانية. ادخل بـ Google أو بالبريد، استكشف 35 جامعة و60+ منحة، احصل على Career DNA، وابنِ سيرتك الذاتية.",
  path: "/auth/register",
  keywords: [
    "تسجيل مسارك",
    "حساب طالب",
    "منصة طلاب لبنان",
    "تسجيل مجاني",
    "دخول مسارك",
  ],
});

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
