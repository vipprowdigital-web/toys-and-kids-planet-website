// app/features/contact/components/contact-multi-delete-dialog.tsx

"use client";

import type { Table } from "@tanstack/react-table";
import { MultiDeleteDialog } from "@/components/crud/MultiDeleteDialog";

import { useDeleteContactMutation } from "../data/contactApi";

type ContactMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

export function ContactMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: ContactMultiDeleteDialogProps<TData>) {
  const [deleteContact] = useDeleteContactMutation();

  return (
    <MultiDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      table={table}
      entityName="contact"
      deleteFn={(id) => deleteContact(id).unwrap()}
    />
  );
}
