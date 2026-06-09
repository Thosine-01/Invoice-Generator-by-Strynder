export interface LineItemInput {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceTotals {
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
}

/** Round to 2 decimal places for currency math. */
export function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * lineTotal = quantity × unitPrice
 */
export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return roundMoney(quantity * unitPrice);
}

/**
 * subtotal = sum(all lineTotals)
 * vatAmount = vatEnabled ? (subtotal × vatRate / 100) : 0
 * grandTotal = subtotal + vatAmount
 */
export function calculateInvoiceTotals(
  lineItems: LineItemInput[],
  vatEnabled: boolean,
  vatRate: number
): InvoiceTotals {
  const subtotal = roundMoney(
    lineItems.reduce(
      (sum, item) =>
        sum + calculateLineTotal(item.quantity, item.unitPrice),
      0
    )
  );

  const vatAmount = vatEnabled
    ? roundMoney(subtotal * (vatRate / 100))
    : 0;

  const grandTotal = roundMoney(subtotal + vatAmount);

  return { subtotal, vatAmount, grandTotal };
}

/** Parse string inputs from form fields into numeric line item values. */
export function parseLineItemRow(
  description: string,
  quantity: string,
  unitPrice: string
): LineItemInput | null {
  const trimmed = description.trim();
  if (!trimmed) return null;

  const qty = parseFloat(quantity) || 0;
  const price = parseFloat(unitPrice) || 0;

  return {
    description: trimmed,
    quantity: qty,
    unitPrice: price,
  };
}
