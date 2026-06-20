// src/app/courses/page.tsx
import { buildMetadata } from "@/lib/seo";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata = buildMetadata({
  title: "كورسات مسارك — قريباً",
  description: "كورسات قصيرة بالعربية للطلاب اللبنانيين: مهارات، CV، interviews، وأكثر.",
  path: "/courses",
  noIndex: true, // coming-soon stub
});

export default function CoursesPage() {
  return (
    <ComingSoonPage
      emoji="📚"
      title="كورسات مسارك"
      description="قريباً: كورسات قصيرة (15-30 دقيقة) بالعربية لمهارات الطلاب الأكثر طلباً."
      features={[
        "كيف تكتب CV احترافي (3 وحدات)",
        "أساسيات Excel للمحاسبة والتحليل",
        "أساسيات الـ Marketing الرقمي",
        "كيف تفوّق في مقابلة العمل",
        "إدارة الوقت للطلاب",
        "كل كورس بشهادة قابلة للمشاركة على LinkedIn",
      ]}
      expected="2027 Q1"
      storageKey="masarak_alerts_courses"
    />
  );
}
