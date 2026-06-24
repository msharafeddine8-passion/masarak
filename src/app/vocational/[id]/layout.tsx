import type { Metadata } from "next";
import { fetchTrackById } from "@/lib/entities";
import { buildTrackMetadata } from "@/lib/seo-detail";

export const revalidate = 86400;

export async function generateMetadata(
  { params }: { params: { id: string } }
): Promise<Metadata> {
  const id = String(params?.id || "");
  if (!id) return { title: "المسار غير موجود — مسارك" };
  try {
    const track = await fetchTrackById(id);
    if (!track) return { title: "المسار غير موجود — مسارك" };
    return buildTrackMetadata(track);
  } catch {
    return { title: "مسارك — التعليم المهني والتقني" };
  }
}

export default function VocationalTrackLayout(
  { children }: { children: React.ReactNode }
) {
  return children;
}
