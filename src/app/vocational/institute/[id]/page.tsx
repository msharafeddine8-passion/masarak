// Vocational institute — detail page (Server Component).
// Metadata is supplied by layout.tsx. This wrapper prebuilds the known institutes
// (generateStaticParams) and hands the interactive UI its data server-side so the
// full profile renders into the initial SSR HTML (the body was previously fetched
// client-side in useEffect, so crawlers only saw a ⏳ skeleton). The client island
// still refetches live DB data on mount.
import { INSTITUTES } from "@/app/vocational/data";
import InstituteDetailClient from "./InstituteDetailClient";

export function generateStaticParams() {
  return INSTITUTES.map((i) => ({ id: String(i.id) }));
}

export default function InstituteDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const initialInst = INSTITUTES.find((i) => i.id === id) ?? null;
  return <InstituteDetailClient initialInst={initialInst} id={id} />;
}
