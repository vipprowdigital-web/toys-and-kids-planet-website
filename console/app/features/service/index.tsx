// app/features/category/index.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  useGetServicesQuery,
  usePartiallyUpdateServiceMutation,
  useDeleteServiceMutation,
} from "./data/serviceApi";
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

export default function ServicePage() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [tableInstance, setTableInstance] = React.useState<any>(null);

  // ✅ Fetch all services
  const { data, isLoading } = useGetServicesQuery({ page, limit });
  const [toggleServiceStatus] = usePartiallyUpdateServiceMutation();
  const [deleteService] = useDeleteServiceMutation();

  const serviceData = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  // ✅ Delete handler
  const handleDelete = async (item: any) => {
    await toast.promise(deleteService(item._id).unwrap(), {
      loading: `Deleting ${item.title}...`,
      success: `Service "${item.title}" deleted successfully!`,
      error: "Failed to delete service.",
    });
  };

  // ✅ Toggle active status
  const handleToggleActive = async (service: any) => {
    try {
      await toggleServiceStatus({
        id: service._id,
        data: { isActive: !service.isActive },
      }).unwrap();
      toast.success(
        `Service "${service.title}" has been ${
          service.isActive ? "deactivated" : "activated"
        }.`,
      );
    } catch {
      toast.error("Failed to update service status.");
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
      accessorKey: "thumbnail",
      header: "Thumbnail",
      cell: ({ row }) =>
        row.original.thumbnail ? (
          <img
            src={row.original.thumbnail}
            alt={row.original.title}
            className="h-10 w-10 rounded object-cover border"
          />
        ) : (
          <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs text-muted-foreground">
            N/A
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
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-foreground">
          {row.original.title}
        </span>
      ),
    },
    {
      accessorKey: "domain",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Domain
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const domain = row.original.domain;

        return (
          <span className="font-medium text-foreground">
            {domain?.name || "-"}
          </span>
        );
      },
    },
    {
      accessorKey: "subHeading",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Sub Heading
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.subHeading || "-"}
        </span>
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
      id: "actions",
      header: "Actions",
      cell: ({ row, table }) => {
        const service = row.original;
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
                onClick={() => navigate(`/admin/service/edit/${service._id}`)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  (table.options.meta as any)?.openDeleteDialog(service)
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
        <h1 className="text-2xl font-semibold">Services</h1>
        <Button onClick={() => navigate("/admin/service/create")}>
          <CirclePlus className="mr-2 h-4 w-4" /> Add Service
        </Button>
      </div>

      {/* BULK ACTIONS */}
      {tableInstance && (
        <BulkActions table={tableInstance} entityName="service" />
      )}

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={serviceData}
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
