"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./auth";

function toNullable(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updatePaymentAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase.from("payment_details").upsert(
    {
      user_id: user.id,
      bank_name: toNullable(formData.get("bankName")),
      account_name: toNullable(formData.get("accountName")),
      account_number: toNullable(formData.get("accountNumber")),
      additional_note: toNullable(formData.get("additionalNote")),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  revalidatePath("/payment-details");
  return { success: "Payment details updated successfully." };
}
