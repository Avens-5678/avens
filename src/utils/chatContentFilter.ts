/**
 * Anti-backdoor chat content filter.
 * Runs client-side BEFORE sending any message.
 * Detects and masks contact info to prevent off-platform deals.
 */

const MASK = "[Contact info hidden — all communication happens through Evnting]";

// ── Indian phone numbers ──
// 10 digits starting with 6-9, optional +91/91/0 prefix, spaces/dashes allowed
const PHONE_REGEX = /(?:\+?91[\s\-.]?)?(?:0[\s\-.]?)?[6-9]\d[\s\-.]?\d{2}[\s\-.]?\d{2}[\s\-.]?\d{2}[\s\-.]?\d{2}/g;
// Compact 10-digit
const PHONE_COMPACT = /\b[6-9]\d{9}\b/g;

// ── Email addresses ──
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;
// Natural language email: "xyz at gmail dot com"
const EMAIL_NATURAL = /\b\w+\s+(?:at|@)\s+(?:gmail|yahoo|hotmail|outlook|proton)\s+(?:dot|\.)\s+(?:com|in|co\.in|net|org)\b/gi;

// ── URLs and links ──
const URL_REGEX = /https?:\/\/[^\s<]+/gi;
const WAME_REGEX = /wa\.me\/?\d*/gi;
const TELEGRAM_REGEX = /t\.me\/[^\s]+/gi;
const DOMAIN_REGEX = /\b(?:www\.)?[a-zA-Z0-9\-]+\.(?:com|in|co\.in|org|net|io|me|app)\b/gi;

// ── Social handles ──
const AT_HANDLE = /@[a-zA-Z0-9_]{3,30}\b/g;
const SOCIAL_PREFIX = /\b(?:insta|ig|fb|telegram|tg|snap|twitter|whatsapp)\s*[:;\-]?\s*@?[a-zA-Z0-9_.]{2,30}/gi;
const SOCIAL_PHRASE = /\b(?:my\s+(?:insta|instagram|facebook|fb|telegram|whatsapp|number)\s+(?:is|id|handle)\s*[:;\-]?\s*@?[a-zA-Z0-9_.@]{2,})/gi;

// ── UPI IDs ──
const UPI_REGEX = /[a-zA-Z0-9._\-]+@(?:oksbi|okaxis|okicici|okhdfcbank|ybl|paytm|upi|apl|ibl|sbi|axl|icici|hdfc|kotak|boi|pnb|fbl|federal)\b/gi;
const UPI_APP = /\b(?:paytm|gpay|phonepe|google\s*pay|phone\s*pe)\s*(?:number|no|:)?\s*[:\-]?\s*\d{5,}/gi;

// ── Spelled-out digits ──
const DIGIT_WORDS: Record<string, string> = {
  zero: "0", one: "1", two: "2", three: "3", four: "4",
  five: "5", six: "6", seven: "7", eight: "8", nine: "9",
  nol: "0", ek: "1", do: "2", teen: "3", char: "4",
  paanch: "5", chhe: "6", saat: "7", aath: "8", nau: "9",
};
const DIGIT_WORD_PATTERN = new RegExp(
  `\\b(${Object.keys(DIGIT_WORDS).join("|")})\\b`,
  "gi"
);

// ── Bypass intent phrases ──
const BYPASS_PHRASES = [
  /\b(?:call\s+me\s+(?:directly|outside|on\s+my))/gi,
  /\b(?:let'?s?\s+talk\s+(?:outside|directly|off|on\s+whatsapp|on\s+phone))/gi,
  /\b(?:contact\s+me\s+(?:directly|outside|on))/gi,
  /\b(?:better\s+(?:price|rate|deal)\s+(?:if\s+you\s+)?(?:contact|call|msg)\s+(?:me\s+)?directly)/gi,
  /\b(?:save\s+(?:commission|platform\s+fee|charges))/gi,
  /\b(?:deal\s+(?:directly|outside))/gi,
  /\b(?:my\s+(?:personal|direct)\s+(?:number|contact|phone))/gi,
  /\b(?:share\s+(?:my|your)\s+(?:number|contact|phone|whatsapp))/gi,
  /\b(?:without\s+(?:platform|evnting|middleman))/gi,
];

// ── Suspicious keywords (trigger AI check, don't block) ──
const SUSPICIOUS_WORDS = /\b(?:call|contact|direct|outside|whatsapp|number|phone|numb[ae]r|personal|private|offline)\b/i;

/**
 * Detect spelled-out phone numbers.
 * Converts "nine eight seven six..." to digits and checks if it forms a phone number.
 */
function detectSpelledNumbers(text: string): boolean {
  const lower = text.toLowerCase();
  const matches = lower.match(DIGIT_WORD_PATTERN);
  if (!matches || matches.length < 7) return false;

  // Convert consecutive digit words to number string
  let digitStr = "";
  let lastIndex = -2;
  const words = lower.split(/\s+/);
  for (const word of words) {
    const clean = word.replace(/[^a-z]/g, "");
    if (DIGIT_WORDS[clean] !== undefined) {
      digitStr += DIGIT_WORDS[clean];
    } else if (digitStr.length > 0 && digitStr.length < 10) {
      // Non-digit word breaks the sequence, but allow short gaps
      digitStr = "";
    }
  }
  // Check if we got a phone-number-length digit string starting with 6-9
  return digitStr.length >= 10 && /^[6-9]/.test(digitStr);
}

export interface FilterResult {
  sanitized: string;
  detected: string[];
  shouldFlag: boolean;
  isSuspicious: boolean;
  severity: "low" | "medium" | "high" | "critical";
}

export function filterChatContent(text: string): FilterResult {
  const detected: string[] = [];
  let sanitized = text;
  let shouldFlag = false;

  // 1. Phone numbers
  if (PHONE_REGEX.test(sanitized) || PHONE_COMPACT.test(sanitized)) {
    detected.push("phone_number");
    sanitized = sanitized.replace(PHONE_REGEX, MASK).replace(PHONE_COMPACT, MASK);
    shouldFlag = true;
  }

  // 2. Email
  if (EMAIL_REGEX.test(sanitized)) {
    detected.push("email");
    sanitized = sanitized.replace(EMAIL_REGEX, MASK);
    shouldFlag = true;
  }
  if (EMAIL_NATURAL.test(sanitized)) {
    detected.push("email");
    sanitized = sanitized.replace(EMAIL_NATURAL, MASK);
    shouldFlag = true;
  }

  // 3. URLs
  if (URL_REGEX.test(sanitized) || WAME_REGEX.test(sanitized) || TELEGRAM_REGEX.test(sanitized)) {
    detected.push("url");
    sanitized = sanitized.replace(URL_REGEX, MASK).replace(WAME_REGEX, MASK).replace(TELEGRAM_REGEX, MASK);
    shouldFlag = true;
  }
  if (DOMAIN_REGEX.test(sanitized)) {
    // Don't mask evnting.com or evnting.in
    const domains = sanitized.match(DOMAIN_REGEX) || [];
    const externalDomains = domains.filter((d) => !/evnting/i.test(d));
    if (externalDomains.length > 0) {
      detected.push("url");
      externalDomains.forEach((d) => { sanitized = sanitized.replace(d, MASK); });
      shouldFlag = true;
    }
  }

  // 4. Social handles
  if (AT_HANDLE.test(sanitized) && !sanitized.includes("@evnting")) {
    detected.push("social_handle");
    sanitized = sanitized.replace(AT_HANDLE, MASK);
    shouldFlag = true;
  }
  if (SOCIAL_PREFIX.test(sanitized)) {
    detected.push("social_handle");
    sanitized = sanitized.replace(SOCIAL_PREFIX, MASK);
    shouldFlag = true;
  }
  if (SOCIAL_PHRASE.test(sanitized)) {
    detected.push("social_handle");
    sanitized = sanitized.replace(SOCIAL_PHRASE, MASK);
    shouldFlag = true;
  }

  // 5. UPI IDs
  if (UPI_REGEX.test(sanitized) || UPI_APP.test(sanitized)) {
    detected.push("upi_id");
    sanitized = sanitized.replace(UPI_REGEX, MASK).replace(UPI_APP, MASK);
    shouldFlag = true;
  }

  // 6. Spelled-out numbers
  if (detectSpelledNumbers(text)) {
    detected.push("spelled_out_number");
    sanitized = MASK;
    shouldFlag = true;
  }

  // 7. Bypass intent phrases
  for (const pattern of BYPASS_PHRASES) {
    if (pattern.test(sanitized)) {
      detected.push("bypass_intent");
      shouldFlag = true;
      break;
    }
  }

  // Determine if AI check needed (suspicious but not caught by regex)
  const isSuspicious = !shouldFlag && SUSPICIOUS_WORDS.test(text);

  // Severity
  let severity: FilterResult["severity"] = "low";
  if (detected.includes("phone_number") || detected.includes("upi_id")) severity = "high";
  else if (detected.includes("email") || detected.includes("bypass_intent")) severity = "medium";
  else if (detected.length > 0) severity = "medium";
  if (detected.length >= 3) severity = "critical";

  // Deduplicate consecutive masks
  sanitized = sanitized.replace(new RegExp(`(${MASK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*){2,}`, "g"), MASK);

  return { sanitized, detected, shouldFlag, isSuspicious, severity };
}
