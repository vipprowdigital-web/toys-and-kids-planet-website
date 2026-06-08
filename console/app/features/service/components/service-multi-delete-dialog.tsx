// app/features/service/components/service-multi-delete-dialog.tsx

"use client";

import type { Table } from "@tanstack/react-table"; // ✅ FIXED
import { MultiDeleteDialog } from "@/components/crud/MultiDeleteDialog";
import { useDeleteServiceMutation } from "../data/serviceApi";

type ServiceMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

export function ServiceMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: ServiceMultiDeleteDialogProps<TData>) {
  const [deleteService] = useDeleteServiceMutation();

  return (
    <MultiDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      table={table}
      entityName="Service"
      deleteFn={(id) => deleteService(id).unwrap()}
    />
  );
}
