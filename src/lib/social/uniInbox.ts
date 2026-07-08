// Student-side view of their university conversations.
// Bridges the org_messages inbox (shared university dashboard inbox) into the
// student's /messages. Reads are RLS-gated (a student sees org_messages rows
// where they are the sender or the recipient). Replies reuse the existing
// message_university RPC — which also notifies the university's admins — so the
// student→university direction already alerts the org. (The org→student
// notification needs a SECURITY DEFINER RPC and is added separately.)
import { supabase } from '@/lib/supabase';

export type UniMsg = {
  id: number;
  org_id: string;
  sender_type: 'org' | 'student';
  sender_id: string;
  recipient_id: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
};

export type UniThread = {
  org_id: string;
  uni_id: number | null;   // organizations.entity_id → /universities/[id] + reply target
  uni_name: string;
  last: UniMsg;
  unread: number;          // org→student messages not yet read
};

const COLS = 'id, org_id, sender_type, sender_id, recipient_id, body, read_at, created_at';

/** All of the student's university threads, most-recent first. */
export async function listUniThreads(me: string): Promise<UniThread[]> {
  const { data: msgs } = await supabase
    .from('org_messages')
    .select(COLS)
    .or(`sender_id.eq.${me},recipient_id.eq.${me}`)
    .order('created_at', { ascending: false })
    .limit(500);
  const rows = (msgs || []) as UniMsg[];
  if (rows.length === 0) return [];

  const orgIds = Array.from(new Set(rows.map(r => r.org_id)));
  const { data: orgs } = await supabase
    .from('organizations')
    .select('id, name, entity_id')
    .in('id', orgIds);
  const orgMap = new Map((orgs || []).map((o: { id: string; name: string; entity_id: number | null }) => [o.id, o]));

  const byOrg = new Map<string, UniMsg[]>();
  for (const r of rows) {
    const list = byOrg.get(r.org_id) ?? [];
    list.push(r);
    byOrg.set(r.org_id, list);
  }

  const threads: UniThread[] = [];
  for (const [orgId, list] of byOrg) {
    const sorted = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    const org = orgMap.get(orgId);
    threads.push({
      org_id: orgId,
      uni_id: org?.entity_id ?? null,
      uni_name: org?.name ?? 'جامعة',
      last: sorted[0],
      unread: list.filter(m => m.sender_type === 'org' && m.recipient_id === me && !m.read_at).length,
    });
  }
  return threads.sort((a, b) => +new Date(b.last.created_at) - +new Date(a.last.created_at));
}

/** Full message history for one university thread, oldest first. */
export async function getUniThread(orgId: string, me: string): Promise<UniMsg[]> {
  const { data } = await supabase
    .from('org_messages')
    .select(COLS)
    .eq('org_id', orgId)
    .or(`sender_id.eq.${me},recipient_id.eq.${me}`)
    .order('created_at', { ascending: true })
    .limit(500);
  return (data || []) as UniMsg[];
}

/** Best-effort: mark the org→student messages in this thread as read. */
export async function markUniThreadRead(orgId: string, me: string): Promise<void> {
  try {
    await supabase.from('org_messages')
      .update({ read_at: new Date().toISOString() })
      .eq('org_id', orgId).eq('recipient_id', me).is('read_at', null);
  } catch { /* no update policy → unread badge just won't clear; non-blocking */ }
}

/** Reply to a university. Reuses message_university (inserts + notifies org admins). */
export async function replyToUni(uniId: number, body: string) {
  return supabase.rpc('message_university', { p_uni_id: uniId, p_body: body });
}
