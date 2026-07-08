// Vocational track — detail page (Server Component).
// Metadata is supplied by layout.tsx. This wrapper prebuilds the known tracks
// (generateStaticParams) and hands the interactive UI its data server-side so the
// full profile renders into the initial SSR HTML (the body was previously fetched
// client-side in useEffect, so crawlers only saw a ⏳ skeleton). The client island
// still refetches live DB data on mount.
import { TRACKS } from "@/app/vocational/data";
import VocationalTrackClient from "./VocationalTrackClient";

export function generateStaticParams() {
  return TRACKS.map((t) => ({ id: String(t.id) }));
}

export default function VocationalTrackPage({ params }: { params: { id: string } }) {
  const id = String(params.id);
  const initialTrack = TRACKS.find((t) => t.id === id) ?? null;
  return <VocationalTrackClient initialTrack={initialTrack} id={id} />;
}
