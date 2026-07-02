"use client";
// Client island for a school profile: logs the view event + renders the
// gated reviews section (only students of that school can review).
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { emit } from "@/lib/events/emit";
import { useI18n } from "@/lib/i18n";

interface Review {
  id: number;
  user_id: string;
  rating: number;
  text: string;
  status_year: string | null;
  created_at: string;
}

function Stars({ n }: { n: number }) {
  return <span>{Array.from({ length: 5 }).map((_, i) => <span key={i} className={i < n ? "text-yellow-400" : "text-gray-200"}>★</span>)}</span>;
}

export default function SchoolReviews({ schoolId, schoolName }: { schoolId: number; schoolName: string }) {
  const { t, lang } = useI18n();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [user, setUser] = useState<{ id: string } | null>(null);
  const [profile, setProfile] = useState<{ school_name?: string } | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    void emit("student.viewed_school", { entity_type: "school", entity_id: String(schoolId) });
    loadReviews();
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [schoolId]);

  const loadReviews = async () => {
    const { data } = await supabase.from("entity_reviews").select("*")
      .eq("entity_type", "school").eq("entity_id", String(schoolId)).eq("is_visible", true)
      .order("created_at", { ascending: false });
    setReviews((data as Review[]) || []);
  };
  const loadUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const { data } = await supabase.from("student_profiles").select("school_name").eq("user_id", session.user.id).maybeSingle();
      if (data) setProfile(data);
    }
  };

  const canReview = !!user && !!profile?.school_name && !!schoolName &&
    profile.school_name.toLowerCase().includes(schoolName.toLowerCase().slice(0, 10));
  const userReviewed = reviews.some((r) => r.user_id === user?.id);

  return (
    <div className="bg-surface rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg text-primary">{t("dp.sch.reviews_title")} ({reviews.length})</h2>
        {canReview && !userReviewed && (
          <button onClick={() => setShowForm(true)} className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm">{t("dp.sch.add_review")}</button>
        )}
      </div>

      {!user && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4 text-sm text-blue-900">
          {t("dp.sch.signin_pre")} <Link href="/auth/login" className="font-bold underline">{t("dp.sch.signin_link")}</Link> {t("dp.sch.signin_post")}
        </div>
      )}
      {user && !canReview && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4 text-sm text-amber-900">
          {t("dp.sch.gate_pre")} <strong>{schoolName}</strong> {t("dp.sch.gate_link_pre")} <Link href="/profile" className="font-bold underline">{t("dp.sch.gate_link")}</Link>{t("dp.sch.gate_post")}
        </div>
      )}

      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-bg-soft rounded-xl">
          <div className="text-5xl mb-3">💬</div>
          <p className="text-ink-subtle">{t("dp.sch.no_reviews")}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="border border-line rounded-xl p-5">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <div className="font-bold text-ink">{t("dp.uni.alumni_label")}</div>
                  <div className="text-xs text-ink-subtle">{r.status_year} • {new Date(r.created_at).toLocaleDateString(lang === "ar" ? "ar" : "en")}</div>
                </div>
                <Stars n={r.rating} />
              </div>
              <p className="text-ink-muted text-sm leading-relaxed">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      {showForm && user && (
        <ReviewForm entityId={String(schoolId)} onClose={() => setShowForm(false)} onSubmit={async () => { await loadReviews(); setShowForm(false); }} />
      )}
    </div>
  );
}

function ReviewForm({ entityId, onClose, onSubmit }: { entityId: string; onClose: () => void; onSubmit: () => Promise<void> }) {
  const { t, dir } = useI18n();
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [statusYear, setStatusYear] = useState(t("dp.review.s.current"));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  const submit = async () => {
    if (!text.trim()) { setErr(t("dp.review.err.empty")); return; }
    setSaving(true); setErr("");
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) { setErr(t("dp.review.err.login")); setSaving(false); return; }
    const { error } = await supabase.from("entity_reviews").upsert({
      user_id: session.user.id, entity_type: "school", entity_id: entityId,
      rating, text: text.trim(), status_year: statusYear,
    }, { onConflict: "user_id,entity_type,entity_id" });
    if (error) { setErr(error.message); setSaving(false); return; }
    await onSubmit(); setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-surface rounded-2xl shadow-2xl w-full max-w-lg p-6" dir={dir}>
        <h2 className="text-xl font-bold text-primary mb-4">{t("dp.review.modal")}</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-2">{t("dp.review.rating")}</label>
            <div className="flex gap-1 text-3xl">
              {[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => setRating(n)} className={n <= rating ? "text-yellow-400" : "text-gray-300"}>★</button>)}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t("dp.review.status")}</label>
            <select value={statusYear} onChange={(e) => setStatusYear(e.target.value)} className="w-full px-3 py-2 border border-line rounded-lg bg-surface">
              <option value={t("dp.review.s.current")}>{t("dp.review.s.current")}</option>
              <option value={t("dp.review.s.grad_2024")}>{t("dp.review.s.grad_2024")}</option>
              <option value={t("dp.review.s.grad_2023")}>{t("dp.review.s.grad_2023")}</option>
              <option value={t("dp.review.s.grad_old")}>{t("dp.review.s.grad_old")}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-2">{t("dp.review.comment")}</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full px-3 py-2 border border-line rounded-lg min-h-[120px]" />
          </div>
          {err && <div className="bg-red-50 text-red-700 p-3 rounded-lg text-sm">❌ {err}</div>}
          <div className="flex gap-2">
            <button onClick={submit} disabled={saving} className="flex-1 px-5 py-2.5 bg-primary text-white rounded-lg font-bold disabled:opacity-50">{saving ? t("dp.review.publishing") : t("dp.review.publish")}</button>
            <button onClick={onClose} className="px-5 py-2.5 bg-bg-soft rounded-lg font-bold">{t("dp.review.cancel")}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
