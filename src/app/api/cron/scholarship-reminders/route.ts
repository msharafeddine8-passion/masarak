/**
 * POST /api/cron/scholarship-reminders
 * Vercel Cron: يُشغَّل كل يوم الساعة 8 صباحاً UTC.
 * يبحث عن المنح التي تقترب مواعيدها النهائية ويُنشئ إشعارات للطلاب الذين حفظوها.
 *
 * FIX (growth M1): this cron was silently broken since day one — it queried
 * columns that don't exist (title / organization_id / is_active) and compared
 * `deadline` as an ISO date, while the real table is (name, org, active) with
 * Arabic-text deadlines like "15 أغسطس 2026". Rewritten against the real
 * schema: parse the Arabic month date, and notify savers at the 7 / 3 / 1
 * days-left thresholds (one ping per threshold — no daily spam), using the
 * notifications columns the rest of the platform writes (link/severity/channel).
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export const runtime = "edge";
export const dynamic = "force-dynamic";

// "15 أغسطس 2026" → days from today (null if unparseable).
function daysFromArabicDeadline(deadlineStr: string | null | undefined): number | null {
  if (!deadlineStr) return null;
  const months: Record<string, number> = {
    'يناير': 1, 'فبراير': 2, 'مارس': 3, 'أبريل': 4, 'مايو': 5, 'يونيو': 6,
    'يوليو': 7, 'أغسطس': 8, 'سبتمبر': 9, 'أكتوبر': 10, 'نوفمبر': 11, 'ديسمبر': 12,
  };
  const parts = String(deadlineStr).trim().split(/\s+/);
  if (parts.length < 3) return null;
  const day = parseInt(parts[0]);
  const month = months[parts[1]];
  const year = parseInt(parts[2]);
  if (!day || !month || !year) return null;
  const target = new Date(Date.UTC(year, month - 1, day));
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return Math.round((target.getTime() - todayUtc.getTime()) / 86400000);
}

const THRESHOLDS = new Set([7, 3, 1]);

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
    const { data: schols, error: schErr } = await supabaseAdmin
      .from("scholarships")
      .select("id, name, deadline")
      .eq("active", true)
      .limit(500);
    if (schErr) throw schErr;

    // Keep only scholarships sitting exactly on a reminder threshold today.
    const hits = (schols || [])
      .map((s: { id: number; name: string; deadline: string | null }) => ({ ...s, days: daysFromArabicDeadline(s.deadline) }))
      .filter((s): s is { id: number; name: string; deadline: string | null; days: number } =>
        s.days !== null && THRESHOLDS.has(s.days));
    if (hits.length === 0) {
      return NextResponse.json({ ok: true, message: "No scholarships at a reminder threshold today", notified: 0 });
    }

    // Students who saved them (saved_items.item_id is text).
    const ids = hits.map(h => String(h.id));
    const { data: saved, error: savedErr } = await supabaseAdmin
      .from("saved_items")
      .select("user_id, item_id")
      .eq("item_type", "scholarship")
      .in("item_id", ids);
    if (savedErr) throw savedErr;
    if (!saved?.length) {
      return NextResponse.json({ ok: true, message: "No savers to notify", scholarships_at_threshold: hits.length, notified: 0 });
    }

    const byId = new Map(hits.map(h => [String(h.id), h]));
    const seen = new Set<string>();
    const notifications: object[] = [];
    for (const row of saved as { user_id: string; item_id: string }[]) {
      const sch = byId.get(String(row.item_id));
      if (!sch) continue;
      const key = `${row.user_id}:${sch.id}`;
      if (seen.has(key)) continue;
      seen.add(key);
      notifications.push({
        user_id: row.user_id,
        type: "scholarship_deadline",
        title: sch.days === 1 ? "⏰ آخر يوم غداً!" : "⏳ الموعد النهائي يقترب",
        body: `منحة «${sch.name}» بتسكّر ${sch.days === 1 ? "بكرا" : `بعد ${sch.days} أيام`} — قدّم قبل ما يفوتك الموعد!`,
        link: `/scholarships/${sch.id}`,
        severity: sch.days === 1 ? "warning" : "info",
        channel: "in_app",
      });
    }

    if (notifications.length > 0) {
      const { error: nErr } = await supabaseAdmin.from("notifications").insert(notifications);
      if (nErr) throw nErr;
    }

    return NextResponse.json({
      ok: true,
      scholarships_at_threshold: hits.length,
      notified: notifications.length,
    });
  } catch (err) {
    console.error("[cron/scholarship-reminders]", err);
    return NextResponse.json({ error: "Internal server error", detail: String(err) }, { status: 500 });
  }
}

// Vercel will call GET during health checks from the dashboard
export async function GET() {
  return NextResponse.json({ ok: true, cron: "scholarship-reminders" });
}
