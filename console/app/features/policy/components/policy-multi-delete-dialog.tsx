// app/features/policy/components/policy-multi-delete-dialog.tsx
"use client";

import type { Table } from "@tanstack/react-table"; // ✅ FIXED
import { MultiDeleteDialog } from "@/components/crud/MultiDeleteDialog";
import { useDeletePolicyMutation } from "../data/policyApi";

type PolicyMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

export function PolicyMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: PolicyMultiDeleteDialogProps<TData>) {
  const [deletePolicy] = useDeletePolicyMutation();

  return (
    <MultiDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      table={table}
      entityName="Policy"
      deleteFn={(id) => deletePolicy(id).unwrap()}
    />
  );
}
