import { formatCurrency, formatDate } from "@/lib/format";
import type { ProfileSnapshot } from "@/lib/types";

export interface PreviewLineItem {
  sort_order: number;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface InvoicePreviewProps {
  headerColor: string;
  profile: ProfileSnapshot;
  invoiceNumber: string;
  issueDate: string | Date;
  dueDate?: string | Date | null;
  currency: string;
  clientName: string;
  clientAddress?: string | null;
  clientEmail?: string | null;
  clientPhone?: string | null;
  lineItems: PreviewLineItem[];
  vatEnabled: boolean;
  vatRate: number;
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
  paymentDetails?: string | null;
  notes?: string | null;
  compact?: boolean;
}

export function InvoicePreview({
  headerColor,
  profile,
  invoiceNumber,
  issueDate,
  dueDate,
  currency,
  clientName,
  clientAddress,
  clientEmail,
  clientPhone,
  lineItems,
  vatEnabled,
  vatRate,
  subtotal,
  vatAmount,
  grandTotal,
  paymentDetails,
  notes,
  compact = false,
}: InvoicePreviewProps) {
  const displayName = profile.business_name || profile.owner_name;

  return (
    <div
      className={`bg-card text-foreground ${compact ? "text-sm" : ""}`}
      style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      <div
        className={`text-white ${compact ? "px-5 py-4" : "px-8 py-6"}`}
        style={{ backgroundColor: headerColor }}
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            {profile.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.logo_url}
                alt="Business logo"
                className="h-14 w-14 rounded-md bg-white/10 object-contain p-1 ring-1 ring-white/20"
              />
            )}
            <div>
              {displayName && (
                <h2
                  className={`font-bold tracking-tight ${compact ? "text-lg" : "text-2xl"}`}
                >
                  {displayName}
                </h2>
              )}
              {profile.slogan && (
                <p className="mt-1 text-sm text-white/90">{profile.slogan}</p>
              )}
              {profile.owner_name && profile.business_name && (
                <p className="mt-1 text-sm text-white/75">
                  {profile.owner_name}
                </p>
              )}
            </div>
          </div>
          <div className="text-right">
            <p
              className={`font-bold tracking-[0.2em] ${compact ? "text-sm" : "text-lg"}`}
            >
              INVOICE
            </p>
            <p className="mt-2 text-sm text-white/90">{invoiceNumber}</p>
          </div>
        </div>
      </div>

      <div
        className={`grid gap-6 border-b border-border ${compact ? "p-4" : "p-8"} md:grid-cols-2`}
      >
        <div className="space-y-1 text-sm text-muted-foreground">
          {profile.address && <p>{profile.address}</p>}
          {profile.phone && <p>{profile.phone}</p>}
          {profile.email && <p>{profile.email}</p>}
        </div>
        <div className="space-y-1 text-sm md:text-right">
          <p>
            <span className="font-semibold text-foreground">Date of issue:</span>{" "}
            {formatDate(issueDate)}
          </p>
          {dueDate && (
            <p>
              <span className="font-semibold text-foreground">Due date:</span>{" "}
              {formatDate(dueDate)}
            </p>
          )}
          <p>
            <span className="font-semibold text-foreground">Currency:</span>{" "}
            {currency}
          </p>
        </div>
      </div>

      <div className={compact ? "p-4" : "p-8"}>
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Bill to
        </p>
        <p className="text-base font-semibold">{clientName}</p>
        {clientAddress && (
          <p className="mt-1 text-sm text-muted-foreground">{clientAddress}</p>
        )}
        {clientEmail && (
          <p className="text-sm text-muted-foreground">{clientEmail}</p>
        )}
        {clientPhone && (
          <p className="text-sm text-muted-foreground">{clientPhone}</p>
        )}
      </div>

      <div className={compact ? "px-4 pb-4" : "px-8 pb-8"}>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr style={{ backgroundColor: headerColor }} className="text-white">
              <th className="px-4 py-2.5 text-left font-semibold">#</th>
              <th className="px-4 py-2.5 text-left font-semibold">Description</th>
              <th className="px-4 py-2.5 text-right font-semibold">Qty</th>
              <th className="px-4 py-2.5 text-right font-semibold">Price</th>
              <th className="px-4 py-2.5 text-right font-semibold">Total</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item) => (
              <tr
                key={item.sort_order}
                className="border-b border-border/60"
              >
                <td className="px-4 py-2.5 text-muted-foreground">
                  {item.sort_order}
                </td>
                <td className="px-4 py-2.5">{item.description}</td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {item.quantity}
                </td>
                <td className="px-4 py-2.5 text-right tabular-nums">
                  {formatCurrency(item.unit_price, currency)}
                </td>
                <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                  {formatCurrency(item.line_total, currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-xs space-y-2 text-sm">
            {vatEnabled && (
              <>
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="tabular-nums text-foreground">
                    {formatCurrency(subtotal, currency)}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>VAT ({vatRate}%)</span>
                  <span className="tabular-nums text-foreground">
                    {formatCurrency(vatAmount, currency)}
                  </span>
                </div>
              </>
            )}
            <div
              className="flex justify-between border-t pt-3 text-base font-bold"
              style={{ borderColor: headerColor }}
            >
              <span>{vatEnabled ? "Grand total" : "Total"}</span>
              <span className="tabular-nums" style={{ color: headerColor }}>
                {formatCurrency(grandTotal, currency)}
              </span>
            </div>
          </div>
        </div>

        {paymentDetails && (
          <div className="mt-8 rounded-lg border border-border bg-muted/30 p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Payment details
            </p>
            <p className="whitespace-pre-line text-sm text-foreground/80">
              {paymentDetails}
            </p>
          </div>
        )}

        {notes && (
          <div className="mt-6">
            <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Notes
            </p>
            <p className="whitespace-pre-line text-sm text-muted-foreground">
              {notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
