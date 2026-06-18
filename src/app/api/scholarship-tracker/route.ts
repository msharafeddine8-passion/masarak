import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client for actual DB operations (bypasses RLS for admin-level writes)
const serviceSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/** Resolve the authenticated user from the session cookie. Returns null if unauthenticated. */
async function getSessionUserId(): Promise<string | null> {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  return session?.user?.id ?? null;
}

// GET /api/scholarship-tracker
export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await serviceSupabase
    .from("scholarship_tracker")
    .select("*, scholarships(name, org, deadline, amount, emoji)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

// POST /api/scholarship-tracker  { scholarshipId, status, notes, appDeadline }
export async function POST(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { scholarshipId, status, notes, appDeadline } = await req.json();

  if (!scholarshipId || !status)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const { error } = await serviceSupabase.from("scholarship_tracker").upsert({
    user_id:        userId,
    scholarship_id: scholarshipId,
    status,
    notes:          notes || null,
    app_deadline:   appDeadline || null,
    updated_at:     new Date().toISOString(),
  }, { onConflict: "user_id,scholarship_id" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE /api/scholarship-tracker?scholarshipId=yyy
export async function DELETE(req: NextRequest) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const scholarshipId = new URL(req.url).searchParams.get("scholarshipId");

  if (!scholarshipId)
    return NextResponse.json({ error: "Missing scholarshipId param" }, { status: 400 });

  const { error } = await serviceSupabase
    .from("scholarship_tracker")
    .delete()
    .eq("user_id", userId)
    .eq("scholarship_id", scholarshipId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
