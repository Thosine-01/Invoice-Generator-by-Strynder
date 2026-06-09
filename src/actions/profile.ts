"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { HEADER_COLORS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./auth";

function toNullable(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function updateProfileAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const defaultHeaderColor =
    HEADER_COLORS.find(
      (c) => c.value === (formData.get("defaultHeaderColor") as string)
    )?.value ?? HEADER_COLORS[0].value;

  const { error } = await supabase.from("business_profiles").upsert(
    {
      user_id: user.id,
      owner_name: toNullable(formData.get("ownerName")),
      business_name: toNullable(formData.get("businessName")),
      logo_url: toNullable(formData.get("logoUrl")),
      address: toNullable(formData.get("address")),
      phone: toNullable(formData.get("phone")),
      email: toNullable(formData.get("email")),
      slogan: toNullable(formData.get("slogan")),
      default_currency: (formData.get("defaultCurrency") as string) || "NGN",
      default_header_color: defaultHeaderColor,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" }
  );

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: "Profile updated successfully." };
}
