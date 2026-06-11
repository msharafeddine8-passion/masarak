import type { Metadata } from "next";
import { fetchUniversityById } from "@/lib/entities";
import { buildUniversityMetadata } from "@/lib/seo-detail";
import { CollegeOrUniversitySchema } from "@/components/StructuredData";
import Breadcrumbs from "@/components/Breadcrumbs";

export const revalidate = 86400;

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const id = Number(params?.id);
  if (!Number.isFinite(id) || id <= 0) return { title: "الجامعة غير موجودة — مسارك" };
  try {
    const uni = await fetchUniversityById(id);
    if (!uni) return { title: "الجامعة غير موجودة — مسارك" };
    return buildUniversityMetadata(uni);
  } catch {
    return { title: "مسارك — الجامعات" };
  }
}

export default async function UniversityDetailLayout(
  { children, params }: { children: React.ReactNode; params: { id: string } }
) {
  const id = Number(params?.id);
  let uni: any = null;
  if (Number.isFinite(id) && id > 0) {
    try { uni = await fetchUniversityById(id); } catch {}
  }

  return (
    <>
      {uni && (
        <CollegeOrUniversitySchema
          name={uni.name}
          short={uni.short}
          url={uni.url}
          address={uni.campus}
          region={uni.region}
          foundingDate={uni.founded}
          detailPath={`/universities/${uni.id}`}
          photo={uni.photo}
          description={uni.desc}
        />
      )}
      <div className="container mx-auto max-w-6xl px-4 pt-4">
        <Breadcrumbs
          items={[
            { label: "الرئيسية", href: "/" },
            { label: "الجامعات", href: "/universities" },
            { label: uni?.name || "تفاصيل" },
          ]}
        />
      </div>
      {children}
    </>
  );
}
