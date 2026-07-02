'use client';
/** Social proof for entity pages (Feature 13): "students who saved this"
 *  (public-profile avatars via savers_of) + a discuss link. Drops into server
 *  pages (scholarship / major / …) — it resolves its own i18n. */
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import type { PersonCard } from '@/lib/social/friends';

export default function EntitySocial({ itemType, itemId, discussHref }: { itemType: string; itemId: string; discussHref: string }) {
  const { t } = useI18n();
  const [count, setCount] = useState(0);
  const [people, setPeople] = useState<PersonCard[]>([]);

  useEffect(() => {
    supabase.rpc('savers_of', { p_item_type: itemType, p_item_id: itemId }).then(({ data }) => {
      if (data) { setCount((data as any).count || 0); setPeople(((data as any).people as PersonCard[]) || []); }
    });
  }, [itemType, itemId]);

  const savedLabel = itemType === 'scholarship' ? t('int.saved_schol')
                   : itemType === 'major' ? t('int.saved_major')
                   : t('int.saved_generic');

  return (
    <section className="bg-surface rounded-2xl p-4 shadow-soft border border-border-soft flex items-center justify-between gap-3 flex-wrap" dir="rtl">
      <div className="flex items-center gap-2 min-w-0">
        {people.length > 0 && (
          <div className="flex flex-row-reverse">
            {people.slice(0, 5).map((p, i) => (
              <Link key={p.user_id} href={p.slug ? `/u/${p.slug}` : '#'} title={p.full_name || ''} className={i > 0 ? '-mr-2' : ''}>
                {p.avatar_url
                  /* eslint-disable-next-line @next/next/no-img-element */
                  ? <img src={p.avatar_url} alt="" className="w-8 h-8 rounded-full ring-2 ring-surface object-cover" />
                  : <div className="w-8 h-8 rounded-full ring-2 ring-surface bg-gradient-mint-deep text-white flex items-center justify-center text-xs font-bold">{(p.full_name || 'ط').charAt(0)}</div>}
              </Link>
            ))}
          </div>
        )}
        <span className="text-sm text-ink-muted">👥 <b className="text-ink">{count.toLocaleString('en')}</b> {savedLabel}</span>
      </div>
      <Link href={discussHref} className="text-sm font-bold text-primary hover:underline shrink-0">💬 {t('int.discuss')} ←</Link>
    </section>
  );
}
