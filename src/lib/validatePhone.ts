/**
 * Validate and format Indian phone number for WhatsApp.
 * Returns formatted number (91XXXXXXXXXX) or null if invalid.
 */
export const formatWhatsAppPhone = (phone?: string | null): string | null => {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  // Strip leading 91 if present
  const local = digits.startsWith("91") && digits.length > 10 ? digits.slice(2) : digits;
  if (local.length !== 10) return null;
  // Indian mobile numbers start with 6-9
  if (!/^[6-9]/.test(local)) return null;
  return `91${local}`;
};
