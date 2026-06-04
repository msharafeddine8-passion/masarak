import type { Metadata } from "next";
import { fetchSchoolById } from "@/lib/entities";
import { buildSchoolMetadata } from "@/lib/seo-detail";

export const revalidate = 3600;

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

export default function SchoolDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
