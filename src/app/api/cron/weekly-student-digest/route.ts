/**
 * POST /api/cron/weekly-student-digest
 * Vercel Cron — Sundays 08:00 UTC (11:00 Beirut).
 * The "Sunday report" (growth strategy M1): drops one in-app notification per
 * student who was active in the last 7 days, summarizing their week (quizzes
 * played, XP earned) + how many new scholarships were added — a reason to open
 * the dashboard at the start of every week.
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "edge";
export const dynamic = "force-dynamic";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabaseAdmin = getSupabaseAdmin();
  if (!supabaseAdmin) {
    return NextResponse.json({ error: "Service role not configured" }, { status: 503 });
  }

  try {
    const weekAgo = new Date(Date.now() - 7 * 86400000);
    const weekAgoDate = weekAgo.toISOString().slice(0, 10);

    // This week's completed daily-quiz sessions → per-user aggregates.
    const { data: sessions, error: sErr } = await supabaseAdmin
      .from("quiz_daily_sessions")
      .select("user_id, xp_earned")
      .gte("quiz_date", weekAgoDate)
      .not("completed_at", "is", null)
      .limit(20000);
    if (sErr) throw sErr;
    if (!sessions?.length) return NextResponse.json({ ok: true, message: "No active students this week", sent: 0 });

    const byUser = new Map<string, { plays: number; xp: number }>();
    for (const r of sessions as { user_id: string; xp_earned: number | null }[]) {
      const cur = byUser.get(r.user_id) || { plays: 0, xp: 0 };
      cur.plays += 1;
      cur.xp += r.xp_earned || 0;
      byUser.set(r.user_id, cur);
    }

    // New scholarships this week (nice-to-know hook in the digest).
    const { count: newSchols } = await supabaseAdmin
      .from("scholarships")
      .select("id", { count: "exact", head: true })
      .eq("active", true)
      .gte("created_at", weekAgo.toISOString());

    const scholLine = newSchols && newSchols > 0 ? ` و${newSchols} منحة جديدة نزلت عالمنصة 🏆` : "";
    const notifications = Array.from(byUser.entries()).map(([user_id, v]) => ({
      user_id,
      type: "weekly_digest",
      title: "📊 تقريرك الأسبوعي جاهز",
      body: `هالأسبوع لعبت ${v.plays} ${v.plays === 1 ? "اختبار" : "اختبارات"} وكسبت ${v.xp} XP${scholLine} — كمّل عالسلسلة 🔥`,
      link: "/dashboard",
      severity: "info",
      channel: "in_app",
    }));

    const { error: nErr } = await supabaseAdmin.from("notifications").insert(notifications);
    if (nErr) throw nErr;

    return NextResponse.json({ ok: true, sent: notifications.length, new_scholarships: newSchols ?? 0 });
  } catch (err) {
    console.error("[cron/weekly-student-digest]", err);
    return NextResponse.json({ error: "Internal server error", detail: String(err) }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, cron: "weekly-student-digest" });
}
