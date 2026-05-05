import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/university-reviews?slug=aub
export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const { data, error } = await supabase
    .from("university_reviews")
    .select("id, rating, comment, major, year, created_at, profiles(full_name)")
    .eq("university_slug", slug)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data || [] });
}

// POST /api/university-reviews  { slug, rating, comment, major, year, userId }
export async function POST(req: NextRequest) {
  const { slug, rating, comment, major, year, userId } = await req.json();

  if (!slug || !rating || !userId)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  if (rating < 1 || rating > 5)
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });

  // One review per user per university
  const { data: existing } = await supabase
    .from("university_reviews")
    .select("id")
    .eq("university_slug", slug)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    // Update existing
    const { error } = await supabase
      .from("university_reviews")
      .update({ rating, comment, major, year, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, updated: true });
  }

  const { error } = await supabase.from("university_reviews").insert({
    university_slug: slug,
    user_id:         userId,
    rating,
    comment:         comment || null,
    major:           major || null,
    year:            year || null,
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, updated: false });
}
