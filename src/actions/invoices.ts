"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  calculateInvoiceTotals,
  calculateLineTotal,
} from "@/lib/calculations";
import { formatPaymentDetails } from "@/lib/payment";
import { createClient } from "@/lib/supabase/server";
import type { ProfileSnapshot } from "@/lib/types";
import type { ActionResult } from "./auth";

function buildProfileSnapshot(profile: {
  owner_name: string | null;
  business_name: string | null;
  logo_url: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  slogan: string | null;
} | null): ProfileSnapshot {
  if (!profile) return {};
  return {
    owner_name: profile.owner_name,
    business_name: profile.business_name,
    logo_url: profile.logo_url,
    address: profile.address,
    phone: profile.phone,
    email: profile.email,
    slogan: profile.slogan,
  };
}

function parseLineItems(formData: FormData) {
  const descriptions = formData.getAll("lineDescription") as string[];
  const quantities = formData.getAll("lineQuantity") as string[];
  const unitPrices = formData.getAll("lineUnitPrice") as string[];

  return descriptions
    .map((description, i) => ({
      description: description.trim(),
      quantity: parseFloat(quantities[i] || "0"),
      unitPrice: parseFloat(unitPrices[i] || "0"),
    }))
    .filter((item) => item.description && item.quantity > 0);
}

function toNullable(value: FormDataEntryValue | null): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function insertInvoiceWithLineItems(
  supabase: Awaited<ReturnType<typeof createClient>>,
  rpcInvoice: Record<string, unknown>,
  dbInvoice: Record<string, unknown>,
  lineItemsPayload: Array<{
    sort_order: number;
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>
): Promise<{ invoiceId: string | null; error: string | null }> {
  const { data: rpcId, error: rpcError } = await supabase.rpc(
    "create_invoice_with_line_items",
    {
      p_invoice: rpcInvoice,
      p_line_items: lineItemsPayload,
    }
  );

  if (!rpcError && rpcId) {
    return { invoiceId: rpcId as string, error: null };
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert(dbInvoice)
    .select("id")
    .single();

  if (invoiceError || !invoice) {
    return {
      invoiceId: null,
      error: rpcError?.message ?? invoiceError?.message ?? "Failed to create invoice.",
    };
  }

  const { error: lineError } = await supabase.from("line_items").insert(
    lineItemsPayload.map((item) => ({
      invoice_id: invoice.id,
      ...item,
    }))
  );

  if (lineError) {
    await supabase.from("invoices").delete().eq("id", invoice.id);
    return { invoiceId: null, error: lineError.message };
  }

  return { invoiceId: invoice.id, error: null };
}

export async function createInvoiceAction(
  _prev: ActionResult,
  formData: FormData
): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const clientName = (formData.get("clientName") as string)?.trim();
  if (!clientName) return { error: "Client name is required." };

  const lineItems = parseLineItems(formData);
  if (lineItems.length === 0) {
    return { error: "Add at least one line item with a description and quantity." };
  }

  const vatEnabled = formData.get("vatEnabled") === "on";
  const vatRate = parseFloat((formData.get("vatRate") as string) || "7.5");
  const totals = calculateInvoiceTotals(lineItems, vatEnabled, vatRate);

  const paymentFromForm = toNullable(formData.get("paymentDetails"));
  const paymentText =
    paymentFromForm ?? formatPaymentDetails(user.paymentDetails) ?? null;

  const profileSnapshot = buildProfileSnapshot(user.profile);

  const invoicePayload = {
    user_id: user.id,
    invoice_number: (formData.get("invoiceNumber") as string) || "INV-000",
    issue_date: formData.get("issueDate") as string,
    due_date: toNullable(formData.get("dueDate")),
    currency: (formData.get("currency") as string) || "NGN",
    client_name: clientName,
    client_address: toNullable(formData.get("clientAddress")),
    client_email: toNullable(formData.get("clientEmail")),
    client_phone: toNullable(formData.get("clientPhone")),
    payment_details: paymentText,
    notes: toNullable(formData.get("notes")),
    vat_enabled: vatEnabled,
    vat_rate: vatRate,
    subtotal: totals.subtotal,
    vat_amount: totals.vatAmount,
    grand_total: totals.grandTotal,
    header_color: (formData.get("headerColor") as string) || "#1e3a5f",
    profile_snapshot: profileSnapshot,
    status: formData.get("status") === "draft" ? "draft" : "finalized",
  };

  const lineItemsPayload = lineItems.map((item, i) => ({
    sort_order: i + 1,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    line_total: calculateLineTotal(item.quantity, item.unitPrice),
  }));

  const rpcInvoicePayload = {
    invoice_number: invoicePayload.invoice_number,
    issue_date: invoicePayload.issue_date,
    due_date: invoicePayload.due_date ?? "",
    currency: invoicePayload.currency,
    client_name: invoicePayload.client_name,
    client_address: invoicePayload.client_address ?? "",
    client_email: invoicePayload.client_email ?? "",
    client_phone: invoicePayload.client_phone ?? "",
    payment_details: invoicePayload.payment_details ?? "",
    notes: invoicePayload.notes ?? "",
    vat_enabled: invoicePayload.vat_enabled,
    vat_rate: invoicePayload.vat_rate,
    subtotal: invoicePayload.subtotal,
    vat_amount: invoicePayload.vat_amount,
    grand_total: invoicePayload.grand_total,
    header_color: invoicePayload.header_color,
    profile_snapshot: profileSnapshot,
    status: invoicePayload.status,
  };

  const { invoiceId, error } = await insertInvoiceWithLineItems(
    supabase,
    rpcInvoicePayload,
    invoicePayload,
    lineItemsPayload
  );

  if (error || !invoiceId) {
    return { error: error ?? "Failed to create invoice." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  redirect(`/invoices/${invoiceId}`);
}

export async function deleteInvoiceAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  const supabase = await createClient();

  const { error } = await supabase
    .from("invoices")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/dashboard");
  revalidatePath("/invoices");
  return { success: "Invoice deleted." };
}

export async function duplicateInvoiceAction(id: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: original } = await supabase
    .from("invoices")
    .select("*, line_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!original) throw new Error("Invoice not found.");

  const lineItems = (original.line_items as Array<{
    sort_order: number;
    description: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>) ?? [];

  const invoicePayload = {
    user_id: user.id,
    invoice_number: `${original.invoice_number}-COPY`,
    issue_date: new Date().toISOString().split("T")[0],
    due_date: original.due_date,
    currency: original.currency,
    client_name: original.client_name,
    client_address: original.client_address,
    client_email: original.client_email,
    client_phone: original.client_phone,
    payment_details: original.payment_details,
    notes: original.notes,
    vat_enabled: original.vat_enabled,
    vat_rate: original.vat_rate,
    subtotal: original.subtotal,
    vat_amount: original.vat_amount,
    grand_total: original.grand_total,
    header_color: original.header_color,
    profile_snapshot: original.profile_snapshot,
    status: "draft",
  };

  const lineItemsPayload = lineItems.map((item) => ({
    sort_order: item.sort_order,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.line_total,
  }));

  const rpcDuplicatePayload = {
    invoice_number: invoicePayload.invoice_number,
    issue_date: invoicePayload.issue_date,
    due_date: invoicePayload.due_date ?? "",
    currency: invoicePayload.currency,
    client_name: invoicePayload.client_name,
    client_address: invoicePayload.client_address ?? "",
    client_email: invoicePayload.client_email ?? "",
    client_phone: invoicePayload.client_phone ?? "",
    payment_details: invoicePayload.payment_details ?? "",
    notes: invoicePayload.notes ?? "",
    vat_enabled: invoicePayload.vat_enabled,
    vat_rate: invoicePayload.vat_rate,
    subtotal: invoicePayload.subtotal,
    vat_amount: invoicePayload.vat_amount,
    grand_total: invoicePayload.grand_total,
    header_color: invoicePayload.header_color,
    profile_snapshot: invoicePayload.profile_snapshot,
    status: invoicePayload.status,
  };

  const { invoiceId, error } = await insertInvoiceWithLineItems(
    supabase,
    rpcDuplicatePayload,
    invoicePayload,
    lineItemsPayload
  );

  if (error || !invoiceId) throw new Error(error ?? "Failed to duplicate");

  revalidatePath("/invoices");
  redirect(`/invoices/${invoiceId}`);
}
