// src/app/onboarding/layout.tsx
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "ابدأ مسارك — Onboarding",
  description: "أكمل 4 خطوات سريعة لنخصّص لك التجربة: الجامعات، المنح، والمسارات المهنية المناسبة لك.",
  path: "/onboarding",
  noIndex: true,
});

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
