"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  searchOrganizations, requestOrgAccess, fetchMyRequests, fetchMyOrgs,
  ORG_TYPE_LABEL, type OrgType, type OrgAccessRequest,
} from "@/lib/org";
import { useI18n, type TranslationKey } from "@/lib/i18n";

interface SearchRow {
  id: string;
  org_type: OrgType;
  entity_id: number | null;
  slug: string;
  display_name: string;
  logo_url: string | null;
  verification_status: string;
}

export default function OrgClaimPage() {
  const router = useRouter();
  const { dir, t } = useI18n();
  const tk = (k: string) => t(k as TranslationKey);
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [myRequests, setMyRequests] = useState<OrgAccessRequest[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchRow | null>(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/auth/login?next=/org/claim"); return; }
      setUser(data.user);
      // already manages an org? jump to dashboard
      const mine = await fetchMyOrgs(data.user.id);
      if (mine.length > 0) { router.push("/org/dashboard"); return; }
      setMyRequests(await fetchMyRequests(data.user.id));
      setAuthLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const tmr = setTimeout(async () => {
      setSearching(true);
      const rows = await searchOrganizations(query.trim());
      setResults(rows as SearchRow[]);
      setSearching(false);
    }, 350);
    return () => clearTimeout(tmr);
  }, [query]);

  async function handleSubmit() {
    if (!selected || !user) return;
    setSubmitting(true); setError("");
    const { error } = await requestOrgAccess(
      selected.id, user.id, user.email || "", note.trim(),
    );
    setSubmitting(false);
    if (error) { setError(error); return; }
    setDone(true);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg" dir={dir}>
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const pendingReq = myRequests.find((r) => r.status === "pending");

  return (
    <main className="min-h-screen bg-bg py-10 px-4" dir={dir}>
      <div className="max-w-xl mx-auto">
        <Link href="/dashboard" className="text-sm text-ink-subtle hover:text-primary mb-4 inline-block">
          ← {tk("orgclaim.back")}
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#0F4A52] to-[#1A6F7C] rounded-2xl p-8 text-white text-center mb-6">
          <div className="text-5xl mb-3">🏛️</div>
          <h1 className="text-2xl font-extrabold mb-2">{tk("orgclaim.hero.title")}</h1>
          <p className="text-white/85 text-sm leading-relaxed">
            {tk("orgclaim.hero.subtitle")}
          </p>
        </div>

        {/* Already has a pending request */}
        {pendingReq && !done && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-6">
            <div className="text-4xl mb-2">⏳</div>
            <h2 className="font-extrabold text-amber-800 mb-1">{tk("orgclaim.pending.title")}</h2>
            <p className="text-sm text-amber-700">
              {tk("orgclaim.pending.prefix")} <strong>{pendingReq.organizations?.display_name}</strong> {tk("orgclaim.pending.suffix")}
            </p>
          </div>
        )}

        {done ? (
          <div className="bg-surface rounded-2xl border border-line p-8 text-center">
            <div className="text-6xl mb-4">📨</div>
            <h2 className="text-xl font-extrabold text-primary mb-2">{tk("orgclaim.done.title")}</h2>
            <p className="text-ink-muted text-sm mb-6 leading-relaxed">
              {tk("orgclaim.done.prefix")} <strong>{selected?.display_name}</strong>{tk("orgclaim.done.suffix")}
            </p>
            <Link href="/dashboard" className="btn-primary inline-block px-6 py-3 rounded-xl">
              {tk("orgclaim.done.backDashboard")}
            </Link>
          </div>
        ) : selected ? (
          /* ── Step 2: write the request ── */
          <div className="bg-surface rounded-2xl border border-line p-6">
            <button onClick={() => { setSelected(null); setError(""); }}
              className="text-sm text-ink-subtle hover:text-primary mb-4">← {tk("orgclaim.chooseAnother")}</button>

            <div className="flex items-center gap-3 mb-5 p-3 bg-bg-soft rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                {selected.logo_url
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={selected.logo_url} alt="" className="w-full h-full object-contain rounded-xl" />
                  : "🏛️"}
              </div>
              <div>
                <div className="font-bold text-primary">{selected.display_name}</div>
                <div className="text-xs text-ink-subtle">{ORG_TYPE_LABEL[selected.org_type]}</div>
              </div>
            </div>

            {selected.verification_status === "verified" ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                ⚠️ {tk("orgclaim.alreadyManaged.prefix")} <Link href="/contact" className="font-bold underline">{tk("orgclaim.alreadyManaged.link")}</Link> {tk("orgclaim.alreadyManaged.suffix")}
              </div>
            ) : (
              <>
                <label className="block text-sm font-bold text-ink mb-2">
                  {tk("orgclaim.roleLabel")} <span className="text-ink-subtle font-normal">{tk("orgclaim.roleLabel.hint")}</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder={tk("orgclaim.rolePlaceholder")}
                  className="w-full border-2 border-line rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none mb-2"
                />
                <p className="text-xs text-ink-subtle mb-4">
                  {tk("orgclaim.contactHint.prefix")} <strong dir="ltr">{user?.email}</strong> {tk("orgclaim.contactHint.suffix")}
                </p>

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-4">
                    ❌ {error}
                  </div>
                )}

                <button
                  onClick={handleSubmit}
                  disabled={submitting || note.trim().length < 10}
                  className="btn-primary w-full py-3.5 rounded-xl disabled:opacity-50"
                >
                  {submitting ? tk("orgclaim.submitting") : tk("orgclaim.submit")}
                </button>
              </>
            )}
          </div>
        ) : (
          /* ── Step 1: search ── */
          <div className="bg-surface rounded-2xl border border-line p-6">
            <label className="block text-sm font-bold text-ink mb-2">{tk("orgclaim.searchLabel")}</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={tk("orgclaim.searchPlaceholder")}
              className="w-full border-2 border-line rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />

            <div className="mt-4 space-y-2">
              {searching && <div className="text-center text-sm text-ink-subtle py-4">{tk("orgclaim.searching")}</div>}
              {!searching && query.trim().length >= 2 && results.length === 0 && (
                <div className="text-center text-sm text-ink-subtle py-6">
                  {tk("orgclaim.noResults.prefix")} <Link href="/contact" className="text-primary font-bold underline">{tk("orgclaim.noResults.link")}</Link> {tk("orgclaim.noResults.suffix")}
                </div>
              )}
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setSelected(r); setError(""); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-line hover:border-primary hover:bg-primary/5 transition-all text-right"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                    {r.logo_url
                      ? /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={r.logo_url} alt="" className="w-full h-full object-contain rounded-lg" />
                      : "🏛️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-primary text-sm truncate">{r.display_name}</div>
                    <div className="text-xs text-ink-subtle">{ORG_TYPE_LABEL[r.org_type]}</div>
                  </div>
                  {r.verification_status === "verified" && (
                    <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">✓ {tk("orgclaim.managedBadge")}</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
