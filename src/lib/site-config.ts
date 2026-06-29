// Single source of truth for deployment-level brand constants.
// Replaces scattered "masaraklb.com" / support-email / phone magic strings so the
// platform can be rebranded / re-pointed per deployment without code edits.
export const SITE = {
  name: 'مسارك',
  domain: 'masaraklb.com',
  url: 'https://www.masaraklb.com',
  supportEmail: 'support@masaraklb.com',
  // Default country for forms/SEO when the user/profile hasn't chosen one yet.
  defaultCountry: 'LB',
} as const;
