// Server component wrapping the interactive client.
// Per Jun-3 audit: detail pages were CSR with no unique <title> — biggest SEO win.
import type { Metadata } from "next";
import { fetchUniversityById } from "@/lib/entities";
import { buildUniversityMetadata, buildUniversityJsonLd } from "@/lib/seo-detail";
import UniversityDetailClient from "./UniversityDetailClient";

// Revalidate every hour — Vercel keeps the SSR page cached, then refreshes
// on next request after the window expires. Tuned for content that changes
// occasionally (admin edits, new universities) but doesn't need real-time.
export const revalidate = 3600;

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const id = Number(params?.id);
  if (!Number.isFinite(id) || id <= 0) {
    return { title: "الجامعة غير موجودة — مسارك" };
  }
  const uni = await fetchUniversityById(id);
  if (!uni) {
    return { title: "الجامعة غير موجودة — مسارك" };
  }
  return buildUniversityMetadata(uni);
}

export default async function UniversityDetailPage(
  { params }: { params: { id: string } }
) {
  const id = Number(params?.id);
  // Fetch once on the server so the JSON-LD payload reflects the real entity.
  // The client component re-fetches for interactive state — that's fine; this
  // is for SEO/initial paint only.
  const uni = Number.isFinite(id) && id > 0 ? await fetchUniversityById(id) : null;
  const jsonLd = uni ? buildUniversityJsonLd(uni) : null;
  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          // schema.org payload — safe because we control the object shape.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <UniversityDetailClient />
    </>
  );
}
