'use client';
import Link from 'next/link';
import { flagEmoji } from '@/lib/social/profile';
import type { PersonCard as TCard } from '@/lib/social/friends';

/**
 * Reusable person card (friends, search, suggestions, mutuals, later feed/communities).
 * `action` is a context-supplied slot (Add / Accept / Remove …).
 */
export default function PersonCard({ person, action }: { person: TCard; action?: React.ReactNode }) {
  const name = person.full_name || 'طالب مسارك';
  const initial = name.charAt(0).toUpperCase();
  const sub = [person.major, person.university_name || person.school_name].filter(Boolean).join(' · ');

  const inner = (
    <>
      {person.avatar_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
        <img src={person.avatar_url} alt={name} className="w-12 h-12 rounded-2xl object-cover shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-2xl bg-gradient-mint-deep text-white flex items-center justify-center font-extrabold shrink-0">{initial}</div>
      )}
      <div className="min-w-0">
        <div className="font-bold text-ink truncate">
          {name} {person.country_code && <span className="text-sm">{flagEmoji(person.country_code)}</span>}
        </div>
        {sub && <div className="text-xs text-ink-muted truncate">{sub}</div>}
      </div>
    </>
  );

  return (
    <div className="bg-surface rounded-2xl p-3 shadow-soft border border-border-soft flex items-center gap-3">
      {person.slug ? (
        <Link href={`/u/${person.slug}`} className="flex items-center gap-3 flex-1 min-w-0 hover:opacity-90">{inner}</Link>
      ) : (
        <div className="flex items-center gap-3 flex-1 min-w-0">{inner}</div>
      )}
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
