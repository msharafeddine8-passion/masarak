'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useI18n } from '@/lib/i18n';

export default function NewsletterSignup({ source = 'footer' }: { source?: string }) {
  const { t, locale } = useI18n();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error' | 'duplicate'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setStatus('loading');
    setErrorMsg('');

    try {
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert({ email: email.trim().toLowerCase(), source, language: locale });

      if (error) {
        if (error.code === '23505') {
          // duplicate email
          setStatus('duplicate');
        } else {
          setStatus('error');
          setErrorMsg(error.message);
        }
        return;
      }

      setStatus('success');
      setEmail('');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err.message || (locale === 'ar' ? 'حدث خطأ' : 'Something went wrong'));
    }
  }

  if (status === 'success') {
    return (
      <div className="flex items-center gap-2 text-sm bg-white/15 backdrop-blur px-4 py-2.5 rounded-2xl text-white font-bold">
        <span className="text-xl">✅</span>
        <span>{t('newsletter.success')}</span>
      </div>
    );
  }

  if (status === 'duplicate') {
    return (
      <div className="flex items-center gap-2 text-sm bg-white/15 backdrop-blur px-4 py-2.5 rounded-2xl text-white font-bold">
        <span className="text-xl">📫</span>
        <span>{t('newsletter.duplicate')}</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubscribe} className="flex gap-2 flex-col sm:flex-row">
      <input
        type="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={t('newsletter.placeholder')}
        required
        disabled={status === 'loading'}
        className="flex-1 min-w-0 px-4 py-2.5 rounded-2xl border-2 border-white/30 bg-white/10 text-white placeholder:text-white/70 focus:bg-white focus:text-ink focus:outline-none focus:border-white transition-colors disabled:opacity-60"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="bg-white text-accent-dark font-extrabold px-6 py-2.5 rounded-2xl shadow-floaty hover:scale-105 transition-transform whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === 'loading' ? '...' : t('newsletter.submit')}
      </button>
      {status === 'error' && (
        <div className="text-xs text-white/90 sm:absolute sm:mt-12">⚠️ {errorMsg}</div>
      )}
    </form>
  );
}
