import type { Metadata } from "next";
import { fetchUniversityById } from "@/lib/entities";
import { buildUniversityMetadata } from "@/lib/seo-detail";

export const revalidate = 3600;

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

export default function UniversityDetailLayout({ children }: { children: React.ReactNode }) {
  return children;
}
