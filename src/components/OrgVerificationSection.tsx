'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type OrgStatus = {
  verification_status?: string | null;
  is_verified?: boolean | null;
  verification_requested_at?: string | null;
  verified_at?: string | null;
};

export default function OrgVerificationSection({ orgId }: { orgId: string }) {
  const [status, setStatus] = useState<OrgStatus | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ tone: 'ok'|'warn'; text: string } | null>(null);

  async function load() {
    const { data } = await supabase
      .from('organizations')
      .select('verification_status, is_verified, verification_requested_at, verified_at')
      .eq('id', orgId)
      .single();
    setStatus(data as OrgStatus);
  }
  useEffect(() => { load(); }, [orgId]);

  async function request() {
    setSubmitting(true);
    setMsg(null);
    const { data, error } = await supabase.rpc('request_org_verification', { p_org_id: orgId, p_notes: notes.trim() || null });
    if (error) {
      setMsg({ tone: 'warn', text: 'فشل: ' + error.message });
    } else {
      const r = data as { ok: boolean; error?: string };
      if (!r?.ok) {
        setMsg({ tone: 'warn', text: 'فشل: ' + (r?.error || 'unknown') });
      } else {
        setMsg({ tone: 'ok', text: '✓ تم إرسال طلب التوثيق. سيراجعه الفريق قريباً.' });
        await load();
      }
    }
    setSubmitting(false);
  }

  const isVerified = status?.is_verified || status?.verification_status === 'verified';
  const isRequested = !!status?.verification_requested_at;

  return (
    <section id="verification" className="bg-surface rounded-2xl border-2 border-line p-4 lg:p-6 mb-4">
      <div className="flex items-center gap-3 mb-4">
        <span className="text-3xl">✓</span>
        <div>
          <h3 className="text-lg font-extrabold text-primary">شارة التوثيق</h3>
          <p className="text-xs text-ink-muted">شارة "موثّقة" بتزيد ثقة الطلاب وتحسّن ترتيبك بنتائج البحث.</p>
        </div>
      </div>

      {isVerified ? (
        <div className="bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
          <div className="flex items-center gap-2 font-extrabold text-emerald-800 mb-1">
            <span className="text-2xl">✓</span>
            <span>مؤسستك موثّقة</span>
          </div>
          {status?.verified_at && (
            <div className="text-xs text-emerald-700">تم التوثيق بتاريخ {new Date(status.verified_at).toLocaleDateString('ar')}</div>
          )}
          <div className="text-sm text-ink-muted mt-2">
            الشارة الزرقاء ✓ تظهر بصفحتك العامة. الـ "حياة الحرم" تبويب مفعّل للزوار.
          </div>
        </div>
      ) : isRequested ? (
        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4">
          <div className="flex items-center gap-2 font-extrabold text-amber-800 mb-1">
            <span className="text-2xl">⏳</span>
            <span>الطلب قيد المراجعة</span>
          </div>
          <div className="text-xs text-amber-700 mt-1">
            تم إرسال طلب التوثيق بتاريخ {new Date(status!.verification_requested_at!).toLocaleDateString('ar')}.
          </div>
          <div className="text-sm text-ink-muted mt-2">
            الفريق رح يراجع الطلب خلال 3-5 أيام عمل. رح يوصلك إشعار بالنتيجة.
          </div>
        </div>
      ) : (
        <>
          <div className="bg-blue-50 border-2 border-blue-100 rounded-xl p-3 mb-3 text-sm text-blue-900">
            <strong className="block mb-1">قبل ما تطلب التوثيق، تأكّد إنّو:</strong>
            <ul className="text-xs space-y-1">
              <li>✓ ملف المؤسسة مكتمل (نبذة، شعار، روابط تواصل)</li>
              <li>✓ في صور للحرم بقسم الوسائط</li>
              <li>✓ أضفت فعالية أو منحة بآخر 30 يوم</li>
              <li>✓ المؤسسة فعلية ومسجّلة رسمياً</li>
            </ul>
          </div>

          <textarea
            value={notes} onChange={e => setNotes(e.target.value)}
            placeholder="ملاحظات إضافية (اختيارية) — مثلاً: رابط الموقع الرسمي، رقم السجل التجاري، إلخ"
            rows={3}
            className="w-full px-3 py-2 rounded-xl border-2 border-line focus:border-primary outline-none text-sm mb-3"
          />

          {msg && (
            <div className={'rounded-xl p-3 text-sm mb-3 ' + (msg.tone === 'ok' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700')}>
              {msg.text}
            </div>
          )}

          <button disabled={submitting} onClick={request}
            className="bg-primary text-white font-bold px-6 py-3 rounded-xl hover:bg-primary-dark disabled:opacity-50">
            {submitting ? 'جاري الإرسال...' : '📤 طلب التوثيق'}
          </button>
        </>
      )}
    </section>
  );
}
