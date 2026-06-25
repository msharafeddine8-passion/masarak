/**
 * Skeleton loading components — pulse animation placeholders
 * Usage:
 *   <Skeleton className="h-4 w-32 rounded" />
 *   <SkeletonCard />
 *   <SkeletonTable rows={5} />
 *   <SkeletonStatGrid />
 */

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
}

/** Base shimmer block */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-bg-soft rounded",
        className
      )}
    />
  );
}

/** Card-shaped skeleton — matches common bg-surface rounded-2xl cards */
export function SkeletonCard({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("bg-surface rounded-2xl border border-line p-5 shadow-sm", className)}>
      <Skeleton className="h-5 w-2/5 mb-3" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn("h-3 mb-2", i === lines - 1 ? "w-3/5" : "w-full")}
        />
      ))}
    </div>
  );
}

/** Grid of 4 stat cards */
export function SkeletonStatGrid() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-surface rounded-xl border border-line p-4 text-center">
          <Skeleton className="h-8 w-8 rounded-full mx-auto mb-2" />
          <Skeleton className="h-7 w-16 mx-auto mb-1" />
          <Skeleton className="h-3 w-20 mx-auto" />
        </div>
      ))}
    </div>
  );
}

/** Table skeleton */
export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-surface rounded-2xl border border-line overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex gap-4 px-5 py-3 border-b border-line bg-bg-soft">
        {[40, 24, 20, 16].map((w, i) => (
          <Skeleton key={i} className={`h-3 w-${w} flex-shrink-0`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-gray-50 last:border-0">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-2.5 w-48 opacity-70" />
          </div>
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-7 w-14 rounded-lg" />
        </div>
      ))}
    </div>
  );
}

/** Full page loading shell — for route-level suspense */
export function SkeletonPage() {
  return (
    <main dir="rtl" className="min-h-screen bg-[#f8fafc] pb-16">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-4">
        {/* Hero */}
        <Skeleton className="h-36 w-full rounded-2xl" />
        {/* Stats */}
        <SkeletonStatGrid />
        {/* Table */}
        <SkeletonTable rows={6} />
      </div>
    </main>
  );
}

/** List of skeleton cards (for feeds / scholarship lists) */
export function SkeletonList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface rounded-2xl border border-line p-5 flex gap-4 shadow-sm">
          <Skeleton className="h-12 w-12 rounded-xl flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-2/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/5" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg flex-shrink-0 self-center" />
        </div>
      ))}
    </div>
  );
}
