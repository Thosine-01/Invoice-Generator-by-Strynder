import type { PaymentDetails } from "./types";

export function formatPaymentDetails(
  payment: Pick<
    PaymentDetails,
    "bank_name" | "account_name" | "account_number" | "additional_note"
  > | null
): string {
  if (!payment) return "";

  const lines: string[] = [];
  if (payment.bank_name) lines.push(`Bank: ${payment.bank_name}`);
  if (payment.account_name) lines.push(`Account Name: ${payment.account_name}`);
  if (payment.account_number) lines.push(`Account Number: ${payment.account_number}`);
  if (payment.additional_note) lines.push(payment.additional_note);

  return lines.join("\n");
}

export function hasPaymentDetails(
  payment: Pick<
    PaymentDetails,
    "bank_name" | "account_name" | "account_number" | "additional_note"
  > | null
): boolean {
  if (!payment) return false;
  return !!(
    payment.bank_name ||
    payment.account_name ||
    payment.account_number ||
    payment.additional_note
  );
}
