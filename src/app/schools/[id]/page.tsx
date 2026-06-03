// Server component wrapping the interactive client.
// Per Jun-3 audit: detail pages were CSR with no unique <title> — biggest SEO win.
import type { Metadata } from "next";
import { fetchSchoolById } from "@/lib/entities";
import { buildSchoolMetadata, buildSchoolJsonLd } from "@/lib/seo-detail";
import SchoolDetailClient from "./SchoolDetailClient";

export const revalidate = 3600;

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const id = Number(params?.id);
  if (!Number.isFinite(id) || id <= 0) {
    return { title: "المدرسة غير موجودة — مسارك" };
  }
  const school = await fetchSchoolById(id);
  if (!school) {
    return { title: "المدرسة غير موجودة — مسارك" };
  }
  return buildSchoolMetadata(school);
}

export default async function SchoolDetailPage(
  { params }: { params: { id: string } }
) {
  const id = Number(params?.id);
  const school = Number.isFinite(id) && id > 0 ? await fetchSchoolById(id) : null;
  const jsonLd = school ? buildSchoolJsonLd(school) : null;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <SchoolDetailClient />
    </>
  );
}
