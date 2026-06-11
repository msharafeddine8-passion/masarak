import type { Metadata } from "next";
import { fetchSchoolById } from "@/lib/entities";
import { buildSchoolMetadata } from "@/lib/seo-detail";
import Breadcrumbs from "@/components/Breadcrumbs";
import LastUpdated from "@/components/LastUpdated";

export const revalidate = 86400;

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const id = Number(params?.id);
  if (!Number.isFinite(id) || id <= 0) return { title: "المدرسة غير موجودة — مسارك" };
  try {
    const school = await fetchSchoolById(id);
    if (!school) return { title: "المدرسة غير موجودة — مسارك" };
    return buildSchoolMetadata(school);
  } catch {
    return { title: "مسارك — المدارس" };
  }
}

export default async function SchoolDetailLayout(
  { children, params }: { children: React.ReactNode; params: { id: string } }
) {
  const id = Number(params?.id);
  let school: any = null;
  if (Number.isFinite(id) && id > 0) {
    try { school = await fetchSchoolById(id); } catch {}
  }

  return (
    <>
      <div className="container mx-auto max-w-6xl px-4 pt-4">
        <Breadcrumbs
          items={[
            { label: "الرئيسية", href: "/" },
            { label: "المدارس", href: "/schools" },
            { label: school?.name || "تفاصيل" },
          ]}
        />
        {school && <LastUpdated date={school.updated_at} className="mb-3" />}
      </div>
      {children}
    </>
  );
}
