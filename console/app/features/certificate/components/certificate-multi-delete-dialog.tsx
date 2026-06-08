// app/features/certificate/components/certificate-multi-delete-dialog.tsx"
// use client";

import type { Table } from "@tanstack/react-table";
import { MultiDeleteDialog } from "@/components/crud/MultiDeleteDialog";
import { useDeleteCertificateMutation } from "../data/certificateApi";

type CertificateMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

export function CertificateMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: CertificateMultiDeleteDialogProps<TData>) {
  const [deleteCertificate] = useDeleteCertificateMutation();

  return (
    <MultiDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      table={table}
      entityName="certificate"
      deleteFn={(id) => deleteCertificate(id).unwrap()}
    />
  );
}
