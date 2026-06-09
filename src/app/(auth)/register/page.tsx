import Link from "next/link";
import { RegisterForm } from "@/components/RegisterForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2 text-center">
          <Link
            href="/"
            className="text-2xl font-semibold tracking-tight text-foreground"
          >
            Strynder
          </Link>
          <p className="text-sm text-muted-foreground">
            Start creating branded invoices in minutes
          </p>
        </div>

        <Card className="border-0 bg-card shadow-sm ring-1 ring-foreground/10">
          <CardHeader className="space-y-1 pb-2 text-center">
            <CardTitle className="text-xl font-semibold">
              Create your account
            </CardTitle>
            <CardDescription>
              Save your business details once. Reuse them on every invoice.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RegisterForm />
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
