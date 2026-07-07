// Own metadata for /vocational/institute/[id]. The page is a client component,
// so without this it inherited RootLayout's homepage metadata (wrong canonical
// "/" + homepage title → treated as a homepage duplicate and dropped by Google).
import { createClient } from "@supabase/supabase-js";
import { buildMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: { id: string } }) {
  let name = "";
  const u = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const k = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (u && k) {
    try {
      const { data } = await createClient(u, k)
        .from("vocational_institutes").select("name").eq("id", params.id).maybeSingle();
      name = (data as { name?: string } | null)?.name || "";
    } catch { /* fall through to generic title */ }
  }
  const title = name ? `${name} — معهد مهني/تقني في لبنان | مسارك` : "معهد مهني/تقني في لبنان | مسارك";
  return buildMetadata({
    title,
    description: name
      ? `تعرّف على ${name}: التخصصات المهنية والتقنية، التواصل، والموقع. دليل التعليم المهني في لبنان عبر منصة مسارك.`
      : "دليل المعاهد المهنية والتقنية في لبنان: التخصصات، التواصل، والموقع، عبر منصة مسارك.",
    path: `/vocational/institute/${params.id}`,
    keywords: ["معهد مهني لبنان", "التعليم المهني", "التعليم التقني", name].filter(Boolean) as string[],
  });
}

export default function InstituteLayout({ children }: { children: React.ReactNode }) {
  return children;
}
