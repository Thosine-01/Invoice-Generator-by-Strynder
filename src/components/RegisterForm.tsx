"use client";

import { useState, useTransition, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Turnstile, type TurnstileCApiInstance } from '@marsidev/react-turnstile'
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  registerSchema,
  type RegisterFormValues,
} from "@/lib/validations/auth";

export function RegisterForm() {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string>();
  const turnstileRef = useRef<TurnstileCApiInstance>(null);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  function handlePrivacyDownload(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault();
    const link = document.createElement("a");
    link.href = "/api/privacy-pdf";
    link.download = "Strynder-Privacy-Policy.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    setServerSuccess(null);

    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("confirmPassword", values.confirmPassword);

    startTransition(async () => {
      const result = await registerAction({}, formData, captchaToken);

      // reset in both branches — token is single-use either way
      turnstileRef.current?.reset();

      if (result?.error) {
        setServerError(result.error);
        if (result.error.toLowerCase().includes("email")) {
          form.setError("email", { message: result.error });
        } else if (result.error.toLowerCase().includes("password")) {
          form.setError("password", { message: result.error });
        }
        return;
      }

      if (result?.success) {
        setServerSuccess(result.success);
        form.reset();
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          >
            {serverError}
          </div>
        )}

        {serverSuccess && (
          <div
            role="status"
            className="rounded-lg border border-purple-200 bg-purple-50 px-4 py-3 text-sm text-purple-800"
          >
            {serverSuccess}
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="email"
                  placeholder="you@business.com"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-start gap-3">
                <FormControl>
                  <Checkbox
                    id={field.name}
                    checked={field.value === true}
                    onChange={(e) => field.onChange(e.target.checked)}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                </FormControl>
                <label
                  htmlFor={field.name}
                  className="text-xs leading-relaxed text-muted-foreground cursor-pointer select-none"
                >
                  I agree to the{" "}
                  <a
                    href="/api/privacy-pdf"
                    onClick={handlePrivacyDownload}
                    className="font-medium text-primary underline underline-offset-2 hover:text-primary/80 transition-colors"
                  >
                    Privacy Policy
                  </a>
                  . Your data is never sold or shared. We do not store payment
                  information of any kind.
                </label>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Turnstile
          ref={turnstileRef}
          siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
          onSuccess={(token) => setCaptchaToken(token)}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isPending || !captchaToken}
        >
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
}