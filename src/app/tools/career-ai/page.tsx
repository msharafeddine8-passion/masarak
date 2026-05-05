"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SUGGESTIONS = [
  "شو أحسن تخصص للمستقبل في لبنان؟",
  "كيف أبني CV قوي وأنا بس خريج جديد؟",
  "ما الفرق بين AUB وLAU — شو تنصحني؟",
  "كيف ألاقي عمل عن بُعد وأنا بلبنان؟",
  "شو المنح الدراسية المتاحة لطلاب لبنان؟",
  "كيف أحضّر لمقابلة عمل؟",
];

const WELCOME: Message = {
  role: "assistant",
  content: `مرحبا! أنا Masarak AI، مساعدك الشخصي للتوجيه المهني والتعليمي 🎯

بقدر ساعدك في:
• اختيار التخصص والجامعة المناسبة
• تطوير CV وخطاب التقديم
• البحث عن فرص عمل ومنح دراسية
• التخطيط للمسيرة المهنية
• نصائح لسوق العمل في لبنان والمنطقة

شو بدك تعرف اليوم؟ 😊`,
};

function TypingDots() {
  return (
    <div style={{ display: "flex", gap: 4, alignItems: "center", padding: "0.75rem 1rem" }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: "50%", background: "#667eea",
          animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function CareerAIPage() {
  const [messages, setMessages] = useState<Message[]>([WELCOME]);
  const [input,    setInput]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    const userMsg: Message = { role: "user", content: msg };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/career-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages
            .filter(m => m.role !== "assistant" || m !== WELCOME)
            .map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      if (data.text) {
        setMessages(p => [...p, { role: "assistant", content: data.text }]);
      } else {
        setMessages(p => [...p, { role: "assistant", content: "Sorry, something went wrong. Try again! 🔄" }]);
      }
    } catch {
      setMessages(p => [...p, { role: "assistant", content: "Connection error. Please try again." }]);
    }
    setLoading(false);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", fontFamily: "Inter, sans-serif", background: "#f8fafc" }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: "1rem 1.5rem", flexShrink: 0,
        boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
      }}>
        <div style={{ maxWidth: 750, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <Link href="/tools" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: 13 }}>←</Link>
            <div style={{
              width: 40, height: 40, borderRadius: "50%",
              background: "rgba(255,255,255,0.2)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
            }}>🤖</div>
            <div>
              <div style={{ color: "#fff", fontWeight: 800, fontSize: 16 }}>Masarak AI</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4ade80", display: "inline-block" }} />
                Online — Career Guidance Assistant
              </div>
            </div>
          </div>
          <button
            onClick={() => setMessages([WELCOME])}
            style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", borderRadius: 8, padding: "0.4rem 0.85rem", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
          >
            New Chat
          </button>
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem 1.5rem" }}>
        <div style={{ maxWidth: 750, margin: "0 auto", display: "flex", flexDirection: "column", gap: "0.85rem" }}>

          {messages.map((m, i) => (
            <div key={i} style={{
              display: "flex",
              justifyContent: m.role === "user" ? "flex-end" : "flex-start",
              alignItems: "flex-end", gap: "0.5rem",
            }}>
              {m.role === "assistant" && (
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "linear-gradient(135deg, #667eea, #764ba2)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}>🤖</div>
              )}
              <div style={{
                maxWidth: "75%",
                background: m.role === "user"
                  ? "linear-gradient(135deg, #667eea, #764ba2)"
                  : "#fff",
                color: m.role === "user" ? "#fff" : "#1a1a2e",
                borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                padding: "0.75rem 1rem",
                fontSize: 14,
                lineHeight: 1.65,
                boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                whiteSpace: "pre-wrap",
              }}>
                {m.content}
              </div>
              {m.role === "user" && (
                <div style={{
                  width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                  background: "#e8e8e8",
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
                }}>👤</div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: "0.5rem" }}>
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: "linear-gradient(135deg, #667eea, #764ba2)",
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
              }}>🤖</div>
              <div style={{ background: "#fff", borderRadius: "18px 18px 18px 4px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
                <TypingDots />
              </div>
            </div>
          )}

          {/* Suggestion chips — only after welcome message */}
          {messages.length === 1 && !loading && (
            <div style={{ marginTop: "0.5rem" }}>
              <div style={{ fontSize: 12, color: "#999", marginBottom: "0.5rem", paddingRight: 44 }}>
                أسئلة مقترحة:
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", paddingRight: 44 }}>
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => send(s)} style={{
                    padding: "0.45rem 0.85rem", borderRadius: 99,
                    border: "1px solid #667eea", background: "#f0f4ff",
                    color: "#4338ca", fontSize: 12, fontWeight: 600,
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input bar */}
      <div style={{
        background: "#fff", borderTop: "1px solid #f0f0f0",
        padding: "1rem 1.5rem", flexShrink: 0,
        boxShadow: "0 -2px 12px rgba(0,0,0,0.05)",
      }}>
        <div style={{ maxWidth: 750, margin: "0 auto", display: "flex", gap: "0.75rem", alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="اسألني عن مسيرتك التعليمية والمهنية… (Enter to send)"
            rows={1}
            style={{
              flex: 1, padding: "0.75rem 1rem", borderRadius: 14,
              border: "1.5px solid #e0e0e0", fontSize: 14,
              resize: "none", outline: "none", fontFamily: "inherit",
              lineHeight: 1.5, maxHeight: 120, overflowY: "auto",
              transition: "border-color 0.2s",
              direction: "rtl",
            }}
            onFocus={e => { e.target.style.borderColor = "#667eea"; }}
            onBlur={e => { e.target.style.borderColor = "#e0e0e0"; }}
          />
          <button
            onClick={() => send()}
            disabled={!input.trim() || loading}
            style={{
              width: 44, height: 44, borderRadius: "50%", border: "none",
              background: input.trim() && !loading
                ? "linear-gradient(135deg, #667eea, #764ba2)"
                : "#e0e0e0",
              color: "#fff", fontSize: 18, cursor: input.trim() ? "pointer" : "default",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0, transition: "all 0.2s",
            }}
          >
            ➤
          </button>
        </div>
        <div style={{ maxWidth: 750, margin: "0.5rem auto 0", fontSize: 11, color: "#bbb", textAlign: "center" }}>
          Masarak AI uses Claude Haiku · Career guidance only · Not a substitute for professional advice
        </div>
      </div>
    </div>
  );
}
