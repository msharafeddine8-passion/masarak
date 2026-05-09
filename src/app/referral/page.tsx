"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const REWARDS = [
  { invites: 1, reward: "🎁 شارة 'مشارك مجتمعي'", unlocked: false },
  { invites: 3, reward: "✨ AI Career Advisor مفتوح", unlocked: false },
  { invites: 5, reward: "🌟 شارة 'سفير مسارك'", unlocked: false },
  { invites: 10, reward: "💎 Premium مجاني لشهر", unlocked: false },
  { invites: 25, reward: "👑 'سفير ذهبي' + Premium 6 أشهر مجاناً", unlocked: false },
  { invites: 50, reward: "🚀 Premium مجاني للأبد + شهادة شراكة", unlocked: false },
];

function generateCode(): string {
  const adjectives = ["smart", "bright", "wise", "swift", "bold", "kind"];
  const nouns = ["star", "wave", "peak", "spark", "trail", "path"];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const num = Math.floor(Math.random() * 9000 + 1000);
  return `${adj}-${noun}-${num}`;
}

export default function ReferralPage() {
  const [code, setCode] = useState("loading...");
  const [invites, setInvites] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let storedCode = "";
    let storedInvites = 0;
    try {
      storedCode = localStorage.getItem("masarak_referral_code") || "";
      storedInvites = parseInt(localStorage.getItem("masarak_referral_count") || "0", 10);
    } catch (e) { /* ignore */ }
    if (!storedCode) {
      storedCode = generateCode();
      try { localStorage.setItem("masarak_referral_code", storedCode); } catch (e) { /* ignore */ }
    }
    setCode(storedCode);
    setInvites(storedInvites);
  }, []);

  const referralUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/auth/register?ref=${code}`
    : `https://masarak-khaki.vercel.app/auth/register?ref=${code}`;

  const shareText = "اكتشفت منصة مسارك للطلاب اللبنانيين! بتساعدك تختار تخصصك، تلاقي منح، وتبني CV احترافي. جرّبها معي:";

  function copyLink() {
    navigator.clipboard.writeText(referralUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareTo(platform: string) {
    const encodedText = encodeURIComponent(shareText);
    const encodedUrl = encodeURIComponent(referralUrl);
    let url = "";
    switch (platform) {
      case "whatsapp":
        url = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case "twitter":
        url = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "linkedin":
        url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case "telegram":
        url = `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`;
        break;
      case "email":
        url = `mailto:?subject=${encodeURIComponent("اكتشف مسارك معي")}&body=${encodedText}%20${encodedUrl}`;
        break;
    }
    if (url) window.open(url, "_blank");
  }

  const nextReward = REWARDS.find((r) => r.invites > invites) || REWARDS[REWARDS.length - 1];
  const progress = Math.min((invites / nextReward.invites) * 100, 100);

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4" dir="rtl">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-10">
          <Link href="/" className="text-sm text-gray-500 hover:text-primary mb-2 inline-block">
            ← العودة
          </Link>
          <div className="text-6xl mb-4">🎁</div>
          <h1 className="text-4xl font-extrabold text-primary mb-3">ادعو أصدقاءك</h1>
          <p className="text-gray-600 text-lg max-w-xl mx-auto">
            ساعد أصدقاءك يكتشفوا مساراتهم، واحصل على مكافآت رائعة!
          </p>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-br from-primary to-[#1A8456] text-white rounded-2xl p-6 md:p-8 mb-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <div className="text-sm opacity-90 mb-1">دعوات ناجحة</div>
              <div className="text-5xl font-extrabold">{invites}</div>
            </div>
            <div>
              <div className="text-sm opacity-90 mb-1">المكافأة التالية</div>
              <div className="text-sm font-bold mt-3 leading-tight">{nextReward.reward}</div>
              <div className="text-xs opacity-90 mt-1">عند {nextReward.invites} دعوات</div>
            </div>
          </div>
          <div className="bg-white/20 rounded-full h-3 overflow-hidden">
            <div className="bg-white h-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Code */}
        <div className="bg-white rounded-2xl border-2 border-primary p-6 mb-6 text-center">
          <div className="text-sm text-gray-600 mb-2">كود الإحالة الخاص بك</div>
          <div className="text-2xl md:text-3xl font-mono font-extrabold text-primary mb-4 break-all">{code}</div>
          <button
            onClick={copyLink}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:opacity-90"
          >
            {copied ? "✓ تم النسخ!" : "📋 نسخ الرابط"}
          </button>
        </div>

        {/* Share buttons */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h2 className="font-bold text-lg mb-4 text-center">شارك على...</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { id: "whatsapp", emoji: "💬", label: "WhatsApp", color: "bg-green-500" },
              { id: "twitter", emoji: "🐦", label: "Twitter", color: "bg-sky-500" },
              { id: "facebook", emoji: "📘", label: "Facebook", color: "bg-blue-600" },
              { id: "linkedin", emoji: "💼", label: "LinkedIn", color: "bg-blue-700" },
              { id: "telegram", emoji: "✈️", label: "Telegram", color: "bg-cyan-500" },
              { id: "email", emoji: "✉️", label: "Email", color: "bg-gray-600" },
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => shareTo(s.id)}
                className={`${s.color} text-white rounded-xl py-3 px-2 font-semibold hover:opacity-90 transition-all flex flex-col items-center gap-1 text-xs`}
              >
                <span className="text-2xl">{s.emoji}</span>
                <span>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rewards Ladder */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-lg mb-4 text-center">🏆 سلّم المكافآت</h2>
          <div className="space-y-3">
            {REWARDS.map((r, idx) => {
              const unlocked = invites >= r.invites;
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-4 p-3 rounded-xl border-2 ${
                    unlocked ? "border-emerald-300 bg-emerald-50" : "border-gray-200 bg-gray-50"
                  }`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center font-extrabold text-lg">
                    {r.invites}
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{r.reward}</div>
                    <div className="text-xs text-gray-500">
                      {unlocked ? "✓ تم الحصول عليها!" : `${r.invites - invites} دعوات للوصول`}
                    </div>
                  </div>
                  {unlocked && <span className="text-emerald-600 text-xl">✓</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-2xl p-5 text-center">
          <div className="text-2xl mb-2">💡</div>
          <p className="text-sm text-amber-900 leading-relaxed">
            <strong>كيف يعمل النظام؟</strong> لما يسجّل صديقك بكودك، إنت تحصل على نقطة. لما يكمّل أوّل اختبار Career DNA، تحصل على نقطة إضافية. المكافآت تنفعّل تلقائياً.
          </p>
        </div>
      </div>
    </main>
  );
}
