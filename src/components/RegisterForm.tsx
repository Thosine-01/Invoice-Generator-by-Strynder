"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { registerAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
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

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  function onSubmit(values: RegisterFormValues) {
    setServerError(null);
    setServerSuccess(null);

    const formData = new FormData();
    formData.set("email", values.email);
    formData.set("password", values.password);
    formData.set("confirmPassword", values.confirmPassword);

    startTransition(async () => {
      const result = await registerAction({}, formData);

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
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
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

        <p className="text-xs leading-relaxed text-muted-foreground">
          By registering, you agree that your data is stored securely. You are
          responsible for tax compliance on invoices you generate.
        </p>

        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? "Creating account..." : "Create account"}
        </Button>
      </form>
    </Form>
  );
}
