// src/lib/ratelimit.ts
// Centralized rate limiting using Upstash Redis (sliding-window).
// Fails OPEN (allows the request) when env is missing or Redis is down,
// so we never block legitimate traffic on infra hiccups.

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = URL && TOKEN ? new Redis({ url: URL, token: TOKEN }) : null;

// Pre-built limiter buckets, keyed by purpose.
// Sliding window keeps usage smooth (no burst-then-block patterns).
const limiters = redis
  ? {
      // AI / expensive endpoints: 10 requests / minute / IP
      ai: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "60 s"),
        analytics: true,
        prefix: "rl:ai",
      }),
      // Public forms (contact, sponsor apply, partnership, reviews): 5 / 5min / IP
      form: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "300 s"),
        analytics: true,
        prefix: "rl:form",
      }),
      // Auth-adjacent (redeem, signup helpers): 20 / min / IP
      auth: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(20, "60 s"),
        analytics: true,
        prefix: "rl:auth",
      }),
      // General API: 60 / min / IP
      general: new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(60, "60 s"),
        analytics: true,
        prefix: "rl:gen",
      }),
    }
  : null;

export type RateLimitBucket = "ai" | "form" | "auth" | "general";

export type RateLimitResult = {
  success: boolean;
  limit?: number;
  remaining?: number;
  reset?: number;
  reason?: "disabled" | "ok" | "blocked" | "error";
};

/** Extract a stable client identifier (IP, with sensible fallbacks). */
export function getClientId(req: NextRequest | Request): string {
  const r = req as NextRequest;
  const xff =
    r.headers.get("x-forwarded-for") ||
    r.headers.get("x-real-ip") ||
    "";
  const ip = xff.split(",")[0]?.trim();
  if (ip) return ip;
  // Some platforms expose ip directly
  // @ts-expect-error - Next 14 typing
  if (r.ip) return r.ip as string;
  return "anon";
}

/**
 * Check rate limit. Returns success=true (and reason="disabled") when no
 * Redis env is configured — so dev / preview never breaks.
 */
export async function checkRateLimit(
  bucket: RateLimitBucket,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiters) {
    return { success: true, reason: "disabled" };
  }
  try {
    const r = await limiters[bucket].limit(identifier);
    return {
      success: r.success,
      limit: r.limit,
      remaining: r.remaining,
      reset: r.reset,
      reason: r.success ? "ok" : "blocked",
    };
  } catch (e) {
    console.warn("[ratelimit] backend error, failing open:", e);
    return { success: true, reason: "error" };
  }
}

/** Build a 429 Response with standard rate-limit headers. */
export function rateLimitResponse(r: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: "حدّ المعدّل تجاوز السقف المسموح. حاول بعد قليل.",
    }),
    {
      status: 429,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "x-ratelimit-limit": String(r.limit ?? 0),
        "x-ratelimit-remaining": String(r.remaining ?? 0),
        "x-ratelimit-reset": String(r.reset ?? 0),
        "retry-after": String(Math.max(1, Math.ceil(((r.reset ?? 0) - Date.now()) / 1000))),
      },
    }
  );
}
