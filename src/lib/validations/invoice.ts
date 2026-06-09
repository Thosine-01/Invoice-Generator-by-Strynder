import { z } from "zod";
import { CURRENCIES, HEADER_COLORS } from "@/lib/constants";

const headerColorValues = HEADER_COLORS.map((c) => c.value) as [
  string,
  ...string[],
];

const lineItemRowSchema = z.object({
  description: z.string(),
  quantity: z.string(),
  unitPrice: z.string(),
});

export const invoiceBuilderSchema = z
  .object({
    dueDate: z.string(),
    currency: z.enum(CURRENCIES),
    headerColor: z.enum(headerColorValues),
    clientName: z.string().trim().min(1, "Client name is required."),
    clientAddress: z.string(),
    clientEmail: z.string(),
    clientPhone: z.string(),
    paymentDetails: z.string(),
    notes: z.string(),
    vatEnabled: z.boolean(),
    vatRate: z.string(),
    lineItems: z.array(lineItemRowSchema).min(1, "Add at least one line item."),
  })
  .superRefine((data, ctx) => {
    const validLines = data.lineItems.filter(
      (line) =>
        line.description.trim() &&
        (parseFloat(line.quantity) || 0) > 0
    );

    if (validLines.length === 0) {
      ctx.addIssue({
        code: "custom",
        message:
          "Add at least one line item with a description and quantity greater than zero.",
        path: ["lineItems"],
      });
    }

    if (data.clientEmail.trim()) {
      const result = z.string().email().safeParse(data.clientEmail.trim());
      if (!result.success) {
        ctx.addIssue({
          code: "custom",
          message: "Enter a valid client email address.",
          path: ["clientEmail"],
        });
      }
    }

    if (data.vatEnabled) {
      const rate = parseFloat(data.vatRate);
      if (Number.isNaN(rate) || rate < 0 || rate > 100) {
        ctx.addIssue({
          code: "custom",
          message: "VAT rate must be between 0 and 100.",
          path: ["vatRate"],
        });
      }
    }
  });

export type InvoiceBuilderFormValues = z.infer<typeof invoiceBuilderSchema>;
export type LineItemRowValues = z.infer<typeof lineItemRowSchema>;
