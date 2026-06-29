import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Sprint 5.3: open-redirect hardening.
 * Accept only internal paths in `next`. Reject anything that:
 *   - doesn't start with "/"
 *   - is protocol-relative ("//evil.com")
 *   - contains a backslash or whitespace
 * Falls back to a safe default.
 */
function safeNext(input: string | null): string {
  if (!input) return "/dashboard";
  // Must start with a single forward slash; reject "//" (protocol-relative) and "/\".
  if (!input.startsWith("/") || input.startsWith("//") || input.startsWith("/\\")) {
    return "/dashboard";
  }
  // Reject any control chars / whitespace.
  if (/[\s\\]/.test(input)) return "/dashboard";
  return input;
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = safeNext(requestUrl.searchParams.get("next"));

  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    const { data } = await supabase.auth.exchangeCodeForSession(code);
    // Fire register_complete once for brand-new accounts. OAuth (Google) signups
    // bypass the register form, so without this they were never counted.
    try {
      const user = data?.user;
      if (user?.created_at && Date.now() - new Date(user.created_at).getTime() < 15000) {
        await supabase.from("analytics_events").insert({
          user_id: user.id,
          event_name: "register_complete",
          properties: { role: (user.user_metadata as { role?: string } | null)?.role ?? null, via: "oauth" },
        } as never);
      }
    } catch { /* analytics must never block auth */ }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
