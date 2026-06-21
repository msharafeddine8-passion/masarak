"use client";
// Admin inbox for partnership requests.
// Read-only list with mark-as-contacted/approved/rejected actions.

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Req = {
  id: string;
  org_type: "school" | "university";
  org_name: string;
  contact_person: string;
  position: string | null;
  email: string;
  phone: string | null;
  num_students: number | null;
  city: string | null;
  country: string | null;
  student_capacity: number | null;
  message: string | null;
  status: "new" | "contacted" | "approved" | "rejected";
  admin_notes: string | null;
  created_at: string;
};

const STATUS_STYLE: Record<Req["status"], string> = {
  new:       "bg-blue-100 text-blue-700",
  contacted: "bg-amber-100 text-amber-800",
  approved:  "bg-emerald-100 text-emerald-700",
  rejected:  "bg-white/10 text-ink-muted",
};

export default function AdminPartnershipsPage() {
  const [requests, setRequests] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Req["status"] | "all">("all");

  async function load() {
    setLoading(true);
    let q = supabase.from("partnership_requests").select("*").order("created_at", { ascending: false });
    if (filter !== "all") q = q.eq("status", filter);
    const { data } = await q;
    setRequests((data as Req[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, [filter]); // eslint-disable-line

  async function updateStatus(id: string, status: Req["status"]) {
    await supabase.from("partnership_requests").update({
      status,
      reviewed_at: new Date().toISOString(),
    }).eq("id", id);
    load();
  }

  const counts = {
    new: requests.filter(r => r.status === "new").length,
    total: requests.length,
  };

  return (
    <main className="min-h-screen bg-bg-soft p-6" dir="rtl">
      <div className="max-w-6xl mx-auto">
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold text-[#012730] mb-1">طلبات الشراكة</h1>
          <p className="text-ink-muted">
            {counts.total} طلب · <span className="font-bold text-blue-700">{counts.new} جديد</span>
          </p>
        </header>

        <div className="flex gap-2 mb-6 flex-wrap">
          {(["all", "new", "contacted", "approved", "rejected"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition ${
                filter === s ? "bg-[#012730] text-white" : "bg-surface border border-white/10 text-ink-muted hover:border-[#012730]"
              }`}
            >
              {s === "all" ? "الكل" : s === "new" ? "جديد" : s === "contacted" ? "تم التواصل" : s === "approved" ? "موافق عليه" : "مرفوض"}
            </button>
          ))}
        </div>

        {loading && <div className="text-center py-12 text-ink-subtle">⏳ جارٍ التحميل...</div>}

        {!loading && requests.length === 0 && (
          <div className="text-center py-16 bg-surface rounded-2xl border border-white/10">
            <div className="text-5xl mb-3">📭</div>
            <p className="text-ink-subtle">مفيش طلبات بهالحالة</p>
          </div>
        )}

        <div className="space-y-3">
          {requests.map(r => (
            <div key={r.id} className="bg-surface rounded-2xl border border-white/10 p-5">
              <div className="flex justify-between items-start gap-4 mb-3">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wide text-ink-subtle">
                    {r.org_type === "school" ? "🏫 مدرسة" : "🏛️ جامعة"}
                  </span>
                  <h2 className="text-xl font-extrabold text-[#012730] mt-1">{r.org_name}</h2>
                  <div className="text-sm text-ink-muted mt-1">
                    {r.contact_person}{r.position && ` · ${r.position}`}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[r.status]}`}>
                  {r.status === "new" ? "جديد" : r.status === "contacted" ? "تم التواصل" : r.status === "approved" ? "موافق" : "مرفوض"}
                </span>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2 text-sm text-ink-muted mb-3">
                <div>📧 <span dir="ltr">{r.email}</span></div>
                {r.phone && <div>📞 <span dir="ltr">{r.phone}</span></div>}
                {r.city && <div>📍 {r.city}</div>}
                {r.country && <div>🌍 {r.country}</div>}
                {r.num_students !== null && <div>👥 {r.num_students} طالب</div>}
                {r.student_capacity !== null && <div>🎓 طاقة {r.student_capacity}</div>}
              </div>

              {r.message && (
                <div className="bg-bg-soft rounded-xl p-3 text-sm text-ink-muted mb-3 whitespace-pre-line">
                  {r.message}
                </div>
              )}

              <div className="flex gap-2 flex-wrap text-xs">
                <span className="text-ink-subtle">{new Date(r.created_at).toLocaleDateString("ar")}</span>
                <span className="text-gray-300">·</span>
                <a href={`mailto:${r.email}`} className="text-blue-700 font-bold hover:underline">📧 رد بالإيميل</a>
                <span className="text-gray-300">·</span>
                {r.status !== "contacted" && (
                  <button onClick={() => updateStatus(r.id, "contacted")} className="text-amber-700 font-bold hover:underline">
                    تم التواصل
                  </button>
                )}
                {r.status !== "approved" && (
                  <button onClick={() => updateStatus(r.id, "approved")} className="text-emerald-700 font-bold hover:underline">
                    موافقة
                  </button>
                )}
                {r.status !== "rejected" && (
                  <button onClick={() => updateStatus(r.id, "rejected")} className="text-ink-subtle font-bold hover:underline">
                    رفض
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
