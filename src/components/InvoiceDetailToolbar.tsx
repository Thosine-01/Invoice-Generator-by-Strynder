"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { InvoiceActions } from "@/components/InvoiceActions";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { InvoicePreviewProps } from "@/components/InvoicePreview";
import { Pencil } from "lucide-react";

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
  isDraft: boolean;
  previewProps: InvoicePreviewProps;
}

export function InvoiceDetailToolbar({
  invoiceId,
  isDraft,
  previewProps,
}: InvoiceDetailToolbarProps) {
  return (
    <div className="flex flex-wrap items-start gap-3">
      {isDraft && (
        <Link
          href={`/invoices/${invoiceId}/edit`}
          className={cn(buttonVariants({ variant: "outline" }))}
        >
          <Pencil className="size-4" />
          Edit draft
        </Link>
      )}
      <DownloadPdfButton {...previewProps} />
      <InvoiceActions invoiceId={invoiceId} />
    </div>
  );
}
