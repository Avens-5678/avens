/**
 * Normalize phone number for WATI WhatsApp API.
 * Strips non-digits, prepends "91" (India) if 10 digits.
 */
export const normalizePhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
};
