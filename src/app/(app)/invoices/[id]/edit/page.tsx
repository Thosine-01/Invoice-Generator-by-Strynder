import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { InvoiceForm } from "@/components/InvoiceForm";
import type { InvoiceFormInitialData } from "@/lib/types";

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const supabase = await createClient();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, line_items(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!invoice) notFound();

  if (invoice.status !== "draft") {
    redirect(`/invoices/${id}`);
  }

  const lineItems = (
    invoice.line_items as Array<{
      sort_order: number;
      description: string;
      quantity: number;
      unit_price: number;
    }>
  ).sort((a, b) => a.sort_order - b.sort_order);

  const profile = user.profile;

  const initialData: InvoiceFormInitialData = {
    id: invoice.id,
    invoice_number: invoice.invoice_number,
    issue_date: invoice.issue_date,
    due_date: invoice.due_date,
    currency: invoice.currency,
    header_color: invoice.header_color,
    client_name: invoice.client_name,
    client_address: invoice.client_address,
    client_email: invoice.client_email,
    client_phone: invoice.client_phone,
    payment_details: invoice.payment_details,
    notes: invoice.notes,
    vat_enabled: invoice.vat_enabled,
    vat_rate: Number(invoice.vat_rate),
    line_items: lineItems.map((item) => ({
      description: item.description,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
    })),
  };

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <Link
          href={`/invoices/${id}`}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to invoice
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Edit draft
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Update {invoice.invoice_number}. Saving will refresh the profile
          snapshot from your current business profile.
        </p>
      </header>

      <InvoiceForm
        profile={{
          owner_name: profile?.owner_name,
          business_name: profile?.business_name,
          logo_url: profile?.logo_url,
          address: profile?.address,
          phone: profile?.phone,
          email: profile?.email,
          slogan: profile?.slogan,
        }}
        paymentDetailsText={initialData.payment_details ?? ""}
        defaultCurrency={profile?.default_currency}
        defaultHeaderColor={profile?.default_header_color}
        initialData={initialData}
      />
    </div>
  );
}
