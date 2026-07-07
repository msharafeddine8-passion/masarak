'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/lib/notify';
import { useI18n } from '@/lib/i18n';

export default function OrgReportsSection({ orgId }: { orgId: string }) {
  const { t } = useI18n();
  const [busy, setBusy] = useState<string | null>(null);

  async function exportLeads() {
    setBusy('leads');
    const { data } = await supabase
      .from('org_leads')
      .select('*')
      .eq('org_id', orgId)
      .order('last_interaction_at', { ascending: false });
    if (!data || data.length === 0) { toast(t('orgreports.emptyLeads'), 'info'); setBusy(null); return; }

    // Enrich with student emails
    const ids = Array.from(new Set((data as { student_id: string }[]).map(d => d.student_id)));
    const { data: students } = await supabase
      .from('student_profiles')
      .select('user_id, email, full_name')
      .in('user_id', ids);
    const stmap: Record<string, { email?: string; full_name?: string }> = {};
    for (const s of (students || []) as { user_id: string; email?: string; full_name?: string }[]) {
      stmap[s.user_id] = s;
    }

    const rows = (data as { student_id: string; source: string; status: string; score: number; first_interaction_at: string; last_interaction_at: string }[]).map(r => [
      r.student_id, stmap[r.student_id]?.email || '', stmap[r.student_id]?.full_name || '',
      r.source, r.status, r.score, r.first_interaction_at, r.last_interaction_at,
    ]);
    const header = ['student_id','email','name','source','status','score','first_interaction','last_interaction'];
    downloadCsv('leads_' + new Date().toISOString().slice(0,10), [header, ...rows]);
    setBusy(null);
  }

  async function exportEvents() {
    setBusy('events');
    const { data } = await supabase
      .from('org_events')
      .select('*')
      .eq('org_id', orgId);
    if (!data || data.length === 0) { toast(t('orgreports.emptyEvents'), 'info'); setBusy(null); return; }
    const header = Object.keys(data[0]);
    const rows = (data as Record<string, unknown>[]).map(r => header.map(h => r[h]));
    downloadCsv('events_' + new Date().toISOString().slice(0,10), [header, ...rows]);
    setBusy(null);
  }

  async function exportMessages() {
    setBusy('messages');
    const { data } = await supabase
      .from('org_messages')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: true });
    if (!data || data.length === 0) { toast(t('orgreports.emptyMessages'), 'info'); setBusy(null); return; }
    const header = ['thread_key','sender_type','sender_id','recipient_id','body','read_at','created_at'];
    const rows = (data as Record<string, unknown>[]).map(r => header.map(h => r[h]));
    downloadCsv('messages_' + new Date().toISOString().slice(0,10), [header, ...rows]);
    setBusy(null);
  }

  return (
    <section id="reports" className="bg-surface rounded-2xl border-2 border-line p-4 lg:p-6 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">📋</span>
        <div>
          <h3 className="text-lg font-extrabold text-primary">{t('orgreports.title')}</h3>
          <p className="text-xs text-ink-muted">{t('orgreports.subtitle')}</p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <ReportCard
          icon="🎯" title={t('orgreports.leadsTitle')}
          desc={t('orgreports.leadsDesc')}
          onClick={exportLeads} busy={busy === 'leads'}
        />
        <ReportCard
          icon="📅" title={t('orgreports.eventsTitle')}
          desc={t('orgreports.eventsDesc')}
          onClick={exportEvents} busy={busy === 'events'}
        />
        <ReportCard
          icon="💬" title={t('orgreports.messagesTitle')}
          desc={t('orgreports.messagesDesc')}
          onClick={exportMessages} busy={busy === 'messages'}
        />
      </div>

      <div className="mt-4 bg-bg-soft rounded-xl p-3 text-xs text-ink-muted">
        💡 <strong>{t('orgreports.soonLabel')}</strong>: {t('orgreports.soonText')}
      </div>
    </section>
  );
}

function ReportCard({ icon, title, desc, onClick, busy }: { icon: string; title: string; desc: string; onClick: () => void; busy: boolean }) {
  const { t } = useI18n();
  return (
    <button onClick={onClick} disabled={busy}
      className="bg-surface border-2 border-line hover:border-primary/40 rounded-xl p-4 text-right transition disabled:opacity-50">
      <div className="text-2xl mb-2">{icon}</div>
      <div className="font-extrabold mb-1">{title}</div>
      <div className="text-xs text-ink-muted mb-3">{desc}</div>
      <div className="text-xs font-bold text-primary">
        {busy ? '⏳ ' + t('orgreports.exporting') : '📥 ' + t('orgreports.exportCsv')}
      </div>
    </button>
  );
}

function downloadCsv(name: string, rows: unknown[][]) {
  const csv = rows.map(r => r.map(c => {
    const s = String(c ?? '');
    return '"' + s.replaceAll('"', '""') + '"';
  }).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = name + '.csv';
  a.click();
  URL.revokeObjectURL(url);
}
