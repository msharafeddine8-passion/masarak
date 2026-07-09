/**
 * POST /api/cron/daily-quiz-reminder
 * Vercel Cron — daily 13:00 UTC (16:00 Beirut).
 * Sends a web push ("protect your streak — today's quiz is ready") to every
 * subscribed browser whose user has NOT completed today's quiz. Dead
 * subscriptions (endpoint gone: 404/410) are deleted.
 *
 * Env: CRON_SECRET, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, [VAPID_SUBJECT]
 * Runtime: nodejs (web-push needs Node crypto — not edge-compatible).
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

type SubRow = { id: number; user_id: string; endpoint: string; p256dh: string; auth: string };

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const pub = process.env.VAPID_PUBLIC_KEY;
  const priv = process.env.VAPID_PRIVATE_KEY;
  if (!pub || !priv) {
    return NextResponse.json({ error: "VAPID keys not configured" }, { status: 503 });
  }
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }

  webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:support@masaraklb.com", pub, priv);

  try {
    const { data: subs, error: subErr } = await supabaseAdmin
      .from("web_push_subscriptions")
      .select("id, user_id, endpoint, p256dh, auth")
      .limit(5000);
    if (subErr) {
      // Table not applied yet → succeed quietly so the cron doesn't page anyone.
      if (subErr.code === "42P01") return NextResponse.json({ ok: true, message: "web_push_subscriptions not created yet", sent: 0 });
      throw subErr;
    }
    if (!subs?.length) return NextResponse.json({ ok: true, message: "No subscriptions", sent: 0 });

    // Who already completed today's quiz? (don't nag them)
    const today = new Date().toISOString().slice(0, 10);
    const { data: doneRows } = await supabaseAdmin
      .from("quiz_daily_sessions")
      .select("user_id")
      .eq("quiz_date", today)
      .not("completed_at", "is", null);
    const done = new Set((doneRows || []).map((r: { user_id: string }) => r.user_id));

    const targets = (subs as SubRow[]).filter(s => !done.has(s.user_id));
    const payload = JSON.stringify({
      title: "🔥 احمِ سلسلتك!",
      body: "اختبار اليوم جاهز — ٥ أسئلة وبس، وسلسلتك بتكمّل.",
      url: "/quiz/today",
      tag: "daily-quiz",
    });

    let sent = 0;
    const deadIds: number[] = [];
    await Promise.all(targets.map(async (s) => {
      try {
        await webpush.sendNotification(
          { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
          payload
        );
        sent++;
      } catch (e: unknown) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) deadIds.push(s.id); // subscription expired/unsubscribed
      }
    }));

    if (deadIds.length > 0) {
      await supabaseAdmin.from("web_push_subscriptions").delete().in("id", deadIds);
    }

    return NextResponse.json({
      ok: true,
      subscriptions: subs.length,
      skipped_done_today: subs.length - targets.length,
      sent,
      pruned_dead: deadIds.length,
    });
  } catch (err) {
    console.error("[cron/daily-quiz-reminder]", err);
    return NextResponse.json({ error: "Internal server error", detail: String(err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, cron: "daily-quiz-reminder" });
}
