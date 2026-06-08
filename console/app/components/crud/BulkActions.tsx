// app/components/crud/BulkAction.tsx

"use client";

import React, { useEffect, useState } from "react";
import { type Table } from "@tanstack/react-table";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Import all multi-delete dialogs
import { CategoryMultiDeleteDialog } from "~/features/category/components/category-multi-delete-dialog";
import { ServiceMultiDeleteDialog } from "~/features/service/components/service-multi-delete-dialog";
import { PolicyMultiDeleteDialog } from "~/features/policy/components/policy-multi-delete-dialog";
import { TestimonialMultiDeleteDialog } from "~/features/testimonial/components/testimonial-multi-delete-dialog";
import { GalleryMultiDeleteDialog } from "~/features/gallery/components/gallery-multi-delete-dialog";
import { BlogMultiDeleteDialog } from "~/features/blog/components/blog-multi-delete-dialog";
import { ContactMultiDeleteDialog } from "~/features/contact/components/contact-multi-delete-dialog";
import { CourseMultiDeleteDialog } from "~/features/course/components/blog-multi-delete-dialog";
import { CertificateMultiDeleteDialog } from "~/features/certificate/components/certificate-multi-delete-dialog";
import { UserCertificateMultiDeleteDialog } from "~/features/user-certificate/components/user-certificate-multi-delete-dialog";
// You can add more in the future like:
// import { UserMultiDeleteDialog } from "~/features/user/components/user-multi-delete-dialog";

export function BulkActions<TData>({
  table,
  entityName = "item",
}: {
  table: Table<TData>;
  entityName?: string;
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCount, setSelectedCount] = useState(0);

  // ✅ Dynamically choose the correct delete dialog
  const renderDeleteDialog = () => {
    switch (entityName?.toLowerCase()) {
      case "service":
        return (
          <ServiceMultiDeleteDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            table={table}
          />
        );

      case "category":
        return (
          <CategoryMultiDeleteDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            table={table}
          />
        );

      case "policy":
        return (
          <PolicyMultiDeleteDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            table={table}
          />
        );

      case "testimonial":
        return (
          <TestimonialMultiDeleteDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            table={table}
          />
        );

      case "certificate":
        return (
          <CertificateMultiDeleteDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            table={table}
          />
        );

      case "user-certificate":
        return (
          <UserCertificateMultiDeleteDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            table={table}
          />
        );

      case "gallery":
        return (
          <GalleryMultiDeleteDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            table={table}
          />
        );

      case "blog":
        return (
          <BlogMultiDeleteDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            table={table}
          />
        );

      case "course":
        return (
          <CourseMultiDeleteDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            table={table}
          />
        );

      case "contact":
        return (
          <ContactMultiDeleteDialog
            open={showDeleteConfirm}
            onOpenChange={setShowDeleteConfirm}
            table={table}
          />
        );

      // Future example:
      // case "user":
      //   return (
      //     <UserMultiDeleteDialog
      //       open={showDeleteConfirm}
      //       onOpenChange={setShowDeleteConfirm}
      //       table={table}
      //     />
      //   );

      default:
        return null;
    }
  };

  useEffect(() => {
    const rerender = () => {
      const count = table.getFilteredSelectedRowModel().rows.length;
      setSelectedCount(count);
      setIsVisible(count >= 2);
    };
    const interval = setInterval(rerender, 150);
    rerender();
    return () => clearInterval(interval);
  }, [table]);

  return (
    <>
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 80 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 80 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center justify-between
              rounded-xl bg-white/90 shadow-lg border border-gray-200 px-4 py-3 backdrop-blur-md 
              dark:bg-gray-900/80 w-[25%] max-w-2xl"
          >
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium">
                {selectedCount} {entityName}
                {selectedCount > 1 ? "s" : ""} selected
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* 🗑️ Bulk Delete */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Bulk Delete</p>
                </TooltipContent>
              </Tooltip>

              {/* ❌ Clear Selection */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => table.resetRowSelection()}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Clear selection</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🧩 Dynamically rendered Delete Dialog */}
      {renderDeleteDialog()}
    </>
  );
}
