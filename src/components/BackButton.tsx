"use client";
import { useRouter, usePathname } from "next/navigation";
import { isChromelessRoute } from "@/lib/chrome";

/**
 * Floating "back" button shown on every page except the home page.
 * Uses browser history; falls back to home if there's nowhere to go back to.
 */
export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname();

  // hide on home and on dedicated admin surfaces (org dashboard, platform admin)
  if (pathname === "/" || isChromelessRoute(pathname)) return null;

  function goBack() {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/");
    }
  }

  return (
    <button
      onClick={goBack}
      aria-label="رجوع"
      className="fixed top-3 z-[60] flex items-center justify-center w-10 h-10 rounded-full
                 bg-surface/90 backdrop-blur border border-white/10 shadow-md
                 text-ink-muted hover:text-primary hover:border-primary transition-colors
                 ltr:left-3 rtl:right-3"
      style={{ insetInlineStart: "0.75rem" }}
    >
      {/* arrow points toward the start of the reading direction */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="rtl:rotate-180">
        <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
