// app/features/user-certificate/components/user-certificate-multi-delete-dialog.tsx"

"use client";

import type { Table } from "@tanstack/react-table";
import { MultiDeleteDialog } from "@/components/crud/MultiDeleteDialog";
import { useDeleteUserCertificateMutation } from "../data/user-certificateApi";

type UserCertificateMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

export function UserCertificateMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: UserCertificateMultiDeleteDialogProps<TData>) {
  const [deleteUserCertificate] = useDeleteUserCertificateMutation();

  return (
    <MultiDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      table={table}
      entityName="user-certificate"
      deleteFn={(id) => deleteUserCertificate(id).unwrap()}
    />
  );
}