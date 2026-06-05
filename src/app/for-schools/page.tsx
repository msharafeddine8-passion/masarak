// src/app/for-schools/page.tsx
// Server component — preserves SEO metadata. Visual content in ForSchoolsClient.tsx.
// When ?partnership=1, show the partnership lead form (school accounts cannot self-register).

import { buildMetadata } from "@/lib/seo";
import ForSchoolsClient from "./ForSchoolsClient";
import PartnershipForm from "@/components/PartnershipForm";
import Link from "next/link";

export const metadata = buildMetadata({
  title: "للمدارس — مسارك شريكك بتوجيه طلابك",
  description: "حلول مسارك للمدارس اللبنانية: dashboard لمتابعة الطلاب، تقارير، ومحتوى توجيه. شراكات تعزّز إرشادك المهني.",
  path: "/for-schools",
  keywords: ["شراكات المدارس", "حلول B2B تعليمية", "إرشاد مهني للمدارس"],
});

export default function ForSchoolsPage({
  searchParams,
}: {
  searchParams: { partnership?: string };
}) {
  if (searchParams?.partnership === "1") {
    return (
      <main className="min-h-screen bg-bg py-12 px-4" dir="rtl">
        <div className="container mx-auto max-w-2xl">
          <Link href="/for-schools" className="text-sm text-gray-500 hover:text-blue-700 mb-4 inline-block">
            ← العودة للمزايا
          </Link>
          <PartnershipForm orgType="school" />
        </div>
      </main>
    );
  }
  return <ForSchoolsClient />;
}
