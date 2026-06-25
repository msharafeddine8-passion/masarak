/**
 * POST /api/cron/weekly-org-digest
 * Vercel Cron: يُشغَّل كل اثنين الساعة 9 صباحاً UTC
 * يُنشئ موجزاً أسبوعياً لكل مؤسسة عن نشاط الـ leads الخاصة بها.
 *
 * vercel.json config:
 * {
 *   "crons": [{ "path": "/api/cron/weekly-org-digest", "schedule": "0 9 * * 1" }]
 * }
 */
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export const runtime = "edge";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  // Fail closed: reject if CRON_SECRET is unset (else "Bearer undefined" would pass).
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get org_leads activity in the last 7 days, grouped by org
    const { data: recentLeads, error: leadsErr } = await supabaseAdmin
      .from("org_leads")
      .select("org_id, student_id, source, score, status, first_interaction_at, last_interaction_at")
      .gte("last_interaction_at", weekAgo.toISOString());

    if (leadsErr) throw leadsErr;

    if (!recentLeads?.length) {
      return NextResponse.json({ ok: true, message: "No lead activity this week", orgs_processed: 0 });
    }

    // Group by org_id
    const orgMap = new Map<string, typeof recentLeads>();
    for (const lead of recentLeads) {
      if (!orgMap.has(lead.org_id)) orgMap.set(lead.org_id, []);
      orgMap.get(lead.org_id)!.push(lead);
    }

    // Get the admin user IDs for each org
    const orgIds = Array.from(orgMap.keys());
    const { data: orgAdmins } = await supabaseAdmin
      .from("org_members")
      .select("org_id, user_id, role")
      .in("org_id", orgIds)
      .in("role", ["admin", "owner"]);

    // Build weekly digest notifications for org admins
    const notifications: Array<{
      user_id: string;
      type: string;
      title: string;
      body: string;
      link: string;
      metadata: Record<string, unknown>;
      is_read: boolean;
    }> = [];

    for (const [orgId, leads] of orgMap.entries()) {
      const newLeads = leads.filter((l) => l.first_interaction_at >= weekAgo.toISOString()).length;
      const totalLeads = leads.length;
      const avgScore = leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length;

      const adminUsers = orgAdmins?.filter((a) => a.org_id === orgId) || [];
      for (const admin of adminUsers) {
        notifications.push({
          user_id: admin.user_id,
          type: "weekly_org_digest",
          title: "ملخص أسبوعي — نشاط ملفاتك على مسارك",
          body: `هذا الأسبوع: ${newLeads} طالب/ة جديد اهتم بمؤسستك، و${totalLeads} تفاعل إجمالاً. متوسط نقاط الاهتمام: ${Math.round(avgScore)}.`,
          link: `/org/dashboard/leads`,
          metadata: { org_id: orgId, new_leads: newLeads, total_leads: totalLeads, avg_score: Math.round(avgScore) },
          is_read: false,
        });
      }
    }

    if (notifications.length) {
      const { error: notifErr } = await supabaseAdmin
        .from("notifications")
        .insert(notifications);
      if (notifErr && notifErr.code !== "42P01") throw notifErr;
    }

    return NextResponse.json({
      ok: true,
      orgs_processed: orgMap.size,
      total_leads: recentLeads.length,
      notifications_sent: notifications.length,
      timestamp: now.toISOString(),
    });
  } catch (err) {
    console.error("[cron/weekly-org-digest]", err);
    return NextResponse.json(
      { error: "Internal server error", detail: String(err) },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({ ok: true, cron: "weekly-org-digest" });
}
