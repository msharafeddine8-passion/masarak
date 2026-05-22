"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  fetchPendingRequests, grantOrgAccess, rejectRequest,
  ORG_TYPE_LABEL, type OrgAccessRequest,
} from "@/lib/org";

export default function OrgRequestsTab({ flash }: { flash: (m: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState("");
  const [requests, setRequests] = useState<OrgAccessRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setRequests(await fetchPendingRequests());
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setAdminId(data.user.id);
      load();
    });
  }, [load]);

  async function handleGrant(req: OrgAccessRequest) {
    setBusyId(req.id);
    const { error } = await grantOrgAccess(req, adminId);
    if (error) { flash("❌ خطأ: " + error); setBusyId(null); return; }
    flash("✓ تم منح الوصول وتوثيق المؤسسة");
    await load();
    setBusyId(null);
  }

  async function handleReject(req: OrgAccessRequest) {
    const reason = prompt(`سبب رفض طلب "${req.organizations?.display_name}"؟`);
    if (reason === null) return;
    setBusyId(req.id);
    await rejectRequest(req.id, adminId, reason.trim() || "غير محدد");
    flash("تم رفض الطلب");
    await load();
    setBusyId(null);
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-slate-500 text-sm">
          المؤسسات اللي طلبت إدارة صفحاتها — راجعها وامنح الوصول.
        </p>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
          requests.length > 0 ? "bg-amber-100 text-amber-700" : "bg-slate-100 text-slate-500"
        }`}>
          {requests.length} قيد المراجعة
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-slate-500">ما في طلبات قيد المراجعة</p>
          <p className="text-xs text-slate-400 mt-2">
            الطلبات الجديدة من صفحة <code className="bg-slate-100 px-1.5 py-0.5 rounded">/org/claim</code> رح تظهر هون.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {requests.map((req) => (
            <div key={req.id} className="bg-white rounded-2xl border border-slate-200 p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {req.organizations?.logo_url
                    ? /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={req.organizations.logo_url} alt="" className="w-full h-full object-contain rounded-xl" />
                    : "🏛️"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-[#1b3a6b]">{req.organizations?.display_name}</div>
                  <div className="text-xs text-slate-500">
                    {req.organizations && ORG_TYPE_LABEL[req.organizations.org_type]}
                    {" · "}
                    {new Date(req.created_at).toLocaleDateString("ar")}
                  </div>
                </div>
              </div>

              {req.requester_email && (
                <div className="text-sm text-slate-700 mb-2">
                  <span className="font-bold text-slate-500 text-xs">إيميل مقدّم الطلب: </span>
                  <span dir="ltr">{req.requester_email}</span>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 mb-3 leading-relaxed">
                <span className="font-bold text-slate-500 text-xs">رسالته: </span>
                {req.note}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleGrant(req)}
                  disabled={busyId === req.id}
                  className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-green-700 disabled:opacity-50"
                >
                  {busyId === req.id ? "..." : "✓ منح الوصول وتوثيق المؤسسة"}
                </button>
                <button
                  onClick={() => handleReject(req)}
                  disabled={busyId === req.id}
                  className="flex-1 border-2 border-red-300 text-red-600 font-bold py-2.5 rounded-xl text-sm hover:bg-red-50 disabled:opacity-50"
                >
                  رفض
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
