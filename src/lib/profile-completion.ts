import type { BusinessProfile, PaymentDetails } from "./types";

const PROFILE_FIELDS: (keyof BusinessProfile)[] = [
  "owner_name",
  "business_name",
  "logo_url",
  "address",
  "phone",
  "email",
  "slogan",
];

const PAYMENT_FIELDS: (keyof PaymentDetails)[] = [
  "bank_name",
  "account_name",
  "account_number",
  "additional_note",
];

export function calculateProfileCompletion(
  profile: BusinessProfile | null,
  payment: PaymentDetails | null
): number {
  const total = PROFILE_FIELDS.length + PAYMENT_FIELDS.length;
  let filled = 0;

  for (const field of PROFILE_FIELDS) {
    if (profile?.[field]) filled++;
  }
  for (const field of PAYMENT_FIELDS) {
    if (payment?.[field]) filled++;
  }

  return Math.round((filled / total) * 100);
}
