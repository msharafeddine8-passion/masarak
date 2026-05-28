"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { isChromelessRoute } from "@/lib/chrome";

type NavItem = { href: string; emoji: string; key: TranslationKey };

// 4-tab cinematic bottom nav matching the new Masarak Redesign:
// 🏠 الرئيسية · 📊 لوحتي · 🧬 Career DNA · 👤 ملفي
const NAV_ITEMS: NavItem[] = [
  { href: "/",            emoji: "🏠", key: "mobile.home"      },
  { href: "/dashboard",   emoji: "📊", key: "mobile.dashboard" },
  { href: "/career-dna",  emoji: "🧬", key: "mobile.dna"       },
  { href: "/profile",     emoji: "👤", key: "mobile.profile"   },
];

export default function MobileBottomNav() {
  const path = usePathname();
  const { t } = useI18n();

  // Hidden on dedicated admin surfaces (institution dashboard, platform admin).
  if (isChromelessRoute(path)) return null;

  return (
    <>
      {/* Spacer so page content isn't covered by the fixed nav */}
      <div className="h-20 md:hidden" aria-hidden="true" />
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-3 pb-3 pt-2 pointer-events-none"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="pointer-events-auto mx-auto max-w-md rounded-3xl bg-[#0A2B33]/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? path === "/" : path === item.href || path.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative flex-1 flex flex-col items-center justify-center py-2.5 gap-0.5 transition-all duration-200 ${
                  active ? "scale-105" : "opacity-70 hover:opacity-100"
                }`}
              >
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-2 inset-y-1 rounded-2xl bg-gradient-to-br from-[#97DED0]/25 to-[#5CC4B8]/15 border border-[#97DED0]/30"
                  />
                )}
                <span className={`relative text-xl leading-none transition-transform ${active ? "drop-shadow-[0_0_8px_rgba(151,222,208,0.6)]" : ""}`}>
                  {item.emoji}
                </span>
                <span className={`relative text-[10px] font-bold ${active ? "text-[#97DED0]" : "text-white/80"}`}>
                  {t(item.key)}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
