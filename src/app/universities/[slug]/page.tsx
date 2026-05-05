"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { UNIVERSITIES, getUniversityBySlug } from "../data";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Review {
  id: number;
  rating: number;
  comment: string | null;
  major: string | null;
  year: string | null;
  created_at: string;
  profiles?: { full_name: string | null };
}

const Stars = ({ n, size = 16 }: { n: number; size?: number }) => (
  <span style={{ fontSize: size, letterSpacing: 1 }}>
    {"★".repeat(Math.round(n))}{"☆".repeat(5 - Math.round(n))}
  </span>
);

export default function UniversityPage() {
  const { slug } = useParams<{ slug: string }>();
  const uni       = getUniversityBySlug(slug);

  const [tab,      setTab]      = useState<"overview" | "reviews" | "compare">("overview");
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [userId,   setUserId]   = useState<string | null>(null);
  const [myRating, setMyRating] = useState(5);
  const [comment,  setComment]  = useState("");
  const [major,    setMajor]    = useState("");
  const [year,     setYear]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [compareSlug, setCompareSlug] = useState("");
  const compareUni = compareSlug ? getUniversityBySlug(compareSlug) : null;

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) =>
      setUserId(s?.user?.id ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (tab !== "reviews" || !slug) return;
    fetch(`/api/university-reviews?slug=${slug}`)
      .then(r => r.json())
      .then(d => setReviews(d.reviews || []));
  }, [tab, slug, submitted]);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const submitReview = async () => {
    if (!userId) { alert("Please sign in to leave a review"); return; }
    setSubmitting(true);
    await fetch("/api/university-reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug, rating: myRating, comment, major, year, userId }),
    });
    setSubmitting(false);
    setSubmitted(p => !p);
    setComment(""); setMajor(""); setYear("");
  };

  if (!uni) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem" }}>
      <div style={{ fontSize: 60 }}>🏫</div>
      <h2 style={{ color: "#333" }}>University not found</h2>
      <Link href="/universities" style={{ color: "#667eea", fontWeight: 600 }}>← Back to Universities</Link>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      {/* Hero */}
      <div style={{ background: `linear-gradient(135deg, ${uni.color}dd 0%, ${uni.color} 100%)`, padding: "2rem 1.5rem 3rem" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <Link href="/universities" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14 }}>
            ← All Universities
          </Link>
          <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "flex-start", gap: "1rem" }}>
            <div style={{
              width: 72, height: 72, borderRadius: 16, background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, flexShrink: 0,
            }}>
              {uni.emoji}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={{ color: "#fff", fontSize: 24, fontWeight: 800, margin: 0, lineHeight: 1.3, direction: "rtl" }}>
                {uni.name}
              </h1>
              <p style={{ color: "rgba(255,255,255,0.8)", margin: "0.25rem 0 0", fontSize: 14 }}>
                {uni.nameEn}
              </p>
            </div>
          </div>
          {/* Key stats row */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.25rem", flexWrap: "wrap" }}>
            {[
              { icon: "📍", label: uni.region },
              { icon: "💰", label: uni.tuition },
              { icon: "🗣️", label: uni.lang },
              { icon: "🏛️", label: `Est. ${uni.established}` },
              { icon: "👥", label: uni.students },
            ].filter(s => s.label).map(stat => (
              <div key={stat.label} style={{
                background: "rgba(255,255,255,0.15)", borderRadius: 8,
                padding: "0.35rem 0.75rem", fontSize: 13, color: "#fff",
              }}>
                {stat.icon} {stat.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ maxWidth: 800, margin: "-1.5rem auto 0", padding: "0 1.5rem" }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}>
            {(["overview", "reviews", "compare"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "1rem 0.5rem", border: "none", cursor: "pointer",
                fontWeight: 600, fontSize: 13, background: "transparent",
                color: tab === t ? "#667eea" : "#666",
                borderBottom: tab === t ? "2px solid #667eea" : "2px solid transparent",
                transition: "all 0.2s",
              }}>
                {t === "overview" ? "📋 Overview"
               : t === "reviews"  ? `⭐ Reviews${reviews.length && tab === "reviews" ? ` (${reviews.length})` : ""}`
               :                    "⚖️ Compare"}
              </button>
            ))}
          </div>

          <div style={{ padding: "1.5rem" }}>
            {/* ── Overview Tab ── */}
            {tab === "overview" && (
              <div>
                <p style={{ color: "#444", lineHeight: 1.7, fontSize: 15, direction: "rtl" }}>{uni.desc}</p>

                <h3 style={{ fontWeight: 700, color: "#1a1a2e", margin: "1.5rem 0 0.75rem", direction: "rtl" }}>
                  📚 الكليات والتخصصات
                </h3>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                  {uni.programs.map(p => (
                    <span key={p} style={{
                      background: "#f0f4ff", color: "#4338ca", borderRadius: 99,
                      padding: "0.35rem 0.85rem", fontSize: 13, fontWeight: 500, direction: "rtl",
                    }}>
                      {p}
                    </span>
                  ))}
                </div>

                <div style={{ marginTop: "1.5rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {[
                    { label: "المنطقة",        val: uni.region },
                    { label: "النوع",           val: uni.type },
                    { label: "لغة التدريس",    val: uni.lang },
                    { label: "الرسوم السنوية", val: uni.tuition },
                    { label: "تأسست",          val: uni.established || "—" },
                    { label: "عدد الطلاب",     val: uni.students || "—" },
                  ].map(item => (
                    <div key={item.label} style={{
                      background: "#f8fafc", borderRadius: 10, padding: "0.75rem",
                    }}>
                      <div style={{ fontSize: 11, color: "#888", fontWeight: 600, direction: "rtl" }}>{item.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#1a1a2e", direction: "rtl" }}>{item.val}</div>
                    </div>
                  ))}
                </div>

                <a href={uni.url} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: "0.5rem",
                  marginTop: "1.5rem", padding: "0.75rem 1.5rem", borderRadius: 12,
                  background: uni.color, color: "#fff", textDecoration: "none",
                  fontWeight: 700, fontSize: 15,
                }}>
                  🌐 Visit Official Website →
                </a>
              </div>
            )}

            {/* ── Reviews Tab ── */}
            {tab === "reviews" && (
              <div>
                {/* Average */}
                <div style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  background: "#f8fafc", borderRadius: 12, padding: "1rem 1.25rem", marginBottom: "1.5rem",
                }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 40, fontWeight: 800, color: "#1a1a2e", lineHeight: 1 }}>
                      {avgRating ? avgRating.toFixed(1) : "—"}
                    </div>
                    <div style={{ color: "#f59e0b", fontSize: 18 }}>
                      {avgRating ? "★".repeat(Math.round(avgRating)) : ""}
                    </div>
                    <div style={{ fontSize: 12, color: "#888" }}>{reviews.length} reviews</div>
                  </div>
                  <div style={{ flex: 1 }}>
                    {[5,4,3,2,1].map(star => {
                      const count = reviews.filter(r => Math.round(r.rating) === star).length;
                      const pct   = reviews.length ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={star} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: "#888", width: 8 }}>{star}</span>
                          <span style={{ color: "#f59e0b", fontSize: 11 }}>★</span>
                          <div style={{ flex: 1, background: "#e8e8e8", borderRadius: 99, height: 6 }}>
                            <div style={{ width: `${pct}%`, height: "100%", background: "#f59e0b", borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: 11, color: "#888", width: 20 }}>{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Write review */}
                <div style={{ background: "#f0f4ff", borderRadius: 12, padding: "1rem", marginBottom: "1.5rem" }}>
                  <h4 style={{ margin: "0 0 0.75rem", fontSize: 14, fontWeight: 700, color: "#1a1a2e" }}>
                    ✍️ Write a Review
                  </h4>
                  {!userId ? (
                    <div style={{ fontSize: 13, color: "#666" }}>
                      <Link href="/auth/login" style={{ color: "#667eea", fontWeight: 700 }}>Sign in</Link> to leave a review.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <span style={{ fontSize: 13, color: "#555", fontWeight: 600 }}>Rating:</span>
                        <div style={{ display: "flex", gap: "0.25rem" }}>
                          {[1,2,3,4,5].map(s => (
                            <button key={s} onClick={() => setMyRating(s)} style={{
                              fontSize: 22, background: "none", border: "none", cursor: "pointer",
                              color: s <= myRating ? "#f59e0b" : "#ddd",
                            }}>★</button>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" }}>
                        <input value={major} onChange={e => setMajor(e.target.value)}
                          placeholder="Your major (optional)" style={{
                          padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid #ddd",
                          fontSize: 13, outline: "none",
                        }} />
                        <select value={year} onChange={e => setYear(e.target.value)} style={{
                          padding: "0.5rem 0.75rem", borderRadius: 8, border: "1px solid #ddd",
                          fontSize: 13, outline: "none", background: "#fff",
                        }}>
                          <option value="">Year (optional)</option>
                          <option value="1">Year 1</option>
                          <option value="2">Year 2</option>
                          <option value="3">Year 3</option>
                          <option value="4">Year 4</option>
                          <option value="grad">Graduate</option>
                          <option value="alumni">Alumni</option>
                        </select>
                      </div>
                      <textarea value={comment} onChange={e => setComment(e.target.value)}
                        placeholder="Share your experience... (optional)"
                        rows={3} style={{
                          padding: "0.6rem 0.75rem", borderRadius: 8, border: "1px solid #ddd",
                          fontSize: 13, resize: "vertical", outline: "none", fontFamily: "inherit",
                        }} />
                      <button onClick={submitReview} disabled={submitting} style={{
                        padding: "0.65rem", borderRadius: 8, border: "none", cursor: "pointer",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "#fff", fontWeight: 700, fontSize: 14,
                      }}>
                        {submitting ? "Submitting…" : "Submit Review"}
                      </button>
                    </div>
                  )}
                </div>

                {/* Reviews list */}
                {reviews.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                    No reviews yet. Be the first!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                    {reviews.map(r => (
                      <div key={r.id} style={{
                        background: "#f8fafc", borderRadius: 12, padding: "1rem",
                        borderLeft: "3px solid #667eea",
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <div>
                            <span style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>
                              {r.profiles?.full_name || "Anonymous"}
                            </span>
                            {r.major && <span style={{ fontSize: 12, color: "#888", marginLeft: 6 }}>· {r.major}</span>}
                            {r.year && <span style={{ fontSize: 12, color: "#888", marginLeft: 4 }}>· Year {r.year}</span>}
                          </div>
                          <Stars n={r.rating} />
                        </div>
                        {r.comment && (
                          <p style={{ margin: 0, fontSize: 14, color: "#444", lineHeight: 1.6 }}>{r.comment}</p>
                        )}
                        <div style={{ fontSize: 11, color: "#bbb", marginTop: 6 }}>
                          {new Date(r.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── Compare Tab ── */}
            {tab === "compare" && (
              <div>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label style={{ fontWeight: 600, fontSize: 14, color: "#333", display: "block", marginBottom: 8 }}>
                    ⚖️ Compare with:
                  </label>
                  <select value={compareSlug} onChange={e => setCompareSlug(e.target.value)} style={{
                    width: "100%", padding: "0.75rem", borderRadius: 10, border: "1px solid #ddd",
                    fontSize: 14, outline: "none", background: "#fff",
                  }}>
                    <option value="">— Select a university —</option>
                    {UNIVERSITIES.filter(u => u.slug !== uni.slug).map(u => (
                      <option key={u.id} value={u.slug}>{u.name.split("–")[1]?.trim() || u.abbr} — {u.name.split("–")[0].trim()}</option>
                    ))}
                  </select>
                </div>

                {compareUni ? (
                  <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: "0.75rem", background: "#f8fafc", color: "#555", fontWeight: 600, textAlign: "left", borderBottom: "2px solid #e8e8e8", width: "35%" }}>
                            Feature
                          </th>
                          <th style={{ padding: "0.75rem", textAlign: "center", borderBottom: "2px solid #e8e8e8", background: `${uni.color}15` }}>
                            <div style={{ fontSize: 22 }}>{uni.emoji}</div>
                            <div style={{ fontWeight: 800, color: uni.color, fontSize: 13 }}>{uni.abbr}</div>
                          </th>
                          <th style={{ padding: "0.75rem", textAlign: "center", borderBottom: "2px solid #e8e8e8", background: `${compareUni.color}15` }}>
                            <div style={{ fontSize: 22 }}>{compareUni.emoji}</div>
                            <div style={{ fontWeight: 800, color: compareUni.color, fontSize: 13 }}>{compareUni.abbr}</div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { label: "Type",     a: uni.type,        b: compareUni.type },
                          { label: "Region",   a: uni.region,      b: compareUni.region },
                          { label: "Language", a: uni.lang,        b: compareUni.lang },
                          { label: "Tuition",  a: uni.tuition,     b: compareUni.tuition },
                          { label: "Ranking",  a: uni.rank,        b: compareUni.rank },
                          { label: "Students", a: uni.students||"—", b: compareUni.students||"—" },
                          { label: "Founded",  a: uni.established||"—", b: compareUni.established||"—" },
                        ].map((row, i) => (
                          <tr key={row.label} style={{ background: i % 2 === 0 ? "#f8fafc" : "#fff" }}>
                            <td style={{ padding: "0.65rem 0.75rem", fontWeight: 600, color: "#555" }}>{row.label}</td>
                            <td style={{ padding: "0.65rem 0.75rem", textAlign: "center", direction: "rtl" }}>{row.a}</td>
                            <td style={{ padding: "0.65rem 0.75rem", textAlign: "center", direction: "rtl" }}>{row.b}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Programs comparison */}
                    <div style={{ marginTop: "1.25rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                      {[{ u: uni }, { u: compareUni }].map(({ u }) => (
                        <div key={u.slug} style={{ background: `${u.color}0d`, borderRadius: 10, padding: "0.85rem" }}>
                          <div style={{ fontWeight: 700, color: u.color, fontSize: 13, marginBottom: 8 }}>
                            {u.abbr} Programs
                          </div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.3rem" }}>
                            {u.programs.map(p => (
                              <span key={p} style={{
                                background: `${u.color}20`, color: u.color,
                                borderRadius: 99, padding: "0.2rem 0.6rem", fontSize: 11, direction: "rtl",
                              }}>{p}</span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                      {[uni, compareUni].map(u => (
                        <Link key={u.slug} href={`/universities/${u.slug}`} style={{
                          display: "block", padding: "0.65rem", borderRadius: 10,
                          background: u.color, color: "#fff", textDecoration: "none",
                          fontWeight: 700, fontSize: 13, textAlign: "center",
                        }}>
                          View {u.abbr} →
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                    Select a university above to compare
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div style={{ height: "3rem" }} />
      </div>
    </div>
  );
}
