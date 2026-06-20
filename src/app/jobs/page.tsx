// src/app/jobs/page.tsx
import { buildMetadata } from "@/lib/seo";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata = buildMetadata({
  title: "وظائف الخرّيجين — قريباً",
  description: "بنك وظائف للخرّيجين اللبنانيين. وظائف entry-level وفرص عمل عن بعد.",
  path: "/jobs",
  noIndex: true, // coming-soon stub
});

export default function JobsPage() {
  return (
    <ComingSoonPage
      emoji="💼"
      title="بنك الوظائف"
      description="قريباً: منصة الوظائف الأولى للخرّيجين اللبنانيين. وظائف entry-level، خبرة قليلة، وفرص remote."
      features={[
        "وظائف Entry-level مخصّصة للخرّيجين",
        "فلترة بالتخصص والمدينة والراتب",
        "Remote jobs من شركات دولية",
        "Application Tracker متكامل",
        "Salary insights لكل وظيفة",
        "Notifications يومية بالوظائف الجديدة",
      ]}
      expected="Q4 2026"
      storageKey="masarak_alerts_jobs"
    />
  );
}
