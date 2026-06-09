"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  deleteInvoiceAction,
  duplicateInvoiceAction,
} from "@/actions/invoices";
import { Button } from "@/components/ui/button";

export function InvoiceActions({ invoiceId }: { invoiceId: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleDelete() {
    if (!confirm("Delete this invoice? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteInvoiceAction(invoiceId);
      if (!result.error) router.push("/invoices");
      else alert(result.error);
    });
  }

  function handleDuplicate() {
    startTransition(async () => {
      await duplicateInvoiceAction(invoiceId);
    });
  }

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        variant="secondary"
        onClick={handleDuplicate}
        disabled={pending}
      >
        Duplicate
      </Button>
      <Button
        type="button"
        variant="destructive"
        onClick={handleDelete}
        disabled={pending}
      >
        Delete
      </Button>
    </div>
  );
}
