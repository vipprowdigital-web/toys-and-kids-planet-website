// app/features/domains/index.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  useGetDomainsQuery,
  useDeleteDomainMutation,
  usePartiallyUpdateDomainMutation,
} from "./data/domainsApi";
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
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function DomainPage() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [tableInstance, setTableInstance] = React.useState<any>(null);

  const { data, isLoading } = useGetDomainsQuery({ page, limit });
  const [deleteDomain] = useDeleteDomainMutation();
  const [partiallyUpdateDomain] = usePartiallyUpdateDomainMutation();

  const DomainData = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  const handleDelete = async (item: any) => {
    await toast.promise(deleteDomain(item._id).unwrap(), {
      loading: `Deleting ${item.name}...`,
      success: `Domain "${item.name}" deleted successfully!`,
      error: "Failed to delete domain.",
    });
  };

  const handleToggleActive = async (domain: any) => {
    try {
      await partiallyUpdateDomain({
        id: domain._id,
        data: { isActive: !domain.isActive },
      }).unwrap();
      toast.success(
        `Domain "${domain.name}" has been ${
          domain.isActive ? "deactivated" : "activated"
        }.`
      );
    } catch {
      toast.error("Failed to update domain status.");
    }
  };

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
      cell: ({ row }) => (
        <img
          src={row.original.image}
          alt={row.original.name}
          className="h-10 w-10 rounded-full object-cover"
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
          Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },
    {
      accessorKey: "parentDomain",
      header: "Parent Domain",
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground">
            {row.original.parentDomain?.name ?? "—"}
          </span>
        );
      },
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
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row, table }) => {
        const domain = row.original;
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
                onClick={() => navigate(`/admin/domain/edit/${domain._id}`)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  (table.options.meta as any)?.openDeleteDialog(domain)
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Domains</h1>
        <Button onClick={() => navigate("/admin/domains/create")}>
          <CirclePlus /> Add Domain
        </Button>
      </div>

      {tableInstance && (
        <BulkActions table={tableInstance} entityName="domain" />
      )}

      <DataTable
        columns={columns}
        data={DomainData}
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
