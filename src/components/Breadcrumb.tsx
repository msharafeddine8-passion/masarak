"use client";

import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  /** Override text / background. Defaults to dark-bg variant (white text) for use on coloured hero banners. */
  variant?: "dark" | "light";
}

/**
 * Lightweight breadcrumb nav — RTL-aware, no external deps.
 *
 * Usage:
 *   <Breadcrumb items={[
 *     { label: 'الرئيسية', href: '/' },
 *     { label: 'الجامعات', href: '/universities' },
 *     { label: uni.name },          // last item = current page, no href
 *   ]} />
 */
export default function Breadcrumb({ items, variant = "dark" }: BreadcrumbProps) {
  const isDark = variant === "dark";

  return (
    <nav aria-label="breadcrumb" className="flex items-center flex-wrap gap-1 text-sm">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;

        return (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && (
              <span
                className={isDark ? "opacity-50 mx-1" : "text-ink-subtle mx-1"}
                aria-hidden
              >
                ‹
              </span>
            )}

            {isLast || !item.href ? (
              <span
                className={
                  isDark
                    ? "text-white font-semibold truncate max-w-[180px] sm:max-w-xs"
                    : "text-ink font-semibold truncate max-w-[180px] sm:max-w-xs"
                }
                aria-current="page"
                title={item.label}
              >
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className={
                  isDark
                    ? "text-white/75 hover:text-white transition-colors"
                    : "text-[#1b3a6b]/70 hover:text-[#1b3a6b] transition-colors"
                }
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
