"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n, type TranslationKey } from "@/lib/i18n";
import { isChromelessRoute } from "@/lib/chrome";

type NavItem = { href: string; emoji: string; key: TranslationKey };

const NAV_ITEMS: NavItem[] = [
  { href: "/",                emoji: "🏠", key: "mobile.home"         },
  { href: "/universities",    emoji: "🏛️", key: "mobile.universities" },
  { href: "/tools/career-ai", emoji: "🤖", key: "mobile.advisor"      },
  { href: "/tools/cv-builder",emoji: "📄", key: "mobile.cv"           },
  { href: "/dashboard",       emoji: "👤", key: "mobile.account"      },
];

export default function MobileBottomNav() {
  const path = usePathname();
  const { t } = useI18n();

  // Hidden on dedicated admin surfaces (institution dashboard, platform admin).
  if (isChromelessRoute(path)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 flex md:hidden">
      {NAV_ITEMS.map(item => {
        const active = path === item.href || (item.href !== "/" && path.startsWith(item.href));
        return (
          <Link key={item.href} href={item.href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              active ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
            }`}>
            <span className="text-xl leading-none">{item.emoji}</span>
            <span className={`text-[10px] font-semibold ${active ? "text-blue-600" : "text-gray-400"}`}>
              {t(item.key)}
            </span>
            {active && <span className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-full" />}
          </Link>
        );
      })}
    </nav>
  );
}
