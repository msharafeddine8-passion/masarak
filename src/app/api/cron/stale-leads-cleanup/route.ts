/**
 * POST /api/cron/stale-leads-cleanup
 * Vercel Cron: يُشغَّل كل يوم الجمعة الساعة 2 صباحاً UTC
 * يُنظّف الـ leads الخاملة (لا تفاعل منذ 90 يوماً) ويُحدّث حالتها إلى "stale".
 *
 * vercel.json config:
 * {
 *   "crons": [{ "path": "/api/cron/stale-leads-cleanup", "schedule": "0 2 * * 5" }]
 * }
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Service-role client — built LAZILY inside the handler (not at module scope) so a
// missing env var can never throw at import/build time; the request fails closed 503.
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const runtime = "edge";
export const dynamic = "force-dynamic";

// Leads older than this with no recent activity → marked stale
const STALE_DAYS = 90;
// Leads older than this with status=stale → hard deleted
const DELETE_DAYS = 180;

export async function POST(req: Request) {
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
    const staleThreshold  = new Date(now.getTime() - STALE_DAYS  * 24 * 60 * 60 * 1000);
    const deleteThreshold = new Date(now.getTime() - DELETE_DAYS * 24 * 60 * 60 * 1000);

    // 1. Mark stale: leads with no interaction for 90+ days, status != 'converted' | 'stale'
    const { data: markedStale, error: staleErr } = await supabaseAdmin
      .from("org_leads")
      .update({ status: "stale" })
      .lt("last_interaction_at", staleThreshold.toISOString())
      .not("status", "in", '("converted","stale","archived")')
      .select("id");

    if (staleErr) {
      console.error("[cron/stale-leads-cleanup] mark stale error:", staleErr);
      // Continue to deletion step even if update failed
    }

    // 2. Hard delete: leads that have been stale for 180+ days
    const { data: deleted, error: deleteErr } = await supabaseAdmin
      .from("org_leads")
      .delete()
      .eq("status", "stale")
      .lt("last_interaction_at", deleteThreshold.toISOString())
      .select("id");

    if (deleteErr) {
      console.error("[cron/stale-leads-cleanup] delete error:", deleteErr);
    }

    // 3. Log audit entry
    try {
      await supabaseAdmin.from("cron_audit_log").insert({
        cron_name: "stale-leads-cleanup",
        ran_at: now.toISOString(),
        result: {
          marked_stale: markedStale?.length ?? 0,
          hard_deleted: deleted?.length ?? 0,
          stale_threshold_days: STALE_DAYS,
          delete_threshold_days: DELETE_DAYS,
        },
      });
    } catch {
      // audit table may not exist yet — silently skip
    }

    return NextResponse.json({
      ok: true,
      marked_stale: markedStale?.length ?? 0,
      hard_deleted: deleted?.length ?? 0,
      stale_threshold_days: STALE_DAYS,
      delete_threshold_days: DELETE_DAYS,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error("[cron/stale-leads-cleanup]", err);
    return NextResponse.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    cron: "stale-leads-cleanup",
    stale_threshold_days: STALE_DAYS,
    delete_threshold_days: DELETE_DAYS,
  });
}
