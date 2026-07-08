// Universities — detail page (Server Component).
// Metadata + CollegeOrUniversity/Breadcrumb JSON-LD are supplied by layout.tsx.
// This wrapper only prebuilds the known universities (generateStaticParams) and
// hands the interactive UI its data server-side so the full profile renders into
// the initial SSR HTML (previously the body was fetched client-side in useEffect,
// so crawlers only saw a ⏳ skeleton). The client island still refetches live DB
// data on mount to reflect any org edits.
import { UNIVERSITIES } from "@/app/universities/data";
import UniversityDetailClient from "./UniversityDetailClient";

export function generateStaticParams() {
  return UNIVERSITIES.map((u) => ({ id: String(u.id) }));
}

export default function UniversityDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const initialUni = UNIVERSITIES.find((u) => u.id === id) ?? null;
  return <UniversityDetailClient initialUni={initialUni} id={id} />;
}
