'use client';

import { usePathname } from 'next/navigation';
import { isChromelessRoute } from '@/lib/chrome';
import { hasWhatsApp, whatsappLink } from '@/lib/contact';

const MESSAGE = 'مرحبا، عندي سؤال عن منصة مسارك';

export default function WhatsAppFAB() {
  const pathname = usePathname();

  // No real number configured → don't render placeholder buttons.
  if (!hasWhatsApp()) return null;

  // Hide on admin / org dashboard surfaces and on the auth screens.
  if (isChromelessRoute(pathname)) return null;
  if (pathname?.startsWith('/auth')) return null;

  const href = whatsappLink(MESSAGE);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="تواصل عبر واتساب"
      className="fixed bottom-28 sm:bottom-6 left-3 sm:left-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-floaty hover:scale-110 hover:bg-[#1da851] transition-all animate-bounce-soft"
      style={{ animationDuration: '3s' }}
    >
      <svg
        viewBox="0 0 24 24"
        fill="currentColor"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <path d="M20.52 3.48A11.94 11.94 0 0012.06 0C5.46 0 .12 5.34.12 11.94c0 2.1.55 4.16 1.6 5.98L0 24l6.24-1.64a11.93 11.93 0 005.82 1.49h.01c6.6 0 11.94-5.34 11.94-11.94 0-3.19-1.24-6.19-3.49-8.43zM12.07 22a9.9 9.9 0 01-5.05-1.38l-.36-.21-3.7.97.99-3.61-.24-.37a9.9 9.9 0 01-1.52-5.46c0-5.49 4.46-9.94 9.95-9.94 2.66 0 5.15 1.03 7.03 2.91a9.86 9.86 0 012.91 7.04c0 5.49-4.46 9.94-9.95 9.94zm5.45-7.45c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.39-1.47-.88-.78-1.48-1.75-1.66-2.05-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01a1.09 1.09 0 00-.79.37c-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.19 5.06 4.47.71.31 1.26.49 1.69.63.71.22 1.35.19 1.86.12.57-.09 1.77-.72 2.02-1.42.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z" />
      </svg>
    </a>
  );
}
