'use client';
/**
 * IDCardSkeleton — placeholder animated skeleton
 * while card data is loading
 */

export default function IDCardSkeleton() {
  return (
    <div
      dir="rtl"
      style={{
        width: '600px',
        height: '378px',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 60%, #0F2340 100%)',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Shimmer overlay */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.04) 50%, transparent 60%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.6s infinite',
        }}
      />

      {/* Top stripe */}
      <div style={{
        position: 'absolute', top: 0, right: 0, left: 0, height: '3px',
        background: 'rgba(212,175,55,0.2)',
      }} />

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 20px 10px' }}>
        <Bone width={100} height={24} radius={8} />
        <Bone width={120} height={36} radius={8} />
      </div>

      {/* Divider */}
      <Bone width="100%" height={1} radius={0} opacity={0.1} />

      {/* Body */}
      <div style={{ display: 'flex', gap: '16px', padding: '14px 20px' }}>
        {/* Avatar */}
        <Bone width={84} height={84} radius={42} />
        {/* Text lines */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' }}>
          <Bone width="60%" height={22} radius={6} />
          <Bone width="40%" height={14} radius={6} />
          <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
            <Bone width={70} height={22} radius={6} />
            <Bone width={70} height={22} radius={6} />
            <Bone width={60} height={22} radius={6} />
          </div>
          <Bone width="50%" height={14} radius={6} />
        </div>
      </div>

      {/* Divider */}
      <Bone width="100%" height={1} radius={0} opacity={0.1} />

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px 14px' }}>
        <Bone width={60} height={60} radius={6} />
        <Bone width={80} height={24} radius={6} />
        <Bone width={70} height={28} radius={6} />
      </div>

      {/* Bottom stripe */}
      <div style={{
        position: 'absolute', bottom: 0, right: 0, left: 0, height: '3px',
        background: 'rgba(212,175,55,0.2)',
      }} />

      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}

function Bone({
  width,
  height,
  radius,
  opacity = 0.18,
}: {
  width: number | string;
  height: number;
  radius: number;
  opacity?: number;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: `rgba(255,255,255,${opacity})`,
        flexShrink: 0,
      }}
    />
  );
}
