import { z } from "zod";

export const paymentSchema = z.object({
  bankName: z.string().max(100, "Bank name must be 100 characters or fewer."),
  accountName: z
    .string()
    .max(100, "Account name must be 100 characters or fewer."),
  accountNumber: z
    .string()
    .max(20, "Account number must be 20 characters or fewer."),
  additionalNote: z
    .string()
    .max(500, "Payment note must be 500 characters or fewer."),
});

export type PaymentFormValues = z.infer<typeof paymentSchema>;
