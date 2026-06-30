// Server-only Supabase clients for API routes, created lazily and guarded.
// Audit S3: never silently fall back from the service-role key to the anon key
// (that runs privileged code as anon and masks a misconfiguration). And never
// instantiate at module top level with `URL!` — that throws "supabaseUrl is
// required" at import time and crashes the build's page-data collection when env
// is absent. Callers get null on missing env and should return 503.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let _service: SupabaseClient | null = null;
let _anon: SupabaseClient | null = null;

/** Service-role client for privileged writes. null if env is missing. */
export function getServiceClient(): SupabaseClient | null {
  if (_service) return _service;
  if (!URL || !SERVICE_KEY) return null;
  _service = createClient(URL, SERVICE_KEY, { auth: { persistSession: false } });
  return _service;
}

/** Public anon client for server-side reads. null if env is missing. */
export function getAnonClient(): SupabaseClient | null {
  if (_anon) return _anon;
  if (!URL || !ANON_KEY) return null;
  _anon = createClient(URL, ANON_KEY, { auth: { persistSession: false } });
  return _anon;
}

/** Standard 503 for when server Supabase env is not configured. */
export function serviceUnavailable(): Response {
  return new Response(
    JSON.stringify({ error: "Service temporarily unavailable" }),
    { status: 503, headers: { "content-type": "application/json; charset=utf-8" } },
  );
}
