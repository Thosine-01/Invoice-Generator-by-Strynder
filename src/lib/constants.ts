export const HEADER_COLORS = [
  { name: "Navy", value: "#1e3a5f" },
  { name: "Teal", value: "#0f766e" },
  { name: "Emerald", value: "#047857" },
  { name: "Burgundy", value: "#6d213c" },
  { name: "Charcoal", value: "#2d3436" },
  { name: "Royal Blue", value: "#1d4ed8" },
  { name: "Gold Accent", value: "#b45309" },
  { name: "Black", value: "#111827" },
] as const;

export const CURRENCIES = ["NGN", "USD", "GBP"] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_LABELS: Record<Currency, string> = {
  NGN: "Naira (NGN)",
  USD: "US Dollar (USD)",
  GBP: "British Pound (GBP)",
};

export const DEFAULT_VAT_RATE = 7.5;
export const LOGO_BUCKET = "logos";
export const LOGO_MAX_BYTES = 5 * 1024 * 1024;
export const LOGO_ACCEPTED_MIME_TYPES = ["image/jpeg", "image/png"] as const;
export const LOGO_ACCEPTED_EXTENSIONS = ".jpg,.jpeg,.png";
