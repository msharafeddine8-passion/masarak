import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "أسئلة شائعة — مسارك",
  description:
    "كل الأسئلة الشائعة عن مسارك، حسابات الطلاب والأهل، التسجيل، اختبار Career DNA، المنح الدراسية، والخصوصية.",
  path: "/faq",
  keywords: ["أسئلة شائعة", "مساعدة مسارك", "FAQ"],
});

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  return children;
}
