import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";
import { getServiceClient, getAnonClient, serviceUnavailable } from "@/lib/supabase-admin";

// GET /api/university-reviews?slug=aub  — public, no auth required
export async function GET(req: NextRequest) {
  const slug = new URL(req.url).searchParams.get("slug");
  if (!slug) return NextResponse.json({ error: "Missing slug" }, { status: 400 });

  const anonSupabase = getAnonClient();
  if (!anonSupabase) return serviceUnavailable();

  const { data, error } = await anonSupabase
    .from("university_reviews")
    .select("id, rating, comment, major, year, created_at, profiles(full_name)")
    .eq("university_slug", slug)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ reviews: data || [] });
}

// POST /api/university-reviews  { slug, rating, comment, major, year }
// userId is taken from the session — NOT from the request body
export async function POST(req: NextRequest) {
  // Resolve authenticated user
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const userId = session.user.id;

  // Rate limit review submissions (anti-spam): 5 / 5 min per user.
  const rl = await checkRateLimit("form", `rev:${userId}`);
  if (!rl.success) return rateLimitResponse(rl);

  const { slug, rating, comment, major, year } = await req.json();

  if (!slug || !rating)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  if (rating < 1 || rating > 5)
    return NextResponse.json({ error: "Rating must be 1-5" }, { status: 400 });

  const serviceSupabase = getServiceClient();
  if (!serviceSupabase) return serviceUnavailable();

  // One review per user per university
  const { data: existing } = await serviceSupabase
    .from("university_reviews")
    .select("id")
    .eq("university_slug", slug)
    .eq("user_id", userId)
    .maybeSingle();

  if (existing) {
    const { error } = await serviceSupabase
      .from("university_reviews")
      .update({ rating, comment, major, year, updated_at: new Date().toISOString() })
      .eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ success: true, updated: true });
  }

  const { error } = await serviceSupabase.from("university_reviews").insert({
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
