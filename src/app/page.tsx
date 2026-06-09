import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <span className="text-xl font-bold text-emerald-800">Strynder</span>
          <div className="flex gap-3">
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Log in
            </Link>
            <Link href="/register" className={cn(buttonVariants())}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 py-20 text-center">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-emerald-700">
            Built for Nigerian SMBs
          </p>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Professional invoices in minutes, not hours
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            Save your business details once. Generate branded invoices in Naira,
            Dollars, or Pounds with optional VAT — then download as PDF.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className={cn(buttonVariants({ size: "lg" }), "px-8")}
            >
              Create Free Account
            </Link>
            <Link
              href="/login"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-8")}
            >
              Sign In
            </Link>
          </div>
        </section>

        <section className="border-t border-gray-200 bg-white py-16">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 sm:grid-cols-3">
            {[
              {
                title: "Save once, reuse always",
                desc: "Logo, business name, contact, and payment details auto-fill every invoice.",
              },
              {
                title: "NGN-first, multi-currency",
                desc: "Default to Naira with one-click switch to USD or GBP per invoice.",
              },
              {
                title: "VAT when you need it",
                desc: "Optional 7.5% VAT toggle. Download polished PDFs instantly.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-xl border border-gray-100 p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
