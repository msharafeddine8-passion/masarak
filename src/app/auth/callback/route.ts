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
    const user = data?.user;

    // Belt-and-suspenders: guarantee a canonical user_profiles row exists. The
    // handle_new_user trigger swallows errors, which historically left 5/39 users
    // with no identity row. This self-heals every account on auth, independent of
    // the trigger. (ignoreDuplicates → never clobbers existing data.)
    if (user) {
      try {
        const meta = (user.user_metadata ?? {}) as { full_name?: string; name?: string; role?: string };
        const appMeta = (user.app_metadata ?? {}) as { role?: string };
        await supabase.from("user_profiles").upsert(
          {
            id: user.id,
            email: user.email ?? null,
            full_name: meta.full_name ?? meta.name ?? null,
            primary_role: appMeta.role ?? meta.role ?? "student",
          },
          { onConflict: "id", ignoreDuplicates: true },
        );
      } catch { /* identity ensure must never block auth */ }
    }

    // Fire register_complete once for brand-new accounts. OAuth (Google) signups
    // bypass the register form, so without this they were never counted.
    try {
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
