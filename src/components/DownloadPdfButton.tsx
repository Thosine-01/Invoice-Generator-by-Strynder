"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { sanitizeFilename } from "@/lib/format";
import type { InvoicePreviewProps } from "@/components/InvoicePreview";
import { Download } from "lucide-react";

export function DownloadPdfButton(
  props: InvoicePreviewProps & { label?: string }
) {
  const { label = "Download PDF", ...invoiceProps } = props;
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDownload() {
    setDownloading(true);
    setError(null);

    try {
      const { InvoicePdfDocument } = await import(
        "@/components/InvoicePdfDocument"
      );

      const blob = await pdf(
        <InvoicePdfDocument {...invoiceProps} />
      ).toBlob();

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${sanitizeFilename(invoiceProps.invoiceNumber)}_${sanitizeFilename(invoiceProps.clientName)}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setError("Could not generate PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <Button
        type="button"
        onClick={handleDownload}
        disabled={downloading}
      >
        <Download className="size-4" />
        {downloading ? "Generating..." : label}
      </Button>
      {error && (
        <p className="text-xs text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
