// app/features/category/components/category-multi-delete-dialog.tsx

"use client";

import type { Table } from "@tanstack/react-table"; // ✅ FIXED
import { MultiDeleteDialog } from "@/components/crud/MultiDeleteDialog";
import { useDeleteCategoryMutation } from "../data/categoryApi";

type CategoryMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

export function CategoryMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: CategoryMultiDeleteDialogProps<TData>) {
  const [deleteCategory] = useDeleteCategoryMutation();

  return (
    <MultiDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      table={table}
      entityName="Category"
      deleteFn={(id) => deleteCategory(id).unwrap()}
    />
  );
}
