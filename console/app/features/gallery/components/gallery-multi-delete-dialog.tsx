// app/features/gallery/components/gallery-multi-delete-dialog.tsx

"use client";

import type { Table } from "@tanstack/react-table"; // ✅ FIXED
import { MultiDeleteDialog } from "@/components/crud/MultiDeleteDialog";
import { useDeleteGalleryMutation } from "../data/galleryApi";

type GalleryMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

export function GalleryMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: GalleryMultiDeleteDialogProps<TData>) {
  const [deleteGallery] = useDeleteGalleryMutation();

  return (
    <MultiDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      table={table}
      entityName="gallery"
      deleteFn={(id) => deleteGallery(id).unwrap()}
    />
  );
}
