"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import {
  HEADER_COLORS,
  LOGO_ACCEPTED_MIME_TYPES,
  LOGO_BUCKET,
  LOGO_MAX_BYTES,
} from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./auth";

function toNullable(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function logoExtension(mimeType: string): "png" | "jpg" {
  return mimeType === "image/png" ? "png" : "jpg";
}

async function uploadLogo(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  logoFile: File
): Promise<{ url: string | null; error: string | null }> {
  if (logoFile.size > LOGO_MAX_BYTES) {
    return { url: null, error: "Logo must be 5MB or smaller." };
  }

  if (
    !LOGO_ACCEPTED_MIME_TYPES.includes(
      logoFile.type as (typeof LOGO_ACCEPTED_MIME_TYPES)[number]
    )
  ) {
    return { url: null, error: "Logo must be a JPEG or PNG image." };
  }

  const ext = logoExtension(logoFile.type);
  const path = `${userId}/${Date.now()}-logo.${ext}`;
  const buffer = Buffer.from(await logoFile.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from(LOGO_BUCKET)
    .upload(path, buffer, {
      contentType: logoFile.type,
      upsert: false,
    });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(path);

  return { url: publicUrl, error: null };
}

export async function updateProfileAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  let logoUrl = user.profile?.logo_url ?? null;
  const logoFile = formData.get("logo");

  if (logoFile instanceof File && logoFile.size > 0) {
    const { url, error } = await uploadLogo(supabase, user.id, logoFile);
    if (error) return { error };
    logoUrl = url;
  }

  const defaultHeaderColor =
    HEADER_COLORS.find(
      (c) => c.value === (formData.get("defaultHeaderColor") as string)
    )?.value ?? HEADER_COLORS[0].value;

  const { error } = await supabase.from("business_profiles").upsert(
    {
      user_id: user.id,
      owner_name: toNullable(formData.get("ownerName")),
      business_name: toNullable(formData.get("businessName")),
      logo_url: logoUrl,
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
  revalidatePath("/invoices/new");
  return { success: "Profile updated successfully." };
}
