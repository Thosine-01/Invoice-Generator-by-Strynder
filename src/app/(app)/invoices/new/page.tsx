import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { formatPaymentDetails } from "@/lib/payment";
import { InvoiceForm } from "@/components/InvoiceForm";

export default async function NewInvoicePage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const profile = user.profile;

  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          New invoice
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Build your invoice with a live preview. Business and payment details
          are snapshotted when you save — your profile settings are never
          modified.
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
        paymentDetailsText={formatPaymentDetails(user.paymentDetails)}
        defaultCurrency={profile?.default_currency}
        defaultHeaderColor={profile?.default_header_color}
      />
    </div>
  );
}
