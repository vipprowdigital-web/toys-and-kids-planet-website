// app/features/policy/index.tsx

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  useGetPoliciesQuery,
  usePartiallyUpdatePolicyMutation,
  useDeletePolicyMutation,
} from "~/features/policy/data/policyApi";
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
  FileText,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PolicyPage() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [tableInstance, setTableInstance] = React.useState<any>(null);

  // ✅ Fetch policies (paginated)
  const { data, isLoading } = useGetPoliciesQuery({ page, limit });
  const [togglePolicyStatus] = usePartiallyUpdatePolicyMutation();
  const [deletePolicy] = useDeletePolicyMutation();

  const policyData = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  // ✅ Delete handler
  const handleDelete = async (item: any) => {
    await toast.promise(deletePolicy(item._id).unwrap(), {
      loading: `Deleting ${item.title}...`,
      success: `Policy "${item.title}" deleted successfully!`,
      error: "Failed to delete policy.",
    });
  };

  // ✅ Toggle active status
  const handleToggleActive = async (policy: any) => {
    try {
      await togglePolicyStatus({
        id: policy._id,
        data: { isActive: !policy.isActive },
      }).unwrap();
      toast.success(
        `Policy "${policy.title}" has been ${
          policy.isActive ? "deactivated" : "activated"
        }.`
      );
    } catch {
      toast.error("Failed to update policy status.");
    }
  };

  // ✅ Define table columns
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
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.title || "-"}
        </span>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <code className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground">
          {row.original.slug || "-"}
        </code>
      ),
    },
    {
      accessorKey: "isActive",
      header: "Active",
      cell: ({ row }) => (
        <Switch
          checked={row.original.isActive}
          onCheckedChange={() => handleToggleActive(row.original)}
        />
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("en-IN"),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated At",
      cell: ({ row }) =>
        new Date(row.original.updatedAt).toLocaleDateString("en-IN"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row, table }) => {
        const policy = row.original;
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
                onClick={() => navigate(`/admin/policy/edit/${policy._id}`)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate(`/policy/public/${policy.slug}`)}
              >
                <FileText className="mr-2 h-4 w-4" /> View Public
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  (table.options.meta as any)?.openDeleteDialog(policy)
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

  return (
    <div className="p-0 space-y-3">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Policies</h1>
        <Button onClick={() => navigate("/admin/policy/create")}>
          <CirclePlus className="mr-2 h-4 w-4" /> Add Policy
        </Button>
      </div>

      {/* BULK ACTIONS */}
      {tableInstance && (
        <BulkActions table={tableInstance} entityName="policy" />
      )}

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={policyData}
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
