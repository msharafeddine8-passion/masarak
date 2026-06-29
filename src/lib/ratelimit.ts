// src/lib/ratelimit.ts
// Centralized rate limiting using Upstash Redis (sliding-window).
// When Redis is missing or down, we DO NOT fail fully open: an in-memory
// sliding-window fallback still throttles per-instance, so the AI/auth cost
// vectors stay capped even on an infra hiccup or misconfiguration. (Previously
// this failed open, leaving the paid AI endpoints uncapped — see audit C2.)

import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";

const URL = process.env.UPSTASH_REDIS_REST_URL;
const TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

const redis = URL && TOKEN ? new Redis({ url: URL, token: TOKEN }) : null;

// Single source of truth for bucket limits — used by BOTH the Upstash limiters
// and the in-memory fallback so the two stay in sync.
const BUCKET_CONFIG: Record<RateLimitBucket, { limit: number; windowMs: number }> = {
  ai: { limit: 10, windowMs: 60_000 },
  form: { limit: 5, windowMs: 300_000 },
  auth: { limit: 20, windowMs: 60_000 },
  general: { limit: 60, windowMs: 60_000 },
};

// In-memory sliding-window fallback. Per-instance (serverless spreads load
// across instances), so it's a backstop — not a replacement for Redis — but it
// keeps a single instance from being abused into an unbounded Anthropic bill.
const memHits = new Map<string, number[]>();

function memoryLimit(bucket: RateLimitBucket, identifier: string): RateLimitResult {
  const { limit, windowMs } = BUCKET_CONFIG[bucket];
  const now = Date.now();
  const key = `${bucket}:${identifier}`;

  // Coarse global guard against unbounded growth on a long-lived instance.
  if (memHits.size > 10_000) memHits.clear();

  const cutoff = now - windowMs;
  const hits = (memHits.get(key) || []).filter((t) => t > cutoff);
  const success = hits.length < limit;
  if (success) hits.push(now);
  memHits.set(key, hits);

  return {
    success,
    limit,
    remaining: Math.max(0, limit - hits.length),
    reset: now + windowMs,
    reason: success ? "memory" : "memory-blocked",
  };
}

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
  reason?: "disabled" | "ok" | "blocked" | "error" | "memory" | "memory-blocked";
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
  const direct = (r as { ip?: string }).ip;
  if (direct) return direct;
  return "anon";
}

/**
 * Check rate limit. Uses Upstash Redis when configured; otherwise (or on a
 * Redis error) falls back to an in-memory per-instance limiter so the request
 * is still throttled rather than allowed unconditionally.
 */
export async function checkRateLimit(
  bucket: RateLimitBucket,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiters) {
    // No Redis configured → in-memory backstop (was: fully open).
    return memoryLimit(bucket, identifier);
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
    // Redis hiccup → don't fail open on cost-sensitive traffic; throttle in memory.
    console.warn("[ratelimit] backend error, using in-memory fallback:", e);
    return memoryLimit(bucket, identifier);
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
