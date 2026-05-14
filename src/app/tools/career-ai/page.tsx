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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (profile?.fullName) {
      setMessages([{
        role: "assistant",
        content: `أهلاً ${profile.fullName.split(" ")[0]}! 👋 ${t('ai.greeting').replace(/^أهلاً! 👋 |^Hi! 👋 /, '')}`,
      }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.fullName, careerDNA?.primaryPath]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function buildSystemPrompt() {
    let ctx = `أنت مستشار مهني وأكاديمي متخصص للطلاب اللبنانيين. اسمك "مسار". تتحدث بالعربية دائماً.
تقدم نصائح عملية ومخصصة بناءً على السياق اللبناني.
كن مشجعاً، واقعياً، وموجزاً.`;
    if (profile?.fullName) ctx += `\nالطالب: ${profile.fullName}`;
    if (profile?.grade) ctx += `\nالصف: ${profile.grade}`;
    if (profile?.region) ctx += `\nالمنطقة: ${profile.region}`;
    if (profile?.gpa) ctx += `\nالمعدل: ${profile.gpa}%`;
    if (profile?.interests?.length) ctx += `\nالاهتمامات: ${profile.interests.join(", ")}`;
    if (careerDNA?.primaryPath) ctx += `\nCareer DNA: المسار الأساسي "${careerDNA.primaryPath}"${careerDNA.secondaryPath ? ` والثانوي "${careerDNA.secondaryPath}"` : ""}`;
    if (skillGap?.role) ctx += `\nتحليل المهارات لـ"${skillGap.role}": نتيجة ${skillGap.scorePercent}%${skillGap.gapSkills?.length ? ` يحتاج: ${skillGap.gapSkills.join(", ")}` : ""}`;
    return ctx;
  }

  async function sendMessage(text?: string) {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");
    const newMessages = [...messages, { role: "user" as const, content: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages.slice(-10), system: buildSystemPrompt() }),
      });
      if (!res.ok) throw new Error("failed");
      const data = await res.json();
      setMessages(prev => [...prev, { role: "assistant", content: data.message || t("ai.error.generic") }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: t("ai.error.api"),
      }]);
    }
    setLoading(false);
  }

  return (
    <div dir={dir} className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-extrabold">م</span>
            </div>
            <span className="text-blue-600 font-extrabold text-lg">مسارك</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">م</span>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">{t('ai.title')}</p>
              <p className="text-xs text-green-500 font-semibold">{t('ai.status')}</p>
            </div>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-blue-600">{t('ai.back')}</Link>
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
                : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm"
            }`}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-end">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
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
          <p className="text-xs text-gray-400 mb-2 font-semibold">{t('ai.suggestions')}</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_PROMPT_KEYS.map((k, i) => (
              <button key={i} onClick={() => sendMessage(t(k))}
                className="text-xs bg-white border border-gray-200 rounded-full px-3 py-1.5 text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors">
                {t(k)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border-t sticky bottom-0">
        <div className="max-w-3xl mx-auto px-4 py-3 flex gap-3">
          <input value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
            placeholder={t('ai.placeholder')} disabled={loading}
            className="flex-1 border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400" />
          <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
            className="bg-blue-600 text-white font-bold px-5 py-3 rounded-2xl hover:bg-blue-700 disabled:opacity-40 transition-colors">
            {dir === 'rtl' ? '←' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
}
