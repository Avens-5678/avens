// Lightweight client-side validators. Each returns null when valid, or an error message string.

export const required = (v: any, label = "This field"): string | null => {
  if (v === null || v === undefined) return `${label} is required`;
  if (typeof v === "string" && v.trim() === "") return `${label} is required`;
  return null;
};

export const validIndianMobile = (v: string): string | null => {
  if (!v) return "Phone is required";
  const digits = v.replace(/\D/g, "");
  if (!/^[6-9]\d{9}$/.test(digits)) return "Enter a valid 10-digit mobile starting with 6–9";
  return null;
};

export const validEmail = (v: string): string | null => {
  if (!v) return "Email is required";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())) return "Enter a valid email address";
  return null;
};

export const validPincode = (v: string): string | null => {
  if (!v) return "Pincode is required";
  if (!/^[1-9]\d{5}$/.test(v.trim())) return "Pincode must be 6 digits and not start with 0";
  return null;
};

export const validGST = (v: string): string | null => {
  if (!v) return null; // optional
  if (!/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(v.trim().toUpperCase()))
    return "Invalid GSTIN format";
  return null;
};

export const validPAN = (v: string): string | null => {
  if (!v) return null; // optional
  if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(v.trim().toUpperCase())) return "Invalid PAN format";
  return null;
};

export const validYears = (v: any): string | null => {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  if (isNaN(n)) return "Enter a number";
  if (n < 0 || n > 80) return "Years must be between 0 and 80";
  return null;
};

export const minLen = (v: string, n: number, label = "This field"): string | null => {
  if (!v || v.trim().length < n) return `${label} must be at least ${n} characters`;
  return null;
};

export const maxLen = (v: string, n: number, label = "This field"): string | null => {
  if (v && v.length > n) return `${label} must be at most ${n} characters`;
  return null;
};

export const validPositiveNumber = (v: any, label = "Value"): string | null => {
  const n = typeof v === "number" ? v : parseFloat(String(v ?? ""));
  if (isNaN(n) || n <= 0) return `${label} must be greater than 0`;
  return null;
};

export const validNonNegativeInt = (v: any, label = "Value"): string | null => {
  const n = typeof v === "number" ? v : parseInt(String(v ?? ""), 10);
  if (isNaN(n) || n < 0) return `${label} must be 0 or more`;
  return null;
};

// Helper: combine validators, returning the first error
export const firstError = (...checks: Array<string | null>): string | null => {
  for (const c of checks) if (c) return c;
  return null;
};
