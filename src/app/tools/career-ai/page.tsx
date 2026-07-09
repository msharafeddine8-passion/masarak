"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useStudentContext } from "@/context/StudentContext";
import { useI18n, type TranslationKey } from "@/lib/i18n";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_PROMPT_KEYS: TranslationKey[] = [
  "ai.prompt.1",
  "ai.prompt.2",
  "ai.prompt.3",
  "ai.prompt.4",
  "ai.prompt.5",
  "ai.prompt.6",
];

export default function CareerAIPage() {
  const { t, dir } = useI18n();
  const { profile, careerDNA, skillGap, savedUniversities } = useStudentContext();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant" as const,
      content: t("ai.greeting"),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  // null = checking; false = AI key not configured → show the "coming soon"
  // state instead of a chat that can only error. On check failure, assume
  // configured (never hide a working feature because of a network blip).
  const [configured, setConfigured] = useState<boolean | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/career-ai")
      .then(r => r.json())
      .then(d => setConfigured(!!d.configured))
      .catch(() => setConfigured(true));
  }, []);

  useEffect(() => {
    if (profile?.fullName) {
      setMessages([{
        role: "assistant",
        content: `${t('cai.greetingHi')} ${profile.fullName.split(" ")[0]}! 👋 ${t('ai.greeting').replace(/^أهلاً! 👋 |^Hi! 👋 /, '')}`,
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.fullName, careerDNA?.primaryPath]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // FIX (mentor v1): this page used to POST to /api/chat — an endpoint that has
  // never existed — so every message 404'd and the coach was dead on arrival. It
  // now calls the real /api/career-ai route, which builds the student's context
  // (profile, DNA, budget, saved items) SERVER-SIDE from their own RLS-scoped
  // rows — the client no longer supplies a system prompt at all.
  async function sendMessage(text?: string) {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/career-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.slice(-10) }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.text || t("ai.error.generic") }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: t("ai.error.api"),
      }]);
    }
    setLoading(false);
  }

  if (configured === false) {
    return (
      <div dir={dir} className="min-h-screen bg-bg-soft flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-surface rounded-3xl border border-line shadow-sm p-8 text-center">
          <div className="text-6xl mb-4">🤖</div>
          <h1 className="text-2xl font-extrabold text-primary mb-2">{t('ai.soon.title')}</h1>
          <p className="text-ink-muted text-sm leading-relaxed mb-6">{t('ai.soon.sub')}</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/career-dna" className="btn-primary px-5 py-2.5 rounded-xl text-sm">{t('ai.soon.dna')}</Link>
            <Link href="/dashboard" className="px-5 py-2.5 rounded-xl text-sm font-bold bg-bg-soft text-ink-muted hover:bg-mint-light">{t('ai.soon.back')}</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div dir={dir} className="min-h-screen bg-bg-soft flex flex-col">
      <header className="bg-surface border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-blue-600 font-extrabold text-lg">{t('cai.brand')}</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">م</span>
            </div>
            <div>
              <p className="text-sm font-bold text-ink">{t('ai.title')}</p>
              <p className="text-xs text-green-500 font-semibold">{t('ai.status')}</p>
            </div>
          </div>
          <Link href="/dashboard" className="text-sm text-ink-subtle hover:text-blue-600">{t('ai.back')}</Link>
        </div>
      </header>

      {(careerDNA?.primaryPath || profile?.grade) && (
        <div className="bg-blue-50 border-b border-blue-100 py-2">
          <div className="max-w-3xl mx-auto px-4 flex items-center gap-2 text-xs text-blue-700 flex-wrap">
            <span className="font-bold">{t('ai.context.label')}</span>
            {profile?.fullName && <span className="bg-blue-100 px-2 py-0.5 rounded-full">👤 {profile.fullName}</span>}
            {profile?.grade && <span className="bg-blue-100 px-2 py-0.5 rounded-full">📚 {profile.grade}</span>}
            {careerDNA?.primaryPath && <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">🧬 {careerDNA.primaryPath}</span>}
            {skillGap?.role && <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full">📊 {skillGap.role} {skillGap.scorePercent}%</span>}
          </div>
        </div>
      )}

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-start" : "justify-end"}`}>
            <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
              m.role === "user"
                ? "bg-blue-600 text-white rounded-br-sm"
                : "bg-surface border border-line text-ink rounded-bl-sm shadow-sm"
            }`}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-surface border border-line rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
              <div className="flex gap-1 items-center h-4">
                {[0,150,300].map(d => <div key={d} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`${d}ms`}} />)}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </main>

      {messages.length <= 1 && (
        <div className="max-w-3xl mx-auto w-full px-4 pb-2">
          <p className="text-xs text-ink-subtle mb-2 font-semibold">{t('ai.suggestions')}</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPT_KEYS.map((k, i) => (
              <button key={i} onClick={() => sendMessage(t(k))}
                className="text-xs bg-surface border border-line rounded-full px-3 py-1.5 text-ink-muted hover:border-blue-400 hover:text-blue-600 transition-colors">
                {t(k)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-surface border-t sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={t('ai.placeholder')} disabled={loading}
            className="flex-1 border-2 border-line rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="bg-blue-600 text-white font-bold px-5 py-3 rounded-2xl hover:bg-blue-700 disabled:opacity-40 transition-colors">
            {dir === 'rtl' ? '←' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
}
