"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  searchOrganizations, requestAffiliation, fetchMyAffiliations,
  ORG_TYPE_LABEL, AFFILIATION_LABEL,
  type OrgType, type AffiliationKind, type OrgAffiliation,
} from "@/lib/org";
import { useI18n } from "@/lib/i18n";

interface SearchRow {
  id: string;
  org_type: OrgType;
  display_name: string;
  logo_url: string | null;
  verification_status: string;
}

const STATUS_LABEL: Record<string, { label: string; cls: string }> = {
  pending:  { label: "قيد المراجعة", cls: "bg-amber-100 text-amber-700" },
  verified: { label: "✓ منتسب", cls: "bg-green-100 text-green-700" },
  rejected: { label: "مرفوض", cls: "bg-red-100 text-red-700" },
};

export default function OrgJoinPage() {
  const router = useRouter();
  const { dir } = useI18n();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [mine, setMine] = useState<OrgAffiliation[]>([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchRow[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<SearchRow | null>(null);
  const [affiliation, setAffiliation] = useState<AffiliationKind>("student");
  const [program, setProgram] = useState("");
  const [gradYear, setGradYear] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadMine = useCallback(async (uid: string) => {
    setMine(await fetchMyAffiliations(uid));
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) { router.push("/auth/login?next=/org/join"); return; }
      setUser(data.user);
      const { data: prof } = await supabase
        .from("student_profiles")
        .select("full_name, avatar_url, school_name")
        .eq("user_id", data.user.id).maybeSingle();
      setProfile(prof);
      await loadMine(data.user.id);
      setAuthLoading(false);
    });
  }, [router, loadMine]);

  useEffect(() => {
    if (query.trim().length < 2) { setResults([]); return; }
    const tmr = setTimeout(async () => {
      setSearching(true);
      const rows = await searchOrganizations(query.trim());
      // only verified orgs can receive affiliations
      setResults((rows as SearchRow[]).filter((r) => r.verification_status === "verified"));
      setSearching(false);
    }, 350);
    return () => clearTimeout(tmr);
  }, [query]);

  async function handleSubmit() {
    if (!selected || !user) return;
    setSubmitting(true); setError("");
    const { error } = await requestAffiliation({
      orgId: selected.id,
      userId: user.id,
      affiliation,
      gradYear: gradYear ? Number(gradYear) : undefined,
      program: program.trim() || undefined,
      studentName: profile?.full_name || user.email?.split("@")[0] || "طالب",
      studentEmail: user.email || "",
      studentAvatar: profile?.avatar_url || undefined,
    });
    setSubmitting(false);
    if (error) { setError(error); return; }
    setSelected(null); setProgram(""); setGradYear("");
    await loadMine(user.id);
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg" dir={dir}>
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const alreadyIds = new Set(mine.map((m) => m.org_id));

  return (
    <main className="min-h-screen bg-bg py-10 px-4" dir={dir}>
      <div className="max-w-xl mx-auto">
        <Link href="/profile" className="text-sm text-gray-500 hover:text-primary mb-4 inline-block">
          ← الملف الشخصي
        </Link>

        <div className="bg-gradient-to-br from-[#0F4A52] to-[#1A6F7C] rounded-2xl p-8 text-white text-center mb-6">
          <div className="text-5xl mb-3">🎓</div>
          <h1 className="text-2xl font-extrabold mb-2">انتسب لمؤسستك</h1>
          <p className="text-white/85 text-sm leading-relaxed">
            اربط حسابك بجامعتك أو مدرستك — وتظهر ضمن طلابها مع إنجازاتك ونقاطك.
          </p>
        </div>

        {/* My affiliations */}
        {mine.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
            <h2 className="font-bold text-primary mb-3">انتساباتي</h2>
            <div className="space-y-2">
              {mine.map((m) => {
                const st = STATUS_LABEL[m.status];
                return (
                  <div key={m.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-lg">
                      {m.organizations?.logo_url
                        ? /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={m.organizations.logo_url} alt="" className="w-full h-full object-contain rounded-lg" />
                        : "🏛️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-800 truncate">
                        {m.organizations?.display_name}
                      </div>
                      <div className="text-xs text-gray-500">{AFFILIATION_LABEL[m.affiliation]}</div>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {selected ? (
          /* ── request form ── */
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <button onClick={() => { setSelected(null); setError(""); }}
              className="text-sm text-gray-500 hover:text-primary mb-4">← اختر مؤسسة ثانية</button>

            <div className="flex items-center gap-3 mb-5 p-3 bg-gray-50 rounded-xl">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl">
                {selected.logo_url
                  ? /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={selected.logo_url} alt="" className="w-full h-full object-contain rounded-xl" />
                  : "🏛️"}
              </div>
              <div>
                <div className="font-bold text-primary">{selected.display_name}</div>
                <div className="text-xs text-gray-500">{ORG_TYPE_LABEL[selected.org_type]}</div>
              </div>
            </div>

            <label className="block text-sm font-bold text-gray-800 mb-1.5">صفتك</label>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {(Object.keys(AFFILIATION_LABEL) as AffiliationKind[]).map((k) => (
                <button key={k} onClick={() => setAffiliation(k)}
                  className={`py-2 rounded-xl text-sm font-bold border-2 ${
                    affiliation === k ? "border-primary bg-primary/5 text-primary" : "border-gray-200 text-gray-500"
                  }`}>
                  {AFFILIATION_LABEL[k]}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">التخصص (اختياري)</label>
                <input value={program} onChange={(e) => setProgram(e.target.value)}
                  placeholder="هندسة، طب..." className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">سنة التخرج (اختياري)</label>
                <input type="number" value={gradYear} onChange={(e) => setGradYear(e.target.value)}
                  placeholder="2027" className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm focus:border-primary focus:outline-none" />
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              المؤسسة رح تأكّد انتسابك. بتظهر ضمن طلابها بعد التأكيد — وتقدر تخفي ظهورك وقت ما بدك.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-4">❌ {error}</div>
            )}

            <button onClick={handleSubmit} disabled={submitting}
              className="btn-primary w-full py-3.5 rounded-xl disabled:opacity-50">
              {submitting ? "جاري الإرسال..." : "أرسل طلب الانتساب"}
            </button>
          </div>
        ) : (
          /* ── search ── */
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <label className="block text-sm font-bold text-gray-800 mb-2">ابحث عن مؤسستك</label>
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 اكتب اسم الجامعة أو المدرسة..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none" />

            <div className="mt-4 space-y-2">
              {searching && <div className="text-center text-sm text-gray-400 py-4">جاري البحث...</div>}
              {!searching && query.trim().length >= 2 && results.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-6">
                  ما لقينا مؤسسة موثّقة بهالاسم. بس المؤسسات الموثّقة بتستقبل انتسابات.
                </div>
              )}
              {results.map((r) => {
                const joined = alreadyIds.has(r.id);
                return (
                  <button key={r.id} disabled={joined}
                    onClick={() => { setSelected(r); setError(""); }}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl border text-right transition-all ${
                      joined ? "border-gray-100 opacity-50 cursor-not-allowed"
                             : "border-gray-100 hover:border-primary hover:bg-primary/5"
                    }`}>
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
                      {r.logo_url
                        ? /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={r.logo_url} alt="" className="w-full h-full object-contain rounded-lg" />
                        : "🏛️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-primary text-sm truncate">{r.display_name}</div>
                      <div className="text-xs text-gray-500">{ORG_TYPE_LABEL[r.org_type]}</div>
                    </div>
                    {joined && <span className="text-xs text-gray-400">طلبت سابقاً</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
