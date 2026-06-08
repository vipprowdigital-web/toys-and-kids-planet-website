// app/features/career/index.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router";
// import {
//   useGetCategoriesQuery,
//   useDeleteCategoryMutation,
//   usePartiallyUpdateCategoryMutation,
// } from "./data/categoryApi";
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

export default function CategoryPage() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [tableInstance, setTableInstance] = React.useState<any>(null);

  // const { data, isLoading } = useGetCategoriesQuery({ page, limit });
  // const [deleteCategory] = useDeleteCategoryMutation();
  // const [partiallyUpdateCategory] = usePartiallyUpdateCategoryMutation();

  // const categoryData = data?.data ?? [];
  // const totalPages = data?.pagination?.totalPages ?? 1;

  // const handleDelete = async (item: any) => {
  //   await toast.promise(deleteCategory(item._id).unwrap(), {
  //     loading: `Deleting ${item.name}...`,
  //     success: `Category "${item.name}" deleted successfully!`,
  //     error: "Failed to delete category.",
  //   });
  // };

  // const handleToggleActive = async (category: any) => {
  //   try {
  //     await partiallyUpdateCategory({
  //       id: category._id,
  //       data: { isActive: !category.isActive },
  //     }).unwrap();
  //     toast.success(
  //       `Category "${category.name}" has been ${
  //         category.isActive ? "deactivated" : "activated"
  //       }.`
  //     );
  //   } catch {
  //     toast.error("Failed to update category status.");
  //   }
  // };

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
      accessorKey: "parentCategory",
      header: "Parent Category",
      cell: ({ row }) => {
        return (
          <span className="text-sm text-muted-foreground">
            {row.original.parentCategory?.name ?? "—"}
          </span>
        );
      },
    },
    // {
    //   accessorKey: "isActive",
    //   header: "Active",
    //   cell: ({ row }) => (
    //     // <Switch
    //     //   checked={row.original.isActive}
    //     //   onCheckedChange={() => handleToggleActive(row.original)}
    //     // />
    //   ),
    // },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row, table }) => {
        const category = row.original;
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
                onClick={() => navigate(`/admin/category/edit/${category._id}`)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() =>
                  (table.options.meta as any)?.openDeleteDialog(category)
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
        <h1 className="text-2xl font-semibold">Careers</h1>
        <Button onClick={() => navigate("/admin/career/create")}>
          <CirclePlus /> Add Career
        </Button>
      </div>

      {tableInstance && (
        <BulkActions table={tableInstance} entityName="category" />
      )}

      {/* {/* <DataTable
        columns={columns}
        data={categoryData}
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
      } */}
    </div>
  );
}
