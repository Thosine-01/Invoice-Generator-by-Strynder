import { DEFAULT_VAT_RATE, HEADER_COLORS, type Currency } from "@/lib/constants";
import type { InvoiceFormInitialData } from "@/lib/types";
import type { InvoiceBuilderFormValues } from "@/lib/validations/invoice";

export function resolveHeaderColor(
  color: string | undefined | null
): InvoiceBuilderFormValues["headerColor"] {
  if (color && HEADER_COLORS.some((c) => c.value === color)) {
    return color as InvoiceBuilderFormValues["headerColor"];
  }
  return HEADER_COLORS[0].value;
}

export function buildInvoiceFormDefaults(
  options: {
    paymentDetailsText: string;
    defaultCurrency?: string;
    defaultHeaderColor?: string;
    initialData?: InvoiceFormInitialData;
  }
): InvoiceBuilderFormValues {
  const { paymentDetailsText, defaultCurrency, defaultHeaderColor, initialData } =
    options;

  if (initialData) {
    return {
      dueDate: initialData.due_date ?? "",
      currency: (initialData.currency as Currency) || "NGN",
      headerColor: resolveHeaderColor(initialData.header_color),
      clientName: initialData.client_name,
      clientAddress: initialData.client_address ?? "",
      clientEmail: initialData.client_email ?? "",
      clientPhone: initialData.client_phone ?? "",
      paymentDetails: initialData.payment_details ?? "",
      notes: initialData.notes ?? "",
      vatEnabled: initialData.vat_enabled,
      vatRate: String(initialData.vat_rate),
      lineItems:
        initialData.line_items.length > 0
          ? initialData.line_items.map((item) => ({
              description: item.description,
              quantity: String(item.quantity),
              unitPrice: String(item.unit_price),
            }))
          : [{ description: "", quantity: "1", unitPrice: "" }],
    };
  }

  return {
    dueDate: "",
    currency: ((defaultCurrency as Currency) || "NGN") as Currency,
    headerColor: resolveHeaderColor(defaultHeaderColor),
    clientName: "",
    clientAddress: "",
    clientEmail: "",
    clientPhone: "",
    paymentDetails: paymentDetailsText,
    notes: "",
    vatEnabled: false,
    vatRate: String(DEFAULT_VAT_RATE),
    lineItems: [{ description: "", quantity: "1", unitPrice: "" }],
  };
}
