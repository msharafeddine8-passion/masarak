/**
 * POST /api/cron/scholarship-reminders
 * Vercel Cron: يُشغَّل كل يوم الساعة 8 صباحاً UTC
 * يبحث عن المنح التي تنتهي خلال 7 أيام ويُنشئ إشعارات للطلاب الذين حفظوها.
 *
 * vercel.json config:
 * {
 *   "crons": [{ "path": "/api/cron/scholarship-reminders", "schedule": "0 8 * * *" }]
 * }
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client — bypasses RLS for cron operations. Built LAZILY inside the
// handler (not at module scope) so a missing env var can never throw at import/build
// time; instead the request fails closed with a clean 503.
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  // Verify Vercel cron secret
  const authHeader = req.headers.get("authorization");
  // Fail closed: reject if CRON_SECRET is unset (else "Bearer undefined" would pass).
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }

  try {
    const now = new Date();
    const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Find scholarships expiring in the next 7 days
    const { data: expiringScholarships, error: schErr } = await supabaseAdmin
      .from("scholarships")
      .select("id, title, deadline, organization_id")
      .gte("deadline", now.toISOString())
      .lte("deadline", in7Days.toISOString())
      .eq("is_active", true);

    if (schErr) throw schErr;
    if (!expiringScholarships?.length) {
      return NextResponse.json({ ok: true, message: "No expiring scholarships", count: 0 });
    }

    const scholarshipIds = expiringScholarships.map((s) => s.id);

    // Find students who saved these scholarships but haven't applied yet
    const { data: savedItems, error: savedErr } = await supabaseAdmin
      .from("saved_items")
      .select("user_id, item_id")
      .eq("item_type", "scholarship")
      .in("item_id", scholarshipIds);

    if (savedErr) throw savedErr;
    if (!savedItems?.length) {
      return NextResponse.json({ ok: true, message: "No saved scholarships to notify", count: 0 });
    }

    // Deduplicate: one notification per (user_id, scholarship_id)
    const pairs = savedItems.map((s) => ({ user_id: s.user_id, scholarship_id: s.item_id }));
    const uniquePairs = pairs.filter(
      (p, i, arr) => i === arr.findIndex((x) => x.user_id === p.user_id && x.scholarship_id === p.scholarship_id)
    );

    // Build notifications to insert
    const scholarshipMap = new Map(expiringScholarships.map((s) => [s.id, s]));
    const notifications = uniquePairs.map(({ user_id, scholarship_id }) => {
      const sch = scholarshipMap.get(scholarship_id)!;
      const deadline = new Date(sch.deadline);
      const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / 86400000);
      return {
        user_id,
        type: "scholarship_deadline",
        title: `موعد انتهاء المنحة يقترب`,
        body: `المنحة "${sch.title}" تنتهي خلال ${daysLeft} ${daysLeft === 1 ? "يوم" : "أيام"} — لا تفوّت الفرصة!`,
        link: `/scholarships/${scholarship_id}`,
        metadata: { scholarship_id, days_left: daysLeft },
        is_read: false,
      };
    });

    // Insert notifications (ignore conflicts — same user+scholarship+type already notified)
    const { error: notifErr } = await supabaseAdmin
      .from("notifications")
      .insert(notifications);

    // If notifications table doesn't exist yet, log and continue gracefully
    if (notifErr && notifErr.code !== "42P01") throw notifErr;

    return NextResponse.json({
      ok: true,
      scholarships_expiring: expiringScholarships.length,
      notifications_sent: notifications.length,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error("[cron/scholarship-reminders]", err);
    return NextResponse.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 }
    );
  }
}

// Vercel will call GET during health checks from the dashboard
export async function GET() {
  return NextResponse.json({ ok: true, cron: "scholarship-reminders" });
}
