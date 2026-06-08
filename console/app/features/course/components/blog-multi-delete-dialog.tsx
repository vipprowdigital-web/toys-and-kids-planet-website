// app/features/course/components/course-multi-delete-dialog.tsx

"use client";

import type { Table } from "@tanstack/react-table";
import { MultiDeleteDialog } from "@/components/crud/MultiDeleteDialog";
import { useDeleteCourseMutation } from "../data/courseApi";

type CourseMultiDeleteDialogProps<TData> = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table<TData>;
};

export function CourseMultiDeleteDialog<TData>({
  open,
  onOpenChange,
  table,
}: CourseMultiDeleteDialogProps<TData>) {
  const [deleteCourse] = useDeleteCourseMutation();

  return (
    <MultiDeleteDialog
      open={open}
      onOpenChange={onOpenChange}
      table={table}
      entityName="course"
      // ❗ Courses delete by ID, NOT slug
      deleteFn={(id) => deleteCourse(id).unwrap()}
    />
  );
}

