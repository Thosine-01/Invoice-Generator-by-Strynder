"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updatePaymentAction } from "@/actions/payment";
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
import { Textarea } from "@/components/ui/textarea";
import type { PaymentDetails } from "@/lib/types";
import {
  paymentSchema,
  type PaymentFormValues,
} from "@/lib/validations/payment";

interface PaymentFormProps {
  payment: PaymentDetails | null;
}

function toFormValues(payment: PaymentDetails | null): PaymentFormValues {
  return {
    bankName: payment?.bank_name ?? "",
    accountName: payment?.account_name ?? "",
    accountNumber: payment?.account_number ?? "",
    additionalNote: payment?.additional_note ?? "",
  };
}

export function PaymentForm({ payment }: PaymentFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: toFormValues(payment),
  });

  function onSubmit(values: PaymentFormValues) {
    setServerError(null);
    setServerSuccess(null);

    const formData = new FormData();
    formData.set("bankName", values.bankName);
    formData.set("accountName", values.accountName);
    formData.set("accountNumber", values.accountNumber);
    formData.set("additionalNote", values.additionalNote);

    startTransition(async () => {
      const result = await updatePaymentAction({}, formData);

      if (result?.error) {
        setServerError(result.error);
        return;
      }

      if (result?.success) {
        setServerSuccess(result.success);
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
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

        <section className="space-y-5">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Bank account
            </h2>
            <p className="text-sm text-muted-foreground">
              Nigerian bank details for clients to pay you. All fields are
              optional.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="bankName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bank name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. GTBank, Access Bank" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accountName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account name</FormLabel>
                  <FormControl>
                    <Input placeholder="Name on the account" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="accountNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account number</FormLabel>
                <FormControl>
                  <Input placeholder="10-digit NUBAN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-5 border-t border-border pt-10">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Additional payment info
            </h2>
            <p className="text-sm text-muted-foreground">
              MoMo, PayPal, or other instructions shown on every new invoice
              when filled.
            </p>
          </div>

          <FormField
            control={form.control}
            name="additionalNote"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment note</FormLabel>
                <FormControl>
                  <Textarea
                    rows={4}
                    placeholder="PayPal, MoMo, sort code, etc."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <div className="border-t border-border pt-6">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save payment details"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
