"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { isChromelessRoute } from "@/lib/chrome";
import { supabase } from "@/lib/supabase";

type NavItem = { href: string; emoji: string; key: TranslationKey };

// Default nav for students (and unauthenticated visitors)
const STUDENT_NAV: NavItem[] = [
  { href: "/",           emoji: "🏠", key: "mobile.home"         },
  { href: "/dashboard",  emoji: "📊", key: "mobile.dashboard"    },
  { href: "/career-dna", emoji: "🧬", key: "mobile.dna"          },
  { href: "/profile",    emoji: "👤", key: "mobile.profile"      },
];

// Parents: replace DNA with their dashboard + universities shortcut
const PARENT_NAV: NavItem[] = [
  { href: "/",                 emoji: "🏠", key: "mobile.home"         },
  { href: "/parent/dashboard", emoji: "👨‍👩‍👧", key: "mobile.dashboard"    },
  { href: "/universities",     emoji: "🎓", key: "mobile.universities"  },
  { href: "/profile",          emoji: "👤", key: "mobile.profile"      },
];

// Counselors: replace DNA with their dashboard + universities shortcut
const COUNSELOR_NAV: NavItem[] = [
  { href: "/",                    emoji: "🏠", key: "mobile.home"         },
  { href: "/counselor/dashboard", emoji: "📋", key: "mobile.dashboard"    },
  { href: "/universities",        emoji: "🎓", key: "mobile.universities"  },
  { href: "/profile",             emoji: "👤", key: "mobile.profile"      },
];

function navForRole(role: string | null): NavItem[] {
  if (role === "parent")    return PARENT_NAV;
  if (role === "counselor") return COUNSELOR_NAV;
  return STUDENT_NAV;
}

export default function MobileBottomNav() {
  const path = usePathname();
  const { t } = useI18n();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setRole((data.user?.app_metadata?.role as string) ?? data.user?.user_metadata?.role ?? null);
    });
  }, []);

  // Hidden on dedicated admin surfaces (institution dashboard, platform admin).
  if (isChromelessRoute(path)) return null;

  const NAV_ITEMS = navForRole(role);

  return (
    <>
      {/* Spacer so page content isn't covered by the fixed nav */}
      <div className="h-24 md:hidden" aria-hidden="true" />
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 md:hidden px-3 pb-3 pt-2 pointer-events-none"
        style={{ paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))" }}
      >
        <div className="pointer-events-auto mx-auto max-w-md rounded-3xl bg-[#0A2B33]/95 backdrop-blur-xl border border-line shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] flex">
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
                <span className={`relative text-[11px] font-bold ${active ? "text-[#97DED0]" : "text-white/80"}`}>
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
