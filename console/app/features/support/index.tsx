// app/features/support/index.tsx
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router";
// import {
//   useGetBlogsQuery,
//   usePartiallyUpdateBlogMutation,
//   useDeleteBlogMutation,
// } from "./data/blogApi";
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

export default function SupportPage() {
  const navigate = useNavigate();
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(10);
  const [tableInstance, setTableInstance] = React.useState<any>(null);
  const [params] = useSearchParams();
  const filter = params.get("filter") || "all";

  // const { data, isLoading } = useGetBlogsQuery({ page, limit, filter });
  // const [toggleBlogStatus] = usePartiallyUpdateBlogMutation();
  // const [deleteBlog] = useDeleteBlogMutation();

  // const blogData = data?.data ?? [];
  // const totalPages = data?.pagination?.totalPages ?? 1;

  // // ⭐ FIX DELETE HANDLER (use _id)
  // const handleDelete = async (item: any) => {
  //   await toast.promise(deleteBlog(item._id).unwrap(), {
  //     loading: `Deleting "${item.title}"...`,
  //     success: `Article "${item.title}" deleted successfully!`,
  //     error: "Failed to delete blog.",
  //   });
  // };

  // ⭐ FIX TOGGLE ACTIVE USING _id
  // const handleToggleActive = async (blog: any) => {
  //   try {
  //     await toggleBlogStatus({
  //       id: blog._id, // ⭐ MUST use _id
  //       data: { isActive: !blog.isActive },
  //     }).unwrap();

  //     toast.success(
  //       `Blog "${blog.title}" has been ${
  //         blog.isActive ? "deactivated" : "activated"
  //       }.`
  //     );
  //   } catch {
  //     toast.error("Failed to update blog status.");
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
      accessorKey: "thumbnail",
      header: "Thumbnail",
      cell: ({ row }) =>
        row.original.thumbnail ? (
          <img
            src={row.original.thumbnail}
            className="h-10 w-10 rounded object-cover border"
          />
        ) : (
          <div className="h-10 w-10 bg-muted rounded flex items-center justify-center">
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
          Title <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
    },

    {
      accessorKey: "category.name",
      header: "Category",
      cell: ({ row }) =>
        row.original.category?.name || (
          <span className="text-muted-foreground">Uncategorized</span>
        ),
    },

    // {
    //   accessorKey: "isActive",
    //   header: "Active",
    //   cell: ({ row }) => (
    //     <Switch
    //       checked={row.original.isActive}
    //       onCheckedChange={() => handleToggleActive(row.original)}
    //     />
    //   ),
    // },

    // {
    //   accessorKey: "isFeature",
    //   header: "Featured",
    //   cell: ({ row }) => (
    //     <Switch
    //       checked={row.original.isFeature}
    //       onCheckedChange={() =>
    //         toggleBlogStatus({
    //           id: row.original._id, // ⭐ FIX
    //           data: { isFeature: !row.original.isFeature },
    //         })
    //       }
    //     />
    //   ),
    // },

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
        const blog = row.original;

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

              {/* ⭐ FIX EDIT NAVIGATION */}
              <DropdownMenuItem
                onClick={() => navigate(`/admin/support/edit/${blog._id}`)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={() =>
                  (table.options.meta as any)?.openDeleteDialog(blog)
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

  return (
    <div className="p-0 space-y-3">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Support</h1>
        <Button onClick={() => navigate("/admin/support/create")}>
          <CirclePlus className="mr-2 h-4 w-4" /> Add Support
        </Button>
      </div>

      {tableInstance && <BulkActions table={tableInstance} entityName="support" />}

      {/* <DataTable
        columns={columns}
        data={blogData}
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
      /> */}
    </div>
  );
}
