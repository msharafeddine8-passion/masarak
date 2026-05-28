import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "للأهل — تابعوا مستقبل ابنكم خطوة بخطوة",
  description:
    "حساب أهل مجاني على مسارك. تابعوا تقدّم ابنكم بـ Career DNA، الجامعات اللي يفكر فيها، المنح الدراسية المتاحة، والمواعيد المهمة — بدون ما تضطروا تطلبوا منو.",
  path: "/for-parents",
  keywords: ["مسارك للأهل", "متابعة الأبناء", "مستقبل ابني", "اختيار جامعة لبنان", "منح للطلاب"],
});

export default function ForParentsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
