"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CURRENCIES, CURRENCY_LABELS, type Currency } from "@/lib/constants";

interface CurrencySelectProps {
  value: Currency;
  onChange: (currency: Currency) => void;
}

export function CurrencySelect({ value, onChange }: CurrencySelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(next) => {
        if (next) onChange(next as Currency);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {CURRENCIES.map((currency) => (
          <SelectItem key={currency} value={currency}>
            {CURRENCY_LABELS[currency]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
