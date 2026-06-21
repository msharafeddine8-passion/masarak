// src/app/for-universities/page.tsx
// Server component — preserves SEO metadata. Visual content in ForUniversitiesClient.tsx.
// When ?partnership=1, show the partnership lead form (university accounts cannot self-register).

import { buildMetadata } from "@/lib/seo";
import ForUniversitiesClient from "./ForUniversitiesClient";
import PartnershipForm from "@/components/PartnershipForm";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "للجامعات — مسارك يجلبلك أفضل المرشّحين",
  description: "حلول B2B للجامعات: lead generation، تواجد بدليلنا، إعلانات منح، وتقارير سوق. اربط نفسك بالطلاب اللي يبحثون عنك.",
  path: "/for-universities",
  keywords: ["شراكات الجامعات", "تسويق جامعي", "lead generation للجامعات", "B2B تعليم"],
});

export default function ForUniversitiesPage({
  searchParams,
}: {
  searchParams: { partnership?: string };
}) {
  if (searchParams?.partnership === "1") {
    return (
      <main className="min-h-screen bg-bg py-12 px-4" dir="rtl">
        <div className="container mx-auto max-w-2xl">
          <Link href="/for-universities" className="text-sm text-ink-subtle hover:text-blue-700 mb-4 inline-block">
            ← العودة للمزايا
          </Link>
          <PartnershipForm orgType="university" />
        </div>
      </main>
    );
  }
  return <ForUniversitiesClient />;
}
