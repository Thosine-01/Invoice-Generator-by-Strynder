import Link from "next/link";
import { redirect } from "next/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate } from "@/lib/format";
import { calculateProfileCompletion } from "@/lib/profile-completion";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: invoices } = await supabase
    .from("invoices")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5);

  const { count } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const profile = user.profile;
  const completion = calculateProfileCompletion(profile, user.paymentDetails);
  const displayName =
    profile?.business_name || profile?.owner_name || user.email;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome{displayName ? `, ${displayName}` : ""}
          </h1>
          <p className="mt-1 text-gray-600">
            Manage your business profile and invoices
          </p>
        </div>
        <Link href="/invoices/new" className={cn(buttonVariants())}>
          + New Invoice
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Profile Completion</h2>
          <p className="text-3xl font-bold text-emerald-800">{completion}%</p>
          <p className="mt-2 text-sm text-gray-500">
            <Link href="/profile" className="text-emerald-700 hover:underline">
              Complete profile
            </Link>
            {" · "}
            <Link
              href="/payment-details"
              className="text-emerald-700 hover:underline"
            >
              Payment details
            </Link>
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Total Invoices</h2>
          <p className="text-3xl font-bold text-gray-800">{count ?? 0}</p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Default Currency</h2>
          <p className="text-3xl font-bold text-gray-800">
            {profile?.default_currency ?? "NGN"}
          </p>
        </section>
      </div>

      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-lg font-semibold">Recent Invoices</h2>
          <Link href="/invoices" className="text-sm text-emerald-700 hover:underline">
            View all
          </Link>
        </div>
        {!invoices?.length ? (
          <p className="px-6 py-8 text-center text-sm text-gray-500">
            No invoices yet.{" "}
            <Link href="/invoices/new" className="text-emerald-700 hover:underline">
              Create your first invoice
            </Link>
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 text-left text-gray-500">
                  <th className="px-6 py-3 font-medium">Invoice</th>
                  <th className="px-6 py-3 font-medium">Client</th>
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Total</th>
                  <th className="px-6 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/invoices/${inv.id}`}
                        className="font-medium text-emerald-700 hover:underline"
                      >
                        {inv.invoice_number}
                      </Link>
                    </td>
                    <td className="px-6 py-3">{inv.client_name}</td>
                    <td className="px-6 py-3">{formatDate(inv.issue_date)}</td>
                    <td className="px-6 py-3">
                      {formatCurrency(inv.grand_total, inv.currency)}
                    </td>
                    <td className="px-6 py-3 capitalize">{inv.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
