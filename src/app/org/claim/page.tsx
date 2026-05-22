"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  searchOrganizations, requestOrgAccess, fetchMyRequests, fetchMyOrgs,
  ORG_TYPE_LABEL, type OrgType, type OrgAccessRequest,
} from "@/lib/org";
import { useI18n } from "@/lib/i18n";

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
  const { dir } = useI18n();
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
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-primary mb-4 inline-block">
          ← الرجوع
        </Link>

        {/* Hero */}
        <div className="bg-gradient-to-br from-[#0F4A52] to-[#1A6F7C] rounded-2xl p-8 text-white text-center mb-6">
          <div className="text-5xl mb-3">🏛️</div>
          <h1 className="text-2xl font-extrabold mb-2">اطلب إدارة صفحة مؤسستك</h1>
          <p className="text-white/85 text-sm leading-relaxed">
            صفحة مؤسستك موجودة على مسارك. اطلب إدارتها — فريق مسارك رح يتواصل معك ويفعّلها.
          </p>
        </div>

        {/* Already has a pending request */}
        {pendingReq && !done && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center mb-6">
            <div className="text-4xl mb-2">⏳</div>
            <h2 className="font-extrabold text-amber-800 mb-1">طلبك قيد المراجعة</h2>
            <p className="text-sm text-amber-700">
              طلب إدارة <strong>{pendingReq.organizations?.display_name}</strong> وصل لفريق مسارك. رح نتواصل معك قريباً.
            </p>
          </div>
        )}

        {done ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
            <div className="text-6xl mb-4">📨</div>
            <h2 className="text-xl font-extrabold text-primary mb-2">تم إرسال طلبك</h2>
            <p className="text-gray-600 text-sm mb-6 leading-relaxed">
              فريق مسارك رح يراجع طلب إدارة <strong>{selected?.display_name}</strong>،
              يتواصل معك للتأكد، ويفعّل صفحتك. رح يوصلك إشعار عند الموافقة.
            </p>
            <Link href="/dashboard" className="btn-primary inline-block px-6 py-3 rounded-xl">
              الرجوع للوحة التحكم
            </Link>
          </div>
        ) : selected ? (
          /* ── Step 2: write the request ── */
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

            {selected.verification_status === "verified" ? (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                ⚠️ هالمؤسسة مُدارة مسبقاً. تواصل مع <Link href="/contact" className="font-bold underline">فريق مسارك</Link> إذا في خطأ.
              </div>
            ) : (
              <>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  من أنت داخل المؤسسة؟ <span className="text-gray-400 font-normal">(لإثبات صلاحيتك)</span>
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  placeholder="مثال: أنا مسؤول القبول في الجامعة — إيميلي الرسمي admissions@..."
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none mb-2"
                />
                <p className="text-xs text-gray-400 mb-4">
                  فريق مسارك رح يتواصل معك على <strong dir="ltr">{user?.email}</strong> للتأكد قبل التفعيل.
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
                  {submitting ? "جاري الإرسال..." : "أرسل طلب الإدارة"}
                </button>
              </>
            )}
          </div>
        ) : (
          /* ── Step 1: search ── */
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <label className="block text-sm font-bold text-gray-800 mb-2">ابحث عن مؤسستك</label>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="🔍 اكتب اسم الجامعة أو المدرسة..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />

            <div className="mt-4 space-y-2">
              {searching && <div className="text-center text-sm text-gray-400 py-4">جاري البحث...</div>}
              {!searching && query.trim().length >= 2 && results.length === 0 && (
                <div className="text-center text-sm text-gray-400 py-6">
                  ما لقينا نتيجة. <Link href="/contact" className="text-primary font-bold underline">تواصل معنا</Link> لإضافة مؤسستك.
                </div>
              )}
              {results.map((r) => (
                <button
                  key={r.id}
                  onClick={() => { setSelected(r); setError(""); }}
                  className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-primary hover:bg-primary/5 transition-all text-right"
                >
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
                  {r.verification_status === "verified" && (
                    <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">✓ مُدارة</span>
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
