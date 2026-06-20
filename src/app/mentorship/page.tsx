// src/app/mentorship/page.tsx
import { buildMetadata } from "@/lib/seo";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata = buildMetadata({
  title: "برنامج الإرشاد المهني — قريباً",
  description: "احصل على mentor شخصي من خرّيجين لبنانيين ناجحين. توجيه 1-on-1 مع خبراء بمجالك.",
  path: "/mentorship",
  noIndex: true, // coming-soon stub
});

export default function MentorshipPage() {
  return (
    <ComingSoonPage
      emoji="🤝"
      title="Mentorship Program"
      description="قريباً: ربط الطلاب بخرّيجين لبنانيين ناجحين بكل المجالات للحصول على إرشاد شخصي."
      features={[
        "Mentor matching حسب التخصص والاهتمامات",
        "جلسات 1-on-1 شهرية (30 دقيقة)",
        "نصائح مهنية، CV review، interview prep",
        "Mentors من Google, AUB, AUH, شركات لبنانية رائدة",
        "مجاني للطلاب — مدفوع للـ premium support",
        "جلسات إرشاد جماعية شهرية",
      ]}
      expected="Q4 2026"
      storageKey="masarak_alerts_mentorship"
    />
  );
}
