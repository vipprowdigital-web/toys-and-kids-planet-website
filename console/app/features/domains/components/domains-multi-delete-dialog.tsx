// app/features/domains/components/domains-multi-delete-dialog.tsx

"use client";

import type { Table } from "@tanstack/react-table"; // ✅ FIXED
import { MultiDeleteDialog } from "@/components/crud/MultiDeleteDialog";
import { useDeleteDomainMutation } from "../data/domainsApi";

type DomainsMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

export function DomainMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: DomainsMultiDeleteDialogProps<TData>) {
  const [deleteDomain] = useDeleteDomainMutation();

  return (
    <MultiDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      table={table}
      entityName="Domain"
      deleteFn={(id) => deleteDomain(id).unwrap()}
    />
  );
}
