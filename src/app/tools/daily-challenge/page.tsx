"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface Challenge {
  id: number;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  category: string;
  difficulty: number;
}
interface UserStats {
  total_xp: number;
  current_streak: number;
  longest_streak: number;
  last_challenge_date: string;
}
interface LeaderEntry {
  user_id: string;
  total_xp: number;
  current_streak: number;
  profiles?: { full_name: string | null };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const diffLabel = (d: number) =>
  d === 1 ? { text: "Beginner", color: "bg-green-100 text-green-700" }
: d === 2 ? { text: "Intermediate", color: "bg-amber-100 text-amber-700" }
:           { text: "Advanced", color: "bg-red-100 text-red-700" };

const xpToLevel = (xp: number) => {
  if (xp <  100) return { level: 1, title: "Explorer",    next: 100 };
  if (xp <  300) return { level: 2, title: "Learner",     next: 300 };
  if (xp <  600) return { level: 3, title: "Achiever",    next: 600 };
  if (xp < 1000) return { level: 4, title: "Scholar",     next: 1000 };
  if (xp < 1500) return { level: 5, title: "Expert",      next: 1500 };
               return { level: 6, title: "Master",      next: 9999 };
};

const catEmoji: Record<string, string> = {
  career: "💼", study: "📚", skills: "🛠️", tech: "💻",
  finance: "💰", general: "🌍", health: "🏥",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DailyChallengePage() {
  const [userId,   setUserId]   = useState<string | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [selected,  setSelected] = useState<string | null>(null);
  const [result,    setResult]   = useState<{
    isCorrect: boolean; xpEarned: number; correctAnswer: string; explanation: string;
    newXP: number; newStreak: number;
  } | null>(null);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [revealAnswer, setRevealAnswer] = useState<string | null>(null);
  const [explanation,  setExplanation]  = useState<string | null>(null);
  const [tab,       setTab]      = useState<"challenge" | "leaderboard">("challenge");
  const [leaders,   setLeaders]  = useState<LeaderEntry[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [today,     setToday]    = useState("");

  // ── Auth ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) =>
      setUserId(s?.user?.id ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  // ── Load challenge ─────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const url = userId
        ? `/api/daily-challenge?userId=${userId}`
        : `/api/daily-challenge`;
      const res  = await fetch(url);
      const data = await res.json();
      setChallenge(data.challenge);
      setUserStats(data.userStats);
      setToday(data.today || "");
      if (data.alreadyAnswered) {
        setAlreadyDone(true);
        setRevealAnswer(data.correctAnswer);
        setExplanation(data.explanation);
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  // ── Load leaderboard ───────────────────────────────────────────────────────
  useEffect(() => {
    if (tab !== "leaderboard") return;
    supabase
      .from("user_stats")
      .select("user_id, total_xp, current_streak, profiles(full_name)")
      .order("total_xp", { ascending: false })
      .limit(10)
      .then(({ data }) => setLeaders((data as unknown as LeaderEntry[]) || []));
  }, [tab]);

  // ── Submit answer ──────────────────────────────────────────────────────────
  const submit = async () => {
    if (!selected || !challenge) return;
    if (!userId) { alert("Please sign in to save your progress!"); return; }
    setSubmitting(true);
    const res  = await fetch("/api/daily-challenge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, challengeId: challenge.id, answer: selected }),
    });
    const data = await res.json();
    if (res.ok) {
      setResult(data);
      setRevealAnswer(data.correctAnswer);
      setExplanation(data.explanation);
      setUserStats(s => s
        ? { ...s, total_xp: data.newXP, current_streak: data.newStreak }
        : { total_xp: data.newXP, current_streak: data.newStreak, longest_streak: data.newStreak, last_challenge_date: today }
      );
    }
    setSubmitting(false);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  const stats     = userStats ? xpToLevel(userStats.total_xp) : xpToLevel(0);
  const xpInLevel = userStats ? userStats.total_xp - (stats.level > 1 ? [0,0,100,300,600,1000,1500][stats.level] : 0) : 0;
  const xpNeeded  = stats.next - (stats.level > 1 ? [0,0,100,300,600,1000,1500][stats.level] : 0);
  const progress  = Math.min(100, Math.round((xpInLevel / xpNeeded) * 100));
  const diff      = challenge ? diffLabel(challenge.difficulty) : null;
  const answered  = !!result || alreadyDone;

  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "Inter, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "2rem 1.5rem 3rem" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <Link href="/tools" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 14 }}>
            ← Back to Tools
          </Link>
          <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
            <div>
              <h1 style={{ color: "#fff", fontSize: 28, fontWeight: 800, margin: 0 }}>⚡ Daily Challenge</h1>
              <p style={{ color: "rgba(255,255,255,0.75)", margin: "0.25rem 0 0", fontSize: 14 }}>
                One question per day — grow your career knowledge
              </p>
            </div>
            {/* Streak + XP badges */}
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "0.5rem 1rem", textAlign: "center" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 22 }}>
                  🔥 {userStats?.current_streak ?? 0}
                </div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>day streak</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.15)", borderRadius: 12, padding: "0.5rem 1rem", textAlign: "center" }}>
                <div style={{ color: "#fff", fontWeight: 800, fontSize: 22 }}>
                  ⭐ {userStats?.total_xp ?? 0}
                </div>
                <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>total XP</div>
              </div>
            </div>
          </div>

          {/* Level bar */}
          <div style={{ marginTop: "1.25rem", background: "rgba(255,255,255,0.1)", borderRadius: 12, padding: "0.75rem 1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 13 }}>
                Level {stats.level} — {stats.title}
              </span>
              <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 12 }}>
                {xpInLevel} / {xpNeeded} XP
              </span>
            </div>
            <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 99, height: 8 }}>
              <div style={{
                width: `${progress}%`, height: "100%", borderRadius: 99,
                background: "linear-gradient(90deg, #f6d365, #fda085)",
                transition: "width 0.5s ease",
              }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ maxWidth: 700, margin: "-1.5rem auto 0", padding: "0 1.5rem" }}>
        <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 20px rgba(0,0,0,0.08)", overflow: "hidden" }}>
          <div style={{ display: "flex", borderBottom: "1px solid #f0f0f0" }}>
            {(["challenge", "leaderboard"] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                flex: 1, padding: "1rem", border: "none", cursor: "pointer", fontWeight: 600,
                fontSize: 14, background: "transparent",
                color: tab === t ? "#667eea" : "#666",
                borderBottom: tab === t ? "2px solid #667eea" : "2px solid transparent",
                transition: "all 0.2s",
              }}>
                {t === "challenge" ? "⚡ Today's Challenge" : "🏆 Leaderboard"}
              </button>
            ))}
          </div>

          <div style={{ padding: "1.5rem" }}>

            {/* ── Challenge Tab ── */}
            {tab === "challenge" && (
              <>
                {loading ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
                    <div style={{ fontSize: 40, marginBottom: 8 }}>⚡</div>
                    Loading today&apos;s challenge…
                  </div>
                ) : !challenge ? (
                  <div style={{ textAlign: "center", padding: "3rem", color: "#999" }}>
                    No challenge available today. Check back soon!
                  </div>
                ) : (
                  <>
                    {/* Category + difficulty */}
                    <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
                      <span style={{ background: "#f0f4ff", color: "#667eea", borderRadius: 99, padding: "0.3rem 0.75rem", fontSize: 13, fontWeight: 600 }}>
                        {catEmoji[challenge.category] || "🌍"} {challenge.category}
                      </span>
                      {diff && (
                        <span style={{ borderRadius: 99, padding: "0.3rem 0.75rem", fontSize: 13, fontWeight: 600 }} className={diff.color}>
                          {diff.text}
                        </span>
                      )}
                      <span style={{ marginLeft: "auto", color: "#999", fontSize: 12, alignSelf: "center" }}>
                        📅 {today}
                      </span>
                    </div>

                    {/* Question */}
                    <div style={{ background: "#f8fafc", borderRadius: 12, padding: "1.25rem", marginBottom: "1.25rem" }}>
                      <p style={{ margin: 0, fontSize: 17, fontWeight: 600, color: "#1a1a2e", lineHeight: 1.5 }}>
                        {challenge.question}
                      </p>
                    </div>

                    {/* Options */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                      {(["a","b","c","d"] as const).map(opt => {
                        const text = challenge[`option_${opt}`];
                        const isSelected = selected === opt;
                        const isCorrect  = revealAnswer === opt;
                        const isWrong    = answered && isSelected && !isCorrect;
                        let bg = "#f8fafc", border = "2px solid #e8e8e8", color = "#333";
                        if (isCorrect && answered)        { bg = "#f0fdf4"; border = "2px solid #22c55e"; color = "#15803d"; }
                        else if (isWrong)                 { bg = "#fff1f2"; border = "2px solid #ef4444"; color = "#dc2626"; }
                        else if (isSelected && !answered) { bg = "#f0f4ff"; border = "2px solid #667eea"; color = "#4338ca"; }
                        return (
                          <button key={opt} disabled={answered} onClick={() => setSelected(opt)} style={{
                            display: "flex", alignItems: "center", gap: "0.75rem",
                            padding: "0.85rem 1rem", borderRadius: 10, cursor: answered ? "default" : "pointer",
                            background: bg, border, color, fontWeight: isCorrect && answered ? 700 : 500,
                            fontSize: 15, textAlign: "left", transition: "all 0.15s",
                          }}>
                            <span style={{
                              width: 28, height: 28, borderRadius: "50%", display: "flex",
                              alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 800,
                              background: isCorrect && answered ? "#22c55e" : isWrong ? "#ef4444" : isSelected ? "#667eea" : "#e0e0e0",
                              color: (isCorrect && answered) || isWrong || isSelected ? "#fff" : "#666",
                              flexShrink: 0,
                            }}>
                              {opt.toUpperCase()}
                            </span>
                            {text}
                            {isCorrect && answered && <span style={{ marginLeft: "auto" }}>✓</span>}
                            {isWrong            && <span style={{ marginLeft: "auto" }}>✗</span>}
                          </button>
                        );
                      })}
                    </div>

                    {/* Submit button */}
                    {!answered && (
                      <button onClick={submit} disabled={!selected || submitting} style={{
                        marginTop: "1.25rem", width: "100%", padding: "0.9rem",
                        borderRadius: 12, border: "none", cursor: selected ? "pointer" : "not-allowed",
                        background: selected ? "linear-gradient(135deg, #667eea, #764ba2)" : "#e0e0e0",
                        color: selected ? "#fff" : "#999", fontWeight: 700, fontSize: 16,
                        transition: "all 0.2s",
                      }}>
                        {submitting ? "Checking…" : "Submit Answer"}
                      </button>
                    )}

                    {/* Result banner */}
                    {(result || alreadyDone) && (
                      <div style={{
                        marginTop: "1.25rem",
                        background: result?.isCorrect ? "#f0fdf4" : alreadyDone ? "#f0f4ff" : "#fff1f2",
                        border: `1px solid ${result?.isCorrect ? "#bbf7d0" : alreadyDone ? "#c7d2fe" : "#fecaca"}`,
                        borderRadius: 12, padding: "1.25rem",
                      }}>
                        {result && (
                          <div style={{ marginBottom: "0.75rem" }}>
                            <div style={{ fontWeight: 800, fontSize: 18, color: result.isCorrect ? "#15803d" : "#dc2626" }}>
                              {result.isCorrect ? "🎉 Correct!" : "❌ Not quite — keep going!"}
                            </div>
                            <div style={{ fontSize: 14, color: "#666", marginTop: 4 }}>
                              +{result.xpEarned} XP earned &nbsp;·&nbsp; 🔥 {result.newStreak}-day streak
                            </div>
                          </div>
                        )}
                        {alreadyDone && !result && (
                          <div style={{ fontWeight: 700, color: "#4338ca", marginBottom: "0.5rem" }}>
                            ✅ You already completed today&apos;s challenge!
                          </div>
                        )}
                        {explanation && (
                          <div style={{ fontSize: 14, color: "#555", lineHeight: 1.6 }}>
                            <strong>💡 Explanation:</strong> {explanation}
                          </div>
                        )}
                        <div style={{ marginTop: "1rem", fontSize: 13, color: "#888" }}>
                          Come back tomorrow for a new challenge ⏰
                        </div>
                      </div>
                    )}

                    {/* Guest CTA */}
                    {!userId && !answered && (
                      <div style={{
                        marginTop: "1rem", background: "#fffbeb", border: "1px solid #fde68a",
                        borderRadius: 10, padding: "0.85rem 1rem", fontSize: 13, color: "#92400e",
                      }}>
                        ⚠️ Sign in to save your XP and streak!{" "}
                        <Link href="/auth/login" style={{ color: "#d97706", fontWeight: 700 }}>
                          Sign in →
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </>
            )}

            {/* ── Leaderboard Tab ── */}
            {tab === "leaderboard" && (
              <div>
                <h3 style={{ margin: "0 0 1rem", fontSize: 16, fontWeight: 700, color: "#1a1a2e" }}>
                  🏆 Top Students This Month
                </h3>
                {leaders.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#999" }}>
                    No data yet. Complete challenges to appear here!
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {leaders.map((l, i) => {
                      const lv    = xpToLevel(l.total_xp);
                      const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`;
                      const isMe  = l.user_id === userId;
                      return (
                        <div key={l.user_id} style={{
                          display: "flex", alignItems: "center", gap: "0.75rem",
                          padding: "0.75rem 1rem", borderRadius: 10,
                          background: isMe ? "#f0f4ff" : "#f8fafc",
                          border: isMe ? "1px solid #c7d2fe" : "1px solid transparent",
                        }}>
                          <span style={{ fontSize: 20, width: 32, textAlign: "center" }}>{medal}</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#1a1a2e" }}>
                              {l.profiles?.full_name || "Anonymous Student"}
                              {isMe && <span style={{ marginLeft: 6, fontSize: 11, color: "#667eea" }}>(you)</span>}
                            </div>
                            <div style={{ fontSize: 12, color: "#888" }}>Level {lv.level} {lv.title}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontWeight: 800, color: "#667eea" }}>⭐ {l.total_xp}</div>
                            <div style={{ fontSize: 12, color: "#888" }}>🔥 {l.current_streak} streak</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Streak badges row */}
                <div style={{ marginTop: "1.5rem", borderTop: "1px solid #f0f0f0", paddingTop: "1.25rem" }}>
                  <h4 style={{ margin: "0 0 0.75rem", fontSize: 13, fontWeight: 700, color: "#888", textTransform: "uppercase" as const, letterSpacing: 1 }}>
                    Level Guide
                  </h4>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                    {[
                      { lv: 1, title: "Explorer",   xp: "0+",    emoji: "🌱" },
                      { lv: 2, title: "Learner",    xp: "100+",  emoji: "📖" },
                      { lv: 3, title: "Achiever",   xp: "300+",  emoji: "⚡" },
                      { lv: 4, title: "Scholar",    xp: "600+",  emoji: "🎓" },
                      { lv: 5, title: "Expert",     xp: "1000+", emoji: "🏆" },
                      { lv: 6, title: "Master",     xp: "1500+", emoji: "🌟" },
                    ].map(lvl => (
                      <div key={lvl.lv} style={{
                        background: "#f8fafc", borderRadius: 8, padding: "0.5rem",
                        textAlign: "center", fontSize: 12,
                      }}>
                        <div style={{ fontSize: 20 }}>{lvl.emoji}</div>
                        <div style={{ fontWeight: 700, color: "#333" }}>{lvl.title}</div>
                        <div style={{ color: "#888" }}>{lvl.xp} XP</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Bottom padding */}
        <div style={{ height: "3rem" }} />
      </div>
    </div>
  );
}
