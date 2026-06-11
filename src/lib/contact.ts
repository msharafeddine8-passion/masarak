// Single source of truth for support contact details.
// WhatsApp number is read from NEXT_PUBLIC_WHATSAPP_NUMBER at build time.
// Format: international, digits only (no +, no spaces). e.g. "9613456789"
// If not set, WhatsApp UI is hidden everywhere — no placeholders.

export const SUPPORT_EMAIL = "support@masaraklb.com";

/** Raw WhatsApp number from env. Empty string = WhatsApp disabled. */
export const SUPPORT_WHATSAPP = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "").replace(/[^0-9]/g, "");

/** True when a real WhatsApp number is configured. UI should hide WhatsApp affordances when false. */
export function hasWhatsApp(): boolean {
  return SUPPORT_WHATSAPP.length >= 8;
}

/** Build a wa.me link with optional prefilled message. Returns "" when number not configured. */
export function whatsappLink(message?: string): string {
  if (!hasWhatsApp()) return "";
  const base = `https://wa.me/${SUPPORT_WHATSAPP}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
