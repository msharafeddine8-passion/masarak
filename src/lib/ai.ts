// src/lib/ai.ts
// Anthropic Claude integration — pay-as-you-go (no subscription).
// Activated only when ANTHROPIC_API_KEY is set in Vercel env.
// All admin AI features call hasAi() first and gracefully degrade to rule-based fallbacks.

export function hasAi(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const DEFAULT_MODEL = 'claude-sonnet-4-6';

export type Msg = { role: 'user' | 'assistant'; content: string };

export type AiResult = {
  ok: boolean;
  text?: string;
  model?: string;
  tokensIn?: number;
  tokensOut?: number;
  costUsd?: number;
  error?: string;
};

/**
 * Call Claude with a system prompt + messages. SERVER-SIDE ONLY.
 * Returns text + usage. Never throws — returns { ok:false, error } instead.
 */
export async function callClaude(opts: {
  system: string;
  messages: Msg[];
  model?: string;
  maxTokens?: number;
}): Promise<AiResult> {
  if (!hasAi()) {
    return { ok: false, error: 'ANTHROPIC_API_KEY not configured' };
  }
  const model = opts.model || DEFAULT_MODEL;
  try {
    const resp = await fetch(ANTHROPIC_URL, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY as string,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: opts.maxTokens ?? 2048,
        system: opts.system,
        messages: opts.messages,
      }),
    });
    if (!resp.ok) {
      const t = await resp.text().catch(() => '');
      return { ok: false, error: `${resp.status} ${resp.statusText}: ${t.slice(0, 200)}` };
    }
    type AnthropicResponse = {
      content?: Array<{ type: string; text?: string }>;
      usage?: { input_tokens: number; output_tokens: number };
    };
    const data = (await resp.json()) as AnthropicResponse;
    const text = data.content?.find((c) => c.type === 'text')?.text || '';
    const tIn = data.usage?.input_tokens || 0;
    const tOut = data.usage?.output_tokens || 0;
    // Claude Sonnet 4.6: ~$3/MTok in, ~$15/MTok out (approx)
    const cost = (tIn / 1_000_000) * 3 + (tOut / 1_000_000) * 15;
    return { ok: true, text, model, tokensIn: tIn, tokensOut: tOut, costUsd: cost };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * Generate the daily executive briefing.
 * Takes a snapshot of yesterday's metrics; returns markdown.
 */
export async function generateDailyBriefing(snapshot: {
  yesterdayNewUsers: number;
  yesterdayActiveUsers: number;
  yesterdaySaves: number;
  yesterdayDnaCompletions: number;
  totalUsers: number;
  pendingInvites: number;
  staleUniversities: number;
  staleSchools: number;
  openTickets: number;
}): Promise<AiResult> {
  const system = `You are the AI Chief of Staff for Masarak — the largest Arabic-first student platform in the Arab World. You write concise, action-oriented daily executive briefings to the founder (Mohamad Charafeddine).
Tone: warm but blunt. Arabic for warmth, English for technical terms. NEVER invent numbers — use only the snapshot provided.
Format: Markdown. Sections (in this order):
- ## ✅ كيف صار اليوم (1-2 lines)
- ## 📈 الإيجابيات (bullets, max 3)
- ## ⚠️ المخاطر والتنبيهات (bullets, max 3)
- ## 🎯 الأولويات لليوم (numbered list, max 3)
- ## 💡 فرصة من النيات`;

  const user = `هاد snapshot الأمس:
- مستخدمين جدد: ${snapshot.yesterdayNewUsers}
- مستخدمين نشطين: ${snapshot.yesterdayActiveUsers}
- حفظ عناصر: ${snapshot.yesterdaySaves}
- DNA completions: ${snapshot.yesterdayDnaCompletions}
- إجمالي المستخدمين: ${snapshot.totalUsers}
- دعوات معلّقة: ${snapshot.pendingInvites}
- جامعات ما حُدّثت 30 يوم: ${snapshot.staleUniversities}
- مدارس ما حُدّثت 30 يوم: ${snapshot.staleSchools}
- تذاكر دعم مفتوحة: ${snapshot.openTickets}

اكتبلي briefing تنفيذي حسب الـ format يلي بـ system prompt.`;

  return callClaude({
    system,
    messages: [{ role: 'user', content: user }],
    maxTokens: 1500,
  });
}
