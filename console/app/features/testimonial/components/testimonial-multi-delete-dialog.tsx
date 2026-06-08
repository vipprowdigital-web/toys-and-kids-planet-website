// app/features/testimonial/components/testimonial-multi-delete-dialog.tsx

"use client";

import type { Table } from "@tanstack/react-table"; // ✅ FIXED
import { MultiDeleteDialog } from "@/components/crud/MultiDeleteDialog";
import { useDeleteTestimonialMutation } from "../data/testimonialApi";

type TestimonialMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

export function TestimonialMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: TestimonialMultiDeleteDialogProps<TData>) {
  const [deleteTestimonial] = useDeleteTestimonialMutation();

  return (
    <MultiDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      table={table}
      entityName="Testimonial"
      deleteFn={(id) => deleteTestimonial(id).unwrap()}
    />
  );
}
