// app/features/testimonial/index.tsx

"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import {
  useGetTestimonialsQuery,
  usePartiallyUpdateTestimonialMutation,
  useDeleteTestimonialMutation,
} from "./data/testimonialApi";
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
  Star,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function TestimonialPage() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [tableInstance, setTableInstance] = React.useState<any>(null);

  // ✅ Fetch all testimonials
  const { data, isLoading } = useGetTestimonialsQuery({ page, limit });
  const [toggleTestimonialStatus] = usePartiallyUpdateTestimonialMutation();
  const [deleteTestimonial] = useDeleteTestimonialMutation();

  const testimonialData = data?.data ?? [];
  const totalPages = data?.pagination?.totalPages ?? 1;

  // ✅ Delete handler
  const handleDelete = async (item: any) => {
    await toast.promise(deleteTestimonial(item._id).unwrap(), {
      loading: `Deleting ${item.name}...`,
      success: `Testimonial by "${item.name}" deleted successfully!`,
      error: "Failed to delete testimonial.",
    });
  };

  // ✅ Toggle active status
  const handleToggleActive = async (testimonial: any) => {
    try {
      await toggleTestimonialStatus({
        id: testimonial._id,
        data: { isActive: !testimonial.isActive },
      }).unwrap();
      toast.success(
        `Testimonial by "${testimonial.name}" has been ${
          testimonial.isActive ? "deactivated" : "activated"
        }.`
      );
    } catch {
      toast.error("Failed to update testimonial status.");
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
      accessorKey: "avatar",
      header: "Avatar",
      cell: ({ row }) =>
        row.original.avatar ? (
          <img
            src={row.original.avatar}
            alt={row.original.name}
            className="h-10 w-10 rounded-full object-cover border"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center text-xs text-muted-foreground">
            N/A
          </div>
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
      cell: ({ row }) => (
        <span className="font-medium text-foreground">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "designation",
      header: "Brand Preview",
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {row.original.designation || "-"}
        </span>
      ),
    },
    {
      accessorKey: "rating",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Rating
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          {[...Array(row.original.rating || 0)].map((_, i) => (
            <Star key={i} className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          ))}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Active
          <ArrowUpDown className="ml-2 h-4 w-4" />
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
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) =>
        new Date(row.original.createdAt).toLocaleDateString("en-IN"),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row, table }) => {
        const testimonial = row.original;
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
                  navigate(`/admin/testimonial/edit/${testimonial._id}`)
                }
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  (table.options.meta as any)?.openDeleteDialog(testimonial)
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
        <h1 className="text-2xl font-semibold">Testimonials</h1>
        <Button onClick={() => navigate("/admin/testimonial/create")}>
          <CirclePlus className="mr-2 h-4 w-4" /> Add Testimonial
        </Button>
      </div>

      {/* BULK ACTIONS */}
      {tableInstance && (
        <BulkActions table={tableInstance} entityName="testimonial" />
      )}

      {/* DATA TABLE */}
      <DataTable
        columns={columns}
        data={testimonialData}
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
