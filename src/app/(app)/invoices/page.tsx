import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/format";

export default async function InvoicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
        <Link href="/invoices/new" className={cn(buttonVariants())}>
          + New Invoice
        </Link>
      </div>

      {!invoices?.length ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center">
          <p className="text-gray-500">No invoices yet.</p>
          <Link
            href="/invoices/new"
            className={cn(buttonVariants(), "mt-4")}
          >
            Create your first invoice
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-left text-gray-500">
                <th className="px-6 py-3 font-medium">Invoice #</th>
                <th className="px-6 py-3 font-medium">Client</th>
                <th className="px-6 py-3 font-medium">Issue Date</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <Link
                      href={`/invoices/${inv.id}`}
                      className="font-medium text-emerald-700 hover:underline"
                    >
                      {inv.invoice_number}
                    </Link>
                  </td>
                  <td className="px-6 py-4">{inv.client_name}</td>
                  <td className="px-6 py-4">{formatDate(inv.issue_date)}</td>
                  <td className="px-6 py-4">
                    {formatCurrency(inv.grand_total, inv.currency)}
                  </td>
                  <td className="px-6 py-4 capitalize">{inv.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
