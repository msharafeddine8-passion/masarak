import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, rateLimitResponse } from "@/lib/ratelimit";

const SYSTEM_PROMPT = `You are Masarak AI, a friendly and knowledgeable career guidance assistant for students and recent graduates across the Arab world. You speak in a natural mix of Arabic and English, adapting to the student's own dialect (Levantine, Gulf, Egyptian, Maghrebi…) so you feel relatable.

Your expertise includes:
- Career path guidance for students across the Arab world
- University selection advice across the region (e.g. AUB, Cairo University, KFUPM, KAUST, Qatar University, UAEU, University of Jordan, and others — tailor to the student's country)
- CV and cover letter tips
- Job market insights across the Arab world and the wider MENA region
- Scholarship opportunities (local and international)
- Study abroad guidance
- Skills to develop for specific careers
- Internship and first job advice
- Remote work and freelancing opportunities for Arab youth

Tone: Warm, encouraging, practical. Use a natural spoken-Arabic tone and mirror the user's dialect. Keep responses focused and actionable — max 3-4 paragraphs. If someone asks a very specific question, be direct. Always end with a follow-up question or suggestion to keep the conversation helpful.

IMPORTANT: Only answer career, education, and professional development questions. For off-topic requests, gently redirect: "هيدا خارج مجالي، بس بقدر ساعدك بأي سؤال عن مسيرتك التعليمية أو المهنية!"`;

// «مرشدك» (growth strategy): build a per-student context block SERVER-SIDE from
// their own rows (route-handler client = user session, so RLS applies) + the
// onboarding answers in user_metadata. The client never supplies a system
// prompt. Best-effort: any failure returns '' and the mentor stays generic.
type SessionUser = { id: string; user_metadata?: Record<string, unknown> };
async function buildStudentContext(
  supabase: ReturnType<typeof createRouteHandlerClient>,
  user: SessionUser
): Promise<string> {
  try {
    const [{ data: sp }, { data: saved }] = await Promise.all([
      supabase.from("student_profiles")
        .select("full_name, grade_level, school_name, career_dna_result")
        .eq("user_id", user.id).maybeSingle(),
      supabase.from("saved_items").select("item_type, item_data").limit(8),
    ]);

    const wiz = (user.user_metadata?.profile ?? {}) as { grade?: string; track?: string; budget?: string };
    const lines: string[] = [];
    const name = (sp?.full_name as string | undefined)?.split(" ")[0];
    if (name) lines.push(`الاسم: ${name}`);
    if (sp?.grade_level || wiz.grade) lines.push(`الصف/المرحلة: ${sp?.grade_level || wiz.grade}`);
    if (wiz.track) lines.push(`الفرع/المسار: ${wiz.track}`);
    if (wiz.budget) lines.push(`الميزانية السنوية التقريبية: ${wiz.budget}`);
    if (sp?.school_name) lines.push(`المدرسة: ${sp.school_name}`);
    if (sp?.career_dna_result) lines.push(`نتيجة اختبار Career DNA: ${sp.career_dna_result}`);

    const savedNames = ((saved ?? []) as { item_type: string; item_data: Record<string, unknown> | null }[])
      .map(s => {
        const d = s.item_data || {};
        const n = (d.name || d.title || d.entityName) as string | undefined;
        return n ? `${n} (${s.item_type})` : null;
      })
      .filter(Boolean)
      .slice(0, 6);
    if (savedNames.length) lines.push(`محفوظاته على المنصة: ${savedNames.join("، ")}`);

    if (lines.length === 0) return "";
    return `\n\n--- STUDENT CONTEXT (from their Masarak profile — use it to personalize every answer; never recite it back as a list) ---\n${lines.join("\n")}\n--- END CONTEXT ---`;
  } catch {
    return "";
  }
}

// Lets the client show a graceful "coming soon" state instead of a chat that
// errors, while the Anthropic key isn't configured. Exposes only a boolean.
export async function GET() {
  return NextResponse.json({ ok: true, configured: !!process.env.ANTHROPIC_API_KEY });
}

export async function POST(req: NextRequest) {
  // ─── Auth gate ────────────────────────────────────────────────────
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // ─── Rate limit (10/min per user) — expensive endpoint ───────────
  const rl = await checkRateLimit("ai", `u:${session.user.id}`);
  if (!rl.success) return rateLimitResponse(rl);
  // ─────────────────────────────────────────────────────────────────

  const { messages } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "AI not configured — add ANTHROPIC_API_KEY to Vercel env vars" },
      { status: 503 }
    );
  }

  // Personalize with the student's own profile (server-side, RLS-scoped).
  const studentContext = await buildStudentContext(supabase, session.user as SessionUser);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 700,
      system: SYSTEM_PROMPT + studentContext,
      messages: messages.slice(-10), // keep last 10 messages for context
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Anthropic API error:", err);
    return NextResponse.json({ error: "AI API error" }, { status: 500 });
  }

  const data = await response.json();
  const text = data.content?.[0]?.text?.trim();

  if (!text) {
    return NextResponse.json({ error: "No response from AI" }, { status: 500 });
  }

  return NextResponse.json({ text });
}
