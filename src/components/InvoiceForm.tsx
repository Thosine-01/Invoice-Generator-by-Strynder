"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createInvoiceAction } from "@/actions/invoices";
import { CurrencySelect } from "@/components/invoice/CurrencySelect";
import { HeaderColorPicker } from "@/components/invoice/HeaderColorPicker";
import { LineItemsEditor } from "@/components/invoice/LineItemsEditor";
import { InvoicePreview } from "@/components/InvoicePreview";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  calculateInvoiceTotals,
  calculateLineTotal,
  parseLineItemRow,
} from "@/lib/calculations";
import {
  DEFAULT_VAT_RATE,
  HEADER_COLORS,
  type Currency,
} from "@/lib/constants";
import { generateInvoiceNumber, toInputDate } from "@/lib/format";
import type { ProfileSnapshot } from "@/lib/types";
import {
  invoiceBuilderSchema,
  type InvoiceBuilderFormValues,
} from "@/lib/validations/invoice";

interface InvoiceFormProps {
  profile: ProfileSnapshot;
  paymentDetailsText: string;
  defaultCurrency?: string;
  defaultHeaderColor?: string;
}

export function InvoiceForm({
  profile,
  paymentDetailsText,
  defaultCurrency = "NGN",
  defaultHeaderColor,
}: InvoiceFormProps) {
  const [invoiceNumber] = useState(generateInvoiceNumber);
  const [issueDate] = useState(toInputDate());
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  const resolvedHeaderColor = HEADER_COLORS.some(
    (c) => c.value === defaultHeaderColor
  )
    ? (defaultHeaderColor as InvoiceBuilderFormValues["headerColor"])
    : HEADER_COLORS[0].value;

  const form = useForm<InvoiceBuilderFormValues>({
    resolver: zodResolver(invoiceBuilderSchema),
    defaultValues: {
      dueDate: "",
      currency: (defaultCurrency as Currency) || "NGN",
      headerColor: resolvedHeaderColor,
      clientName: "",
      clientAddress: "",
      clientEmail: "",
      clientPhone: "",
      paymentDetails: paymentDetailsText,
      notes: "",
      vatEnabled: false,
      vatRate: String(DEFAULT_VAT_RATE),
      lineItems: [{ description: "", quantity: "1", unitPrice: "" }],
    },
  });

  const watched = form.watch();

  const parsedLines = useMemo(() => {
    return watched.lineItems
      .map((line, index) => {
        const parsed = parseLineItemRow(
          line.description,
          line.quantity,
          line.unitPrice
        );
        if (!parsed) return null;
        return {
          sort_order: index + 1,
          description: parsed.description,
          quantity: parsed.quantity,
          unit_price: parsed.unitPrice,
          line_total: calculateLineTotal(parsed.quantity, parsed.unitPrice),
        };
      })
      .filter((line): line is NonNullable<typeof line> => line !== null);
  }, [watched.lineItems]);

  const totals = useMemo(
    () =>
      calculateInvoiceTotals(
        parsedLines.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unitPrice: l.unit_price,
        })),
        watched.vatEnabled,
        parseFloat(watched.vatRate) || DEFAULT_VAT_RATE
      ),
    [parsedLines, watched.vatEnabled, watched.vatRate]
  );

  function buildParsedLinesFromValues(lineItems: InvoiceBuilderFormValues["lineItems"]) {
    return lineItems
      .map((line) =>
        parseLineItemRow(line.description, line.quantity, line.unitPrice)
      )
      .filter((line): line is NonNullable<typeof line> => line !== null);
  }

  function submitInvoice(status: "draft" | "finalized", values: InvoiceBuilderFormValues) {
    setServerError(null);

    const linesToSave = buildParsedLinesFromValues(values.lineItems);

    startTransition(async () => {
      const formData = new FormData();
      formData.set("invoiceNumber", invoiceNumber);
      formData.set("issueDate", issueDate);
      if (values.dueDate) formData.set("dueDate", values.dueDate);
      formData.set("currency", values.currency);
      formData.set("clientName", values.clientName);
      formData.set("clientAddress", values.clientAddress);
      formData.set("clientEmail", values.clientEmail);
      formData.set("clientPhone", values.clientPhone);
      formData.set("paymentDetails", values.paymentDetails);
      formData.set("notes", values.notes);
      if (values.vatEnabled) formData.set("vatEnabled", "on");
      formData.set("vatRate", values.vatRate);
      formData.set("headerColor", values.headerColor);
      formData.set("status", status);

      linesToSave.forEach((line) => {
        formData.append("lineDescription", line.description);
        formData.append("lineQuantity", String(line.quantity));
        formData.append("lineUnitPrice", String(line.unitPrice));
      });

      const result = await createInvoiceAction({}, formData);
      if (result?.error) setServerError(result.error);
    });
  }

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] xl:items-start">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit((values) =>
            submitInvoice("finalized", values)
          )}
          className="space-y-6"
        >
          {serverError && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {serverError}
            </div>
          )}

          <Card className="border-0 shadow-sm ring-1 ring-foreground/10">
            <CardHeader>
              <CardTitle>Invoice details</CardTitle>
              <CardDescription>
                Number and dates are set automatically. Choose currency and
                branding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="grid gap-2">
                  <FormLabel>Invoice number</FormLabel>
                  <Input value={invoiceNumber} readOnly />
                </div>
                <div className="grid gap-2">
                  <FormLabel>Date of issue</FormLabel>
                  <Input type="date" value={issueDate} readOnly />
                </div>
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <CurrencySelect
                          value={field.value}
                          onChange={field.onChange}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="headerColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Header color</FormLabel>
                    <FormControl>
                      <HeaderColorPicker
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Choose from eight branding presets. The preview updates
                      instantly.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-foreground/10">
            <CardHeader>
              <CardTitle>Client</CardTitle>
              <CardDescription>
                Who you are billing. Only the client name is required.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField
                control={form.control}
                name="clientName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client name</FormLabel>
                    <FormControl>
                      <Input placeholder="Client or company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clientAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="Optional"
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
                  name="clientEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Optional"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="clientPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="Optional" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-foreground/10">
            <CardHeader>
              <CardTitle>Line items</CardTitle>
              <CardDescription>
                Add services or products. Totals update as you type.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <LineItemsEditor
                control={form.control}
                currency={watched.currency}
              />

              <div className="flex flex-wrap items-center gap-6 rounded-lg border border-border bg-muted/20 px-4 py-3">
                <FormField
                  control={form.control}
                  name="vatEnabled"
                  render={({ field }) => (
                    <FormItem className="flex items-center gap-3 space-y-0">
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Include VAT</FormLabel>
                    </FormItem>
                  )}
                />
                {watched.vatEnabled && (
                  <FormField
                    control={form.control}
                    name="vatRate"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2 space-y-0">
                        <FormLabel className="text-muted-foreground">
                          Rate (%)
                        </FormLabel>
                        <FormControl>
                          <Input
                            className="w-24"
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm ring-1 ring-foreground/10">
            <CardHeader>
              <CardTitle>Payment & notes</CardTitle>
              <CardDescription>
                Pre-filled from your profile. Edits apply to this invoice only.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField
                control={form.control}
                name="paymentDetails"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment details</FormLabel>
                    <FormControl>
                      <Textarea rows={4} {...field} />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      Snapshot saved on this invoice — your global payment
                      settings stay unchanged.
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes / payment terms</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={2}
                        placeholder="Optional"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save & view invoice"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={isPending}
              onClick={form.handleSubmit((values) =>
                submitInvoice("draft", values)
              )}
            >
              Save as draft
            </Button>
          </div>
        </form>
      </Form>

      <div className="xl:sticky xl:top-6">
        <div className="mb-4 space-y-1">
          <p className="text-sm font-medium text-foreground">Live preview</p>
          <p className="text-xs text-muted-foreground">
            Updates in real time as you build your invoice.
          </p>
        </div>
        <div className="overflow-hidden rounded-xl shadow-lg ring-1 ring-foreground/10">
          <InvoicePreview
            headerColor={watched.headerColor}
            profile={profile}
            invoiceNumber={invoiceNumber}
            issueDate={issueDate}
            dueDate={watched.dueDate || null}
            currency={watched.currency}
            clientName={watched.clientName || "Client Name"}
            clientAddress={watched.clientAddress}
            clientEmail={watched.clientEmail}
            clientPhone={watched.clientPhone}
            lineItems={
              parsedLines.length > 0
                ? parsedLines
                : [
                    {
                      sort_order: 1,
                      description: "Item description",
                      quantity: 1,
                      unit_price: 0,
                      line_total: 0,
                    },
                  ]
            }
            vatEnabled={watched.vatEnabled}
            vatRate={parseFloat(watched.vatRate) || DEFAULT_VAT_RATE}
            subtotal={totals.subtotal}
            vatAmount={totals.vatAmount}
            grandTotal={totals.grandTotal}
            paymentDetails={watched.paymentDetails}
            notes={watched.notes}
          />
        </div>
      </div>
    </div>
  );
}
