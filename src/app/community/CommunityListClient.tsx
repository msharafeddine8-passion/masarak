'use client';
/** Communities directory — search, categories, my communities, create. (Phase 4) */
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n';
import { supabase } from '@/lib/supabase';
import {
  listCommunities, myCommunities, joinCommunity, createCommunity,
  CATEGORIES, type CommunitySummary, type MyCommunity,
} from '@/lib/social/community';
import Modal from '@/components/ui/Modal';

export default function CommunityListClient() {
  const { t } = useI18n();
  const [authed, setAuthed] = useState(false);
  const [items, setItems] = useState<CommunitySummary[]>([]);
  const [mine, setMine] = useState<MyCommunity[]>([]);
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [busy, setBusy] = useState<number | null>(null);

  const load = useCallback(async () => {
    const [list, mineList] = await Promise.all([listCommunities(q, cat ?? undefined), authed ? myCommunities() : Promise.resolve([])]);
    setItems(list); setMine(mineList);
  }, [q, cat, authed]);

  useEffect(() => { supabase.auth.getUser().then(({ data }) => setAuthed(!!data.user)); }, []);
  useEffect(() => { load(); }, [load]);

  async function join(id: number) {
    setBusy(id);
    try { await joinCommunity(id); await load(); } finally { setBusy(null); }
  }

  return (
    <div dir="rtl" className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between gap-3 mb-1">
        <h1 className="text-2xl font-extrabold text-ink">🌐 {t('cm.title')}</h1>
        {authed && <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-xl bg-primary text-white font-bold text-sm hover:bg-primary/90">+ {t('cm.create')}</button>}
      </div>
      <p className="text-ink-muted text-sm mb-5">{t('cm.subtitle')}</p>

      {/* Search + categories */}
      <input value={q} onChange={e => setQ(e.target.value)} placeholder={t('cm.search_ph')}
        className="w-full px-4 py-2.5 rounded-xl border border-border-soft bg-surface outline-none focus:border-primary mb-3" />
      <div className="flex flex-wrap gap-2 mb-6">
        <Chip active={cat === null} onClick={() => setCat(null)} label={t('cm.all')} />
        {CATEGORIES.map(c => <Chip key={c.key} active={cat === c.key} onClick={() => setCat(c.key)} label={`${c.icon} ${c.ar}`} />)}
      </div>

      {/* My communities */}
      {mine.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-bold text-ink-subtle mb-2">{t('cm.mine')}</h2>
          <div className="flex flex-wrap gap-2">
            {mine.map(m => (
              <Link key={m.id} href={`/community/${m.slug}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-mint-light text-primary font-bold text-sm hover:bg-mint">
                <span>{m.icon}</span><span>{m.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* All communities */}
      <div className="grid sm:grid-cols-2 gap-3">
        {items.length === 0 && <div className="col-span-full text-center py-10 text-ink-muted">{t('cm.empty')}</div>}
        {items.map(c => (
          <div key={c.id} className="bg-surface rounded-2xl p-4 shadow-soft border border-border-soft flex flex-col">
            <Link href={`/community/${c.slug}`} className="flex items-start gap-3 flex-1">
              <span className="text-3xl">{c.icon}</span>
              <div className="min-w-0">
                <div className="font-bold text-ink flex items-center gap-1">{c.name} {c.is_official && <span title={t('cm.official')} className="text-primary text-xs">✔</span>}</div>
                {c.description && <p className="text-xs text-ink-muted line-clamp-2 mt-0.5">{c.description}</p>}
                <div className="text-[11px] text-ink-subtle mt-1">{c.member_count} {t('cm.members')} · {c.post_count} {t('cm.posts')}</div>
              </div>
            </Link>
            <div className="mt-3">
              {c.my_role ? (
                <Link href={`/community/${c.slug}`} className="block text-center text-xs font-bold py-2 rounded-lg bg-mint-light text-primary">{t('cm.open')}</Link>
              ) : authed ? (
                <button disabled={busy === c.id} onClick={() => join(c.id)} className="w-full text-xs font-bold py-2 rounded-lg bg-primary text-white hover:opacity-90 disabled:opacity-50">{t('cm.join')}</button>
              ) : (
                <Link href="/auth/login" className="block text-center text-xs font-bold py-2 rounded-lg bg-primary text-white">{t('cm.join')}</Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={load} t={t} />}
    </div>
  );
}

function Chip({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-sm font-semibold border-2 transition-colors ${active ? 'border-primary bg-mint-light text-primary' : 'border-border-soft text-ink-muted hover:border-primary/40'}`}>{label}</button>;
}

function CreateModal({ onClose, onCreated, t }: { onClose: () => void; onCreated: () => void; t: (k: any) => string }) {
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [desc, setDesc] = useState('');
  const [icon, setIcon] = useState('👥');
  const [category, setCategory] = useState('topic');
  const [rules, setRules] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(''); setBusy(true);
    const { data, error } = await createCommunity({ slug: slug || name, name, description: desc, icon, category, rules });
    setBusy(false);
    if (error) { setErr(error.message.includes('taken') ? t('cm.slug_taken') : t('cm.create_err')); return; }
    onCreated(); onClose();
    if (data) window.location.href = `/community/${data}`;
  }

  return (
    <Modal onClose={onClose} labelledBy="cm-create-title" className="w-full max-w-md p-5 max-h-[90vh] overflow-y-auto">
      <form onSubmit={submit} className="space-y-3">
        <h2 id="cm-create-title" className="text-lg font-extrabold text-ink">{t('cm.create')}</h2>
        <div className="flex gap-2">
          <input value={icon} onChange={e => setIcon(e.target.value)} maxLength={2} className="w-14 text-center text-2xl px-2 py-2 rounded-lg border border-border-soft bg-bg" />
          <input value={name} onChange={e => setName(e.target.value)} required placeholder={t('cm.name_ph')} className="flex-1 px-3 py-2 rounded-lg border border-border-soft bg-bg outline-none focus:border-primary" />
        </div>
        <input value={slug} onChange={e => setSlug(e.target.value)} placeholder={t('cm.slug_ph')} dir="ltr" className="w-full px-3 py-2 rounded-lg border border-border-soft bg-bg outline-none focus:border-primary text-sm" />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder={t('cm.desc_ph')} rows={2} className="w-full px-3 py-2 rounded-lg border border-border-soft bg-bg outline-none focus:border-primary text-sm" />
        <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border-soft bg-bg text-sm">
          {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.ar}</option>)}
        </select>
        <textarea value={rules} onChange={e => setRules(e.target.value)} placeholder={t('cm.rules_ph')} rows={2} className="w-full px-3 py-2 rounded-lg border border-border-soft bg-bg outline-none focus:border-primary text-sm" />
        {err && <p className="text-danger text-xs">{err}</p>}
        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={busy || !name.trim()} className="flex-1 py-2.5 rounded-xl bg-primary text-white font-bold disabled:opacity-50">{t('cm.create_btn')}</button>
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-100 text-ink-muted font-bold">{t('cm.cancel')}</button>
        </div>
      </form>
    </Modal>
  );
}
