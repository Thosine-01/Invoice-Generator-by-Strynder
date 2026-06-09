import Link from "next/link";
import { logoutAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function AppNav() {
  return (
    <header className="border-b border-border bg-card">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link
          href="/dashboard"
          className="text-xl font-semibold tracking-tight text-foreground"
        >
          Strynder
        </Link>
        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
          <Link href="/invoices" className="hover:text-foreground">
            Invoices
          </Link>
          <Link href="/invoices/new" className="hover:text-foreground">
            New Invoice
          </Link>
          <Link href="/profile" className="hover:text-foreground">
            Profile
          </Link>
          <Link href="/payment-details" className="hover:text-foreground">
            Payment
          </Link>
          <form action={logoutAction}>
            <Button type="submit" variant="ghost" size="sm" className="text-destructive hover:text-destructive">
              Logout
            </Button>
          </form>
        </nav>
      </div>
    </header>
  );
}
