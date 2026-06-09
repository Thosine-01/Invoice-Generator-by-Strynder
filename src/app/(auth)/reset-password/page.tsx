import Link from "next/link";
import { resetPasswordAction } from "@/actions/auth";
import { AuthForm } from "@/components/AuthForm";

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-emerald-800">
            Strynder
          </Link>
          <h1 className="mt-4 text-xl font-semibold text-gray-900">
            Set new password
          </h1>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <AuthForm
            action={resetPasswordAction}
            submitLabel="Update Password"
            fields="reset"
          />
        </div>
      </div>
    </div>
  );
}
