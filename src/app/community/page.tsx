// src/app/community/page.tsx
import { buildMetadata } from "@/lib/seo";
import ComingSoonPage from "@/components/ComingSoonPage";

export const metadata = buildMetadata({
  title: "مجتمع مسارك — قريباً",
  description: "تواصل مع طلاب بنفس اهتماماتك. شارك تجاربك واكتسب خبرات.",
  path: "/community",
  noIndex: true, // coming-soon stub
});

export default function CommunityPage() {
  return (
    <ComingSoonPage
      emoji="👥"
      title="مجتمع مسارك"
      description="قريباً: مساحة تواصل بين الطلاب لتبادل الخبرات والنصائح والدعم."
      features={[
        "Peer matching: تواصل مع طلاب نفس تخصصك",
        "Discussion boards حسب الجامعة والتخصص",
        "أسئلة وأجوبة مباشرة من خرّيجين",
        "تبادل ملاحظات الدراسة والمصادر",
        "Mentorship requests مع طلاب أكبر سناً",
        "Events ومسابقات شهرية",
      ]}
      expected="Q3 2026"
      storageKey="masarak_alerts_community"
    />
  );
}
