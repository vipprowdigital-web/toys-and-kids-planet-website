// app/features/user-certificate/index.tsx

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";

import {
  useGetUserCertificatesQuery,
  useDeleteUserCertificateMutation,
  type UserCertificate,
} from "./data/user-certificateApi";

import { DataTable, BulkActions } from "@/components/crud";
import type { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Table } from "@tanstack/react-table";

import {
  ArrowUpDown,
  CirclePlus,
  MoreHorizontal,
  Trash2,
  FileText,
  Eye,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function UserCertificatePage() {
  const navigate = useNavigate();

  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [tableInstance, setTableInstance] =
    React.useState<Table<UserCertificate> | null>(null);

  /* ================================
     🟢 Fetch certificates
  ================================ */
  const { data, isLoading } = useGetUserCertificatesQuery({ page, limit });
  const [deleteUserCertificate] = useDeleteUserCertificateMutation();

  const userCertificates: UserCertificate[] = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  /* ================================
     🔥 Delete handler
  ================================ */
  const handleDelete = async (item: UserCertificate) => {
    await toast.promise(deleteUserCertificate(item._id).unwrap(), {
      loading: `Deleting certificate for "${item.name}"...`,
      success: "Certificate deleted successfully!",
      error: "Failed to delete certificate.",
    });
  };

  /* ================================
     📌 Table Columns
  ================================ */
  const columns: ColumnDef<UserCertificate>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
    },

    {
      accessorKey: "name",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          User Name <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },

    {
      accessorKey: "email",
      header: "Email",
    },

    {
      accessorKey: "phone",
      header: "Phone",
    },

    {
      id: "downloads",
      header: "Downloads",
      cell: ({ row }) => row.original.downloads?.length ?? 0,
    },

    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Assigned At <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("en-IN"),
    },

    {
      id: "actions",
      header: "Actions",
      cell: ({ row, table }) => {
        const record = row.original;

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

              {record.pdfUrl && (
                <DropdownMenuItem
                  onClick={() => window.open(record.pdfUrl, "_blank")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View PDF
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() =>
                  navigate(`/admin/user-certificate/edit/${record._id}`)
                }
              >
                <Eye className="mr-2 h-4 w-4" /> Edit / View
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  (
                    table.options.meta as { openDeleteDialog: Function }
                  )?.openDeleteDialog(record)
                }
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  /* ================================
     🎨 Render
  ================================ */
  return (
    <div className="p-0 space-y-3">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">User Certificates</h1>

        <Button onClick={() => navigate("/admin/user-certificate/create")}>
          <CirclePlus className="mr-2 h-4 w-4" /> Assign Certificate
        </Button>
      </div>

      {/* Bulk Actions */}
      {tableInstance && (
        <BulkActions
          table={tableInstance as any}
          entityName="user-certificate"
        />
      )}

      {/* Data Table */}
      <DataTable
        columns={columns}
        data={userCertificates}
        isLoading={isLoading}
        searchKey="name"
        pagination={{
          page,
          totalPages,
          onPageChange: setPage,
          pageSize: limit,
          onPageSizeChange: setLimit,
        }}
        onDelete={handleDelete}
        deleteItemNameKey="name"
        onTableReady={setTableInstance}
      />
    </div>
  );
}
