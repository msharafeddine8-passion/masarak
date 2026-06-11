'use client';

import { track } from '@/lib/analytics';

type Props = {
  /** Optional error to log; not rendered to the user. */
  error?: unknown;
  /** Caller's retry handler. Required to actually re-trigger the fetch. */
  onRetry?: () => void;
  /** Where this error was rendered, for analytics. */
  context?: string;
  className?: string;
};

/**
 * Sprint 5.8: replace the "loading forever" pattern with a clear error +
 * a Retry button. Logs the error to the console (sentry-ready) and emits
 * an analytics event so we can track real-world fetch failure rates.
 */
export default function ErrorState({ error, onRetry, context, className = '' }: Props) {
  if (error && typeof console !== 'undefined') {
    console.error('[ErrorState]', context || 'unknown', error);
  }

  return (
    <div
      role="alert"
      className={`text-center py-10 px-4 bg-red-50 border-2 border-red-100 rounded-2xl ${className}`}
    >
      <div className="text-5xl mb-3" aria-hidden="true">😔</div>
      <h3 className="text-lg font-extrabold text-red-700 mb-1">في مشكلة بالتحميل</h3>
      <p className="text-sm text-red-600 mb-5">
        ما قدرنا نجيب البيانات. جرّب مرّة تانية أو افحص الإنترنت.
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={() => {
            track('cta_click', { id: 'error_retry', location: context || 'unknown' });
            onRetry();
          }}
          className="inline-flex items-center gap-2 bg-red-600 text-white font-bold px-6 py-2.5 rounded-xl hover:bg-red-700 transition-colors"
        >
          <span aria-hidden="true">🔄</span>
          إعادة المحاولة
        </button>
      )}
    </div>
  );
}
