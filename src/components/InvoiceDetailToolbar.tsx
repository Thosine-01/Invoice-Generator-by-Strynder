"use client";

import dynamic from "next/dynamic";
import { InvoiceActions } from "@/components/InvoiceActions";
import { Button } from "@/components/ui/button";
import type { InvoicePreviewProps } from "@/components/InvoicePreview";

const DownloadPdfButton = dynamic(
  () =>
    import("@/components/DownloadPdfButton").then(
      (mod) => mod.DownloadPdfButton
    ),
  {
    ssr: false,
    loading: () => (
      <Button disabled variant="secondary">
        Loading PDF...
      </Button>
    ),
  }
);

interface InvoiceDetailToolbarProps {
  invoiceId: string;
  previewProps: InvoicePreviewProps;
}

export function InvoiceDetailToolbar({
  invoiceId,
  previewProps,
}: InvoiceDetailToolbarProps) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <DownloadPdfButton {...previewProps} />
      <InvoiceActions invoiceId={invoiceId} />
    </div>
  );
}
