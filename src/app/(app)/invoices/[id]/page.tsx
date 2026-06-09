import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { InvoiceDetailToolbar } from "@/components/InvoiceDetailToolbar";
import { InvoicePreview } from "@/components/InvoicePreview";
import type { ProfileSnapshot } from "@/lib/types";

export default async function InvoiceDetailPage({
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

  const lineItems = (
    invoice.line_items as Array<{
      sort_order: number;
      description: string;
      quantity: number;
      unit_price: number;
      line_total: number;
    }>
  ).sort((a, b) => a.sort_order - b.sort_order);

  const profile = invoice.profile_snapshot as ProfileSnapshot;

  const previewProps = {
    headerColor: invoice.header_color,
    profile,
    invoiceNumber: invoice.invoice_number,
    issueDate: invoice.issue_date,
    dueDate: invoice.due_date,
    currency: invoice.currency,
    clientName: invoice.client_name,
    clientAddress: invoice.client_address,
    clientEmail: invoice.client_email,
    clientPhone: invoice.client_phone,
    lineItems,
    vatEnabled: invoice.vat_enabled,
    vatRate: Number(invoice.vat_rate),
    subtotal: Number(invoice.subtotal),
    vatAmount: Number(invoice.vat_amount),
    grandTotal: Number(invoice.grand_total),
    paymentDetails: invoice.payment_details,
    notes: invoice.notes,
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <Link
            href="/invoices"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back to invoices
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {invoice.invoice_number}
          </h1>
          <p className="text-sm capitalize text-muted-foreground">
            {invoice.status}
          </p>
        </div>
        <InvoiceDetailToolbar
          invoiceId={invoice.id}
          previewProps={previewProps}
        />
      </div>

      <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-foreground/10">
        <InvoicePreview {...previewProps} />
      </div>
    </div>
  );
}
