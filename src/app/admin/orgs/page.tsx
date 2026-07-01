"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import {
  fetchPendingRequests, grantOrgAccess, rejectRequest,
  type OrgAccessRequest, type OrgType,
} from "@/lib/org";

const ORG_TYPE_KEY: Record<OrgType, string> = {
  university: "adminorgs.typeUniversity",
  school: "adminorgs.typeSchool",
  vocational: "adminorgs.typeVocational",
  center: "adminorgs.typeCenter",
};

export default function AdminOrgsPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [adminId, setAdminId] = useState<string>("");
  const [requests, setRequests] = useState<OrgAccessRequest[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    setRequests(await fetchPendingRequests());
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.push("/auth/login?next=/admin/orgs"); return; }
      setAdminId(data.user.id);
      load();
    });
  }, [router]);

  async function handleGrant(req: OrgAccessRequest) {
    setBusyId(req.id);
    const { error } = await grantOrgAccess(req, adminId);
    if (error) { alert(t("adminorgs.errorPrefix") + error); setBusyId(null); return; }
    await load();
    setBusyId(null);
  }

  async function handleReject(req: OrgAccessRequest) {
    const reason = prompt(t("adminorgs.rejectPromptPrefix") + `"${req.organizations?.display_name}"` + t("adminorgs.rejectPromptSuffix"));
    if (reason === null) return;
    setBusyId(req.id);
    await rejectRequest(req.id, adminId, reason.trim() || t("adminorgs.unspecified"));
    await load();
    setBusyId(null);
  }

  return (
    <main className="min-h-screen bg-bg-soft py-8 px-4" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Link href="/admin" className="text-sm text-ink-subtle hover:text-primary">← {t("adminorgs.backToAdmin")}</Link>
            <h1 className="text-2xl font-extrabold text-primary mt-1">{t("adminorgs.title")}</h1>
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${
            requests.length > 0 ? "bg-amber-100 text-amber-700" : "bg-bg-soft text-ink-subtle"
          }`}>
            {requests.length} {t("adminorgs.pendingCount")}
          </span>
        </div>

        {loading ? (
          <div className="bg-surface rounded-2xl border border-line p-12 text-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : requests.length === 0 ? (
          <div className="bg-surface rounded-2xl border border-line p-12 text-center">
            <div className="text-5xl mb-3">✅</div>
            <p className="text-ink-subtle">{t("adminorgs.emptyTitle")}</p>
            <p className="text-xs text-ink-subtle mt-2">
              {t("adminorgs.emptyHintPrefix")} <Link href="/org/claim" className="text-primary underline">{t("adminorgs.emptyHintLink")}</Link> {t("adminorgs.emptyHintSuffix")}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
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
                    <div className="font-extrabold text-primary">{req.organizations?.display_name}</div>
                    <div className="text-xs text-ink-subtle">
                      {req.organizations && t(ORG_TYPE_KEY[req.organizations.org_type] as TranslationKey)}
                      {" · "}
                      {new Date(req.created_at).toLocaleDateString("ar")}
                    </div>
                  </div>
                </div>

                {req.requester_email && (
                  <div className="text-sm text-ink-muted mb-2">
                    <span className="font-bold text-ink-subtle text-xs">{t("adminorgs.requesterEmail")} </span>
                    <span dir="ltr">{req.requester_email}</span>
                  </div>
                )}

                <div className="bg-bg-soft rounded-xl p-3 text-sm text-ink-muted mb-3 leading-relaxed">
                  <span className="font-bold text-ink-subtle text-xs">{t("adminorgs.message")} </span>
                  {req.note}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleGrant(req)}
                    disabled={busyId === req.id}
                    className="flex-1 bg-green-600 text-white font-bold py-2.5 rounded-xl text-sm hover:bg-green-700 disabled:opacity-50"
                  >
                    {busyId === req.id ? "..." : "✓ " + t("adminorgs.grantButton")}
                  </button>
                  <button
                    onClick={() => handleReject(req)}
                    disabled={busyId === req.id}
                    className="flex-1 border-2 border-red-300 text-red-600 font-bold py-2.5 rounded-xl text-sm hover:bg-red-50 disabled:opacity-50"
                  >
                    {t("adminorgs.rejectButton")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <p className="text-xs text-ink-subtle text-center mt-6">
          {t("adminorgs.footerNote")}
        </p>
      </div>
    </main>
  );
}
