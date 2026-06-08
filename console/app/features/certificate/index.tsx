// app/features/certificate/index.tsx

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  useGetCertificatesQuery,
  usePartiallyUpdateCertificateMutation,
  useDeleteCertificateMutation,
} from "./data/certificateApi";

import { DataTable, BulkActions } from "@/components/crud";
import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";

import {
  ArrowUpDown,
  CirclePlus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Image as ImageIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function CertificatePage() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [tableInstance, setTableInstance] = React.useState<any>(null);

  // 🟢 Fetch all certificates
  const { data, isLoading } = useGetCertificatesQuery({ page, limit });

  const [toggleCertificateStatus] = usePartiallyUpdateCertificateMutation();
  const [deleteCertificate] = useDeleteCertificateMutation();

  const certificateData = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  /* ============================================
     🔥 DELETE CERTIFICATE
     ============================================ */
  const handleDelete = async (item: any) => {
    await toast.promise(deleteCertificate(item._id).unwrap(), {
      loading: `Deleting "${item.title}"...`,
      success: `Certificate "${item.title}" deleted successfully!`,
      error: "Failed to delete certificate.",
    });
  };

  /* ============================================
     🔄 TOGGLE ACTIVE STATUS
     ============================================ */
  const handleToggleActive = async (certificate: any) => {
    try {
      await toggleCertificateStatus({
        id: certificate._id,
        data: { isActive: !certificate.isActive },
      }).unwrap();

      toast.success(
        `Certificate "${certificate.title}" has been ${
          certificate.isActive ? "deactivated" : "activated"
        }.`
      );
    } catch {
      toast.error("Failed to update certificate status.");
    }
  };

  /* ============================================
     📌 TABLE COLUMNS
     ============================================ */
  const columns: ColumnDef<any>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
    },

    {
      accessorKey: "image",
      header: "Image",
      cell: ({ row }) =>
        row.original.image ? (
          <img
            src={row.original.image?.optimized || row.original.image?.url}
            alt={row.original.title}
            className="h-10 w-10 rounded object-cover border"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
            <ImageIcon className="h-4 w-4 opacity-60" />
          </div>
        ),
    },

    {
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.title}
        </span>
      ),
    },

    {
      accessorKey: "category",
      header: "Category",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.category?.name || "-"}
        </span>
      ),
    },

    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Active <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={() => handleToggleActive(row.original)}
        />
      ),
    },

    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created At <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("en-IN"),
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row, table }) => {
        const certificate = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() =>
                  navigate(`/admin/certificate/edit/${certificate._id}`)
                }
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  (table.options.meta as any)?.openDeleteDialog(certificate)
                }
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  /* ============================================
     🎨 RENDER PAGE
     ============================================ */
  return (
    <div className="p-0 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Certificates</h1>

        <Button onClick={() => navigate("/admin/certificate/create")}>
          <CirclePlus className="mr-2 h-4 w-4" /> Add Certificate
        </Button>
      </div>

      {/* Bulk Actions */}
      {tableInstance && (
        <BulkActions table={tableInstance} entityName="certificate" />
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={certificateData}
        isLoading={isLoading}
        searchKey="title"
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          pageSize: limit,
          onPageSizeChange: setLimit,
        }}
        onDelete={handleDelete}
        deleteItemNameKey="title"
        onTableReady={setTableInstance}
      />
    </div>
  );
}
