"use client";
/**
 * /dashboard/interested — "من مهتم فيك؟"
 * يعرض للطالب المؤسسات التي أضافته كـ lead (اهتمت بملفه).
 * مبني على جدول org_leads حيث student_id = current user.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SkeletonList } from "@/components/ui/Skeleton";

interface OrgLead {
  id: string;
  org_id: string;
  source: string | null;
  status: string | null;
  score: number | null;
  first_interaction_at: string;
  last_interaction_at: string;
  org?: {
    display_name: string;
    org_type: string;
    logo_url: string | null;
    slug: string;
    verification_status: string;
  };
}

const ORG_TYPE_LABEL: Record<string, string> = {
  university: "جامعة",
  school:     "مدرسة",
  vocational: "معهد مهني",
  center:     "مركز تدريبي",
};

const SOURCE_LABEL: Record<string, string> = {
  profile_view:        "شاهدت ملفك الشخصي",
  scholarship_apply:   "تقدمت لمنحتها",
  university_save:     "حفظت الجامعة",
  career_match:        "تطابق مسار مهني",
  direct:              "تواصل مباشر",
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "اليوم";
  if (days === 1) return "أمس";
  if (days < 7)  return `منذ ${days} أيام`;
  if (days < 30) return `منذ ${Math.floor(days / 7)} أسابيع`;
  return `منذ ${Math.floor(days / 30)} أشهر`;
}

export default function InterestedPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [leads, setLeads] = useState<OrgLead[]>([]);
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/auth/login?next=/dashboard/interested"); return; }

      // Check if profile is public
      const { data: card } = await supabase
        .from("student_cards")
        .select("is_public")
        .eq("user_id", user.id)
        .maybeSingle();
      setIsPublic(card?.is_public ?? false);

      // Fetch org_leads for this student
      const { data: rawLeads } = await supabase
        .from("org_leads")
        .select(`
          id, org_id, source, status, score,
          first_interaction_at, last_interaction_at,
          organizations!org_leads_org_id_fkey (
            display_name, org_type, logo_url, slug, verification_status
          )
        `)
        .eq("student_id", user.id)
        .order("last_interaction_at", { ascending: false });

      if (rawLeads) {
        setLeads(
          rawLeads.map((r: Record<string, unknown>) => ({
            ...r,
            org: Array.isArray(r.organizations) ? r.organizations[0] : r.organizations,
          })) as OrgLead[]
        );
      }
      setLoading(false);
    })();
  }, [router]);

  if (loading) {
    return (
      <main dir="rtl" className="min-h-screen bg-[#f8fafc] py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="h-20 bg-white/10 rounded-2xl animate-pulse" />
          <SkeletonList count={4} />
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <Link href="/dashboard" className="text-sm text-ink-subtle hover:text-[#0F4A52] mb-3 inline-block">
            ← العودة للوحة التحكم
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-[#1b3a6b] flex items-center gap-2">
                👀 من مهتم فيك؟
              </h1>
              <p className="text-ink-subtle text-sm mt-1">
                المؤسسات والجامعات اللي اهتمت بملفك الأكاديمي
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-extrabold text-[#0F4A52]">{leads.length}</div>
              <div className="text-xs text-ink-subtle">مؤسسة</div>
            </div>
          </div>
        </div>

        {/* Profile visibility warning */}
        {!isPublic && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <span className="text-2xl">🔒</span>
            <div className="flex-1">
              <p className="text-amber-800 font-bold text-sm">ملفك الشخصي خاص حالياً</p>
              <p className="text-amber-700 text-xs mt-0.5">
                جعل ملفك عاماً يزيد من فرص اهتمام المؤسسات بك.
              </p>
              <Link href="/profile?tab=id" className="inline-block mt-2 text-xs font-bold text-amber-700 underline">
                تفعيل الملف العام ←
              </Link>
            </div>
          </div>
        )}

        {/* Empty state */}
        {leads.length === 0 && (
          <div className="bg-surface rounded-2xl border border-white/10 p-10 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <h2 className="text-xl font-extrabold text-[#1b3a6b] mb-2">
              ما في مؤسسات مهتمة بعد
            </h2>
            <p className="text-ink-subtle text-sm leading-relaxed mb-6 max-w-sm mx-auto">
              أكمل ملفك الشخصي، وفعّل الملف العام، وأكمل اختبار Career DNA لجذب اهتمام الجامعات والمؤسسات.
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              <Link href="/career-dna" className="px-4 py-2 bg-[#0F4A52] text-white rounded-xl font-bold text-sm">
                🧬 اختبار Career DNA
              </Link>
              <Link href="/profile" className="px-4 py-2 border-2 border-white/10 text-ink-muted rounded-xl font-bold text-sm">
                ✏️ أكمل ملفك
              </Link>
            </div>
          </div>
        )}

        {/* Leads list */}
        {leads.length > 0 && (
          <div className="space-y-3">
            {leads.map((lead) => (
              <div key={lead.id} className="bg-surface rounded-2xl border border-white/10 p-5 hover:border-[#0F4A52]/30 hover:shadow-sm transition-all">
                <div className="flex items-start gap-4">
                  {/* Logo */}
                  <div className="w-12 h-12 rounded-xl bg-[#0F4A52]/10 flex items-center justify-center text-2xl flex-shrink-0">
                    {lead.org?.logo_url
                      ? /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={lead.org.logo_url} alt="" className="w-full h-full object-contain rounded-xl" />
                      : "🏛️"}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name + type */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-extrabold text-[#1b3a6b]">
                        {lead.org?.display_name ?? "مؤسسة"}
                      </span>
                      {lead.org?.verification_status === "verified" && (
                        <span className="text-xs bg-blue-100 text-blue-700 font-bold px-2 py-0.5 rounded-full">✓ موثّقة</span>
                      )}
                      {lead.org?.org_type && (
                        <span className="text-xs text-ink-subtle">
                          {ORG_TYPE_LABEL[lead.org.org_type] ?? lead.org.org_type}
                        </span>
                      )}
                    </div>

                    {/* Source */}
                    <p className="text-sm text-ink-subtle mt-1">
                      {SOURCE_LABEL[lead.source ?? ""] ?? lead.source ?? "اهتمت بملفك"}
                    </p>

                    {/* Timestamps + score */}
                    <div className="flex items-center gap-4 mt-2 text-xs text-ink-subtle">
                      <span>أول تفاعل: {timeAgo(lead.first_interaction_at)}</span>
                      <span>آخر تفاعل: {timeAgo(lead.last_interaction_at)}</span>
                      {lead.score !== null && lead.score > 0 && (
                        <span className="text-[#0F4A52] font-semibold">
                          نقاط الاهتمام: {lead.score}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  {lead.org?.slug && (
                    <Link
                      href={`/${lead.org.org_type === "university" ? "universities" : lead.org.org_type === "school" ? "schools" : "org"}/${lead.org.slug}`}
                      className="flex-shrink-0 text-xs font-bold text-[#0F4A52] border border-[#0F4A52]/30 px-3 py-1.5 rounded-lg hover:bg-[#0F4A52]/5 transition-colors"
                    >
                      عرض الصفحة →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tips */}
        <div className="mt-8 bg-gradient-to-br from-[#0F4A52] to-[#1A6F7C] rounded-2xl p-6 text-white">
          <h3 className="font-extrabold mb-3 text-lg">💡 كيف تجذب اهتمام أكثر؟</h3>
          <ul className="space-y-2 text-sm text-white/90">
            <li className="flex items-start gap-2">
              <span>✅</span> أكمل اختبار Career DNA لإظهار مسارك المهني
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span> أضف صورتك الشخصية واسمك كاملاً على بطاقة الهوية
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span> فعّل الملف العام حتى تجده المؤسسات
            </li>
            <li className="flex items-start gap-2">
              <span>✅</span> تصفّح المنح وتقدّم إليها — ينشئ تفاعلاً مع المؤسسات
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
