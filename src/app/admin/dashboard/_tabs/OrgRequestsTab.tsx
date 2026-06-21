"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  fetchPendingRequests, grantOrgAccess, rejectRequest,
  fetchVerifiedOrgs, cancelOrgSubscription, toggleOrgFeatured,
  ORG_TYPE_LABEL, type OrgAccessRequest, type Organization,
} from "@/lib/org";

export default function OrgRequestsTab({ flash }: { flash: (m: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState("");
  const [requests, setRequests] = useState<OrgAccessRequest[]>([]);
  const [verified, setVerified] = useState<Organization[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const [reqs, vers] = await Promise.all([fetchPendingRequests(), fetchVerifiedOrgs()]);
    setRequests(reqs);
    setVerified(vers);
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

  async function handleToggleFeatured(org: Organization) {
    const next = !org.is_featured;
    setBusyId(org.id);
    await toggleOrgFeatured(org.id, next);
    flash(next ? `⭐ ${org.display_name} أصبحت مميّزة` : `${org.display_name} أُزيل تمييزها`);
    await load();
    setBusyId(null);
  }

  async function handleCancel(org: Organization) {
    if (!confirm(`إلغاء اشتراك "${org.display_name}"؟ رح تفقد إدارة صفحتها وترجع صفحة عادية.`)) return;
    setBusyId(org.id);
    await cancelOrgSubscription(org.id);
    flash("تم إلغاء الاشتراك");
    await load();
    setBusyId(null);
  }

  function fmtDate(d: string | null) {
    return d ? new Date(d).toLocaleDateString("ar") : "—";
  }
  function daysLeft(d: string | null) {
    if (!d) return null;
    return Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);
  }

  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border border-line p-12 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <p className="text-ink-subtle text-sm">
          المؤسسات اللي طلبت إدارة صفحاتها — راجعها وامنح الوصول.
        </p>
        <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
          requests.length > 0 ? "bg-amber-100 text-amber-700" : "bg-bg-soft text-ink-subtle"
        }`}>
          {requests.length} قيد المراجعة
        </span>
      </div>

      {requests.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-line p-12 text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-ink-subtle">ما في طلبات قيد المراجعة</p>
          <p className="text-xs text-slate-400 mt-2">
            الطلبات الجديدة من صفحة <code className="bg-bg-soft px-1.5 py-0.5 rounded">/org/claim</code> رح تظهر هون.
          </p>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {requests.map((req) => (
            <div key={req.id} className="bg-surface rounded-2xl border border-line p-5">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl flex-shrink-0">
                  {req.organizations?.logo_url
                    ? /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={req.organizations.logo_url} alt="" className="w-full h-full object-contain rounded-xl" />
                    : "🏛️"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-extrabold text-[#1b3a6b]">{req.organizations?.display_name}</div>
                  <div className="text-xs text-ink-subtle">
                    {req.organizations && ORG_TYPE_LABEL[req.organizations.org_type]}
                    {" · "}
                    {new Date(req.created_at).toLocaleDateString("ar")}
                  </div>
                </div>
              </div>

              {req.requester_email && (
                <div className="text-sm text-ink-muted mb-2">
                  <span className="font-bold text-ink-subtle text-xs">إيميل مقدّم الطلب: </span>
                  <span dir="ltr">{req.requester_email}</span>
                </div>
              )}

              <div className="bg-bg-soft rounded-xl p-3 text-sm text-ink-muted mb-3 leading-relaxed">
                <span className="font-bold text-ink-subtle text-xs">رسالته: </span>
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

      {/* ── Active subscriptions ── */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-extrabold text-[#1b3a6b] text-lg">المؤسسات المشتركة</h3>
          <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-blue-100 text-blue-700">
            {verified.length} موثّقة
          </span>
        </div>

        {verified.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-line p-10 text-center text-slate-400 text-sm">
            ما في مؤسسات مشتركة بعد
          </div>
        ) : (
          <div className="bg-surface rounded-2xl border border-line overflow-hidden max-w-3xl">
            <table className="w-full text-sm">
              <thead className="bg-bg-soft border-b border-line">
                <tr>
                  <th className="px-4 py-3 text-right text-xs font-bold text-ink-subtle">المؤسسة</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-ink-subtle">بداية الاشتراك</th>
                  <th className="px-4 py-3 text-right text-xs font-bold text-ink-subtle">تاريخ الانتهاء</th>
                  <th className="px-4 py-3 text-center text-xs font-bold text-ink-subtle">مميّزة ⭐</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {verified.map((org) => {
                  const left = daysLeft(org.expires_at);
                  const expired = left !== null && left <= 0;
                  const soon = left !== null && left > 0 && left <= 30;
                  return (
                    <tr key={org.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-base flex-shrink-0">
                            {org.logo_url
                              ? /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={org.logo_url} alt="" className="w-full h-full object-contain rounded-lg" />
                              : "🏛️"}
                          </div>
                          <div>
                            <div className="font-bold text-[#1b3a6b]">{org.display_name}</div>
                            <div className="text-[10px] text-slate-400">{ORG_TYPE_LABEL[org.org_type]}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-ink-muted">{fmtDate(org.verified_at)}</td>
                      <td className="px-4 py-3">
                        <span className={`font-semibold ${expired ? "text-red-600" : soon ? "text-amber-600" : "text-ink-muted"}`}>
                          {fmtDate(org.expires_at)}
                        </span>
                        {left !== null && (
                          <span className={`block text-[10px] ${expired ? "text-red-500" : soon ? "text-amber-500" : "text-slate-400"}`}>
                            {expired ? "منتهي" : `باقي ${left} يوم`}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleToggleFeatured(org)}
                          disabled={busyId === org.id}
                          title={org.is_featured ? "إزالة التمييز" : "تمييز المؤسسة"}
                          className={`text-sm font-bold px-3 py-1 rounded-lg border transition-colors disabled:opacity-50 ${
                            org.is_featured
                              ? "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200"
                              : "bg-bg-soft text-slate-400 border-line hover:bg-amber-50 hover:text-amber-600"
                          }`}
                        >
                          {org.is_featured ? "⭐ مميّزة" : "☆"}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-left">
                        <button
                          onClick={() => handleCancel(org)}
                          disabled={busyId === org.id}
                          className="text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 disabled:opacity-50"
                        >
                          {busyId === org.id ? "..." : "إلغاء الاشتراك"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
