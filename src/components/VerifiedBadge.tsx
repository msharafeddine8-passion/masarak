// src/components/VerifiedBadge.tsx
// Blue verified checkmark — shown next to an institution name once its
// organization page is verified by the platform admin.

export default function VerifiedBadge({
  size = 18,
  withLabel = false,
}: { size?: number; withLabel?: boolean }) {
  return (
    <span
      className="inline-flex items-center gap-1 align-middle"
      title="مؤسسة موثّقة على مسارك"
    >
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-label="موثّقة">
        <path
          d="M12 1.5l2.6 1.9 3.2-.3 1 3 2.7 1.8-1 3 1 3-2.7 1.8-1 3-3.2-.3L12 22.5l-2.6-1.9-3.2.3-1-3L2.5 16l1-3-1-3 2.7-1.8 1-3 3.2.3L12 1.5z"
          fill="#1D9BF0"
        />
        <path
          d="M10.6 14.6l-2.3-2.3 1.3-1.3 1 1 3.8-3.8 1.3 1.3-5.1 5.1z"
          fill="#fff"
        />
      </svg>
      {withLabel && <span className="text-xs font-bold text-[#1D9BF0]">موثّقة</span>}
    </span>
  );
}
