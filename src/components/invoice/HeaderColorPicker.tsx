"use client";

import { HEADER_COLORS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface HeaderColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function HeaderColorPicker({ value, onChange }: HeaderColorPickerProps) {
  return (
    <div className="flex flex-wrap gap-3">
      {HEADER_COLORS.map((color) => {
        const selected = value === color.value;
        return (
          <button
            key={color.value}
            type="button"
            title={color.name}
            aria-label={`${color.name} header color`}
            aria-pressed={selected}
            onClick={() => onChange(color.value)}
            className={cn(
              "relative flex size-10 items-center justify-center rounded-full border-2 transition-all",
              selected
                ? "scale-105 border-foreground shadow-md"
                : "border-transparent hover:scale-105 hover:border-border"
            )}
            style={{ backgroundColor: color.value }}
          >
            {selected && (
              <Check className="size-4 text-white drop-shadow-sm" strokeWidth={3} />
            )}
          </button>
        );
      })}
    </div>
  );
}
