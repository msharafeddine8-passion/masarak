// Centralized contact info.
// Per Jun-3 audit: 'one channel only (email, 48hr SLA) — no WhatsApp, no form'.
// Add the WhatsApp number once here, used everywhere (Contact, Footer, future widgets).

export const SUPPORT_EMAIL = "support@masaraklb.com";

// Lebanese WhatsApp Business number — leave empty to hide WA buttons platform-wide.
// Override at runtime with NEXT_PUBLIC_MASARAK_WHATSAPP if you want to swap quickly.
export const SUPPORT_WHATSAPP =
  process.env.NEXT_PUBLIC_MASARAK_WHATSAPP || "+961 70 000 000";

export function whatsappLink(message?: string): string {
  const num = SUPPORT_WHATSAPP.replace(/[^\d]/g, "");
  if (!num) return "";
  const base = `https://wa.me/${num}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

export function hasWhatsApp(): boolean {
  return SUPPORT_WHATSAPP.replace(/[^\d]/g, "").length >= 8;
}
