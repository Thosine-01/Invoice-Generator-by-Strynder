"use client";

import type { Control } from "react-hook-form";
import { useFieldArray, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  calculateLineTotal,
  normalizeQuantityInput,
  roundQuantity,
} from "@/lib/calculations";
import { formatCurrency } from "@/lib/format";
import type { InvoiceBuilderFormValues } from "@/lib/validations/invoice";
import { Plus, Trash2 } from "lucide-react";

interface LineItemsEditorProps {
  control: Control<InvoiceBuilderFormValues>;
  currency: string;
}

export function LineItemsEditor({ control, currency }: LineItemsEditorProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "lineItems",
  });

  return (
    <div className="space-y-4">
      <div className="hidden gap-3 px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground sm:grid sm:grid-cols-[1fr_80px_100px_100px_36px]">
        <span>Description</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Unit price</span>
        <span className="text-right">Line total</span>
        <span />
      </div>

      <div className="space-y-3">
        {fields.map((field, index) => (
          <LineItemRow
            key={field.id}
            control={control}
            index={index}
            currency={currency}
            canRemove={fields.length > 1}
            onRemove={() => remove(index)}
          />
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ description: "", quantity: "1", unitPrice: "" })
        }
      >
        <Plus className="size-4" />
        Add line item
      </Button>

      <FormField
        control={control}
        name="lineItems"
        render={() => (
          <FormItem>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

function LineItemRow({
  control,
  index,
  currency,
  canRemove,
  onRemove,
}: {
  control: Control<InvoiceBuilderFormValues>;
  index: number;
  currency: string;
  canRemove: boolean;
  onRemove: () => void;
}) {
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:grid-cols-[1fr_80px_100px_100px_36px] sm:items-start">
      <FormField
        control={control}
        name={`lineItems.${index}.description`}
        render={({ field }) => (
          <FormItem className="sm:col-span-1">
            <FormLabel className="sm:sr-only">Description</FormLabel>
            <FormControl>
              <Input placeholder="Item or service description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`lineItems.${index}.quantity`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sm:sr-only">Quantity</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0.1"
                step="0.1"
                placeholder="1"
                className="text-right"
                name={field.name}
                ref={field.ref}
                onBlur={field.onBlur}
                value={field.value}
                onChange={(e) => {
                  field.onChange(normalizeQuantityInput(e.target.value));
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`lineItems.${index}.unitPrice`}
        render={({ field }) => (
          <FormItem>
            <FormLabel className="sm:sr-only">Unit price</FormLabel>
            <FormControl>
              <Input
                type="number"
                min="0"
                step="0.01"
                placeholder="0.00"
                className="text-right"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <LineTotalCell control={control} index={index} currency={currency} />

      <div className="flex justify-end sm:items-center">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          disabled={!canRemove}
          onClick={onRemove}
          aria-label="Remove line item"
          className="text-muted-foreground hover:text-destructive"
        >
          <Trash2 className="size-4" />
        </Button>
      </div>
    </div>
  );
}

function LineTotalCell({
  control,
  index,
  currency,
}: {
  control: Control<InvoiceBuilderFormValues>;
  index: number;
  currency: string;
}) {
  const quantity = useWatch({
    control,
    name: `lineItems.${index}.quantity`,
  });
  const unitPrice = useWatch({
    control,
    name: `lineItems.${index}.unitPrice`,
  });

  const total = calculateLineTotal(
    roundQuantity(parseFloat(quantity) || 0),
    parseFloat(unitPrice) || 0
  );

  return (
    <div className="flex h-8 items-center justify-end px-1 text-sm font-medium tabular-nums text-foreground">
      {formatCurrency(total, currency)}
    </div>
  );
}
