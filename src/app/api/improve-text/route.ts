import { NextRequest, NextResponse } from "next/server";

const PROMPTS: Record<string, string> = {
  summary: `You are a professional CV writer. Improve the following professional summary to be more impactful, concise, and results-focused. Keep it 2-4 sentences. Use strong action language. Return only the improved text, nothing else.`,
  bullets: `You are a professional CV writer. Improve the following job experience bullets to be more impactful and results-focused. Start each bullet with a strong action verb. Include metrics where possible. Return each bullet on a new line. Return only the improved bullets, nothing else.`,
  project: `You are a professional CV writer. Improve the following project description to be more compelling and clear. Highlight the problem solved, your role, and the impact. Keep it 1-2 sentences. Return only the improved description, nothing else.`,
};

export async function POST(req: NextRequest) {
  try {
    const { field, text } = await req.json();

    if (!text?.trim()) {
      return NextResponse.json({ error: "No text provided" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI not configured — add ANTHROPIC_API_KEY to Vercel env vars" },
        { status: 503 }
      );
    }

    const systemPrompt = PROMPTS[field] || PROMPTS.summary;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `${systemPrompt}\n\nText to improve:\n${text}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "AI API error" }, { status: 500 });
    }

    const data = await response.json();
    const result = data.content?.[0]?.text?.trim();

    if (!result) {
      return NextResponse.json({ error: "No result from AI" }, { status: 500 });
    }

    return NextResponse.json({ result });
  } catch (err) {
    console.error("improve-text error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
