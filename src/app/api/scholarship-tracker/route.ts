import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// GET /api/scholarship-tracker?userId=xxx
export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) return NextResponse.json({ error: "Missing userId" }, { status: 400 });

  const { data, error } = await supabase
    .from("scholarship_tracker")
    .select("*, scholarships(name, org, deadline, amount, emoji)")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data || [] });
}

// POST /api/scholarship-tracker  { userId, scholarshipId, status, notes, appDeadline }
export async function POST(req: NextRequest) {
  const { userId, scholarshipId, status, notes, appDeadline } = await req.json();

  if (!userId || !scholarshipId || !status)
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });

  const { error } = await supabase.from("scholarship_tracker").upsert({
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

// DELETE /api/scholarship-tracker?userId=xxx&scholarshipId=yyy
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId        = searchParams.get("userId");
  const scholarshipId = searchParams.get("scholarshipId");

  if (!userId || !scholarshipId)
    return NextResponse.json({ error: "Missing params" }, { status: 400 });

  const { error } = await supabase
    .from("scholarship_tracker")
    .delete()
    .eq("user_id", userId)
    .eq("scholarship_id", scholarshipId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
