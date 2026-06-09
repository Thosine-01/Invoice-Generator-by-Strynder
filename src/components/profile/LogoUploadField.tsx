"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  LOGO_ACCEPTED_EXTENSIONS,
  LOGO_MAX_BYTES,
} from "@/lib/constants";
import { logoFileSchema } from "@/lib/validations/profile";
import { cn } from "@/lib/utils";

interface LogoUploadFieldProps {
  existingUrl: string | null;
  onFileChange: (file: File | null) => void;
  /** Increment after a successful save to drop the blob preview and adopt the persisted URL. */
  persistSignal?: number;
  disabled?: boolean;
}

export function LogoUploadField({
  existingUrl,
  onFileChange,
  persistSignal = 0,
  disabled = false,
}: LogoUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(existingUrl);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const clearObjectUrl = useCallback(() => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!persistSignal) return;
    clearObjectUrl();
    setPreviewUrl(existingUrl);
  }, [persistSignal, clearObjectUrl, existingUrl]);

  useEffect(() => {
    if (!objectUrlRef.current) {
      setPreviewUrl(existingUrl);
    }
  }, [existingUrl]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFile = useCallback(
    (file: File | null) => {
      setFieldError(null);

      if (!file) {
        clearObjectUrl();
        setPreviewUrl(existingUrl);
        onFileChange(null);
        return;
      }

      const result = logoFileSchema.safeParse(file);
      if (!result.success) {
        clearObjectUrl();
        setPreviewUrl(existingUrl);
        setFieldError(result.error.issues[0]?.message ?? "Invalid file.");
        onFileChange(null);
        return;
      }

      clearObjectUrl();
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      setPreviewUrl(objectUrl);
      onFileChange(file);
    },
    [clearObjectUrl, existingUrl, onFileChange]
  );

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    handleFile(file);
    e.target.value = "";
  }

  function handleClear() {
    handleFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-2">
      <Label>Business logo</Label>
      <div className="flex flex-wrap items-start gap-4">
        {previewUrl && (
          <div className="relative shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Logo preview"
              className="h-20 w-20 rounded-lg border border-border bg-muted/30 object-contain p-1"
            />
            {!disabled && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute -top-2 -right-2 size-6 rounded-full border border-border bg-background shadow-sm"
                onClick={handleClear}
                aria-label="Remove selected logo"
              >
                <X className="size-3" />
              </Button>
            )}
          </div>
        )}

        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className={cn(
            "flex min-h-20 flex-1 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border bg-muted/20 px-6 py-5 text-center transition-colors",
            "hover:border-foreground/30 hover:bg-muted/40",
            "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
            disabled && "pointer-events-none opacity-50"
          )}
        >
          <ImagePlus className="size-5 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            {previewUrl ? "Replace logo" : "Upload logo"}
          </span>
          <span className="text-xs text-muted-foreground">
            JPEG or PNG, max 5MB
          </span>
        </button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={LOGO_ACCEPTED_EXTENSIONS}
        className="sr-only"
        disabled={disabled}
        onChange={handleInputChange}
      />

      <p className="text-xs text-muted-foreground">
        Optional. Appears on your invoice header. Max{" "}
        {Math.round(LOGO_MAX_BYTES / (1024 * 1024))}MB.
      </p>

      {fieldError && (
        <p className="text-sm font-medium text-destructive" role="alert">
          {fieldError}
        </p>
      )}
    </div>
  );
}
