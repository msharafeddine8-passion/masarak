import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";

export const metadata: Metadata = buildMetadata({
  title: "تأكيد البريد الإلكتروني — مسارك",
  description: "افتحي بريدك واضغطي على رابط التأكيد لإكمال إنشاء حسابك.",
  path: "/auth/confirm-email",
});

export default function ConfirmEmailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
