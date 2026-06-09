import Link from "next/link";
import { LoginForm } from "@/components/LoginForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function LoginPage() {
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
            Professional invoices for Nigerian businesses
          </p>
        </div>

        <Card className="border-0 bg-card shadow-sm ring-1 ring-foreground/10">
          <CardHeader className="space-y-1 pb-2 text-center">
            <CardTitle className="text-xl font-semibold">Sign in</CardTitle>
            <CardDescription>
              Welcome back. Enter your credentials to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          No account?{" "}
          <Link
            href="/register"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Create one
          </Link>
          {" · "}
          <Link
            href="/forgot-password"
            className="font-medium text-foreground underline-offset-4 hover:underline"
          >
            Forgot password
          </Link>
        </p>
      </div>
    </div>
  );
}
