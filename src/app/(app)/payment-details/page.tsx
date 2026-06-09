import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { PaymentForm } from "@/components/PaymentForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function PaymentDetailsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Payment details
        </h1>
        <p className="text-sm text-muted-foreground">
          Bank and payment information shown on your invoices. All fields are
          optional — you can configure this anytime or skip entirely.
        </p>
      </header>

      <Card className="border-0 bg-card shadow-sm ring-1 ring-foreground/10">
        <CardHeader className="border-b border-border pb-6">
          <CardTitle className="text-lg">How clients pay you</CardTitle>
          <CardDescription>
            Pre-fills the payment section on every new invoice when provided.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <PaymentForm payment={user.paymentDetails} />
        </CardContent>
      </Card>
    </div>
  );
}
