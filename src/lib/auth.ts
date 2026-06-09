import { createClient } from "@/lib/supabase/server";
import type { BusinessProfile, PaymentDetails } from "@/lib/types";

export async function getSessionUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const [{ data: profile }, { data: paymentDetails }] = await Promise.all([
    supabase.from("business_profiles").select("*").eq("user_id", user.id).maybeSingle(),
    supabase.from("payment_details").select("*").eq("user_id", user.id).maybeSingle(),
  ]);

  return {
    id: user.id,
    email: user.email ?? "",
    profile: profile as BusinessProfile | null,
    paymentDetails: paymentDetails as PaymentDetails | null,
  };
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}
