"use client";

import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { updateProfileAction } from "@/actions/profile";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { fieldControlClassName, Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  HEADER_COLORS,
  CURRENCIES,
  CURRENCY_LABELS,
} from "@/lib/constants";
import type { BusinessProfile } from "@/lib/types";
import {
  profileSchema,
  type ProfileFormValues,
} from "@/lib/validations/profile";
import { cn } from "@/lib/utils";

interface ProfileFormProps {
  profile: BusinessProfile | null;
}

function toFormValues(profile: BusinessProfile | null): ProfileFormValues {
  return {
    ownerName: profile?.owner_name ?? "",
    businessName: profile?.business_name ?? "",
    logoUrl: profile?.logo_url ?? "",
    address: profile?.address ?? "",
    phone: profile?.phone ?? "",
    email: profile?.email ?? "",
    slogan: profile?.slogan ?? "",
    defaultCurrency: (profile?.default_currency as ProfileFormValues["defaultCurrency"]) ?? "NGN",
    defaultHeaderColor:
      (profile?.default_header_color as ProfileFormValues["defaultHeaderColor"]) ??
      HEADER_COLORS[0].value,
  };
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: toFormValues(profile),
  });

  const logoUrl = form.watch("logoUrl");

  function onSubmit(values: ProfileFormValues) {
    setServerError(null);
    setServerSuccess(null);

    const formData = new FormData();
    formData.set("ownerName", values.ownerName);
    formData.set("businessName", values.businessName);
    formData.set("logoUrl", values.logoUrl);
    formData.set("address", values.address);
    formData.set("phone", values.phone);
    formData.set("email", values.email);
    formData.set("slogan", values.slogan);
    formData.set("defaultCurrency", values.defaultCurrency);
    formData.set("defaultHeaderColor", values.defaultHeaderColor);

    startTransition(async () => {
      const result = await updateProfileAction({}, formData);

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
              Business identity
            </h2>
            <p className="text-sm text-muted-foreground">
              How your business appears on invoices. Leave any field blank to
              skip it.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="ownerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Owner name</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business name</FormLabel>
                  <FormControl>
                    <Input placeholder="Optional" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="slogan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business slogan</FormLabel>
                <FormControl>
                  <Input placeholder="Optional tagline" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="logoUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Logo URL</FormLabel>
                <FormControl>
                  <Input
                    type="url"
                    placeholder="https://example.com/logo.png"
                    {...field}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Paste a public image URL for now. File upload comes in a later
                  update.
                </p>
                {logoUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={logoUrl}
                    alt="Logo preview"
                    className="mt-2 h-16 w-16 rounded-md border object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
                <FormMessage />
              </FormItem>
            )}
          />
        </section>

        <section className="space-y-5 border-t border-border pt-10">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Contact details
            </h2>
            <p className="text-sm text-muted-foreground">
              Shown in the header of your invoices when provided.
            </p>
          </div>

          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Textarea
                    rows={3}
                    placeholder="Optional business address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="+234 801 234 5678"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Nigerian format: +234 followed by your number.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="contact@business.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <section className="space-y-5 border-t border-border pt-10">
          <div className="space-y-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">
              Invoice defaults
            </h2>
            <p className="text-sm text-muted-foreground">
              Pre-selected when you create a new invoice. You can change them per
              invoice.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="defaultCurrency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default currency</FormLabel>
                  <FormControl>
                    <select
                      className={cn(fieldControlClassName)}
                      {...field}
                    >
                      {CURRENCIES.map((c) => (
                        <option key={c} value={c}>
                          {CURRENCY_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="defaultHeaderColor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default header color</FormLabel>
                  <FormControl>
                    <select
                      className={cn(fieldControlClassName)}
                      {...field}
                    >
                      {HEADER_COLORS.map((c) => (
                        <option key={c.value} value={c.value}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </section>

        <div className="border-t border-border pt-6">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving..." : "Save profile"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
