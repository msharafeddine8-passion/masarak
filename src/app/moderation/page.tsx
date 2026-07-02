'use client';
/** /moderation — Social · Phase 9. The report queue for platform admins and
 *  community admins/moderators. list_reports scopes rows to what you can act on,
 *  so a normal user just sees an empty queue. */
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import { listReports, resolveReport, type Report } from '@/lib/social/moderation';

type Status = 'open' | 'reviewed' | 'dismissed';

function typeLabel(tt: string, t: (k: any) => string): string {
  switch (tt) {
    case 'post':      return t('mod.type.post');
    case 'comment':   return t('mod.type.comment');
    case 'community': return t('mod.type.community');
    case 'user':      return t('mod.type.user');
    case 'message':   return t('mod.type.message');
    default:          return tt;
  }
}

export default function ModerationPage() {
  const { t } = useI18n();
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [status, setStatus] = useState<Status>('open');
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async (s: Status) => {
    setLoading(true);
    setReports(await listReports(s));
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { setAuthed(false); return; }
      setAuthed(true); load(status);
    });
  }, [load, status]);

  async function act(id: number, action: 'remove' | 'dismiss' | 'reviewed') {
    setBusy(id);
    try { await resolveReport(id, action); await load(status); } finally { setBusy(null); }
  }

  if (authed === false) {
    return (
      <div dir="rtl" className="max-w-lg mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-3">🛡️</div>
        <h1 className="text-2xl font-extrabold text-ink mb-2">{t('mod.title')}</h1>
        <p className="text-ink-muted mb-5">{t('fr.login_prompt')}</p>
        <Link href="/auth/login" className="btn-primary px-6 py-3 rounded-xl">{t('auth.login')}</Link>
      </div>
    );
  }

  return (
    <div dir="rtl" className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-extrabold text-ink mb-1">🛡️ {t('mod.title')}</h1>
      <p className="text-ink-muted text-sm mb-5">{t('mod.subtitle')}</p>

      <div className="flex gap-2 mb-6">
        {(['open', 'reviewed', 'dismissed'] as const).map(s => (
          <button key={s} onClick={() => setStatus(s)}
            className={'px-4 py-2 rounded-xl text-sm font-bold ' + (status === s ? 'bg-primary text-white' : 'bg-bg-soft text-ink-muted')}>
            {s === 'open' ? t('mod.open') : s === 'reviewed' ? t('mod.reviewed') : t('mod.dismissed')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-10 text-ink-muted">…</div>
      ) : reports.length === 0 ? (
        <div className="bg-surface rounded-2xl border border-border-soft p-10 text-center">
          <div className="text-4xl mb-2">✅</div>
          <p className="text-ink-muted">{t('mod.empty')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map(r => (
            <article key={r.id} className="bg-surface rounded-2xl p-4 shadow-soft border border-border-soft">
              <div className="flex items-center justify-between text-xs text-ink-subtle mb-2">
                <span>⚑ {typeLabel(r.target_type, t)} · {new Date(r.created_at).toLocaleDateString('ar')}</span>
                <span>{t('mod.reported_by')} {r.reporter.full_name || '—'}</span>
              </div>

              {r.reason && <div className="text-sm font-bold text-danger mb-2">« {r.reason} »</div>}

              {r.content ? (
                <div className="bg-bg rounded-xl p-3 border border-border-soft">
                  <div className="text-xs text-ink-subtle mb-1">
                    {r.content.community_name} · {r.content.author.full_name || '—'}
                    {r.content.is_removed && <span className="text-danger"> · {t('mod.already_removed')}</span>}
                  </div>
                  <p className="text-sm text-ink whitespace-pre-wrap break-words line-clamp-4">{r.content.body}</p>
                  <Link href={`/community/post/${r.content.post_id}`} className="text-xs text-primary hover:underline">{t('mod.view_context')} ←</Link>
                </div>
              ) : (
                <div className="text-xs text-ink-muted">{typeLabel(r.target_type, t)} #{r.target_id}</div>
              )}

              {status === 'open' && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {r.content && !r.content.is_removed && (
                    <button disabled={busy === r.id} onClick={() => act(r.id, 'remove')}
                      className="text-xs font-bold px-3 py-2 rounded-lg bg-danger text-white hover:opacity-90 disabled:opacity-50">🗑 {t('mod.remove')}</button>
                  )}
                  <button disabled={busy === r.id} onClick={() => act(r.id, 'reviewed')}
                    className="text-xs font-bold px-3 py-2 rounded-lg bg-mint-light text-primary hover:bg-mint disabled:opacity-50">✓ {t('mod.reviewed')}</button>
                  <button disabled={busy === r.id} onClick={() => act(r.id, 'dismiss')}
                    className="text-xs font-bold px-3 py-2 rounded-lg bg-slate-100 text-ink-muted hover:bg-slate-200 disabled:opacity-50">{t('mod.dismiss')}</button>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
