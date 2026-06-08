// app/features/blog/components/blog-multi-delete-dialog.tsx

"use client";

import type { Table } from "@tanstack/react-table"; // ✅ type-only import
import { MultiDeleteDialog } from "@/components/crud/MultiDeleteDialog";
import { useDeleteBlogMutation } from "../data/blogApi"; // ✅ use blog mutation

type BlogMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

export function BlogMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: BlogMultiDeleteDialogProps<TData>) {
  const [deleteBlog] = useDeleteBlogMutation();

  return (
    <MultiDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      table={table}
      entityName="blog"
      deleteFn={(slug) => deleteBlog(slug).unwrap()} // ✅ uses slug (blogs delete by slug)
    />
  );
}
