"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { fetchPendingOrgs, approveOrg, rejectOrg, ORG_TYPE_LABEL, type Organization } from "@/lib/org";

export default function AdminOrgsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<Organization[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setPending(await fetchPendingOrgs());
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login?next=/admin/orgs"); return; }
      load();
    });
  }, [router]);

  async function handleApprove(org: Organization) {
    setBusyId(org.id);
    await approveOrg(org.id);
    await load();
    setBusyId(null);
  }

  async function handleReject(org: Organization) {
    const reason = prompt(`سبب رفض طلب "${org.display_name}"؟`);
    if (reason === null) return;
    setBusyId(org.id);
    await rejectOrg(org.id, reason.trim() || "غير محدد");
    await load();
    setBusyId(null);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-gray-500 hover:text-primary">← لوحة الأدمن</Link>
            <h1 className="text-2xl font-extrabold text-primary mt-1">طلبات إدارة المؤسسات</h1>
          </div>
          <span className="text-xs bg-amber-100 text-amber-700 font-bold px-3 py-1.5 rounded-full">
            {pending.length} قيد المراجعة
          </span>
        </div>

        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : pending.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-gray-500">ما في طلبات قيد المراجعة</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pending.map((org) => (
              <div key={org.id} className="bg-white rounded-2xl border border-gray-200 p-5">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {org.logo_url
                      ? /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={org.logo_url} alt="" className="w-full h-full object-contain rounded-xl" />
                      : "🏛️"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-extrabold text-primary">{org.display_name}</div>
                    <div className="text-xs text-gray-500">
                      {ORG_TYPE_LABEL[org.org_type]}
                      {org.claimed_at && ` · طُلب ${new Date(org.claimed_at).toLocaleDateString("ar")}`}
                    </div>
                  </div>
                </div>

                {org.claim_note && (
                  <div className="bg-gray-50 rounded-xl p-3 text-sm text-gray-700 mb-3 leading-relaxed">
                    <span className="font-bold text-gray-500 text-xs">رسالة مقدّم الطلب: </span>
                    {org.claim_note}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(org)}
                    disabled={busyId === org.id}
                    className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {busyId === org.id ? "..." : "✓ موافقة وتأكيد"}
                  </button>
                  <button
                    onClick={() => handleReject(org)}
                    disabled={busyId === org.id}
                    className="flex-1 border-2 border-red-300 text-red-600 font-bold py-2.5 rounded-xl text-sm hover:bg-red-50 disabled:opacity-50"
                  >
                    رفض
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-gray-400 text-center mt-6">
          الموافقة تؤكّد المؤسسة وتفعّل ظهور صفحتها للعامة. الرفض يرجّعها لحالة &quot;غير مُدارة&quot;.
        </p>
      </div>
    </main>
  );
}
