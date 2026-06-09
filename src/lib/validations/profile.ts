import { z } from "zod";
import {
  CURRENCIES,
  HEADER_COLORS,
  LOGO_ACCEPTED_MIME_TYPES,
  LOGO_MAX_BYTES,
} from "@/lib/constants";

const headerColorValues = HEADER_COLORS.map((c) => c.value) as [
  string,
  ...string[],
];

export const logoFileSchema = z
  .instanceof(File)
  .refine((file) => file.size <= LOGO_MAX_BYTES, {
    message: "Logo must be 5MB or smaller.",
  })
  .refine(
    (file) =>
      LOGO_ACCEPTED_MIME_TYPES.includes(
        file.type as (typeof LOGO_ACCEPTED_MIME_TYPES)[number]
      ),
    { message: "Logo must be a JPEG or PNG image." }
  );

export const profileSchema = z.object({
  ownerName: z.string().max(100, "Owner name must be 100 characters or fewer."),
  businessName: z
    .string()
    .max(150, "Business name must be 150 characters or fewer."),
  address: z.string().max(300, "Address must be 300 characters or fewer."),
  phone: z.string().max(30, "Phone number must be 30 characters or fewer."),
  email: z.union([
    z.literal(""),
    z.string().email("Enter a valid email address."),
  ]),
  slogan: z.string().max(120, "Slogan must be 120 characters or fewer."),
  defaultCurrency: z.enum(CURRENCIES),
  defaultHeaderColor: z.enum(headerColorValues),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;
