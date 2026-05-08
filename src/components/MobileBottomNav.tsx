"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/",               emoji: "🏠", label: "الرئيسية" },
  { href: "/universities",   emoji: "🏛️", label: "الجامعات"  },
  { href: "/tools/career-ai",emoji: "🤖", label: "المستشار"   },
  { href: "/tools/cv-builder",emoji: "📄", label: "CV"         },
  { href: "/dashboard",      emoji: "👤", label: "حسابي"      },
];

export default function MobileBottomNav() {
  const path = usePathname();
  
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
              {item.label}
            </span>
            {active && <span className="absolute bottom-0 w-8 h-0.5 bg-blue-600 rounded-full" />}
          </Link>
        );
      })}
    </nav>
  );
}
